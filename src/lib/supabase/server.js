import { createClient } from "@supabase/supabase-js";
import { getSupabaseServerEnv } from "./env.js";

export function createSupabaseServiceClient() {
  const { url, serviceRoleKey } = getSupabaseServerEnv();

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
