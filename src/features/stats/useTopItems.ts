import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTopArtists, fetchTopTracks, useSpotifyClient } from '../../api/spotify';
import type { TimeRange } from '../../types/spotify';

/** Stats data changes slowly; 5 minutes matches the plan in docs/ARCHITECTURE.md. */
const STATS_STALE_MS = 5 * 60 * 1000;

export function topArtistsQueryKey(timeRange: TimeRange) {
  return ['spotify', 'me', 'top', 'artists', timeRange] as const;
}

export function topTracksQueryKey(timeRange: TimeRange) {
  return ['spotify', 'me', 'top', 'tracks', timeRange] as const;
}

/** Top artists for a time range. */
export function useTopArtists(timeRange: TimeRange) {
  const client = useSpotifyClient();
  // Stable identity: TanStack Query treats a new `queryFn` as new data and refetches.
  const queryFn = useCallback(() => fetchTopArtists(timeRange, client), [timeRange, client]);
  return useQuery({
    queryKey: topArtistsQueryKey(timeRange),
    queryFn,
    staleTime: STATS_STALE_MS,
    retry: 1,
  });
}

/** Top tracks for a time range. */
export function useTopTracks(timeRange: TimeRange) {
  const client = useSpotifyClient();
  const queryFn = useCallback(() => fetchTopTracks(timeRange, client), [timeRange, client]);
  return useQuery({
    queryKey: topTracksQueryKey(timeRange),
    queryFn,
    staleTime: STATS_STALE_MS,
    retry: 1,
  });
}
