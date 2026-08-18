"use client";

import { useRouter } from "next/navigation";
import { NOMBRE_MARCA } from "@/lib/contacto";
import NavPanel from "@/components/admin/NavPanel";
import FormularioEvento from "@/components/admin/FormularioEvento";
import { crearClienteSupabase } from "@/lib/supabase/client";
import { useMemo } from "react";

export default function PanelEventoNuevo() {
  const router = useRouter();
  const supabase = useMemo(() => crearClienteSupabase(), []);

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
          <p className="text-sm text-zinc-500">Nuevo evento</p>
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

      <FormularioEvento />
    </main>
  );
}
