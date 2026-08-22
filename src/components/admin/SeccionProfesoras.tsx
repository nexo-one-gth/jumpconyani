"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { crearClienteSupabase } from "@/lib/supabase/client";

interface FilaProfesoraEvento {
  id: string;
  nombre: string;
  token: string;
  creado_en: string;
}

interface Props {
  eventoId: string;
}

/** Saca acentos y pasa a minúsculas, para que la búsqueda por nombre no
 * dependa de que se escriban las tildes igual. */
function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Bloque de "Profesoras invitadas" dentro de /admin/eventos/[id]. Yani
 * agrega el nombre de cada profesora que participa del evento y acá le
 * queda un link (con un token impredecible, no una URL adivinable) para
 * copiar y mandarle por WhatsApp — eso lleva a /profesoras/[token], donde
 * la profesora carga su propia lista de alumnas.
 *
 * Desde acá también se entra a la pantalla de pagos de cada profesora
 * (/admin/eventos/[id]/profesoras/[profesoraId]), con la cantidad de
 * alumnas que ya cargó como referencia rápida. La tabla `profesoras_evento`
 * no tiene ningún acceso público: solo la lee/escribe este componente con
 * el cliente autenticado.
 */
export default function SeccionProfesoras({ eventoId }: Props) {
  const supabase = useMemo(() => crearClienteSupabase(), []);

  const [profesoras, setProfesoras] = useState<FilaProfesoraEvento[] | null>(null);
  const [cantidadAlumnas, setCantidadAlumnas] = useState<Record<string, number>>({});
  const [resumen, setResumen] = useState({ totalAlumnas: 0, recaudado: 0 });
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [borrando, setBorrando] = useState<string | null>(null);
  const [tokenCopiado, setTokenCopiado] = useState<string | null>(null);
  const [claveRecarga, setClaveRecarga] = useState(0);
  const [busqueda, setBusqueda] = useState("");

  const profesorasFiltradas = useMemo(() => {
    if (!profesoras) return [];
    const termino = normalizarTexto(busqueda);
    if (!termino) return profesoras;
    return profesoras.filter((profesora) => normalizarTexto(profesora.nombre).includes(termino));
  }, [profesoras, busqueda]);

  useEffect(() => {
    let vigente = true;

    async function cargar() {
      const { data, error: errorConsulta } = await supabase
        .from("profesoras_evento")
        .select("id, nombre, token, creado_en")
        .eq("evento_id", eventoId)
        .order("creado_en", { ascending: true });

      if (!vigente) return;

      if (errorConsulta) {
        setError("No se pudo cargar la lista de profesoras: " + errorConsulta.message);
        setProfesoras([]);
        return;
      }

      setError(null);
      setProfesoras(data ?? []);

      if (!data || data.length === 0) {
        setCantidadAlumnas({});
        setResumen({ totalAlumnas: 0, recaudado: 0 });
        return;
      }

      const { data: alumnas, error: errorAlumnas } = await supabase
        .from("alumnas_evento")
        .select("profesora_evento_id, pago, monto")
        .in(
          "profesora_evento_id",
          data.map((p) => p.id)
        );

      if (!vigente || errorAlumnas || !alumnas) return;

      const conteo: Record<string, number> = {};
      let recaudado = 0;
      alumnas.forEach((fila) => {
        conteo[fila.profesora_evento_id] = (conteo[fila.profesora_evento_id] ?? 0) + 1;
        if (fila.pago) recaudado += fila.monto ?? 0;
      });
      setCantidadAlumnas(conteo);
      setResumen({ totalAlumnas: alumnas.length, recaudado });
    }

    cargar();
    return () => {
      vigente = false;
    };
  }, [supabase, eventoId, claveRecarga]);

  async function agregarProfesora(e: FormEvent) {
    e.preventDefault();
    if (!nombreNuevo.trim()) return;

    setGuardando(true);
    setError(null);

    const { error: errorInsert } = await supabase
      .from("profesoras_evento")
      .insert({ evento_id: eventoId, nombre: nombreNuevo.trim() });

    setGuardando(false);

    if (errorInsert) {
      setError("No se pudo agregar la profesora: " + errorInsert.message);
      return;
    }

    setNombreNuevo("");
    setClaveRecarga((c) => c + 1);
  }

  async function eliminarProfesora(profesora: FilaProfesoraEvento) {
    if (
      !confirm(
        `¿Quitar a "${profesora.nombre}" de este evento? Si ya había cargado alumnas, esa lista se pierde también.`
      )
    )
      return;

    setBorrando(profesora.id);
    setError(null);

    const { error: errorDelete } = await supabase.from("profesoras_evento").delete().eq("id", profesora.id);

    setBorrando(null);

    if (errorDelete) {
      setError("No se pudo quitar: " + errorDelete.message);
      return;
    }

    setClaveRecarga((c) => c + 1);
  }

  async function copiarLink(profesora: FilaProfesoraEvento) {
    const link = `${window.location.origin}/profesoras/${profesora.token}`;
    try {
      await navigator.clipboard.writeText(link);
      setTokenCopiado(profesora.token);
      setTimeout(() => setTokenCopiado((actual) => (actual === profesora.token ? null : actual)), 2000);
    } catch {
      setError("No se pudo copiar el link solo. Copialo a mano: " + link);
    }
  }

  return (
    <details className="group mt-8 border-t border-zinc-200 pt-6">
      <summary className="flex cursor-pointer list-none items-center justify-between font-titulo text-lg uppercase text-marca-negro [&::-webkit-details-marker]:hidden">
        Profesoras invitadas
        <span aria-hidden className="text-base text-zinc-400 transition-transform duration-200 group-open:rotate-180">
          ▾
        </span>
      </summary>
      <p className="mt-2 text-sm text-zinc-500">
        Agregá a cada profesora que participa. Copiale el link para mandarle por WhatsApp — ahí carga su lista de
        alumnas. Cuando tengas la lista, entrá a "Ver pagos" para llevar el registro de quién pagó.
      </p>

      {profesoras !== null && profesoras.length > 0 && (
        <p className="mt-3 rounded-xl bg-zinc-50 p-3 text-sm font-medium text-marca-negro">
          {profesoras.length} profesora{profesoras.length === 1 ? "" : "s"} · {resumen.totalAlumnas} alumna
          {resumen.totalAlumnas === 1 ? "" : "s"} · ${resumen.recaudado.toLocaleString("es-AR")} recaudado
        </p>
      )}

      {error && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-marca-rojo">{error}</p>}

      <form onSubmit={agregarProfesora} className="mt-4 flex gap-2">
        <input
          type="text"
          placeholder="Nombre de la profesora"
          value={nombreNuevo}
          onChange={(e) => setNombreNuevo(e.target.value)}
          className="h-12 flex-1 rounded-xl border border-zinc-300 px-3 text-base"
        />
        <button
          type="submit"
          disabled={guardando || !nombreNuevo.trim()}
          className="flex h-12 items-center justify-center rounded-full bg-marca-rosa px-5 text-sm font-semibold text-marca-negro disabled:opacity-60"
        >
          Agregar
        </button>
      </form>

      {profesoras === null && <p className="mt-4 text-sm text-zinc-500">Cargando…</p>}

      {profesoras !== null && profesoras.length === 0 && (
        <p className="mt-4 rounded-xl bg-zinc-50 p-4 text-sm text-zinc-500">Todavía no agregaste ninguna profesora.</p>
      )}

      {profesoras !== null && profesoras.length > 0 && (
        <input
          type="search"
          placeholder="Buscar profesora por nombre"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="mt-4 h-12 w-full rounded-xl border border-zinc-300 px-3 text-base"
        />
      )}

      {profesoras !== null && profesoras.length > 0 && profesorasFiltradas.length === 0 && (
        <p className="mt-3 rounded-xl bg-zinc-50 p-3 text-sm text-zinc-500">
          No hay ninguna profesora que coincida con &quot;{busqueda}&quot;.
        </p>
      )}

      {profesorasFiltradas.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          {profesorasFiltradas.map((profesora) => {
            const cantidad = cantidadAlumnas[profesora.id] ?? 0;
            return (
              <div key={profesora.id} className="flex flex-wrap items-center gap-2 rounded-2xl border border-zinc-200 p-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-marca-negro">{profesora.nombre}</p>
                  <p className="text-xs text-zinc-500">
                    {cantidad === 0 ? "Todavía no cargó alumnas" : `${cantidad} alumna${cantidad === 1 ? "" : "s"} cargada${cantidad === 1 ? "" : "s"}`}
                  </p>
                </div>
                <Link
                  href={`/admin/eventos/${eventoId}/profesoras/${profesora.id}`}
                  className="flex h-11 items-center justify-center rounded-full bg-marca-rosa px-3 text-xs font-semibold text-marca-negro"
                >
                  Ver pagos
                </Link>
                <button
                  type="button"
                  onClick={() => copiarLink(profesora)}
                  className="flex h-11 items-center justify-center rounded-full border border-zinc-300 px-3 text-xs font-medium text-zinc-600"
                >
                  {tokenCopiado === profesora.token ? "¡Copiado!" : "Copiar link"}
                </button>
                <button
                  type="button"
                  disabled={borrando === profesora.id}
                  onClick={() => eliminarProfesora(profesora)}
                  className="flex h-11 items-center justify-center rounded-full border border-zinc-300 px-3 text-xs font-medium text-zinc-500 disabled:opacity-60"
                >
                  Quitar
                </button>
              </div>
            );
          })}
        </div>
      )}
    </details>
  );
}
