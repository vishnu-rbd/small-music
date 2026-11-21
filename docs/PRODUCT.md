# Product

## Goal

A clean, fast web player for Spotify with a stats section that tells you something about your listening that the Spotify app doesn't.

## Who it's for

People who already use Spotify, want a browser player that isn't cluttered, and like looking at their own listening data. A "Wrapped" you can check any day of the year.

## Screens

### 1. Sign in
- "Sign in with Spotify" button.
- One line on what the app reads from the account and that nothing leaves the browser.
- Note that in-browser playback needs Premium.

### 2. Home
- Greeting and a "Jump back in" row of recently played items.
- Your playlists as a grid.
- A small stats teaser: top artist this month, minutes listened this week (once local history exists).

### 3. Now Playing bar (on every screen)
- Album art, title, artist (artist name links to the artist page).
- Play/pause, previous, next, shuffle, repeat (off / context / track).
- Seek bar with elapsed and total time.
- Volume slider and mute.
- Device picker: this browser or any other active Spotify Connect device.
- Like/unlike the current track.

### 4. Now Playing (full screen)
- Large artwork with a background colour taken from the artwork.
- Up-next queue: view it and add tracks to it.

### 5. Library
- Tabs: Playlists, Liked Songs, Albums, Artists (followed).
- Sort and filter within each tab.
- Playlist and album detail pages with a track list; click a track to play it in that context.

### 6. Search
- Search box with results grouped into tracks, artists, albums, and playlists.
- Results update as you type (debounced).

### 7. Artist page
- Header, top tracks, albums and singles.
- How this artist ranks in your own top lists, if they appear.

### 8. Stats
See [STATS.md](STATS.md) for definitions. Sections:
- Time range switch: last 4 weeks, last 6 months, all time.
- Top artists (ranked list and grid).
- Top tracks.
- Top genres (worked out from your top artists).
- Recently played timeline.
- Listening patterns from local history: hour of day, day of week, minutes per day, streaks.
- Share card: export a PNG image of your top 5.

### 9. Settings
- Account info and sign out.
- Local history: on/off, export as JSON, clear.
- Theme: light, dark, system.

## User stories

- As a listener, I can sign in with Spotify and start playing a playlist within a few clicks.
- As a listener, I can control music on my phone from my laptop.
- As a listener, I can see my top 10 artists for the last month and compare them with all time.
- As a listener, I can see what time of day I listen most, based on history the app has recorded.
- As a listener, I can save an image of my top artists to share.
- As a privacy-minded user, I can see, export, and delete everything the app stores about me.

## Out of scope for v1

- A backend server or user accounts of our own.
- Social features (friends, comparing stats with others).
- Lyrics. Spotify doesn't offer a public lyrics API.
- Audio-feature stats (danceability, energy, tempo) and recommendations. Spotify turned these endpoints off for new apps in November 2024. See [SPOTIFY_API.md](SPOTIFY_API.md).
- Offline playback and mobile apps. The web app should still work well on a phone-sized screen.

## Success criteria for v1

- Sign in, play, pause, skip, and seek all work in Chrome, Firefox, and Safari on desktop.
- Stats pages load in under 2 seconds on a normal connection.
- No Spotify token is ever sent anywhere except Spotify.
