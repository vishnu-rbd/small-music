import { formatDuration, pickImageUrl } from '../../lib/format';
import type { SpotifyTrack } from '../../types/spotify';

/** Ranked list of top tracks. Rank comes from the order Spotify returns. */
export function TrackList({ tracks }: { tracks: SpotifyTrack[] }) {
  return (
    <ol className="space-y-1">
      {tracks.map((track, index) => {
        const imageUrl = pickImageUrl(track.album.images, 64);
        return (
          <li key={track.id} className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-neutral-800/60">
            <span className="w-6 shrink-0 text-right text-sm tabular-nums text-neutral-500">{index + 1}</span>
            {imageUrl ? (
              <img src={imageUrl} alt="" width={40} height={40} className="size-10 rounded object-cover" />
            ) : (
              <span aria-hidden className="size-10 shrink-0 rounded bg-neutral-800" />
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium text-neutral-100">{track.name}</span>
              <span className="block truncate text-xs text-neutral-400">
                {track.artists.map((artist) => artist.name).join(', ')}
              </span>
            </span>
            <span className="shrink-0 text-sm tabular-nums text-neutral-500">{formatDuration(track.duration_ms)}</span>
          </li>
        );
      })}
    </ol>
  );
}
