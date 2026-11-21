import { describe, expect, it, vi } from 'vitest';
import { buildAuthorizeUrl, createCodeChallenge, REQUIRED_SCOPES, SPOTIFY_AUTHORIZE_URL } from './spotifyAuth';

vi.stubEnv('VITE_SPOTIFY_CLIENT_ID', 'test-client-id');

describe('spotifyAuth PKCE helpers', () => {
  it('requests user-top-read and uses the S256 challenge method', async () => {
    expect(REQUIRED_SCOPES).toContain('user-top-read');

    const url = new URL(await buildAuthorizeUrl('abc123', 'http://127.0.0.1:5173/callback'));

    expect(`${url.origin}${url.pathname}`).toBe(SPOTIFY_AUTHORIZE_URL);
    expect(url.searchParams.get('client_id')).toBe('abc123');
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('redirect_uri')).toBe('http://127.0.0.1:5173/callback');
    expect(url.searchParams.get('code_challenge_method')).toBe('S256');
    expect(url.searchParams.get('scope')).toBe('user-top-read');
    expect(url.searchParams.get('state')).toBeTruthy();

    const challenge = url.searchParams.get('code_challenge') ?? '';
    // base64url of a SHA-256 digest: 43 chars, no padding, URL-safe alphabet.
    expect(challenge).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  it('never sends a client secret', async () => {
    const url = await buildAuthorizeUrl('abc123', 'http://127.0.0.1:5173/callback');
    expect(url).not.toMatch(/client_secret|secret/i);
  });

  it('hashes the verifier with SHA-256 (known vector)', async () => {
    // base64url(SHA-256("abc")) per RFC 4648 / FIPS 180-4.
    expect(await createCodeChallenge('abc')).toBe('ungWv48Bz-pBQUDeXa4iI7ADYaOWF3qctBD_YfIAFa0');
  });
});
