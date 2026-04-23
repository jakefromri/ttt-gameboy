import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * supabase is optional — if no env vars set, the app runs in local
 * hot-seat mode (both players on the same device). once env is present
 * the Home screen offers create/join flows.
 */
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;

export const hasRealtime = supabase !== null;
