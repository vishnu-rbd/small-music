import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../auth/AuthProvider';
import { StatsPage } from './StatsPage';
import { topArtistsFixture, topTracksFixture } from '../../test/fixtures/spotify';
import type { TokenSet } from '../../auth/spotifyAuth';

/**
 * These tests run the Stats page against a mocked Spotify API and a stubbed
 * session. No real Spotify account or network request is used anywhere here.
 */

const CLIENT_ID = 'test-client-id';

vi.stubEnv('VITE_SPOTIFY_CLIENT_ID', CLIENT_ID);

function authenticatedSession(): TokenSet {
  return {
    accessToken: 'test-access-token',
    refreshToken: 'test-refresh-token',
    expiresAt: Date.now() + 60 * 60 * 1000,
    scope: 'user-top-read',
  };
}

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

/** Routes /me/top/* to the fixtures and records the requested time ranges. */
function mockSpotifyApi(impl?: (url: URL) => Response | Promise<Response>) {
  const requested: string[] = [];
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = new URL(String(input));
    requested.push(url.searchParams.toString());
    if (impl) return impl(url);

    if (url.pathname === '/v1/me/top/artists') return jsonResponse(topArtistsFixture);
    if (url.pathname === '/v1/me/top/tracks') return jsonResponse(topTracksFixture);
    throw new Error(`Unexpected request in test: ${url.href}`);
  });
  vi.stubGlobal('fetch', fetchMock);
  return { fetchMock, requested };
}

function renderStats(options: { signedIn: boolean }) {
  if (options.signedIn) {
    localStorage.setItem('spotify.tokens', JSON.stringify(authenticatedSession()));
  }
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  const user = userEvent.setup();
  render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatsPage />
      </AuthProvider>
    </QueryClientProvider>,
  );
  return { user };
}

describe('StatsPage', () => {
  let api: ReturnType<typeof mockSpotifyApi>;

  beforeEach(() => {
    api = mockSpotifyApi();
  });

  it('shows top artists and top tracks for the default range', async () => {
    renderStats({ signedIn: true });

    const artistsPanel = screen.getByRole('region', { name: 'Top artists' });
    expect(await within(artistsPanel).findByText('Neon Skyline')).toBeInTheDocument();

    const artistItems = within(artistsPanel).getAllByRole('listitem');
    expect(artistItems).toHaveLength(3);
    expect(artistItems[0]).toHaveTextContent('1');
    expect(artistItems[0]).toHaveTextContent('Neon Skyline');
    expect(artistItems[1]).toHaveTextContent('The Paper Kites');

    const tracksPanel = screen.getByRole('region', { name: 'Top tracks' });
    expect(await within(tracksPanel).findByText('Midnight Arcade')).toBeInTheDocument();
    expect(within(tracksPanel).getByText('3:34')).toBeInTheDocument();
    expect(within(tracksPanel).getByText('The Paper Kites, Glass Harbor')).toBeInTheDocument();

    // The default range is ~4 weeks, i.e. Spotify's short_term.
    expect(api.requested).toContain('time_range=short_term&limit=50&offset=0');
  });

  it('derives genres from the top-artists payload and says so', async () => {
    renderStats({ signedIn: true });

    const genresPanel = await screen.findByRole('region', {
      name: 'Top genres',
    });
    await within(genresPanel).findByText('dream pop');
    expect(within(genresPanel).getByText('synthpop')).toBeInTheDocument();
    expect(within(genresPanel).getByText('indie folk')).toBeInTheDocument();
    // "dream pop" is listed by two artists, so its count is 2.
    const dreamPop = within(genresPanel).getByText('dream pop').closest('li');
    expect(dreamPop).toHaveTextContent('2');
    // Artist 3 has no genres; the note must be honest about the coverage.
    expect(within(genresPanel).getByText(/From 2 of your 3 top artists that have genres/)).toBeInTheDocument();
    expect(within(genresPanel).getByText(/Derived from the top-artists payload/)).toBeInTheDocument();
  });

  it('switches the time range and refetches with the new time_range value', async () => {
    const { user } = renderStats({ signedIn: true });
    const artistsPanel = screen.getByRole('region', { name: 'Top artists' });
    await within(artistsPanel).findByText('Neon Skyline');

    const shortTerm = screen.getByRole('button', { name: '~4 weeks' });
    expect(shortTerm).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: '~6 months' }));
    await waitFor(() => expect(api.requested.some((search) => search.includes('time_range=medium_term'))).toBe(true));
    expect(screen.getByRole('button', { name: '~6 months' })).toHaveAttribute('aria-pressed', 'true');
    expect(shortTerm).toHaveAttribute('aria-pressed', 'false');

    await user.click(screen.getByRole('button', { name: 'All time' }));
    await waitFor(() => expect(api.requested.some((search) => search.includes('time_range=long_term'))).toBe(true));
    expect(screen.getByRole('button', { name: 'All time' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('offers sign-in and makes no API calls when signed out', async () => {
    renderStats({ signedIn: false });

    expect(await screen.findByRole('button', { name: 'Sign in with Spotify' })).toBeInTheDocument();
    expect(screen.getByText('Sign in to see your stats')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Top artists' })).not.toBeInTheDocument();
    expect(api.fetchMock).not.toHaveBeenCalled();
  });

  it('shows an error with a sign-in action when Spotify rejects the request', async () => {
    api = mockSpotifyApi(
      () =>
        new Response(
          JSON.stringify({
            error: { status: 401, message: 'The access token expired' },
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
    );

    renderStats({ signedIn: true });

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/Spotify session expired/);
    // Rejecting the token drops the session; the page must still offer a way in.
    expect(screen.getAllByRole('button', { name: 'Sign in with Spotify' }).length).toBeGreaterThan(0);
    expect(api.fetchMock).toHaveBeenCalled();
  });

  it('shows an error with a sign-in action on a network failure', async () => {
    api = mockSpotifyApi(() => {
      throw new TypeError('Failed to fetch');
    });

    renderStats({ signedIn: true });

    // TanStack Query retries once (with a short backoff) before surfacing the error,
    // so allow more than the default second for this state to settle.
    const alerts = await screen.findAllByRole('alert', {}, { timeout: 4000 });
    expect(alerts.length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: 'Sign in with Spotify' }).length).toBeGreaterThan(0);
  });
});
