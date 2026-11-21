import { useMemo } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { SpotifyApiError } from './errors';
import type { SpotifyArtist, SpotifyPage, SpotifyTrack, TimeRange } from '../types/spotify';

const API_BASE = 'https://api.spotify.com/v1';

/** Spotify's per-request cap for the top-items endpoints. */
export const TOP_ITEMS_LIMIT = 50;

interface RequestOptions {
  getAccessToken: () => Promise<string>;
  /**
   * Called when Spotify rejects the token, so the app can drop the session.
   * Receives a user-facing message, and runs before the request throws.
   */
  onUnauthorized: (message: string) => void;
}

async function spotifyGet<T>(path: string, { getAccessToken, onUnauthorized }: RequestOptions): Promise<T> {
  const accessToken = await getAccessToken();
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (response.ok) return (await response.json()) as T;

  if (response.status === 401) {
    const message = 'Spotify session expired. Please sign in again.';
    onUnauthorized(message);
    throw new SpotifyApiError(401, message);
  }

  if (response.status === 429) {
    const retryAfter = Number(response.headers.get('Retry-After'));
    throw new SpotifyApiError(
      429,
      'Spotify is rate limiting this app. Try again in a moment.',
      Number.isFinite(retryAfter) ? retryAfter : undefined,
    );
  }

  if (response.status === 403) {
    const message = 'Spotify refused this request. Check that the app is allowed to read your top items.';
    onUnauthorized(message);
    throw new SpotifyApiError(403, message);
  }

  throw new SpotifyApiError(response.status, `Spotify request failed (HTTP ${response.status}).`);
}

export function topItemsPath(kind: 'artists' | 'tracks', timeRange: TimeRange): string {
  const params = new URLSearchParams({
    time_range: timeRange,
    limit: String(TOP_ITEMS_LIMIT),
    offset: '0',
  });
  return `/me/top/${kind}?${params.toString()}`;
}

/** `GET /me/top/artists?time_range=…` */
export function fetchTopArtists(timeRange: TimeRange, options: RequestOptions) {
  return spotifyGet<SpotifyPage<SpotifyArtist>>(topItemsPath('artists', timeRange), options);
}

/** `GET /me/top/tracks?time_range=…` */
export function fetchTopTracks(timeRange: TimeRange, options: RequestOptions) {
  return spotifyGet<SpotifyPage<SpotifyTrack>>(topItemsPath('tracks', timeRange), options);
}

/**
 * Reads the session from context and returns a stable client for the query hooks.
 * The object is memoized: TanStack Query treats a changing `queryFn` as new data
 * and would otherwise refetch (and loop) on every render.
 */
export function useSpotifyClient(): RequestOptions {
  const { getAccessToken, expireSession } = useAuth();
  return useMemo(() => ({ getAccessToken, onUnauthorized: expireSession }), [getAccessToken, expireSession]);
}
