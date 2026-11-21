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

/** `/callback` is the one route Spotify is allowed to send the browser back to. */
export const CALLBACK_PATH = '/callback';

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
 * Strips surrounding whitespace and any trailing slash. Spotify treats
 * `…/callback` and `…/callback/` as different strings, and the former is what we
 * document for the dashboard.
 */
export function normalizeRedirectUri(uri: string): string {
  return uri.trim().replace(/([^/])\/+$/, '$1');
}

/**
 * Where Spotify sends the browser back to. This is the single source of truth:
 * the exact same string is sent as `redirect_uri` to `/authorize` and again on
 * the token exchange. Spotify compares both against the Redirect URIs registered
 * on the app, so a single character of drift (a trailing slash, `localhost`
 * instead of `127.0.0.1`, another port) makes it fail with
 * `INVALID_CLIENT: Invalid redirect URI` or `invalid_grant`.
 *
 * It is derived from the live origin so dev and any deployed URL cannot drift,
 * unless `VITE_SPOTIFY_REDIRECT_URI` explicitly overrides it. The callback route
 * is always served from the origin root, so no `base` is prepended.
 */
export function getRedirectUri(): string {
  const configured = import.meta.env.VITE_SPOTIFY_REDIRECT_URI?.trim();
  const uri = configured ? configured : `${window.location.origin}${CALLBACK_PATH}`;
  return normalizeRedirectUri(uri);
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

/**
 * A fresh PKCE code verifier: 32 random bytes, base64url-encoded to 43 chars.
 * RFC 7636 allows 43-128 characters. The challenge is the SHA-256 of exactly this
 * string, so it must never be re-encoded or trimmed before the exchange.
 */
export function createCodeVerifier(): string {
  return randomString(32);
}

/** S256 code challenge: base64url(SHA-256(verifier)). */
export async function createCodeChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return base64UrlEncode(new Uint8Array(digest));
}

/**
 * Builds the authorize URL and stores the verifier + state for the callback.
 *
 * `sessionStorage` is deliberate: the verifier has to survive the round trip
 * through Spotify in the same tab, and session-scoped storage keeps it out of the
 * long-lived, XSS-readable `localStorage` entry that holds the access token.
 */
export async function buildAuthorizeUrl(clientId: string, redirectUri: string): Promise<string> {
  const verifier = createCodeVerifier();
  const state = randomString(16);
  const challenge = await createCodeChallenge(verifier);

  sessionStorage.setItem(VERIFIER_STORAGE_KEY, verifier);
  sessionStorage.setItem(STATE_STORAGE_KEY, state);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: normalizeRedirectUri(redirectUri),
    scope: REQUIRED_SCOPES.join(' '),
    code_challenge_method: 'S256',
    code_challenge: challenge,
    state,
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

/**
 * Plain-language text for the OAuth errors people actually hit. Spotify reports
 * redirect-URI and client problems both on the callback (`?error=…`) and from the
 * token endpoint (`{ "error": "invalid_client" }`), so both paths use this.
 */
export const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  access_denied: 'Sign-in was cancelled. Choose "Sign in with Spotify" to try again.',
  invalid_client:
    'Spotify rejected this app. Check VITE_SPOTIFY_CLIENT_ID against the Spotify dashboard.',
  invalid_grant:
    'Spotify rejected the authorization code: it may have expired, already been used, or the Redirect URI does not match. Try signing in again.',
  invalid_request:
    'Spotify rejected the sign-in request as malformed. Check the Redirect URI in the Spotify dashboard.',
  unauthorized_client: 'This Spotify app is not allowed to use this sign-in method.',
  unsupported_response_type: 'This Spotify app is not configured for the authorization code flow.',
  invalid_scope: 'The requested scope is not allowed for this Spotify app.',
  server_error: 'Spotify had a temporary problem completing sign-in. Try again in a moment.',
  temporarily_unavailable: 'Spotify is temporarily unavailable. Try again in a moment.',
};

export function describeOAuthError(code: string): string {
  return OAUTH_ERROR_MESSAGES[code] ?? `Spotify returned an error while signing in (${code}).`;
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
    throw new AuthError(
      code ? describeOAuthError(code) : `Spotify token request failed: ${detail}`,
      code,
    );
  }
  return (await response.json()) as TokenResponse;
}

/**
 * Completes the login: checks `state`, then exchanges the code for tokens.
 * Returns the stored token set.
 *
 * `redirectUri` must be the exact value sent to `/authorize`; Spotify compares it
 * again here and fails the exchange with `invalid_grant` if it differs.
 */
export async function handleCallback(
  clientId: string,
  callbackUrl: URL,
  redirectUri: string = getRedirectUri(),
): Promise<TokenSet> {
  const params = callbackUrl.searchParams;
  const oauthError = params.get('error');
  if (oauthError) {
    throw new AuthError(describeOAuthError(oauthError), oauthError);
  }

  const code = params.get('code');
  const returnedState = params.get('state');
  const expectedState = sessionStorage.getItem(STATE_STORAGE_KEY);
  const verifier = sessionStorage.getItem(VERIFIER_STORAGE_KEY);

  sessionStorage.removeItem(STATE_STORAGE_KEY);
  sessionStorage.removeItem(VERIFIER_STORAGE_KEY);

  if (!code) throw new AuthError('The callback URL had no authorization code.');
  if (!expectedState || !verifier) {
    throw new AuthError(
      'Sign-in session expired or was started in another tab. Try again, and keep it in one tab.',
    );
  }
  if (returnedState !== expectedState) {
    throw new AuthError('State mismatch on the sign-in callback. Try again.');
  }

  const response = await postTokenRequest(
    new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: normalizeRedirectUri(redirectUri),
      code_verifier: verifier,
      client_id: clientId,
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
