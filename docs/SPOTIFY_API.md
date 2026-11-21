# Spotify API notes

Reference: <https://developer.spotify.com/documentation/web-api> and <https://developer.spotify.com/documentation/web-playback-sdk>.

Check these pages again before building. Spotify changes access rules from time to time.

## Scopes

| Scope | Used for |
| --- | --- |
| `streaming` | Web Playback SDK (play audio in the browser) |
| `user-read-email`, `user-read-private` | Profile, country, and Premium check (required by the SDK) |
| `user-read-playback-state` | Current device, track, and progress |
| `user-modify-playback-state` | Play, pause, skip, seek, volume, transfer, queue |
| `user-read-currently-playing` | Now-playing info |
| `user-read-recently-played` | Recently played and local history recorder |
| `user-top-read` | Top artists and tracks (stats) |
| `user-library-read`, `user-library-modify` | Liked songs, saved albums, like/unlike |
| `playlist-read-private`, `playlist-read-collaborative` | The user's playlists |
| `user-follow-read` | Followed artists |

Ask only for these. Adding a scope later makes every user sign in again.

## Endpoints we use

**Profile**
- `GET /me`

**Player** (need Premium)
- `GET /me/player`, `GET /me/player/devices`, `GET /me/player/currently-playing`
- `PUT /me/player` (transfer), `PUT /me/player/play`, `PUT /me/player/pause`
- `POST /me/player/next`, `POST /me/player/previous`
- `PUT /me/player/seek`, `PUT /me/player/volume`, `PUT /me/player/shuffle`, `PUT /me/player/repeat`
- `GET /me/player/queue`, `POST /me/player/queue`
- `GET /me/player/recently-played` (limit 50, cursor-based with `before`/`after`)

**Library**
- `GET /me/playlists`, `GET /playlists/{id}`, `GET /playlists/{id}/tracks`
- `GET /me/tracks`, `PUT /me/tracks`, `DELETE /me/tracks`, `GET /me/tracks/contains`
- `GET /me/albums`, `GET /albums/{id}`
- `GET /me/following?type=artist`

**Catalog**
- `GET /search?type=track,artist,album,playlist`
- `GET /artists/{id}`, `GET /artists/{id}/top-tracks`, `GET /artists/{id}/albums`
- `GET /artists?ids=...` (batch, up to 50) to get genres for many artists

**Stats**
- `GET /me/top/artists?time_range=short_term|medium_term|long_term&limit=50`
- `GET /me/top/tracks?time_range=...&limit=50`
- `short_term` ≈ last 4 weeks, `medium_term` ≈ last 6 months, `long_term` ≈ about a year (Spotify calls it "all time").

## Gotchas to plan around

1. **Premium needed for playback.** Both the Web Playback SDK and the `/me/player` control endpoints need Premium. Library, search, and stats work on Free.
2. **Endpoints closed to new apps (since November 27, 2024).** Apps created after that date get `403` from: Audio Features, Audio Analysis, Recommendations, Related Artists, featured and category playlists, and 30-second preview URLs. That means no "mood" or "energy" stats and no "similar artists" from the API. Our stats use top items, genres, release years, popularity, and local history instead.
3. **Development mode user limit.** A new Spotify app runs in development mode. Only users you add by email in the Developer Dashboard can sign in, and the number is capped (it has been 25, and Spotify has tightened this over time; check the dashboard). Getting out of development mode needs Spotify's approval, which is now hard for hobby apps. Plan for this to stay a personal or small-group app.
4. **No play counts or listening time.** The API doesn't give how many times you played something or for how long. This is why we record local history.
5. **Recently played is only the last 50 plays**, and tracks under about 30 seconds may not show up.
6. **Genres live on artists, not tracks.** Many artists have an empty genre list, so genre stats are approximate.
7. **Redirect URIs must match exactly**, and Spotify no longer accepts `localhost`. Use `http://127.0.0.1:5173/callback` for local dev and an HTTPS URL in production.
8. **Rate limits** are per app over a rolling 30-second window and aren't published. Handle `429` with `Retry-After`.
9. **Autoplay.** Browsers block audio until the user interacts with the page. Call `player.activateElement()` on the first click.
10. **Safari and Firefox** have had DRM and EME quirks with the Playback SDK. Test them early (see TASKS.md, milestone 2).
11. **Spotify Developer Terms** forbid some uses, including training models on Spotify content and some kinds of data storage and sharing. Read the [Developer Policy](https://developer.spotify.com/policy) before public launch, especially for the history and share-card features.
