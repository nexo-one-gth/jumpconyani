// Datos de eventos y masterclasses.
// A diferencia de las clases semanales (que se gestionan por WhatsApp), un
// evento ya está cerrado de antemano: fecha, lugar y precio se conocen de
// entrada, así que la ficha se explica sola. Ver PRODUCT.md, sección
// "Por qué el evento cuenta todo y la clase no".
//
// Los eventos se cargan y editan desde /admin/eventos (tabla `eventos` en
// Supabase). Se usa el mismo cliente "plano" que configuracionHome.ts: estas
// funciones las llaman Server Components async (createBrowserClient de
// @supabase/ssr rompería ahí porque espera `document`).

import { createClient } from "@supabase/supabase-js";

export type FlyerEvento =
  | { tipo: "imagen"; src: string; ancho: number; alto: number; alt: string }
  | { tipo: "video"; src: string };

export interface OpcionTraslado {
  titulo: string;
  detalle: string;
}

/** Íconos disponibles para los beneficios de la propuesta a sponsors
 * (ver IconosBeneficio.tsx). Set fijo para que Yani elija de un desplegable
 * y no tenga que subir imágenes. */
export const ICONOS_BENEFICIO = ["bandera", "remera", "redes", "radio", "camara"] as const;
export type IconoBeneficio = (typeof ICONOS_BENEFICIO)[number];

export interface BeneficioSponsor {
  icono: IconoBeneficio;
  texto: string;
}

/** Propuesta de sponsoreo que se muestra en /sponsors/[token] antes del
 * formulario. Se carga por evento desde el panel; si está vacía, la sección
 * no se muestra. Todos los campos son opcionales por separado. */
export interface PropuestaSponsors {
  descripcion?: string;
  aporte?: string;
  premio?: string;
  beneficios?: BeneficioSponsor[];
  cierre?: string;
}

export interface Evento {
  id: string;
  slug: string;
  titulo: string;
  flyer: FlyerEvento;
  /** Texto para mostrar tal cual (soporta rangos: "6, 7 y 8 de noviembre"). */
  fecha: string;
  /** Primer día del evento, solo para ordenar y para ocultar eventos ya pasados. */
  fechaOrden: Date;
  horario?: string;
  /** Localidad conocida, no la dirección exacta (mismo criterio que MapaZona). */
  direccion?: string;
  observacion?: string;
  precio?: string;
  comoLlegar?: OpcionTraslado[];
  propuestaSponsors?: PropuestaSponsors;
}

export interface FilaEvento {
  id: string;
  slug: string;
  titulo: string;
  flyer_src: string;
  flyer_ancho: number;
  flyer_alto: number;
  flyer_alt: string;
  fecha: string;
  fecha_orden: string;
  horario: string | null;
  direccion: string | null;
  observacion: string | null;
  precio: string | null;
  como_llegar: OpcionTraslado[] | null;
  propuesta_sponsors: PropuestaSponsors | null;
}

function clienteEventos() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

export function filaAEvento(fila: FilaEvento): Evento {
  // fecha_orden llega como "2026-09-26"; se arma la fecha local a mano para
  // no correr el riesgo de que el huso horario la mueva un día (mismo
  // criterio que src/app/admin/page.tsx).
  const [anio, mes, dia] = fila.fecha_orden.split("-").map(Number);

  return {
    id: fila.id,
    slug: fila.slug,
    titulo: fila.titulo,
    flyer: {
      tipo: "imagen",
      src: fila.flyer_src,
      ancho: fila.flyer_ancho,
      alto: fila.flyer_alto,
      alt: fila.flyer_alt,
    },
    fecha: fila.fecha,
    fechaOrden: new Date(anio, mes - 1, dia),
    horario: fila.horario ?? undefined,
    direccion: fila.direccion ?? undefined,
    observacion: fila.observacion ?? undefined,
    precio: fila.precio ?? undefined,
    comoLlegar: fila.como_llegar ?? undefined,
    propuestaSponsors: fila.propuesta_sponsors ?? undefined,
  };
}

export const COLUMNAS_EVENTO =
  "id, slug, titulo, flyer_src, flyer_ancho, flyer_alto, flyer_alt, fecha, fecha_orden, horario, direccion, observacion, precio, como_llegar, propuesta_sponsors";

export async function obtenerEventoPorSlug(slug: string): Promise<Evento | undefined> {
  const { data, error } = await clienteEventos()
    .from("eventos")
    .select(COLUMNAS_EVENTO)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return undefined;
  return filaAEvento(data);
}

/** Eventos de hoy en adelante, ordenados por fecha. No hace falta que Yani borre los vencidos a mano. */
export async function eventosProximos(desde: Date = new Date()): Promise<Evento[]> {
  const inicioDeHoy = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate());
  const fechaISO = `${inicioDeHoy.getFullYear()}-${String(inicioDeHoy.getMonth() + 1).padStart(2, "0")}-${String(inicioDeHoy.getDate()).padStart(2, "0")}`;

  const { data, error } = await clienteEventos()
    .from("eventos")
    .select(COLUMNAS_EVENTO)
    .gte("fecha_orden", fechaISO)
    .order("fecha_orden", { ascending: true });

  if (error || !data) return [];
  return data.map(filaAEvento);
}

/** Todos los eventos (pasados y próximos), para el panel de administración. */
export async function obtenerTodosLosEventos(): Promise<Evento[]> {
  const { data, error } = await clienteEventos().from("eventos").select(COLUMNAS_EVENTO).order("fecha_orden", { ascending: true });

  if (error || !data) return [];
  return data.map(filaAEvento);
}
