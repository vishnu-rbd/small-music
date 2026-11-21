/**
 * OAuth 2.0 Authorization Code with PKCE, browser only.
 *
 * Spotify's PKCE flow needs no client secret, so everything here is safe to run
 * from the browser (see docs/ARCHITECTURE.md "Auth flow"). The Client ID is read
 * from `VITE_SPOTIFY_CLIENT_ID`; it is public and never a secret.
 */

export const SPOTIFY_AUTHORIZE_URL = 'https://accounts.spotify.com/authorize';
export const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

/**
 * Scopes this slice needs. `user-top-read` powers `/me/top/*` on the Stats page.
 * Scopes are additive in Spotify's model: adding one later signs users out.
 */
export const REQUIRED_SCOPES = ['user-top-read'] as const;

const VERIFIER_STORAGE_KEY = 'spotify.pkce.verifier';
const STATE_STORAGE_KEY = 'spotify.pkce.state';
const TOKENS_STORAGE_KEY = 'spotify.tokens';

export interface TokenSet {
  accessToken: string;
  refreshToken: string;
  /** Unix epoch milliseconds at which `accessToken` should be treated as expired. */
  expiresAt: number;
  scope: string;
}

export function getClientId(): string | undefined {
  const value = import.meta.env.VITE_SPOTIFY_CLIENT_ID?.trim();
  return value ? value : undefined;
}

/**
 * Where Spotify sends the browser back to. Defaults to this origin's `/callback`,
 * which is the route registered on the Spotify app.
 */
export function getRedirectUri(): string {
  const configured = import.meta.env.VITE_SPOTIFY_REDIRECT_URI?.trim();
  if (configured) return configured;
  return `${window.location.origin}/callback`;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function randomString(byteLength = 64): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

/** S256 code challenge: base64url(SHA-256(verifier)). */
export async function createCodeChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return base64UrlEncode(new Uint8Array(digest));
}

/** Builds the authorize URL and stores the verifier + state for the callback. */
export async function buildAuthorizeUrl(clientId: string, redirectUri: string): Promise<string> {
  const verifier = randomString(64);
  const state = randomString(16);
  const challenge = await createCodeChallenge(verifier);

  sessionStorage.setItem(VERIFIER_STORAGE_KEY, verifier);
  sessionStorage.setItem(STATE_STORAGE_KEY, state);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    state,
    scope: REQUIRED_SCOPES.join(' '),
  });
  return `${SPOTIFY_AUTHORIZE_URL}?${params.toString()}`;
}

export function startLogin(clientId: string, redirectUri = getRedirectUri()): Promise<void> {
  return buildAuthorizeUrl(clientId, redirectUri).then((url) => {
    window.location.assign(url);
  });
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

function toTokenSet(response: TokenResponse, previous?: TokenSet | null): TokenSet {
  return {
    accessToken: response.access_token,
    // Spotify may omit the refresh token on refresh; keep the previous one then.
    refreshToken: response.refresh_token ?? previous?.refreshToken ?? '',
    // Refresh a minute early so an in-flight request does not race the expiry.
    expiresAt: Date.now() + Math.max(response.expires_in - 60, 0) * 1000,
    scope: response.scope,
  };
}

export class AuthError extends Error {
  /** Spotify's OAuth `error` code, when it gave one (e.g. `access_denied`). */
  readonly code: string | undefined;

  constructor(message: string, code?: string) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

async function postTokenRequest(body: URLSearchParams): Promise<TokenResponse> {
  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!response.ok) {
    let code: string | undefined;
    let detail = `HTTP ${response.status}`;
    try {
      const parsed = (await response.json()) as {
        error?: string;
        error_description?: string;
      };
      code = parsed.error;
      if (parsed.error_description) detail = parsed.error_description;
    } catch {
      // Keep the status-based message.
    }
    throw new AuthError(`Spotify token request failed: ${detail}`, code);
  }
  return (await response.json()) as TokenResponse;
}

/**
 * Completes the login: checks `state`, then exchanges the code for tokens.
 * Returns the stored token set.
 */
export async function handleCallback(clientId: string, callbackUrl: URL): Promise<TokenSet> {
  const params = callbackUrl.searchParams;
  const oauthError = params.get('error');
  if (oauthError) {
    throw new AuthError(
      oauthError === 'access_denied' ? 'Sign-in was cancelled.' : `Spotify returned an error: ${oauthError}`,
      oauthError,
    );
  }

  const code = params.get('code');
  const returnedState = params.get('state');
  const expectedState = sessionStorage.getItem(STATE_STORAGE_KEY);
  const verifier = sessionStorage.getItem(VERIFIER_STORAGE_KEY);

  sessionStorage.removeItem(STATE_STORAGE_KEY);
  sessionStorage.removeItem(VERIFIER_STORAGE_KEY);

  if (!code) throw new AuthError('The callback URL had no authorization code.');
  if (!expectedState || !verifier) {
    throw new AuthError('Sign-in session expired or was started in another tab. Try again.');
  }
  if (returnedState !== expectedState) {
    throw new AuthError('State mismatch on the sign-in callback. Try again.');
  }

  const response = await postTokenRequest(
    new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: getRedirectUri(),
      client_id: clientId,
      code_verifier: verifier,
    }),
  );
  const tokens = toTokenSet(response);
  saveTokens(tokens);
  return tokens;
}

export async function refreshTokens(clientId: string, current: TokenSet): Promise<TokenSet> {
  if (!current.refreshToken) {
    throw new AuthError('No refresh token available. Please sign in again.');
  }
  const response = await postTokenRequest(
    new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: current.refreshToken,
      client_id: clientId,
    }),
  );
  const tokens = toTokenSet(response, current);
  saveTokens(tokens);
  return tokens;
}

export function saveTokens(tokens: TokenSet): void {
  localStorage.setItem(TOKENS_STORAGE_KEY, JSON.stringify(tokens));
}

export function loadTokens(): TokenSet | null {
  const raw = localStorage.getItem(TOKENS_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<TokenSet>;
    if (!parsed.accessToken || !parsed.refreshToken) return null;
    return {
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
      expiresAt: parsed.expiresAt ?? 0,
      scope: parsed.scope ?? '',
    };
  } catch {
    return null;
  }
}

export function clearTokens(): void {
  localStorage.removeItem(TOKENS_STORAGE_KEY);
}

export function isExpired(tokens: TokenSet): boolean {
  return Date.now() >= tokens.expiresAt;
}
