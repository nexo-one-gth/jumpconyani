// Configuración editable de la home (precios y textos del Hero), cargada
// desde /admin/precios-textos. Se lee con un cliente de Supabase "plano"
// (sin @supabase/ssr): es una lectura pública, sin sesión de por medio, y
// este archivo lo usan Server Components que corren solo en el servidor
// (createBrowserClient de @supabase/ssr rompería ahí porque espera `document`).

import { createClient } from "@supabase/supabase-js";

export interface ConfiguracionHome {
  precioClase: string | null;
  precioConjunto: string | null;
  heroTitulo: string;
  heroBajada: string;
}

const CONFIGURACION_POR_DEFECTO: ConfiguracionHome = {
  precioClase: null,
  precioConjunto: null,
  heroTitulo: "Saltá, quemá calorías y divertite con Yani",
  heroBajada:
    "Clases de Jumping Fitness sobre trampolín para todos los niveles. Reservá tu lugar o sumate a una clase libre — cupos limitados a 13 alumnas por clase.",
};

export async function obtenerConfiguracionHome(): Promise<ConfiguracionHome> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from("configuracion_home")
    .select("precio_clase, precio_conjunto, hero_titulo, hero_bajada")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) {
    return CONFIGURACION_POR_DEFECTO;
  }

  return {
    precioClase: data.precio_clase,
    precioConjunto: data.precio_conjunto,
    heroTitulo: data.hero_titulo,
    heroBajada: data.hero_bajada,
  };
}
