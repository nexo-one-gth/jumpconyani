"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { crearClienteSupabase } from "@/lib/supabase/client";
import { NOMBRE_MARCA } from "@/lib/contacto";
import NavPanel from "@/components/admin/NavPanel";
import FormularioEvento from "@/components/admin/FormularioEvento";
import SeccionProfesoras from "@/components/admin/SeccionProfesoras";
import { COLUMNAS_EVENTO, filaAEvento, type Evento, type FilaEvento } from "@/lib/eventos";

interface Props {
  params: Promise<{ id: string }>;
}

export default function PanelEventoEditar({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = useMemo(() => crearClienteSupabase(), []);

  const [evento, setEvento] = useState<Evento | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;
    supabase
      .from("eventos")
      .select(COLUMNAS_EVENTO)
      .eq("id", id)
      .maybeSingle()
      .then(({ data, error: errorConsulta }) => {
        if (!vigente) return;
        if (errorConsulta || !data) {
          setError("No se pudo cargar el evento: " + (errorConsulta?.message ?? "no existe"));
          return;
        }
        setEvento(filaAEvento(data as unknown as FilaEvento));
      });
    return () => {
      vigente = false;
    };
  }, [supabase, id]);

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
          <p className="text-sm text-zinc-500">Editar evento</p>
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

      {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-marca-rojo">{error}</p>}

      {!evento && !error && <p className="mt-6 text-sm text-zinc-500">Cargando…</p>}

      {evento && (
        <>
          <FormularioEvento evento={evento} />
          <SeccionProfesoras eventoId={evento.id} />
        </>
      )}
    </main>
  );
}
