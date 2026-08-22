// Paquetes de clases semanales: cuántas veces por semana, qué días fijos
// tiene el paquete y qué horarios se pueden elegir para esos días, más el
// precio. Se editan desde /admin/paquetes (tabla `paquetes_semanales` en
// Supabase) y los consume la sección pública "Planes" (SeccionPaquetes).
//
// Igual que horarios.ts, se lee con el cliente de navegador: el selector
// público es un componente de cliente interactivo (elegís paquete y
// horario), no un Server Component de solo lectura.
//
// DIAS_SEMANA y formatearDias viven en lib/dias.ts (compartido con la carga
// de clases semanales en /admin, que también necesita un selector de días
// pero no tiene nada que ver con paquetes). Se re-exportan acá para no tener
// que tocar los componentes que ya los importaban de este archivo.

import { crearClienteSupabase } from "@/lib/supabase/client";
import { DIAS_SEMANA, formatearDias } from "@/lib/dias";

export { DIAS_SEMANA, formatearDias };

export interface Paquete {
  id: string;
  clasesPorSemana: number;
  precio: string;
  dias: string[];
  horarios: string[];
}

export function formatearHora(horario: string): string {
  return `${horario} hs`;
}

/** Paquetes ordenados de más a menos clases por semana (5, 3, 2, ...). */
export async function obtenerPaquetes(): Promise<Paquete[]> {
  const supabase = crearClienteSupabase();
  const { data, error } = await supabase
    .from("paquetes_semanales")
    .select("id, clases_por_semana, precio, dias, horarios")
    .order("clases_por_semana", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((fila) => ({
    id: fila.id,
    clasesPorSemana: fila.clases_por_semana,
    precio: fila.precio,
    dias: fila.dias ?? [],
    horarios: (fila.horarios ?? []).slice().sort(),
  }));
}
