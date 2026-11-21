# Tasks

The build plan, split into milestones. Each milestone ends with something you can use. Check items off as they land.

Docs: [Product](docs/PRODUCT.md) · [Architecture](docs/ARCHITECTURE.md) · [Spotify API](docs/SPOTIFY_API.md) · [Stats](docs/STATS.md) · [Setup](docs/SETUP.md)

---

## Milestone 0: Project setup
- [ ] Create Spotify Developer app and add test users ([SETUP.md](docs/SETUP.md))
- [ ] Scaffold Vite + React + TypeScript
- [ ] Add ESLint, Prettier, and strict `tsconfig`
- [ ] Add Tailwind CSS with light and dark themes
- [ ] Add React Router with placeholder pages: Home, Library, Search, Artist, Stats, Settings, Callback
- [ ] Add TanStack Query and Zustand providers
- [ ] Add Vitest + Testing Library; one sample test
- [ ] Add `.env.example` and `.gitignore` (ignore `.env.local`, `dist/`, `node_modules/`)
- [ ] GitHub Actions: lint, typecheck, test on every push and PR
- [ ] Add MIT LICENSE

**Done when:** `npm run dev` shows the app shell with working navigation, and CI is green.

## Milestone 1: Sign in
- [ ] PKCE helpers: code verifier, SHA-256 challenge, state ([ARCHITECTURE.md › Auth flow](docs/ARCHITECTURE.md#auth-flow))
- [ ] Sign-in page and redirect to Spotify
- [ ] `/callback` route: check state, exchange code for tokens
- [ ] Token storage with expiry; auto-refresh before expiry and on 401
- [ ] Typed fetch wrapper for `api.spotify.com` with 429 `Retry-After` handling
- [ ] Load `GET /me`; show avatar, name, and Free/Premium badge in the header
- [ ] Sign out
- [ ] Protected routes redirect to sign-in
- [ ] Unit tests for PKCE and refresh logic

**Done when:** you can sign in, reload the page and stay signed in, and sign out.

## Milestone 2: Player
- [ ] Load the Web Playback SDK for Premium users only
- [ ] Player service: create the player, capture `device_id`, handle `ready`, `not_ready`, and error events
- [ ] Zustand player store: track, position, duration, paused, shuffle, repeat, volume, device
- [ ] Now Playing bar: artwork, title, artist, play/pause, previous, next
- [ ] Seek bar with smooth progress between state updates
- [ ] Volume slider and mute
- [ ] Shuffle and repeat toggles
- [ ] Device picker: list devices, transfer playback
- [ ] Poll `GET /me/player` for remote devices while the tab is visible
- [ ] Like/unlike the current track
- [ ] Handle autoplay with `activateElement()` on the first click
- [ ] Free-account and "no active device" states
- [ ] Keyboard shortcuts: Space play/pause, ←/→ seek, Shift+←/→ previous/next
- [ ] Media Session API so OS media keys and lock-screen controls work
- [ ] Test in Chrome, Firefox, and Safari; write down any quirks in SPOTIFY_API.md

**Done when:** a Premium user can play, control, and move music between this tab and another device.

## Milestone 3: Library and search
- [ ] Home: recently played row and playlists grid
- [ ] Library tabs: Playlists, Liked Songs, Albums, Artists
- [ ] Infinite scroll for paginated lists
- [ ] Playlist and album detail pages with track list
- [ ] Shared `TrackRow` component: play in context, add to queue, like
- [ ] Search with debounced input and grouped results
- [ ] Artist page: header, top tracks, discography
- [ ] Full-screen Now Playing with queue and artwork colour background
- [ ] Loading skeletons and empty states

**Done when:** you can find and play anything in your library or the catalog without leaving the app.

## Milestone 4: Stats (Spotify data)
- [ ] Stats page layout with time range switch (4 weeks / 6 months / all time)
- [ ] Top artists: ranked list and grid views
- [ ] Top tracks
- [ ] Batch-fetch artist details for genres
- [ ] Top genres with rank weighting ([STATS.md](docs/STATS.md))
- [ ] Rising and falling artists (short vs medium term)
- [ ] Mainstream score
- [ ] Era breakdown by decade (chart)
- [ ] Average track length, explicit share, artist diversity cards
- [ ] Recently played timeline
- [ ] Unit tests for every aggregation function

**Done when:** the Stats page shows all day-one stats for all three time ranges.

## Milestone 5: Local listening history
- [ ] Dexie schema for plays, with a dedup key on `playedAt + trackId`
- [ ] Recorder: poll recently-played with `after` cursor every ~10 min and on tab focus
- [ ] Record plays from Playback SDK state events
- [ ] "Based on N plays since <date>" label on local stats
- [ ] Minutes listened per day, week, and month (chart)
- [ ] Plays per artist and track
- [ ] Listening clock (hour of day)
- [ ] Week heatmap (day × hour)
- [ ] Streaks: current and longest
- [ ] On repeat (3+ plays in last 7 days)
- [ ] Settings: history on/off, export JSON, import JSON, clear
- [ ] Tests for dedup, streaks across time zones and DST

**Done when:** after a few days of use, the local stats show real patterns, and the user can export or delete the data.

## Milestone 6: Polish and release
- [ ] Share card: PNG of top 5, following Spotify's branding rules
- [ ] Responsive layout down to 375px wide
- [ ] Accessibility pass: keyboard navigation, focus states, labels, colour contrast
- [ ] Error banner for offline and API failures
- [ ] Content Security Policy headers
- [ ] Playwright E2E tests with mocked Spotify API: sign in, play, stats
- [ ] Lighthouse: performance and accessibility scores of 90 or higher
- [ ] Deploy to a static host over HTTPS
- [ ] Add the production redirect URI in the Spotify dashboard
- [ ] Read Spotify's Developer Policy and Design guidelines; fix anything that conflicts
- [ ] Update README with screenshots and a live link

**Done when:** the app is live at a public URL and works for the added test users.

---

## Later ideas (not planned)
- [ ] Import Spotify "Extended streaming history" export to fill in past years
- [ ] Exact time-listened for plays in this tab, from SDK events
- [ ] Year-in-review page built from local history
- [ ] Small backend to store tokens in httpOnly cookies and record history while the app is closed
- [ ] PWA install and offline shell
- [ ] Playlist tools: dedupe, sort, create a playlist from top tracks
