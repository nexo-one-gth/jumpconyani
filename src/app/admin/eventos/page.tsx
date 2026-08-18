"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { crearClienteSupabase } from "@/lib/supabase/client";
import { NOMBRE_MARCA } from "@/lib/contacto";
import NavPanel from "@/components/admin/NavPanel";

interface FilaEvento {
  id: string;
  slug: string;
  titulo: string;
  flyer_src: string;
  fecha: string;
  fecha_orden: string;
}

export default function PanelEventos() {
  const router = useRouter();
  const supabase = useMemo(() => crearClienteSupabase(), []);

  const [eventos, setEventos] = useState<FilaEvento[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [borrando, setBorrando] = useState<string | null>(null);
  const [claveRecarga, setClaveRecarga] = useState(0);

  useEffect(() => {
    let vigente = true;
    supabase
      .from("eventos")
      .select("id, slug, titulo, flyer_src, fecha, fecha_orden")
      .order("fecha_orden", { ascending: true })
      .then(({ data, error: errorConsulta }) => {
        if (!vigente) return;
        if (errorConsulta) {
          setError("No se pudo cargar la lista: " + errorConsulta.message);
          setEventos([]);
          return;
        }
        setError(null);
        setEventos(data ?? []);
      });
    return () => {
      vigente = false;
    };
  }, [supabase, claveRecarga]);

  async function borrarEvento(evento: FilaEvento) {
    if (!confirm(`¿Eliminar "${evento.titulo}"? Esta acción no se puede deshacer.`)) return;
    setBorrando(evento.id);
    setError(null);
    const { error: errorDelete } = await supabase.from("eventos").delete().eq("id", evento.id);
    setBorrando(null);
    if (errorDelete) {
      setError("No se pudo eliminar: " + errorDelete.message);
      return;
    }
    setClaveRecarga((c) => c + 1);
  }

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const hoyISO = useMemo(() => {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
  }, []);

  const proximos = (eventos ?? []).filter((e) => e.fecha_orden >= hoyISO);
  const pasados = (eventos ?? []).filter((e) => e.fecha_orden < hoyISO).reverse();

  return (
    <main className="min-h-full px-4 py-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-titulo text-xl uppercase text-marca-negro">Panel de {NOMBRE_MARCA}</h1>
          <p className="text-sm text-zinc-500">Eventos y masterclasses</p>
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

      <Link
        href="/admin/eventos/nuevo"
        className="mt-5 flex h-12 w-full items-center justify-center rounded-full bg-marca-rosa px-5 text-base font-semibold text-marca-negro active:bg-marca-rosa/80"
      >
        + Agregar evento
      </Link>

      {eventos === null && <p className="mt-6 text-sm text-zinc-500">Cargando…</p>}

      {eventos !== null && eventos.length === 0 && (
        <p className="mt-6 rounded-xl bg-zinc-50 p-4 text-sm text-zinc-500">Todavía no hay eventos cargados.</p>
      )}

      {proximos.length > 0 && (
        <div className="mt-6">
          <h2 className="font-titulo text-base uppercase text-marca-negro">Próximos</h2>
          <div className="mt-3 flex flex-col gap-2">
            {proximos.map((evento) => (
              <TarjetaAdminEvento
                key={evento.id}
                evento={evento}
                borrando={borrando === evento.id}
                onBorrar={() => borrarEvento(evento)}
              />
            ))}
          </div>
        </div>
      )}

      {pasados.length > 0 && (
        <div className="mt-6">
          <h2 className="font-titulo text-base uppercase text-zinc-400">Pasados</h2>
          <div className="mt-3 flex flex-col gap-2 opacity-70">
            {pasados.map((evento) => (
              <TarjetaAdminEvento
                key={evento.id}
                evento={evento}
                borrando={borrando === evento.id}
                onBorrar={() => borrarEvento(evento)}
              />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

function TarjetaAdminEvento({
  evento,
  borrando,
  onBorrar,
}: {
  evento: FilaEvento;
  borrando: boolean;
  onBorrar: () => void;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border border-zinc-200 p-3">
      <div className="flex h-20 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-50">
        <Image src={evento.flyer_src} alt="" width={80} height={110} className="h-full w-full object-contain" />
      </div>
      <div className="flex flex-1 flex-col justify-center gap-1">
        <p className="font-titulo text-sm uppercase leading-tight text-marca-negro">{evento.titulo}</p>
        <p className="text-xs text-zinc-500">{evento.fecha}</p>
      </div>
      <div className="flex flex-col justify-center gap-2">
        <Link
          href={`/admin/eventos/${evento.id}`}
          className="flex h-9 items-center justify-center rounded-full bg-marca-rosa px-3 text-xs font-semibold text-marca-negro"
        >
          Editar
        </Link>
        <button
          type="button"
          disabled={borrando}
          onClick={onBorrar}
          className="flex h-9 items-center justify-center rounded-full border border-zinc-300 px-3 text-xs font-medium text-zinc-500 disabled:opacity-60"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
