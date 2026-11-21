import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  clearTokens,
  getClientId,
  isExpired,
  loadTokens,
  refreshTokens,
  startLogin,
  type TokenSet,
} from './spotifyAuth';

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'missing-config';

export interface AuthContextValue {
  status: AuthStatus;
  accessToken: string | null;
  /** Signs in with Spotify (PKCE). No-op when the Client ID is not configured. */
  signIn: () => Promise<void>;
  signOut: () => void;
  /** Returns a valid access token, refreshing it first when it is close to expiring. */
  getAccessToken: () => Promise<string>;
  /**
   * Drops the session after Spotify rejected the token (401/403). `message` is a
   * user-facing explanation and is kept in `sessionEndedReason` for the UI.
   */
  expireSession: (message?: string) => void;
  /**
   * Why the last session ended programmatically (e.g. a rejected token), so a page
   * can still explain what happened after the session is gone. Null after a normal
   * sign-out, or while signed in.
   */
  sessionEndedReason: string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const clientId = getClientId();
  const queryClient = useQueryClient();
  const [tokens, setTokens] = useState<TokenSet | null>(() => loadTokens());
  const [sessionEndedReason, setSessionEndedReason] = useState<string | null>(null);

  const status: AuthStatus = !clientId ? 'missing-config' : tokens ? 'authenticated' : 'unauthenticated';

  const signOut = useCallback(() => {
    clearTokens();
    setTokens(null);
    setSessionEndedReason(null);
    queryClient.clear();
  }, [queryClient]);

  const expireSession = useCallback(
    (message?: string) => {
      clearTokens();
      setTokens(null);
      setSessionEndedReason(message ?? 'Spotify rejected the request. Please sign in again.');
      queryClient.clear();
    },
    [queryClient],
  );

  const signIn = useCallback(async () => {
    if (!clientId) return;
    await startLogin(clientId);
  }, [clientId]);

  // Refresh proactively once an hour-ish token gets close to expiring while the
  // tab is open, so the user is not bounced to sign-in mid-session.
  useEffect(() => {
    if (!clientId || !tokens) return;
    if (!isExpired(tokens)) return;
    let cancelled = false;
    refreshTokens(clientId, tokens)
      .then((next) => {
        if (!cancelled) setTokens(next);
      })
      .catch(() => {
        if (!cancelled) signOut();
      });
    return () => {
      cancelled = true;
    };
  }, [clientId, tokens, signOut]);

  const getAccessToken = useCallback(async () => {
    if (!clientId) throw new Error('VITE_SPOTIFY_CLIENT_ID is not configured.');
    const current = loadTokens();
    if (!current) throw new Error('Not signed in.');
    if (!isExpired(current)) return current.accessToken;
    try {
      const next = await refreshTokens(clientId, current);
      setTokens(next);
      return next.accessToken;
    } catch (error) {
      signOut();
      throw error;
    }
  }, [clientId, signOut]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      accessToken: tokens?.accessToken ?? null,
      signIn,
      signOut,
      getAccessToken,
      expireSession,
      sessionEndedReason,
    }),
    [status, tokens, signIn, signOut, getAccessToken, expireSession, sessionEndedReason],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>.');
  return context;
}
