import type { SpotifyArtist, SpotifyPage, SpotifyTrack } from '../../types/spotify';

function image(seed: string) {
  return [{ url: `https://i.scdn.co/image/${seed}`, height: 64, width: 64 }];
}

export const topArtistsFixture: SpotifyPage<SpotifyArtist> = {
  limit: 50,
  offset: 0,
  total: 3,
  items: [
    {
      id: 'artist-1',
      name: 'Neon Skyline',
      genres: ['synthpop', 'dream pop'],
      popularity: 72,
      images: image('artist-1'),
      external_urls: { spotify: 'https://open.spotify.com/artist/artist-1' },
    },
    {
      id: 'artist-2',
      name: 'The Paper Kites',
      genres: ['indie folk', 'dream pop'],
      popularity: 65,
      images: image('artist-2'),
      external_urls: { spotify: 'https://open.spotify.com/artist/artist-2' },
    },
    {
      id: 'artist-3',
      name: 'Glass Harbor',
      genres: [],
      popularity: 51,
      images: image('artist-3'),
      external_urls: { spotify: 'https://open.spotify.com/artist/artist-3' },
    },
  ],
};

export const topTracksFixture: SpotifyPage<SpotifyTrack> = {
  limit: 50,
  offset: 0,
  total: 2,
  items: [
    {
      id: 'track-1',
      name: 'Midnight Arcade',
      duration_ms: 214000,
      popularity: 70,
      artists: [{ id: 'artist-1', name: 'Neon Skyline' }],
      album: {
        id: 'album-1',
        name: 'Afterglow',
        release_date: '2024-05-01',
        images: image('album-1'),
      },
      external_urls: { spotify: 'https://open.spotify.com/track/track-1' },
    },
    {
      id: 'track-2',
      name: 'Static Bloom',
      duration_ms: 185000,
      popularity: 64,
      artists: [
        { id: 'artist-2', name: 'The Paper Kites' },
        { id: 'artist-3', name: 'Glass Harbor' },
      ],
      album: {
        id: 'album-2',
        name: 'Field Notes',
        release_date: '2023-11-10',
        images: image('album-2'),
      },
      external_urls: { spotify: 'https://open.spotify.com/track/track-2' },
    },
  ],
};
