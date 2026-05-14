import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicEnv } from "./env.js";

export function createSupabaseBrowserClient() {
  const { url, publishableKey } = getSupabasePublicEnv();

  return createBrowserClient(url, publishableKey);
}
