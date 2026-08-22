"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { crearClienteSupabase } from "@/lib/supabase/client";
import { NOMBRE_MARCA } from "@/lib/contacto";
import NavPanel from "@/components/admin/NavPanel";

interface Formulario {
  precioClase: string;
  precioConjunto: string;
  heroTitulo: string;
  heroBajada: string;
  aliasPago: string;
}

export default function PanelPreciosYTextos() {
  const router = useRouter();
  const supabase = useMemo(() => crearClienteSupabase(), []);

  const [form, setForm] = useState<Formulario | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let vigente = true;
    supabase
      .from("configuracion_home")
      .select("precio_clase, precio_conjunto, hero_titulo, hero_bajada, alias_pago")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data, error: errorConsulta }) => {
        if (!vigente) return;
        if (errorConsulta || !data) {
          setError("No se pudo cargar la configuración: " + (errorConsulta?.message ?? "sin datos"));
          return;
        }
        setForm({
          precioClase: data.precio_clase ?? "",
          precioConjunto: data.precio_conjunto ?? "",
          heroTitulo: data.hero_titulo,
          heroBajada: data.hero_bajada,
          aliasPago: data.alias_pago ?? "",
        });
      });
    return () => {
      vigente = false;
    };
  }, [supabase]);

  async function guardar(evento: FormEvent) {
    evento.preventDefault();
    if (!form) return;
    setGuardando(true);
    setError(null);
    setGuardado(false);

    const { error: errorUpdate } = await supabase
      .from("configuracion_home")
      .update({
        precio_clase: form.precioClase.trim() || null,
        precio_conjunto: form.precioConjunto.trim() || null,
        hero_titulo: form.heroTitulo.trim(),
        hero_bajada: form.heroBajada.trim(),
        alias_pago: form.aliasPago.trim() || null,
        actualizado_en: new Date().toISOString(),
      })
      .eq("id", 1);

    setGuardando(false);

    if (errorUpdate) {
      setError("No se pudo guardar: " + errorUpdate.message);
      return;
    }
    setGuardado(true);
  }

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
          <p className="text-sm text-zinc-500">Precios y textos de la home</p>
        </div>
        <button
          type="button"
          onClick={cerrarSesion}
          className="flex h-11 items-center justify-center rounded-full border border-zinc-300 px-4 text-sm font-medium text-zinc-600 active:bg-zinc-100"
        >
          Cerrar sesión
        </button>
      </div>

      <NavPanel actual="precios" />

      {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-marca-rojo">{error}</p>}

      {!form && !error && <p className="mt-6 text-sm text-zinc-500">Cargando…</p>}

      {form && (
        <form onSubmit={guardar} className="mt-6 flex flex-col gap-5">
          <div>
            <h2 className="font-titulo text-lg uppercase text-marca-negro">Precios</h2>
            <p className="text-sm text-zinc-500">
              Dejalo vacío para que no se muestre ningún precio en el sitio (así está hoy).
            </p>

            <label className="mt-3 flex flex-col gap-1">
              <span className="text-sm font-medium text-zinc-700">Precio de la clase</span>
              <input
                type="text"
                placeholder="ej: $15.000 por mes"
                value={form.precioClase}
                onChange={(e) => setForm({ ...form, precioClase: e.target.value })}
                className="h-12 rounded-xl border border-zinc-300 px-3 text-base"
              />
            </label>

            <label className="mt-3 flex flex-col gap-1">
              <span className="text-sm font-medium text-zinc-700">Precio del conjunto</span>
              <input
                type="text"
                placeholder="ej: $20.000"
                value={form.precioConjunto}
                onChange={(e) => setForm({ ...form, precioConjunto: e.target.value })}
                className="h-12 rounded-xl border border-zinc-300 px-3 text-base"
              />
            </label>

            <label className="mt-3 flex flex-col gap-1">
              <span className="text-sm font-medium text-zinc-700">Alias de pago</span>
              <input
                type="text"
                placeholder="ej: yani.jumping"
                value={form.aliasPago}
                onChange={(e) => setForm({ ...form, aliasPago: e.target.value })}
                className="h-12 rounded-xl border border-zinc-300 px-3 text-base"
              />
              <span className="text-xs text-zinc-400">
                Se lo muestra a las profesoras en el link de sus alumnas, para que sepan a dónde transferir.
              </span>
            </label>
          </div>

          <div>
            <h2 className="font-titulo text-lg uppercase text-marca-negro">Texto principal (Hero)</h2>
            <p className="text-sm text-zinc-500">Lo primero que se ve al entrar al sitio.</p>

            <label className="mt-3 flex flex-col gap-1">
              <span className="text-sm font-medium text-zinc-700">Título</span>
              <input
                type="text"
                required
                value={form.heroTitulo}
                onChange={(e) => setForm({ ...form, heroTitulo: e.target.value })}
                className="h-12 rounded-xl border border-zinc-300 px-3 text-base"
              />
            </label>

            <label className="mt-3 flex flex-col gap-1">
              <span className="text-sm font-medium text-zinc-700">Bajada</span>
              <textarea
                required
                rows={3}
                value={form.heroBajada}
                onChange={(e) => setForm({ ...form, heroBajada: e.target.value })}
                className="rounded-xl border border-zinc-300 px-3 py-2 text-base"
              />
            </label>
          </div>

          {guardado && (
            <p className="rounded-xl bg-green-50 p-3 text-sm text-green-700">
              Guardado. Los cambios ya están visibles en el sitio.
            </p>
          )}

          <button
            type="submit"
            disabled={guardando}
            className="flex h-12 w-full items-center justify-center rounded-full bg-marca-rosa px-5 text-base font-semibold text-marca-negro disabled:opacity-60"
          >
            {guardando ? "Guardando…" : "Guardar cambios"}
          </button>
        </form>
      )}
    </main>
  );
}
