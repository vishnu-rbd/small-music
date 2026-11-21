import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { App, createQueryClient } from './App';

/**
 * Route-level smoke tests: mount the real <App> router tree (not individual pages)
 * and check what each route renders. No Spotify account is involved.
 */
vi.stubEnv('VITE_SPOTIFY_CLIENT_ID', 'test-client-id');

function renderAt(path: string) {
  // App owns a BrowserRouter; wrap the route table via MemoryRouter for a given URL.
  window.history.pushState({}, '', path);
  return render(<App queryClient={createQueryClient()} />);
}

describe('app routes', () => {
  it('serves the Home page at / with one h1 and the site footer', () => {
    renderAt('/');
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent('Hello, world');
    expect(screen.getByText('Coming soon')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toHaveTextContent('test-music');
  });

  it('serves the Stats page at /stats with a sign-in action when signed out', async () => {
    renderAt('/stats');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Your listening stats');
    expect(await screen.findByRole('button', { name: 'Sign in with Spotify' })).toBeInTheDocument();
    expect(screen.getByText(/user-top-read/)).toBeInTheDocument();
  });

  it('serves the PKCE callback route at /callback and reports a broken callback', async () => {
    renderAt('/callback');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Signing in with Spotify');
    // Nothing to exchange: the page must explain it, not crash.
    expect(await screen.findByRole('alert')).toHaveTextContent(/no authorization code/i);
  });

  it('rejects a callback whose state does not match the stored sign-in', async () => {
    renderAt('/callback?code=abc&state=not-the-stored-state');
    // No verifier/state in storage (started elsewhere or expired): refuse the exchange.
    expect(await screen.findByRole('alert')).toHaveTextContent(/expired or was started in another tab/i);
  });

  it('explains an access_denied callback and drops the OAuth query from the URL', async () => {
    renderAt('/callback?error=access_denied&state=stale');
    expect(await screen.findByRole('alert')).toHaveTextContent(/cancelled/i);
    await waitFor(() => expect(window.location.search).toBe(''));
    expect(window.location.pathname).toBe('/callback');
  });

  it('leaves no code in the URL when the callback fails', async () => {
    renderAt('/callback?code=spent-code&state=not-stored');
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    await waitFor(() => expect(window.location.search).toBe(''));
    expect(window.location.href).not.toContain('spent-code');
  });

  it('exchanges a valid callback code and lands on /stats with a clean URL', async () => {
    // Pretend sign-in started here: the verifier and state are in sessionStorage.
    sessionStorage.setItem('spotify.pkce.verifier', 'stored-verifier');
    sessionStorage.setItem('spotify.pkce.state', 'stored-state');
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        access_token: 'access-token-value',
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: 'refresh-token-value',
        scope: 'user-top-read',
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    renderAt('/callback?code=good-code&state=stored-state');

    await waitFor(() => expect(window.location.pathname).toBe('/stats'));
    expect(window.location.search).toBe('');
    expect(JSON.parse(localStorage.getItem('spotify.tokens') ?? '{}').accessToken).toBe('access-token-value');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});
