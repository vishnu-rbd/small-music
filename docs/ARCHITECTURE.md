# Architecture

## Overview

A single-page app that runs entirely in the browser. It talks straight to Spotify:

- The **Spotify Web API** for library, search, stats, and remote playback control.
- The **Web Playback SDK** to make the browser tab a Spotify Connect device that plays audio itself.

There is no backend. Sign-in uses OAuth 2.0 **Authorization Code with PKCE**, which Spotify supports for browser apps without a client secret.

```
 Browser
 ┌──────────────────────────────────────────────┐
 │  React UI                                    │
 │   ├─ Router (pages)                          │
 │   ├─ TanStack Query  ──► api/ (fetch wrapper)├──► api.spotify.com
 │   ├─ Zustand (player state)                  │
 │   └─ Player service ──► Web Playback SDK ────├──► Spotify audio
 │                                              │
 │  auth/ (PKCE, token refresh) ────────────────├──► accounts.spotify.com
 │  IndexedDB (Dexie): listening history, cache │
 └──────────────────────────────────────────────┘
```

## Stack and why

| Choice | Why |
| --- | --- |
| Vite + React + TypeScript | Fast dev server, a large ecosystem, and type safety on Spotify's API responses |
| React Router | Client-side routing between pages |
| TanStack Query | Caching, retries, and pagination for Web API calls |
| Zustand | Small store for player state that changes often (position, track, device) |
| Tailwind CSS | Quick, consistent styling; dark mode with the `class` strategy |
| Recharts | Charts for the stats pages |
| Dexie (IndexedDB) | Stores listening history over time, beyond the 50-track limit of Spotify's recently-played endpoint |
| Vitest + Testing Library | Unit and component tests |
| Playwright | End-to-end tests with the Spotify API mocked |
| Static hosting (Vercel, Netlify, or GitHub Pages) | No server needed. The site must be served over HTTPS for the Playback SDK |

## Folder layout (planned)

```
src/
  app/            App shell, router, providers, layout
  auth/           PKCE helpers, token storage, refresh, auth context
  api/            Typed Spotify client, one file per area (me, player, search, ...)
  player/         Web Playback SDK loader, player service, Zustand store
  features/
    home/
    library/
    search/
    artist/
    stats/        Stats pages, chart components, aggregation functions
    settings/
  history/        Dexie schema, recorder (polls recently-played), queries
  components/     Shared UI (Button, TrackRow, Artwork, Slider, ...)
  lib/            Formatting (durations, dates), colour extraction, utilities
  types/          Spotify response types
tests/
  e2e/            Playwright specs
  fixtures/       Recorded Spotify API responses for mocks
docs/
```

## Auth flow

1. The user clicks "Sign in". The app makes a random `code_verifier`, hashes it into a `code_challenge` (SHA-256, base64url), and stores the verifier in `sessionStorage`.
2. Redirect to `https://accounts.spotify.com/authorize` with `client_id`, `response_type=code`, `redirect_uri`, `scope`, `code_challenge_method=S256`, `code_challenge`, and a random `state`.
3. Spotify redirects back to `/callback?code=...&state=...`. Check `state`, then POST to `https://accounts.spotify.com/api/token` with the code and verifier.
4. Store `access_token` (expires in 1 hour), `refresh_token`, and the expiry time.
5. The API client refreshes the token automatically before it expires, and once more when a call returns 401. Spotify may rotate the refresh token; always save the newest one.
6. Sign-out clears the tokens and the query cache. Local history stays unless the user clears it in Settings.

**Token storage.** We keep tokens in `localStorage` so the user stays signed in after reload. That is a known XSS risk for a backend-less app, so we keep it small: a strict Content Security Policy, no `dangerouslySetInnerHTML`, and few dependencies. A backend that holds tokens in an httpOnly cookie is a possible later upgrade.

## Playback

- Load `https://sdk.scdn.co/spotify-player.js` only after sign-in and only for Premium accounts (check `GET /me` → `product === "premium"`).
- Create `new Spotify.Player({ name: "test-music", getOAuthToken, volume })`. On `ready`, save the `device_id`.
- Move playback to the browser with `PUT /me/player` `{ device_ids: [id], play: false }`.
- Start a playlist, album, or track with `PUT /me/player/play` and a `context_uri` / `offset` or `uris`.
- Listen to `player_state_changed` for state in this tab. For remote devices, poll `GET /me/player` every few seconds while the tab is visible.
- Browsers block autoplay, so the first play must come from a click. Call `player.activateElement()` inside that click handler.
- Free accounts: hide the in-browser device. Remote-control endpoints need Premium too, so show a clear "Premium required" state on the controls.

## Listening history (local)

Spotify only returns the last 50 played tracks, and play counts and listening time aren't available at all. To build hour-of-day, streak, and minutes-listened stats:

- While the app is open, poll `GET /me/player/recently-played?after=<last cursor>` every ~10 minutes and when the tab regains focus.
- Store each play in IndexedDB: `{ playedAt, trackId, trackName, artistIds, artistNames, albumId, durationMs, contextUri }`, deduplicated on `playedAt + trackId`.
- Also record plays seen through the Playback SDK's state events, so tracks played in this tab are counted even if polling misses them.
- Limitation: plays that happen while the app is closed are only caught if there are 50 or fewer since the last poll. Say this in the UI.
- Export and import as JSON. Optionally import Spotify's own "Extended streaming history" download (also JSON) to fill in past years. This is a stretch goal.

## Caching and rate limits

- TanStack Query defaults: `staleTime` 5 minutes for library and stats; 0 for player state.
- Respect `429 Too Many Requests` by waiting for the `Retry-After` header. Back off and retry at most 3 times.
- Paginate library calls on demand (infinite scroll), not all at once.

## Error handling

- 401: refresh the token and retry once; if that fails, sign out with a message.
- 403 on player endpoints: usually means not Premium; show the Premium message.
- 404 "No active device": offer the device picker.
- Network down: show a banner and keep cached data on screen.

## Security and privacy

- Content Security Policy that allows only `self`, `*.spotify.com`, `*.scdn.co`, and `i.scdn.co` for images.
- No analytics or third-party trackers in v1.
- All listening history stays in the user's browser.
