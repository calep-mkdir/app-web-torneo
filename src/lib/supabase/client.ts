"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getClientEnv } from "@/lib/env/client";

let browserClient: SupabaseClient<any> | undefined;

export function getSupabaseBrowserClient(): SupabaseClient<any> {
  if (browserClient) {
    return browserClient;
  }

  const { NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishableKey, NEXT_PUBLIC_SUPABASE_URL: url } =
    getClientEnv();

  browserClient = createClient(url, publishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return browserClient;
}
