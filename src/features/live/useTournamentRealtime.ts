"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";

import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { TournamentRealtimeStore } from "./tournamentRealtimeStore";
import type {
  TournamentRealtimeOptions,
  UseTournamentRealtimeResult,
} from "./types";

export function useTournamentRealtime(
  options: TournamentRealtimeOptions,
): UseTournamentRealtimeResult {
  const supabase = options.supabase ?? getSupabaseBrowserClient();
  const store = useMemo(
    () =>
      new TournamentRealtimeStore({
        categoryId: options.categoryId,
        initialSnapshot: options.initialSnapshot ?? null,
        supabase,
      }),
    // The initial snapshot is only a seed for a newly selected category.
    // Recreating the store on every snapshot change would break realtime sync.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [options.categoryId, supabase],
  );
  const state = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  );

  useEffect(() => {
    void store.start();

    return () => {
      void store.dispose();
    };
  }, [store]);

  useEffect(() => {
    const handleOnline = () => {
      void store.reconnectNow();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && store.getSnapshot().stale) {
        void store.refresh();
      }
    };

    window.addEventListener("online", handleOnline);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("online", handleOnline);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [store]);

  return {
    ...state,
    refresh: store.refresh,
    reconnectNow: store.reconnectNow,
  };
}
