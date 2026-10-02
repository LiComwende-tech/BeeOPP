import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "./config";

export function createClient() {
  const config = getSupabaseConfig();
  if (!config) throw new Error("Authentication is not connected yet. Add the Supabase settings to .env.local.");
  return createBrowserClient(config.url, config.key);
}
