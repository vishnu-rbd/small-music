# test-music

A web app that plays your Spotify music in the browser and shows stats about your listening.

> **Status:** Planning only. No code has been written yet. See [TASKS.md](TASKS.md) for the build plan.

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
| [docs/SETUP.md](docs/SETUP.md) | How to register a Spotify app and run the project locally (once there is code) |
| [TASKS.md](TASKS.md) | Milestones and the task checklist |

## Requirements

- A Spotify account. **Playing music inside the browser needs Spotify Premium.** Free accounts can still use the library and stats pages.
- A Spotify Developer app (free) to get a Client ID. See [docs/SETUP.md](docs/SETUP.md).

## Planned stack

Vite, React, TypeScript, React Router, TanStack Query, Zustand, Recharts, Tailwind CSS, IndexedDB (via Dexie), Vitest, and Playwright. There is no backend: the app signs in with Spotify's PKCE flow straight from the browser. Reasons are in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## License

MIT, to be added with the first code commit.
