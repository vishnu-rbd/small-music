/** The Spotify objects this app consumes. A trimmed subset of the real payloads. */

export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

export interface SpotifyNamedRef {
  id: string;
  name: string;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
  images: SpotifyImage[];
  external_urls: { spotify?: string };
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  release_date: string;
  images: SpotifyImage[];
}

export interface SpotifyTrack {
  id: string;
  name: string;
  duration_ms: number;
  popularity: number;
  artists: SpotifyNamedRef[];
  album: SpotifyAlbum;
  external_urls: { spotify?: string };
}

export interface SpotifyPage<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Spotify's `time_range` values. The labels Spotify shows:
 * short_term ≈ 4 weeks, medium_term ≈ 6 months, long_term ≈ all time (about a year).
 */
export type TimeRange = 'short_term' | 'medium_term' | 'long_term';
