import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getServerEnv } from "@/lib/env/server";

let serverClient: SupabaseClient<any> | undefined;

export function getSupabaseServerClient(): SupabaseClient<any> {
  if (serverClient) {
    return serverClient;
  }

  const { NEXT_PUBLIC_SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: serviceRoleKey } =
    getServerEnv();

  serverClient = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return serverClient;
}
