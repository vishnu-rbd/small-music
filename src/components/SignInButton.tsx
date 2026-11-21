import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';

/**
 * The single sign-in action used by every page. Clicking it redirects to Spotify's
 * authorize endpoint; the browser comes back to `/callback`.
 */
export function SignInButton({ className = '' }: { className?: string }) {
  const { status, signIn } = useAuth();
  const [pending, setPending] = useState(false);

  if (status === 'missing-config') {
    return (
      <p className="rounded-md border border-amber-700/60 bg-amber-950/40 px-3 py-2 text-sm text-amber-200">
        Spotify sign-in is not configured. Set <code className="font-mono">VITE_SPOTIFY_CLIENT_ID</code> in{' '}
        <code className="font-mono">.env.local</code> and restart the dev server. See{' '}
        <code className="font-mono">.env.example</code>.
      </p>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        setPending(true);
        void signIn().catch(() => setPending(false));
      }}
      className={`rounded-full bg-[#1db954] px-5 py-2 font-semibold text-neutral-950 transition hover:bg-[#1ed760] disabled:opacity-60 ${className}`}
    >
      {pending ? 'Redirecting to Spotify…' : 'Sign in with Spotify'}
    </button>
  );
}
