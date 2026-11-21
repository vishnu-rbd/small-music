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

   `VITE_SPOTIFY_CLIENT_ID` is the only required variable. It is public by design: PKCE uses no client secret, and this repo never ships one. `VITE_SPOTIFY_REDIRECT_URI` is optional and defaults to `http://127.0.0.1:5173/callback`.

3. Start the dev server:

   ```bash
   npm run dev
   ```

   Open <http://127.0.0.1:5173/stats> and choose **Sign in with Spotify**. Use `127.0.0.1`, not `localhost`: Spotify does not accept `localhost` redirect URIs.

Scripts: `npm run dev` (dev server), `npm run build` (type-check and production build into `dist/`), `npm test` (Vitest), `npm run preview` (serve the build), `npm run typecheck`.

## License

MIT, to be added with the first code commit.
