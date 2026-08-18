import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente de Supabase para usar en Server Components / Server Actions.
 * Lee y escribe la sesión desde las cookies de la request. El error al
 * escribir cookies desde un Server Component se ignora a propósito: el
 * middleware (middleware.ts) ya se encarga de refrescar la sesión en cada
 * request, así que no hace falta que un Server Component pueda escribirlas.
 */
export async function crearClienteSupabaseServidor() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesParaSetear) {
          try {
            cookiesParaSetear.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Se puede ignorar: pasa cuando se llama desde un Server Component.
          }
        },
      },
    }
  );
}
