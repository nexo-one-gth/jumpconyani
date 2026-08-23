// Registro único de los días de la semana, en orden fijo (lunes a domingo) y
// con el índice que usa `Date.getDay()` de JavaScript (0 = domingo).
//
// Antes esto vivía adentro de paquetes.ts. Se separó acá al sumar la carga de
// clases semanales en /admin (que también necesita un selector de días, pero
// no tiene nada que ver con paquetes) para no depender una feature de la otra
// ni duplicar la lista. paquetes.ts re-exporta estos mismos nombres para no
// tener que tocar los componentes que ya los importaban de ahí.

export const DIAS_SEMANA = [
  { clave: "lunes", etiqueta: "Lunes", indiceJs: 1 },
  { clave: "martes", etiqueta: "Martes", indiceJs: 2 },
  { clave: "miercoles", etiqueta: "Miércoles", indiceJs: 3 },
  { clave: "jueves", etiqueta: "Jueves", indiceJs: 4 },
  { clave: "viernes", etiqueta: "Viernes", indiceJs: 5 },
  { clave: "sabado", etiqueta: "Sábado", indiceJs: 6 },
  { clave: "domingo", etiqueta: "Domingo", indiceJs: 0 },
] as const;

/** Solo lunes a viernes — para selectores que no necesitan fin de semana (ej. carga de clases por lote). */
export const DIAS_HABILES = DIAS_SEMANA.slice(0, 5);

/** "lunes, miercoles, viernes" (en cualquier orden) -> "Lunes, miércoles y viernes". */
export function formatearDias(dias: string[]): string {
  const ordenados = DIAS_SEMANA.filter((dia) => dias.includes(dia.clave)).map((dia) => dia.etiqueta);
  if (ordenados.length === 0) return "";
  if (ordenados.length === 1) return ordenados[0];
  return `${ordenados.slice(0, -1).join(", ")} y ${ordenados[ordenados.length - 1]}`;
}

/** Todas las fechas ("2026-08-03") del mes pedido cuyo día de la semana está entre los elegidos. */
export function fechasDelMesQueCaenEn(anio: number, mes: number, diasElegidos: string[]): string[] {
  const indicesElegidos = new Set<number>(
    DIAS_SEMANA.filter((dia) => diasElegidos.includes(dia.clave)).map((dia) => dia.indiceJs)
  );
  const fechas: string[] = [];
  const cursor = new Date(anio, mes, 1);
  while (cursor.getMonth() === mes) {
    if (indicesElegidos.has(cursor.getDay())) {
      fechas.push(
        `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`
      );
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return fechas;
}
