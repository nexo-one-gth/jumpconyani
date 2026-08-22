"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { crearClienteSupabase } from "@/lib/supabase/client";
import { NOMBRE_MARCA } from "@/lib/contacto";
import NavPanel from "@/components/admin/NavPanel";

interface Props {
  params: Promise<{ id: string; sponsorId: string }>;
}

interface FilaColaborador {
  id: string;
  nombre: string;
}

/**
 * Pantalla de colaboradores de un sponsor dentro de un evento
 * (/admin/eventos/[id]/sponsors/[sponsorId]). Acá Yani ve lo que el sponsor
 * cargó desde su link público (/sponsors/[token]): con qué aporta, el
 * detalle de la colaboración, y los nombres de los colaboradores que va a
 * llevar. De solo lectura por ahora — a diferencia de las alumnas de una
 * profesora, acá no hay ningún pago que Yani tenga que registrar por
 * colaborador.
 */
export default function PanelColaboradoresSponsor({ params }: Props) {
  const { id: eventoId, sponsorId } = use(params);
  const router = useRouter();
  const supabase = useMemo(() => crearClienteSupabase(), []);

  const [sponsorNombre, setSponsorNombre] = useState<string | null>(null);
  const [eventoTitulo, setEventoTitulo] = useState<string | null>(null);
  const [aporte, setAporte] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<string | null>(null);
  const [colaboradores, setColaboradores] = useState<FilaColaborador[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;

    async function cargar() {
      const { data: sponsor, error: errorSponsor } = await supabase
        .from("sponsors_evento")
        .select("nombre_sponsor, evento_id, aporte, detalle")
        .eq("id", sponsorId)
        .maybeSingle();

      if (!vigente) return;

      if (errorSponsor || !sponsor) {
        setError("No se pudo cargar el sponsor: " + (errorSponsor?.message ?? "no existe"));
        return;
      }

      setSponsorNombre(sponsor.nombre_sponsor);
      setAporte(sponsor.aporte);
      setDetalle(sponsor.detalle);

      const [{ data: evento, error: errorEvento }, { data: filasColaboradores, error: errorColaboradores }] =
        await Promise.all([
          supabase.from("eventos").select("titulo").eq("id", sponsor.evento_id).maybeSingle(),
          supabase
            .from("colaboradores_sponsor_evento")
            .select("id, nombre")
            .eq("sponsor_evento_id", sponsorId)
            .order("nombre", { ascending: true }),
        ]);

      if (!vigente) return;

      if (errorEvento || !evento) {
        setError("No se pudo cargar el evento: " + (errorEvento?.message ?? "no existe"));
      } else {
        setEventoTitulo(evento.titulo);
      }

      if (errorColaboradores) {
        setError("No se pudo cargar la lista de colaboradores: " + errorColaboradores.message);
        setColaboradores([]);
      } else {
        setError(null);
        setColaboradores(filasColaboradores ?? []);
      }
    }

    cargar();
    return () => {
      vigente = false;
    };
  }, [supabase, sponsorId]);

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <main className="min-h-full px-4 py-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-titulo text-xl uppercase text-marca-negro">Panel de {NOMBRE_MARCA}</h1>
          <p className="text-sm text-zinc-500">Colaboradores del sponsor</p>
        </div>
        <button
          type="button"
          onClick={cerrarSesion}
          className="flex h-11 items-center justify-center rounded-full border border-zinc-300 px-4 text-sm font-medium text-zinc-600 active:bg-zinc-100"
        >
          Cerrar sesión
        </button>
      </div>

      <NavPanel actual="eventos" />

      <Link href={`/admin/eventos/${eventoId}`} className="mt-4 inline-block text-sm font-medium text-marca-rojo">
        ‹ Volver al evento
      </Link>

      {error && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-marca-rojo">{error}</p>}

      {colaboradores === null && !error && <p className="mt-6 text-sm text-zinc-500">Cargando…</p>}

      {colaboradores !== null && (
        <>
          <div className="mt-4 rounded-2xl bg-zinc-50 p-4">
            <p className="font-titulo text-lg uppercase leading-tight text-marca-negro">{sponsorNombre}</p>
            {eventoTitulo && <p className="mt-1 text-sm text-zinc-600">{eventoTitulo}</p>}
            <p className="mt-2 text-sm text-marca-negro">Aporte: {aporte || "sin cargar"}</p>
            <p className="mt-1 text-sm text-marca-negro">Detalle: {detalle || "sin cargar"}</p>
          </div>

          <h2 className="mt-6 font-titulo text-base uppercase text-marca-negro">
            Colaboradores ({colaboradores.length})
          </h2>

          {colaboradores.length === 0 && (
            <p className="mt-3 rounded-xl bg-zinc-50 p-4 text-sm text-zinc-500">
              Este sponsor todavía no cargó ningún colaborador desde su link.
            </p>
          )}

          <div className="mt-3 flex flex-col gap-2">
            {colaboradores.map((colaborador) => (
              <p key={colaborador.id} className="rounded-2xl border border-zinc-200 p-3 text-sm text-marca-negro">
                {colaborador.nombre}
              </p>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
