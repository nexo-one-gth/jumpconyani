// Agenda de clases.
// Antes esto era un archivo estático (GRILLA_CARGADA, editable a mano). Ahora
// se lee de la tabla `clases` en Supabase, que Yani edita sola desde
// /admin — ver src/app/admin/page.tsx. La forma de los datos (Horario,
// DiaConHorarios) se mantiene igual para no tener que tocar los componentes
// visuales.
//
// Los valores que hay cargados hoy siguen siendo de MUESTRA (no la agenda
// real de Yani todavía) — eso no cambió por pasar a Supabase, solo cambió
// quién y cómo los edita. El aviso en pantalla se mantiene hasta que Yani
// cargue la agenda real desde el panel.

import { crearClienteSupabase } from "@/lib/supabase/client";

export interface Horario {
  hora: string; // "09:00"
  cupoTotal: number;
  cupoDisponible: number;
}

export interface DiaConHorarios {
  fecha: Date;
  horarios: Horario[];
}

function primerYUltimoDiaDelMes(anio: number, mes: number): [string, string] {
  const inicio = `${anio}-${String(mes + 1).padStart(2, "0")}-01`;
  const ultimoDia = new Date(anio, mes + 1, 0).getDate();
  const fin = `${anio}-${String(mes + 1).padStart(2, "0")}-${String(ultimoDia).padStart(2, "0")}`;
  return [inicio, fin];
}

/**
 * Trae los días con clase del mes pedido desde Supabase. Si no hay ningún
 * horario cargado para ese mes, devuelve un array vacío (el componente que
 * lo consume es el que decide cómo avisarlo, en vez de inventar horarios).
 */
export async function obtenerGrillaDelMes(anio: number, mes: number): Promise<DiaConHorarios[]> {
  const supabase = crearClienteSupabase();
  const [inicio, fin] = primerYUltimoDiaDelMes(anio, mes);

  const { data, error } = await supabase
    .from("clases")
    .select("fecha, hora, cupo_total, cupo_disponible")
    .gte("fecha", inicio)
    .lte("fecha", fin)
    .order("fecha", { ascending: true })
    .order("hora", { ascending: true });

  if (error || !data) {
    return [];
  }

  const mapa = new Map<string, DiaConHorarios>();
  for (const fila of data) {
    const [anioFila, mesFila, diaFila] = fila.fecha.split("-").map(Number);
    const fecha = new Date(anioFila, mesFila - 1, diaFila);
    const clave = fecha.toDateString();

    if (!mapa.has(clave)) {
      mapa.set(clave, { fecha, horarios: [] });
    }
    mapa.get(clave)!.horarios.push({
      hora: fila.hora.slice(0, 5),
      cupoTotal: fila.cupo_total,
      cupoDisponible: fila.cupo_disponible,
    });
  }

  return Array.from(mapa.values());
}

export function formatearFechaCorta(fecha: Date): string {
  return fecha.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
}

export function mismaFecha(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
