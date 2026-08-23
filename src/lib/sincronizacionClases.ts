// Completa la grilla de `clases` de un mes a partir de los días y horarios
// cargados en `paquetes_semanales`, para que Yani no tenga que cargar dos
// veces lo mismo (una vez en Paquetes, otra vez a mano en Horarios).
//
// Es a propósito puramente ADITIVO: nunca borra ni pisa una clase que ya
// existe. Una clase ya cargada puede tener reservas reales descontadas a
// mano por Yani (cupo_disponible < cupo_total) — sincronizar seguido (cada
// vez que se toca un paquete) con lógica de "borrar y recrear" perdería ese
// conteo sin aviso. Para forzar el reemplazo de un día/horario puntual (por
// ejemplo, limpiar una agenda de muestra) sigue estando el botón manual
// "Cargar clases semanales" en /admin, que sí pisa y pide confirmación antes.

import type { SupabaseClient } from "@supabase/supabase-js";
import { fechasDelMesQueCaenEn } from "@/lib/dias";

/** Regla de negocio: 13 lugares por clase, siempre — ver instrucciones del proyecto. */
const CUPO_FIJO = 13;

export interface ResultadoSincronizacion {
  creadas: number;
}

export async function sincronizarClasesDelMes(
  supabase: SupabaseClient,
  anio: number,
  mes: number
): Promise<ResultadoSincronizacion> {
  const { data: paquetes, error: errorPaquetes } = await supabase
    .from("paquetes_semanales")
    .select("dias, horarios");

  if (errorPaquetes) {
    throw new Error(errorPaquetes.message);
  }

  // Junta todos los pares (día, horario) de todos los paquetes, sin repetir
  // (si dos paquetes comparten día+horario, es la misma clase).
  const paresUnicos = new Map<string, { dia: string; horario: string }>();
  for (const paquete of paquetes ?? []) {
    for (const dia of (paquete.dias as string[] | null) ?? []) {
      for (const horario of (paquete.horarios as string[] | null) ?? []) {
        paresUnicos.set(`${dia}|${horario}`, { dia, horario });
      }
    }
  }

  if (paresUnicos.size === 0) {
    return { creadas: 0 };
  }

  const inicioMes = `${anio}-${String(mes + 1).padStart(2, "0")}-01`;
  const ultimoDia = new Date(anio, mes + 1, 0).getDate();
  const finMes = `${anio}-${String(mes + 1).padStart(2, "0")}-${String(ultimoDia).padStart(2, "0")}`;

  const { data: existentes, error: errorExistentes } = await supabase
    .from("clases")
    .select("fecha, hora")
    .gte("fecha", inicioMes)
    .lte("fecha", finMes);

  if (errorExistentes) {
    throw new Error(errorExistentes.message);
  }

  const clavesExistentes = new Set(
    (existentes ?? []).map((fila) => `${fila.fecha}|${(fila.hora as string).slice(0, 5)}`)
  );

  const filasNuevas: { fecha: string; hora: string; cupo_total: number; cupo_disponible: number }[] = [];

  for (const { dia, horario } of paresUnicos.values()) {
    const fechas = fechasDelMesQueCaenEn(anio, mes, [dia]);
    for (const fecha of fechas) {
      const clave = `${fecha}|${horario}`;
      if (!clavesExistentes.has(clave)) {
        filasNuevas.push({ fecha, hora: horario, cupo_total: CUPO_FIJO, cupo_disponible: CUPO_FIJO });
        clavesExistentes.add(clave); // por si dos pares del mismo mes coinciden en fecha
      }
    }
  }

  if (filasNuevas.length === 0) {
    return { creadas: 0 };
  }

  const { error: errorInsert } = await supabase.from("clases").insert(filasNuevas);
  if (errorInsert) {
    throw new Error(errorInsert.message);
  }

  return { creadas: filasNuevas.length };
}
