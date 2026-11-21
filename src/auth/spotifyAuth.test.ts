import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildAuthorizeUrl,
  createCodeChallenge,
  createCodeVerifier,
  getRedirectUri,
  handleCallback,
  normalizeRedirectUri,
  OAUTH_ERROR_MESSAGES,
  REQUIRED_SCOPES,
  SPOTIFY_AUTHORIZE_URL,
  SPOTIFY_TOKEN_URL,
} from './spotifyAuth';

vi.stubEnv('VITE_SPOTIFY_CLIENT_ID', 'test-client-id');

const REDIRECT_URI = 'http://127.0.0.1:5173/callback';

/** A successful Spotify token response. */
function tokenResponse(overrides: Record<string, unknown> = {}) {
  return {
    access_token: 'access-token-value',
    token_type: 'Bearer',
    expires_in: 3600,
    refresh_token: 'refresh-token-value',
    scope: 'user-top-read',
    ...overrides,
  };
}

/** Mocks `fetch` and returns the mock so its calls can be inspected. */
function mockFetch(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => body,
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

/** Runs a full sign-in up to the redirect, returning the authorize URL. */
async function startSignIn(clientId = 'abc123', redirectUri = REDIRECT_URI) {
  return new URL(await buildAuthorizeUrl(clientId, redirectUri));
}

describe('authorize URL', () => {
  it('asks for an authorization code with user-top-read, S256, state and the redirect URI', async () => {
    expect(REQUIRED_SCOPES).toContain('user-top-read');

    const url = await startSignIn();

    expect(`${url.origin}${url.pathname}`).toBe(SPOTIFY_AUTHORIZE_URL);
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('client_id')).toBe('abc123');
    expect(url.searchParams.get('redirect_uri')).toBe(REDIRECT_URI);
    expect(url.searchParams.get('scope')).toBe('user-top-read');
    expect(url.searchParams.get('code_challenge_method')).toBe('S256');
    expect(url.searchParams.get('state')).toBeTruthy();

    const challenge = url.searchParams.get('code_challenge') ?? '';
    // base64url of a SHA-256 digest: 43 chars, no padding, URL-safe alphabet.
    expect(challenge).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  it('sends a code_challenge that is the S256 hash of the stored verifier', async () => {
    const url = await startSignIn();
    const verifier = sessionStorage.getItem('spotify.pkce.verifier') ?? '';

    // RFC 7636 allows 43-128 characters; Spotify rejects anything else.
    expect(verifier).toMatch(/^[A-Za-z0-9_-]{43,128}$/);
    expect(verifier.length).toBe(43);
    // The verifier itself must never appear in the authorize URL.
    expect(url.search).not.toContain(verifier);
    expect(url.searchParams.get('code_challenge')).toBe(await createCodeChallenge(verifier));
  });

  it('keeps the verifier and state in sessionStorage, not localStorage', async () => {
    const url = await startSignIn();

    expect(sessionStorage.getItem('spotify.pkce.verifier')).toBeTruthy();
    expect(sessionStorage.getItem('spotify.pkce.state')).toBe(url.searchParams.get('state'));
    expect(localStorage.getItem('spotify.pkce.verifier')).toBeNull();
    expect(localStorage.getItem('spotify.pkce.state')).toBeNull();
  });

  it('generates a fresh random state and verifier for every sign-in', async () => {
    const first = await startSignIn();
    const firstVerifier = sessionStorage.getItem('spotify.pkce.verifier');
    const second = await startSignIn();

    expect(first.searchParams.get('state')).not.toBe(second.searchParams.get('state'));
    expect(first.searchParams.get('code_challenge')).not.toBe(second.searchParams.get('code_challenge'));
    expect(sessionStorage.getItem('spotify.pkce.verifier')).not.toBe(firstVerifier);
  });

  it('never sends a client secret', async () => {
    const url = await startSignIn();
    expect(url.toString()).not.toMatch(/client_secret=|secret=/i);
  });

  it('hashes the verifier with SHA-256 (known vector)', async () => {
    // base64url(SHA-256("abc")) per RFC 4648 / FIPS 180-4.
    expect(await createCodeChallenge('abc')).toBe('ungWv48Bz-pBQUDeXa4iI7ADYaOWF3qctBD_YfIAFa0');
  });

  it('produces a 43-character verifier from 32 random bytes', () => {
    expect(createCodeVerifier()).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });
});

describe('redirect URI', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_SPOTIFY_REDIRECT_URI', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv('VITE_SPOTIFY_CLIENT_ID', 'test-client-id');
  });

  it('derives the same value from the current origin that it sends to Spotify', async () => {
    const redirectUri = getRedirectUri();
    const url = await startSignIn('abc123', redirectUri);

    expect(redirectUri).toBe(`${window.location.origin}/callback`);
    expect(url.searchParams.get('redirect_uri')).toBe(redirectUri);
  });

  it('uses VITE_SPOTIFY_REDIRECT_URI when set', () => {
    vi.stubEnv('VITE_SPOTIFY_REDIRECT_URI', 'https://music.example.com/callback');
    expect(getRedirectUri()).toBe('https://music.example.com/callback');
  });

  it('trims whitespace and a trailing slash so the value cannot drift from the dashboard', () => {
    expect(normalizeRedirectUri('  http://127.0.0.1:5173/callback/  ')).toBe(REDIRECT_URI);
    vi.stubEnv('VITE_SPOTIFY_REDIRECT_URI', ' http://127.0.0.1:5173/callback/ ');
    expect(getRedirectUri()).toBe(REDIRECT_URI);
  });

  it('sends the trimmed redirect URI to Spotify when given an untidy one', async () => {
    const url = await startSignIn('abc123', `${REDIRECT_URI}/`);
    expect(url.searchParams.get('redirect_uri')).toBe(REDIRECT_URI);
  });
});

describe('token exchange', () => {
  beforeEach(() => {
    sessionStorage.setItem('spotify.pkce.verifier', 'the-stored-verifier');
    sessionStorage.setItem('spotify.pkce.state', 'the-stored-state');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.stubEnv('VITE_SPOTIFY_CLIENT_ID', 'test-client-id');
  });

  function callbackUrl(params: Record<string, string>) {
    const url = new URL(`${REDIRECT_URI}`);
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
    return url;
  }

  it('POSTs a form-encoded authorization_code grant to the token endpoint', async () => {
    const fetchMock = mockFetch(tokenResponse());

    await handleCallback('abc123', callbackUrl({ code: 'the-code', state: 'the-stored-state' }), REDIRECT_URI);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(SPOTIFY_TOKEN_URL);
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({ 'Content-Type': 'application/x-www-form-urlencoded' });
    expect(init.body).toBeInstanceOf(URLSearchParams);

    const body = init.body as URLSearchParams;
    expect(body.get('grant_type')).toBe('authorization_code');
    expect(body.get('code')).toBe('the-code');
    // Same redirect URI as on /authorize, and the verifier that matches the challenge.
    expect(body.get('redirect_uri')).toBe(REDIRECT_URI);
    expect(body.get('code_verifier')).toBe('the-stored-verifier');
    expect(body.get('client_id')).toBe('abc123');
    // PKCE public clients must not authenticate with a secret.
    expect(body.get('client_secret')).toBeNull();
    expect(body.toString()).not.toMatch(/secret/i);
  });

  it('stores the tokens and clears the one-time verifier and state', async () => {
    mockFetch(tokenResponse());

    const tokens = await handleCallback(
      'abc123',
      callbackUrl({ code: 'the-code', state: 'the-stored-state' }),
      REDIRECT_URI,
    );

    expect(tokens.accessToken).toBe('access-token-value');
    expect(tokens.refreshToken).toBe('refresh-token-value');
    expect(tokens.expiresAt).toBeGreaterThan(Date.now());

    const stored = JSON.parse(localStorage.getItem('spotify.tokens') ?? '{}');
    expect(stored.accessToken).toBe('access-token-value');
    expect(sessionStorage.getItem('spotify.pkce.verifier')).toBeNull();
    expect(sessionStorage.getItem('spotify.pkce.state')).toBeNull();
  });

  it('refuses to exchange when the returned state does not match', async () => {
    const fetchMock = mockFetch(tokenResponse());

    await expect(
      handleCallback('abc123', callbackUrl({ code: 'the-code', state: 'tampered' }), REDIRECT_URI),
    ).rejects.toThrow(/state mismatch/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('reports spotify error= without attempting an exchange', async () => {
    const fetchMock = mockFetch(tokenResponse());

    await expect(
      handleCallback(
        'abc123',
        callbackUrl({ error: 'access_denied', state: 'the-stored-state' }),
        REDIRECT_URI,
      ),
    ).rejects.toThrow(/cancelled/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('explains an invalid_client rejection in readable words', async () => {
    mockFetch({ error: 'invalid_client', error_description: 'Invalid redirect URI' }, { ok: false, status: 400 });

    await expect(
      handleCallback('abc123', callbackUrl({ code: 'the-code', state: 'the-stored-state' }), REDIRECT_URI),
    ).rejects.toThrow(OAUTH_ERROR_MESSAGES.invalid_client);
  });
});
