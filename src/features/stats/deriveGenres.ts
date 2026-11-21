import type { SpotifyArtist } from '../../types/spotify';

export interface GenreCount {
  genre: string;
  /** How many of the top artists list this genre. */
  count: number;
}

export interface DerivedGenres {
  genres: GenreCount[];
  /** Top artists that returned at least one genre. */
  artistsWithGenres: number;
  totalArtists: number;
}

/**
 * Genres are not available on tracks: Spotify puts them on the artist object.
 * So every genre shown on the Stats page is derived from the top-artists payload,
 * weighted by how many of those artists share the genre (see docs/SPOTIFY_API.md
 * gotcha 6: many artists have an empty genre list).
 */
export function deriveGenresFromTopArtists(artists: SpotifyArtist[]): DerivedGenres {
  const counts = new Map<string, number>();
  let artistsWithGenres = 0;

  for (const artist of artists) {
    const genres = [...new Set(artist.genres.map((genre) => genre.trim().toLowerCase()))].filter(Boolean);
    if (genres.length === 0) continue;
    artistsWithGenres += 1;
    for (const genre of genres) counts.set(genre, (counts.get(genre) ?? 0) + 1);
  }

  const genres = [...counts.entries()]
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count || a.genre.localeCompare(b.genre));

  return { genres, artistsWithGenres, totalArtists: artists.length };
}
