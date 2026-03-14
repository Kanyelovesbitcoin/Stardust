import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from './supabase';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

/**
 * Central auth hook — tracks the Supabase session AND the event type so
 * consumers can distinguish a genuine SIGNED_OUT from a transient null
 * session during token refresh.
 */
export function useSupabaseAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [event, setEvent] = useState<AuthChangeEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Keep a ref so fetchAccessToken always reads the latest session
  const sessionRef = useRef<Session | null>(null);
  const eventRef = useRef<AuthChangeEvent | null>(null);

  const applyAuthState = useCallback((nextEvent: AuthChangeEvent, nextSession: Session | null) => {
    sessionRef.current = nextSession;
    eventRef.current = nextEvent;

    setSession((prev) => {
      const prevToken = prev?.access_token ?? null;
      const nextToken = nextSession?.access_token ?? null;
      return prevToken === nextToken ? prev : nextSession;
    });
    setEvent((prev) => (prev === nextEvent ? prev : nextEvent));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const hydrateSession = async () => {
      const {
        data: { session: existing },
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      applyAuthState(existing ? 'SIGNED_IN' : 'SIGNED_OUT', existing ?? null);
    };

    void hydrateSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((authEvent: AuthChangeEvent, authSession: Session | null) => {
      if (!isMounted) {
        return;
      }

      const nextEvent = authSession ? authEvent : 'SIGNED_OUT';
      const nextSession = authSession ?? null;
      const currentToken = sessionRef.current?.access_token ?? null;
      const nextToken = nextSession?.access_token ?? null;
      const didChange =
        nextEvent !== eventRef.current ||
        nextToken !== currentToken;

      if (didChange) {
        applyAuthState(nextEvent, nextSession);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [applyAuthState]);

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      if (forceRefreshToken) {
        const {
          data: { session: refreshed },
        } = await supabase.auth.refreshSession();
        return refreshed?.access_token ?? null;
      }
      return sessionRef.current?.access_token ?? null;
    },
    []
  );

  // Stabilize the return object so ConvexProviderWithAuth doesn't re-auth on every render
  return useMemo(() => ({
    isLoading,
    isAuthenticated: !!session,
    event,
    session,
    fetchAccessToken,
  }), [isLoading, session, event, fetchAccessToken]);
}
