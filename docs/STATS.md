# Stats

Every stat says where its data comes from, so the UI can be honest about it. Two sources:

- **Spotify**: computed by Spotify, available right away after sign-in.
- **Local**: computed from history this app records in the browser (see [ARCHITECTURE.md](ARCHITECTURE.md#listening-history-local)). It starts empty and grows while the app is used. Each local stat shows "Based on N plays since <date>".

## Available on day one (Spotify)

| Stat | How it's computed |
| --- | --- |
| Top artists (4 weeks / 6 months / all time) | `GET /me/top/artists`, up to 50, in Spotify's order |
| Top tracks (same ranges) | `GET /me/top/tracks`, up to 50 |
| Top genres | Collect genres from top artists. Weight each artist by rank: `weight = 51 - rank`. Sum per genre, show top 10 with percentages. Artists with no genres are left out; show how many were left out |
| Rising and falling artists | Compare an artist's rank in `short_term` with `medium_term`. New entries are marked "New" |
| Mainstream score | Average `popularity` (0 to 100) of top tracks. Label: under 40 niche, 40 to 70 balanced, over 70 mainstream |
| Era breakdown | Release year of each top track's album, grouped by decade, as a bar chart |
| Average track length | Mean `duration_ms` of top tracks |
| Explicit share | Percent of top tracks with `explicit: true` |
| Artist diversity | Number of distinct artists across your top 50 tracks |
| Recently played | `GET /me/player/recently-played`, last 50, as a timeline grouped by day |

## Grows over time (Local)

| Stat | How it's computed |
| --- | --- |
| Minutes listened | Sum of `durationMs` per play, per day, week, or month. This counts the full track length, so it overcounts skips. Label it "estimated" |
| Plays per artist and track | Count plays per `artistId` / `trackId` in the chosen range |
| Listening clock | Plays per hour of day (0 to 23) in the user's local time zone; shown as a radial or bar chart |
| Week heatmap | 7 × 24 grid of play counts (day of week × hour) |
| Streak | Longest and current run of days with at least one play |
| Most-played day | The date with the most plays, and what was played |
| First listen | Earliest recorded play of an artist or track |
| On repeat | Tracks played 3 or more times in the last 7 days |

## Not possible (and why)

- **Mood, energy, tempo, danceability.** The Audio Features endpoint is closed to new apps.
- **Exact listening time.** Spotify doesn't report how much of a track was played. Plays in this browser tab could be timed exactly with SDK events as a later improvement.
- **Full lifetime history.** Only through importing Spotify's "Extended streaming history" export, which is a stretch goal.

## Share card

A 1080 × 1350 PNG made in the browser (canvas or `html-to-image`) showing top 5 artists or tracks for one time range, with artwork, the time range, and the app name. Spotify's branding rules require crediting Spotify and not changing album art (no crops that hide parts, no filters). Check the [design guidelines](https://developer.spotify.com/documentation/design) before shipping.

## Testing the maths

Each aggregation is a pure function in `src/features/stats/aggregate/` with unit tests on fixed fixtures: genre weighting, rank delta, decade grouping, streaks across time zones and daylight-saving changes, and dedup of history rows.
