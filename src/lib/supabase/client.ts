import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente de Supabase para usar en componentes de cliente ("use client").
 * Usa la clave pública (anon/publishable): no da acceso a nada que las
 * políticas de seguridad (RLS) de cada tabla no permitan explícitamente.
 */
export function crearClienteSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
