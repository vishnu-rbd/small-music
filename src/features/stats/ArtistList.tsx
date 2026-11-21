import { pickImageUrl } from '../../lib/format';
import type { SpotifyArtist } from '../../types/spotify';

/** Ranked list of top artists. Rank comes from the order Spotify returns. */
export function ArtistList({ artists }: { artists: SpotifyArtist[] }) {
  return (
    <ol className="space-y-1">
      {artists.map((artist, index) => {
        const imageUrl = pickImageUrl(artist.images, 64);
        return (
          <li key={artist.id} className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-neutral-800/60">
            <span className="w-6 shrink-0 text-right text-sm tabular-nums text-neutral-500">{index + 1}</span>
            {imageUrl ? (
              <img src={imageUrl} alt="" width={40} height={40} className="size-10 rounded-full object-cover" />
            ) : (
              <span aria-hidden className="size-10 shrink-0 rounded-full bg-neutral-800" />
            )}
            <span className="min-w-0">
              <span className="block truncate font-medium text-neutral-100">{artist.name}</span>
              <span className="block truncate text-xs text-neutral-400">
                {artist.genres.length > 0 ? artist.genres.slice(0, 3).join(' · ') : 'No genres listed'}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
