# test-music

A web app that plays your Spotify music in the browser and shows stats about your listening.

> **Status:** Early. The app shell and the Stats page are built: sign in with Spotify (PKCE, no backend) and see your top artists, tracks, and genres for ~4 weeks, ~6 months, and all time. Player and library are still planned. See [TASKS.md](TASKS.md) for the build plan.

## What it does

- **Player.** Play music from your Spotify account in the browser, or control playback on another device (phone, desktop app, speaker).
- **Library.** Browse your playlists, saved tracks, and albums, and search the Spotify catalog.
- **Stats.** See your top artists, tracks, and genres over the last 4 weeks, 6 months, and all time, plus your recent listening and patterns built from history the app records over time.

## Docs

| Doc | What's in it |
| --- | --- |
| [docs/PRODUCT.md](docs/PRODUCT.md) | Features, screens, user stories, and what's out of scope |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Tech stack, folder layout, auth flow, data flow, storage |
| [docs/SPOTIFY_API.md](docs/SPOTIFY_API.md) | Spotify endpoints, scopes, limits, and the gotchas we have to plan around |
| [docs/STATS.md](docs/STATS.md) | Each stat: what it means, where its data comes from, how it is computed |
| [docs/SETUP.md](docs/SETUP.md) | How to register a Spotify app and run the project locally |
| [TASKS.md](TASKS.md) | Milestones and the task checklist |

## Requirements

- A Spotify account. **Playing music inside the browser needs Spotify Premium.** Free accounts can still use the library and stats pages.
- A Spotify Developer app (free) to get a Client ID. See [docs/SETUP.md](docs/SETUP.md).

## Planned stack

Vite, React, TypeScript, React Router, TanStack Query, Zustand, Recharts, Tailwind CSS, IndexedDB (via Dexie), Vitest, and Playwright. There is no backend: the app signs in with Spotify's PKCE flow straight from the browser. Reasons are in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

The Stats page uses Vite, React, TypeScript, React Router, TanStack Query, Tailwind CSS, and Vitest. Zustand, Recharts, Dexie, and Playwright are not added yet.

## Run locally

Requires Node.js 20.19+ or 22.12+.

1. Create a Spotify app and copy its **Client ID** (see [docs/SETUP.md](docs/SETUP.md)). Add `http://127.0.0.1:5173/callback` as a Redirect URI, and add your Spotify email under **User Management**.
2. Install and configure:

   ```bash
   npm install
   cp .env.example .env.local
   # then edit .env.local and set VITE_SPOTIFY_CLIENT_ID
   ```

   `VITE_SPOTIFY_CLIENT_ID` is the only required variable. It is public by design: PKCE uses no client secret, and this repo never ships one. `VITE_SPOTIFY_REDIRECT_URI` is optional and normally left empty: the app derives the redirect URI from the browser's own origin instead, so it cannot drift from the URL you actually run (see [Sign-in redirect URI](#sign-in-redirect-uri)).

3. Start the dev server:

   ```bash
   npm run dev
   ```

   Open <http://127.0.0.1:5173/stats> and choose **Sign in with Spotify**. Use `127.0.0.1`, not `localhost`: they are different URIs to Spotify, and the address you register in step 1 is the one you must browse to.

Scripts: `npm run dev` (dev server), `npm run build` (type-check and production build into `dist/`), `npm test` (Vitest), `npm run preview` (serve the build), `npm run typecheck`.

## Sign-in redirect URI

Sign-in uses Spotify's Authorization Code flow with PKCE, entirely in the browser. Spotify only sends the browser back to a URI you registered on the app, and it compares that URI **character for character**.

The app builds the URI from its own origin: `window.location.origin + '/callback'` (unless you set `VITE_SPOTIFY_REDIRECT_URI`). That one value is sent to Spotify as `redirect_uri` when sign-in starts, and again, unchanged, on the token exchange. Deriving it this way means dev and a deployed URL cannot drift apart.

Register these exactly under **Spotify Dashboard → your app → Settings → Redirect URIs**:

| Where you run it | Exact value to register |
| --- | --- |
| Local dev (`npm run dev`) | `http://127.0.0.1:5173/callback` |
| A deployed site | `https://your-site.example/callback` |

Rules that make Spotify reject the request:

- **No trailing slash.** `/callback`, never `/callback/`.
- **`127.0.0.1`, not `localhost`.** They are different URIs; add both only if you register both.
- **Same port.** `npm run dev` uses 5173 with `strictPort`, so the port cannot silently change.
- **Same scheme.** `http` locally, `https` when deployed.

Nothing is hard-coded to a host: if you start the dev server and open a different address, the app sends that address's `/callback`. That is why a mismatch shows up as Spotify refusing the request, or as "sign-in session expired" when the callback lands on a different origin than the tab that started it.

The flow, and what the app checks:

1. **Authorize.** `GET https://accounts.spotify.com/authorize` with `response_type=code`, `client_id`, `redirect_uri`, `scope=user-top-read`, `state` (random) and `code_challenge_method=S256` plus `code_challenge` (SHA-256 of a random verifier). The verifier and state are kept in `sessionStorage`, which is scoped to the tab and not shared with the long-lived token in `localStorage`.
2. **Callback.** Spotify returns to `/callback?code=…&state=…`, or `?error=…` if you decline. The app checks `state` against the stored value, then POSTs `grant_type=authorization_code`, `code`, `redirect_uri` and `code_verifier` to `https://accounts.spotify.com/api/token` as `application/x-www-form-urlencoded`. No client secret is involved.
3. **Landing.** On success the tokens are stored and you land on `/stats`. The `code` and `state` are removed from the address bar, on failure too, so they do not stay in history.

## License

MIT, to be added with the first code commit.
