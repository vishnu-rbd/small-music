# Setup

> There is no code yet. These steps are for when milestone 0 in [TASKS.md](../TASKS.md) is done.

## 1. Create a Spotify app

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and sign in.
2. Click **Create app**.
3. Name: `test-music` (anything works). Description: anything.
4. Redirect URIs: add `http://127.0.0.1:5173/callback`. Add your production URL later, for example `https://your-site.example/callback`.
5. APIs used: tick **Web API** and **Web Playback SDK**.
6. Save, then open **Settings** and copy the **Client ID**. You don't need the client secret; PKCE doesn't use it. Never commit it.
7. Under **User Management**, add the email of every Spotify account that will sign in. In development mode, only these accounts can use the app.

## 2. Configure the project

Create `.env.local` in the project root (it is git-ignored):

```
VITE_SPOTIFY_CLIENT_ID=your_client_id_here
VITE_SPOTIFY_REDIRECT_URI=http://127.0.0.1:5173/callback
```

A `.env.example` with the same keys and empty values will be committed.

## 3. Run it

Requires Node.js 20 or newer.

```bash
npm install
```

```bash
npm run dev -- --host 127.0.0.1
```

Open <http://127.0.0.1:5173>. Use `127.0.0.1`, not `localhost`, or the redirect URI won't match.

## 4. Other scripts (planned)

| Command | What it does |
| --- | --- |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run test` | Unit and component tests (Vitest) |
| `npm run test:e2e` | End-to-end tests (Playwright, Spotify mocked) |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

## 5. Deploy

Any static host that serves HTTPS and can rewrite all paths to `index.html` (for client-side routes like `/callback`). Set the two `VITE_` variables in the host's settings and add the production callback URL in the Spotify dashboard.
