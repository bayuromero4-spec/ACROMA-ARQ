import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/** Variables públicas (la clave "anon/publishable" es pública por diseño; la seguridad la dan las políticas RLS). */
export const SUPABASE_URL: string = import.meta.env.PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_KEY: string = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? '';

export const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_KEY);

let client: SupabaseClient | null = null;

/** Cliente de solo lectura para el build (sin sesión). */
export function getServerClient(): SupabaseClient | null {
  if (!hasSupabase) return null;
  client ??= createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}
