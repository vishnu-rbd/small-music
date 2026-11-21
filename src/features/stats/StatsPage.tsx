import { useState, type ReactNode } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import { Panel, PanelMessage } from '../../components/Panel';
import { SignInButton } from '../../components/SignInButton';
import { deriveGenresFromTopArtists } from './deriveGenres';
import { ArtistList } from './ArtistList';
import { TrackList } from './TrackList';
import { TimeRangeToggle, TIME_RANGE_OPTIONS } from './TimeRangeToggle';
import { useTopArtists, useTopTracks } from './useTopItems';
import type { TimeRange } from '../../types/spotify';

interface StatsPageProps {
  /** Default range; the toggle starts here. */
  initialTimeRange?: TimeRange;
  /** Controlled range (used by tests and deep links). */
  timeRange?: TimeRange;
  onTimeRangeChange?: (timeRange: TimeRange) => void;
}

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return 'Something went wrong while loading your top items.';
}

interface StatsContentProps {
  timeRange: TimeRange;
  onTimeRangeChange: (timeRange: TimeRange) => void;
}

/**
 * The page body. Rendered only when signed in, so its query hooks never run
 * against an empty session.
 */
function StatsContent({ timeRange, onTimeRangeChange }: StatsContentProps) {
  const selected = TIME_RANGE_OPTIONS.find((option) => option.value === timeRange) ?? TIME_RANGE_OPTIONS[0];
  const artistsQuery = useTopArtists(timeRange);
  const tracksQuery = useTopTracks(timeRange);
  const genres = artistsQuery.data ? deriveGenresFromTopArtists(artistsQuery.data.items) : undefined;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <TimeRangeToggle value={timeRange} onChange={onTimeRangeChange} />
        <span className="text-xs text-neutral-500">
          Spotify <code className="font-mono">{selected.value}</code>
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Top artists" caption={`Ranked by Spotify for ${selected.label.toLowerCase()}.`}>
          <QueryState
            isLoading={artistsQuery.isLoading}
            error={artistsQuery.error}
            isEmpty={artistsQuery.data?.items.length === 0}
            emptyMessage="Spotify returned no top artists for this time range."
          >
            <ArtistList artists={artistsQuery.data?.items ?? []} />
          </QueryState>
        </Panel>

        <Panel title="Top tracks" caption={`Ranked by Spotify for ${selected.label.toLowerCase()}.`}>
          <QueryState
            isLoading={tracksQuery.isLoading}
            error={tracksQuery.error}
            isEmpty={tracksQuery.data?.items.length === 0}
            emptyMessage="Spotify returned no top tracks for this time range."
          >
            <TrackList tracks={tracksQuery.data?.items ?? []} />
          </QueryState>
        </Panel>

        <div className="md:col-span-2">
          <Panel
            title="Top genres"
            caption="Derived from the top-artists payload: Spotify attaches genres to artists, not tracks, and many artists have no genres listed, so this is approximate."
          >
            <QueryState
              isLoading={artistsQuery.isLoading}
              error={artistsQuery.error}
              isEmpty={!genres || genres.genres.length === 0}
              emptyMessage={
                artistsQuery.data
                  ? `None of your ${artistsQuery.data.items.length} top artists have genres listed by Spotify for this time range.`
                  : 'No genre data.'
              }
            >
              <ul className="flex flex-wrap gap-2">
                {(genres?.genres ?? []).slice(0, 12).map(({ genre, count }) => (
                  <li
                    key={genre}
                    className="rounded-full border border-neutral-700 bg-neutral-800/70 px-3 py-1 text-sm capitalize"
                  >
                    {genre}
                    <span className="ml-2 text-xs tabular-nums text-neutral-400">{count}</span>
                  </li>
                ))}
              </ul>
              {genres ? (
                <p className="mt-3 text-xs text-neutral-500">
                  From {genres.artistsWithGenres} of your {genres.totalArtists} top artists that have genres. The number
                  is how many of those artists share the genre.
                </p>
              ) : null}
            </QueryState>
          </Panel>
        </div>
      </div>
    </>
  );
}

function QueryState({
  isLoading,
  error,
  isEmpty,
  emptyMessage,
  children,
}: {
  isLoading: boolean;
  error: unknown;
  isEmpty: boolean;
  emptyMessage: string;
  children: ReactNode;
}) {
  if (isLoading) return <PanelMessage>Loading…</PanelMessage>;
  if (error) {
    // Every error state keeps a way back in: the usual cause is a dead session.
    return (
      <div className="space-y-3 py-4">
        <p role="alert" className="text-sm text-red-300">
          {errorMessage(error)}
        </p>
        <SignInButton />
      </div>
    );
  }
  if (isEmpty) return <PanelMessage>{emptyMessage}</PanelMessage>;
  return <>{children}</>;
}

function SignedOutCard() {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6">
      <h2 className="text-lg font-semibold">Sign in to see your stats</h2>
      <p className="mt-1 text-sm text-neutral-400">
        Stats are read from your Spotify account with the <code className="font-mono">user-top-read</code> scope. You
        can keep using the rest of the app without signing in.
      </p>
      <div className="mt-4">
        <SignInButton />
      </div>
    </div>
  );
}

export function StatsPage({ initialTimeRange = 'short_term', timeRange, onTimeRangeChange }: StatsPageProps) {
  const { status, sessionEndedReason } = useAuth();
  const [uncontrolledTimeRange, setUncontrolledTimeRange] = useState<TimeRange>(initialTimeRange);
  const [dismissedReason, setDismissedReason] = useState<string | null>(null);
  // A rejected token drops the session; explain it here, with a way back in.
  const authProblem = sessionEndedReason && sessionEndedReason !== dismissedReason ? sessionEndedReason : null;
  const selectedTimeRange = timeRange ?? uncontrolledTimeRange;

  const handleChange = (next: TimeRange) => {
    setUncontrolledTimeRange(next);
    onTimeRangeChange?.(next);
  };

  // `missing-config` also lands here: SignInButton explains what to set.
  const signedIn = status === 'authenticated';

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Your listening stats</h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-400">
          Your top artists, tracks, and genres over the last 4 weeks, 6 months, or all time. Data comes from Spotify's
          top-items endpoints, so it reflects what Spotify counts as your favourites in each window.
        </p>
      </header>

      {authProblem ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-900/60 bg-red-950/30 p-4">
          <p role="alert" className="text-sm text-red-200">
            {authProblem}
          </p>
          <div className="flex items-center gap-3">
            <SignInButton />
            <button
              type="button"
              onClick={() => setDismissedReason(authProblem)}
              className="text-xs text-neutral-400 underline underline-offset-4"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}

      {signedIn ? <StatsContent timeRange={selectedTimeRange} onTimeRangeChange={handleChange} /> : <SignedOutCard />}
    </main>
  );
}
