import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { getClientId, handleCallback } from '../../auth/spotifyAuth';

type CallbackState = { phase: 'working' } | { phase: 'error'; message: string };

/**
 * Spotify redirects here after sign-in: `/callback?code=…&state=…`.
 * Exchanges the code for tokens (PKCE), then returns to `/stats`.
 */
export function CallbackPage() {
  const clientId = getClientId();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [state, setState] = useState<CallbackState>({ phase: 'working' });
  // StrictMode runs effects twice in development; only exchange the code once.
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    if (!clientId) {
      setState({
        phase: 'error',
        message: 'VITE_SPOTIFY_CLIENT_ID is not set. Add it to .env.local and restart the dev server.',
      });
      return;
    }

    handleCallback(clientId, new URL(window.location.href))
      .then(() => {
        queryClient.clear();
        navigate('/stats', { replace: true });
      })
      .catch((error: unknown) => {
        setState({
          phase: 'error',
          message: error instanceof Error ? error.message : 'Sign-in failed.',
        });
      });
  }, [clientId, navigate, queryClient]);

  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-2xl font-semibold">Signing in with Spotify</h1>
      {state.phase === 'working' ? (
        <p className="mt-2 text-neutral-400" role="status">
          Finishing the handshake…
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          <p role="alert" className="text-sm text-red-300">
            {state.message}
          </p>
          <Link to="/stats" className="text-[#1ed760] underline underline-offset-4">
            Back to stats to try again
          </Link>
        </div>
      )}
    </main>
  );
}
