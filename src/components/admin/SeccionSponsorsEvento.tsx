"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { crearClienteSupabase } from "@/lib/supabase/client";
import { SPONSORS } from "@/lib/sponsors";

interface FilaSponsorEvento {
  id: string;
  nombre_sponsor: string;
  logo_sponsor: string | null;
  token: string;
  aporte: string | null;
  detalle: string | null;
  creado_en: string;
}

interface Props {
  eventoId: string;
}

/**
 * Bloque de "Sponsors del evento" dentro de /admin/eventos/[id]. Mismo
 * mecanismo que "Profesoras invitadas" (ver SeccionProfesoras.tsx): Yani
 * agrega al sponsor y le queda un link con token para copiar y mandarle por
 * WhatsApp — eso lleva a /sponsors/[token], donde el propio sponsor carga
 * con qué aporta al evento, el detalle de la colaboración, y los nombres de
 * los colaboradores que va a llevar. A diferencia de las profesoras, acá no
 * se escribe un nombre libre: se elige de la lista general de sponsors
 * (src/lib/sponsors.ts), así el nombre siempre coincide con uno de los que
 * ya tienen logo.
 *
 * La cantidad de colaboradores ya no es un número que carga el sponsor: se
 * cuenta a partir de los nombres que cargó (tabla
 * `colaboradores_sponsor_evento`), igual que la cantidad de alumnas de cada
 * profesora. El alias que ve el sponsor en su formulario público es el de
 * Yani (alias_pago), no uno propio — por eso ya no hay nada de alias que
 * mostrar acá.
 *
 * La tabla `sponsors_evento` no tiene ningún acceso público: solo la
 * lee/escribe este componente con el cliente autenticado.
 */
export default function SeccionSponsorsEvento({ eventoId }: Props) {
  const supabase = useMemo(() => crearClienteSupabase(), []);

  const [sponsorsEvento, setSponsorsEvento] = useState<FilaSponsorEvento[] | null>(null);
  const [cantidadColaboradores, setCantidadColaboradores] = useState<Record<string, number>>({});
  const [nombreElegido, setNombreElegido] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [borrando, setBorrando] = useState<string | null>(null);
  const [tokenCopiado, setTokenCopiado] = useState<string | null>(null);
  const [claveRecarga, setClaveRecarga] = useState(0);

  useEffect(() => {
    let vigente = true;

    async function cargar() {
      const { data, error: errorConsulta } = await supabase
        .from("sponsors_evento")
        .select("id, nombre_sponsor, logo_sponsor, token, aporte, detalle, creado_en")
        .eq("evento_id", eventoId)
        .order("creado_en", { ascending: true });

      if (!vigente) return;

      if (errorConsulta) {
        setError("No se pudo cargar la lista de sponsors: " + errorConsulta.message);
        setSponsorsEvento([]);
        return;
      }

      setError(null);
      setSponsorsEvento(data ?? []);

      if (!data || data.length === 0) {
        setCantidadColaboradores({});
        return;
      }

      const { data: colaboradores, error: errorColaboradores } = await supabase
        .from("colaboradores_sponsor_evento")
        .select("sponsor_evento_id")
        .in(
          "sponsor_evento_id",
          data.map((s) => s.id)
        );

      if (!vigente || errorColaboradores || !colaboradores) return;

      const conteo: Record<string, number> = {};
      colaboradores.forEach((fila) => {
        conteo[fila.sponsor_evento_id] = (conteo[fila.sponsor_evento_id] ?? 0) + 1;
      });
      setCantidadColaboradores(conteo);
    }

    cargar();
    return () => {
      vigente = false;
    };
  }, [supabase, eventoId, claveRecarga]);

  const disponibles = SPONSORS.filter(
    (s) => !sponsorsEvento?.some((se) => se.nombre_sponsor === s.nombre)
  );

  useEffect(() => {
    if (disponibles.length > 0 && !disponibles.some((s) => s.nombre === nombreElegido)) {
      setNombreElegido(disponibles[0].nombre);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo re-sincroniza el default cuando cambia la lista de disponibles
  }, [sponsorsEvento]);

  async function agregarSponsor(e: FormEvent) {
    e.preventDefault();
    const sponsor = SPONSORS.find((s) => s.nombre === nombreElegido);
    if (!sponsor) return;

    setGuardando(true);
    setError(null);

    const { error: errorInsert } = await supabase
      .from("sponsors_evento")
      .insert({ evento_id: eventoId, nombre_sponsor: sponsor.nombre, logo_sponsor: sponsor.logo });

    setGuardando(false);

    if (errorInsert) {
      setError("No se pudo agregar el sponsor: " + errorInsert.message);
      return;
    }

    setClaveRecarga((c) => c + 1);
  }

  async function eliminarSponsor(sponsor: FilaSponsorEvento) {
    if (!confirm(`¿Quitar a "${sponsor.nombre_sponsor}" de este evento? Se pierde lo que haya cargado.`)) return;

    setBorrando(sponsor.id);
    setError(null);

    const { error: errorDelete } = await supabase.from("sponsors_evento").delete().eq("id", sponsor.id);

    setBorrando(null);

    if (errorDelete) {
      setError("No se pudo quitar: " + errorDelete.message);
      return;
    }

    setClaveRecarga((c) => c + 1);
  }

  async function copiarLink(sponsor: FilaSponsorEvento) {
    const link = `${window.location.origin}/sponsors/${sponsor.token}`;
    try {
      await navigator.clipboard.writeText(link);
      setTokenCopiado(sponsor.token);
      setTimeout(() => setTokenCopiado((actual) => (actual === sponsor.token ? null : actual)), 2000);
    } catch {
      setError("No se pudo copiar el link solo. Copialo a mano: " + link);
    }
  }

  return (
    <details className="group mt-8 border-t border-zinc-200 pt-6">
      <summary className="flex cursor-pointer list-none items-center justify-between font-titulo text-lg uppercase text-marca-negro [&::-webkit-details-marker]:hidden">
        Sponsors del evento
        <span aria-hidden className="text-base text-zinc-400 transition-transform duration-200 group-open:rotate-180">
          ▾
        </span>
      </summary>
      <p className="mt-2 text-sm text-zinc-500">
        Elegí de tu lista general a los sponsors que participan de este evento y copiales el link — ahí cargan con
        qué aportan, el detalle de la colaboración y los colaboradores que van a llevar.
      </p>

      {error && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-marca-rojo">{error}</p>}

      {disponibles.length > 0 ? (
        <form onSubmit={agregarSponsor} className="mt-4 flex gap-2">
          <select
            value={nombreElegido}
            onChange={(e) => setNombreElegido(e.target.value)}
            className="h-12 flex-1 rounded-xl border border-zinc-300 px-3 text-base"
          >
            {disponibles.map((s) => (
              <option key={s.nombre} value={s.nombre}>
                {s.nombre}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={guardando}
            className="flex h-12 items-center justify-center rounded-full bg-marca-rosa px-5 text-sm font-semibold text-marca-negro disabled:opacity-60"
          >
            Agregar
          </button>
        </form>
      ) : (
        sponsorsEvento !== null && (
          <p className="mt-4 rounded-xl bg-zinc-50 p-3 text-sm text-zinc-500">
            Ya agregaste a todos los sponsors de tu lista general.
          </p>
        )
      )}

      {sponsorsEvento === null && <p className="mt-4 text-sm text-zinc-500">Cargando…</p>}

      {sponsorsEvento !== null && sponsorsEvento.length === 0 && (
        <p className="mt-4 rounded-xl bg-zinc-50 p-4 text-sm text-zinc-500">
          Todavía no agregaste ningún sponsor a este evento.
        </p>
      )}

      {sponsorsEvento !== null && sponsorsEvento.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          {sponsorsEvento.map((sponsor) => {
            const cantidad = cantidadColaboradores[sponsor.id] ?? 0;
            return (
              <div key={sponsor.id} className="rounded-2xl border border-zinc-200 p-3">
                <div className="flex flex-wrap items-center gap-3">
                  {sponsor.logo_sponsor && (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-50">
                      <Image
                        src={sponsor.logo_sponsor}
                        alt={sponsor.nombre_sponsor}
                        width={44}
                        height={44}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-marca-negro">{sponsor.nombre_sponsor}</p>
                    <p className="text-xs text-zinc-500">
                      {cantidad === 0 && !sponsor.aporte
                        ? "Todavía no completó sus datos"
                        : [`${cantidad} colaborador${cantidad === 1 ? "" : "es"}`, sponsor.aporte]
                            .filter(Boolean)
                            .join(" · ")}
                    </p>
                    {sponsor.detalle && <p className="mt-1 text-xs text-zinc-500">{sponsor.detalle}</p>}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={`/admin/eventos/${eventoId}/sponsors/${sponsor.id}`}
                    className="flex h-11 items-center justify-center rounded-full bg-marca-rosa px-3 text-xs font-semibold text-marca-negro"
                  >
                    Ver colaboradores
                  </Link>
                  <button
                    type="button"
                    onClick={() => copiarLink(sponsor)}
                    className="flex h-11 items-center justify-center rounded-full border border-zinc-300 px-3 text-xs font-medium text-zinc-600"
                  >
                    {tokenCopiado === sponsor.token ? "¡Copiado!" : "Copiar link"}
                  </button>
                  <button
                    type="button"
                    disabled={borrando === sponsor.id}
                    onClick={() => eliminarSponsor(sponsor)}
                    className="flex h-11 items-center justify-center rounded-full border border-zinc-300 px-3 text-xs font-medium text-zinc-500 disabled:opacity-60"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </details>
  );
}
