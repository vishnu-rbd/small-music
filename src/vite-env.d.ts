/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Spotify app Client ID. Public by design: PKCE uses no client secret. */
  readonly VITE_SPOTIFY_CLIENT_ID?: string;
  /** Redirect URI registered on the Spotify app. Defaults to <origin>/callback. */
  readonly VITE_SPOTIFY_REDIRECT_URI?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
