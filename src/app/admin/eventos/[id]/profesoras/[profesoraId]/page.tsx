"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { crearClienteSupabase } from "@/lib/supabase/client";
import { NOMBRE_MARCA } from "@/lib/contacto";
import NavPanel from "@/components/admin/NavPanel";

interface Props {
  params: Promise<{ id: string; profesoraId: string }>;
}

interface FilaAlumna {
  id: string;
  nombre: string;
  pago: boolean;
  monto: number | null;
  metodo_pago: string | null;
}

const METODOS_PAGO = [
  { valor: "efectivo", etiqueta: "Efectivo" },
  { valor: "transferencia", etiqueta: "Transferencia" },
  { valor: "otro", etiqueta: "Otro" },
] as const;

/**
 * Pantalla de pagos de una profesora dentro de un evento
 * (/admin/eventos/[id]/profesoras/[profesoraId]). Acá Yani lleva el
 * registro de quién pagó, cuánto y con qué medio — la profesora nunca
 * marca esto, solo carga los nombres desde /profesoras/[token] (etapa 2).
 *
 * Mismo patrón de edición fila por fila que la grilla de horarios
 * (src/app/admin/page.tsx): se edita el estado local y se guarda por fila
 * con su propio botón, no un submit general.
 */
export default function PanelPagosProfesora({ params }: Props) {
  const { id: eventoId, profesoraId } = use(params);
  const router = useRouter();
  const supabase = useMemo(() => crearClienteSupabase(), []);

  const [profesoraNombre, setProfesoraNombre] = useState<string | null>(null);
  const [eventoTitulo, setEventoTitulo] = useState<string | null>(null);
  const [eventoPrecio, setEventoPrecio] = useState<string | null>(null);
  const [alumnas, setAlumnas] = useState<FilaAlumna[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState<string | null>(null);
  const [claveRecarga, setClaveRecarga] = useState(0);

  useEffect(() => {
    let vigente = true;

    async function cargar() {
      const { data: profesora, error: errorProfesora } = await supabase
        .from("profesoras_evento")
        .select("nombre, evento_id")
        .eq("id", profesoraId)
        .maybeSingle();

      if (!vigente) return;

      if (errorProfesora || !profesora) {
        setError("No se pudo cargar la profesora: " + (errorProfesora?.message ?? "no existe"));
        return;
      }

      setProfesoraNombre(profesora.nombre);

      const [{ data: evento, error: errorEvento }, { data: filasAlumnas, error: errorAlumnas }] = await Promise.all([
        supabase.from("eventos").select("titulo, precio").eq("id", profesora.evento_id).maybeSingle(),
        supabase
          .from("alumnas_evento")
          .select("id, nombre, pago, monto, metodo_pago")
          .eq("profesora_evento_id", profesoraId)
          .order("nombre", { ascending: true }),
      ]);

      if (!vigente) return;

      if (errorEvento || !evento) {
        setError("No se pudo cargar el evento: " + (errorEvento?.message ?? "no existe"));
      } else {
        setEventoTitulo(evento.titulo);
        setEventoPrecio(evento.precio);
      }

      if (errorAlumnas) {
        setError("No se pudo cargar la lista de alumnas: " + errorAlumnas.message);
        setAlumnas([]);
      } else {
        setError(null);
        setAlumnas(filasAlumnas ?? []);
      }
    }

    cargar();
    return () => {
      vigente = false;
    };
  }, [supabase, profesoraId, claveRecarga]);

  const resumen = useMemo(() => {
    const lista = alumnas ?? [];
    const pagaron = lista.filter((a) => a.pago);
    const total = pagaron.reduce((suma, a) => suma + (a.monto ?? 0), 0);
    return { totalAlumnas: lista.length, cantidadPagaron: pagaron.length, montoRecaudado: total };
  }, [alumnas]);

  function actualizarAlumnaLocal(id: string, cambios: Partial<FilaAlumna>) {
    setAlumnas((actual) => (actual ?? []).map((a) => (a.id === id ? { ...a, ...cambios } : a)));
  }

  function marcarPago(alumna: FilaAlumna, pago: boolean) {
    actualizarAlumnaLocal(alumna.id, {
      pago,
      metodo_pago: pago ? (alumna.metodo_pago ?? "efectivo") : null,
      monto: pago ? alumna.monto : null,
    });
  }

  async function guardarAlumna(alumna: FilaAlumna) {
    if (alumna.pago && (alumna.monto === null || alumna.monto <= 0)) {
      setError(`Cargá un monto para "${alumna.nombre}" antes de guardar.`);
      return;
    }

    setGuardando(alumna.id);
    setError(null);

    const { error: errorUpdate } = await supabase
      .from("alumnas_evento")
      .update({
        pago: alumna.pago,
        monto: alumna.pago ? alumna.monto : null,
        metodo_pago: alumna.pago ? alumna.metodo_pago : null,
        pagado_en: alumna.pago ? new Date().toISOString() : null,
        actualizado_en: new Date().toISOString(),
      })
      .eq("id", alumna.id);

    setGuardando(null);

    if (errorUpdate) {
      setError("No se pudo guardar: " + errorUpdate.message);
      return;
    }

    setClaveRecarga((c) => c + 1);
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
          <p className="text-sm text-zinc-500">Registro de pagos</p>
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

      {alumnas === null && !error && <p className="mt-6 text-sm text-zinc-500">Cargando…</p>}

      {alumnas !== null && (
        <>
          <div className="mt-4 rounded-2xl bg-zinc-50 p-4">
            <p className="font-titulo text-lg uppercase leading-tight text-marca-negro">{profesoraNombre}</p>
            {eventoTitulo && <p className="mt-1 text-sm text-zinc-600">{eventoTitulo}</p>}
            {eventoPrecio && <p className="mt-1 text-sm text-zinc-600">Precio de referencia: {eventoPrecio}</p>}
            <p className="mt-2 text-sm font-medium text-marca-negro">
              {resumen.cantidadPagaron} de {resumen.totalAlumnas} pagaron · ${resumen.montoRecaudado.toLocaleString("es-AR")}{" "}
              recaudado
            </p>
          </div>

          {alumnas.length === 0 && (
            <p className="mt-6 rounded-xl bg-zinc-50 p-4 text-sm text-zinc-500">
              Esta profesora todavía no cargó ninguna alumna desde su link.
            </p>
          )}

          <div className="mt-4 flex flex-col gap-2">
            {alumnas.map((alumna) => (
              <div key={alumna.id} className="rounded-2xl border border-zinc-200 p-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={alumna.pago}
                    onChange={(e) => marcarPago(alumna, e.target.checked)}
                    className="h-5 w-5 rounded border-zinc-300"
                  />
                  <span className="text-sm font-medium text-marca-negro">{alumna.nombre}</span>
                </label>

                {alumna.pago && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <label className="flex items-center gap-1 text-xs text-zinc-500">
                      Monto
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        value={alumna.monto ?? ""}
                        onChange={(e) =>
                          actualizarAlumnaLocal(alumna.id, {
                            monto: e.target.value === "" ? null : Number(e.target.value),
                          })
                        }
                        className="h-10 w-24 rounded-lg border border-zinc-300 px-2 text-sm"
                      />
                    </label>

                    <label className="flex items-center gap-1 text-xs text-zinc-500">
                      Medio
                      <select
                        value={alumna.metodo_pago ?? "efectivo"}
                        onChange={(e) => actualizarAlumnaLocal(alumna.id, { metodo_pago: e.target.value })}
                        className="h-10 rounded-lg border border-zinc-300 px-2 text-sm"
                      >
                        {METODOS_PAGO.map((metodo) => (
                          <option key={metodo.valor} value={metodo.valor}>
                            {metodo.etiqueta}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                )}

                <button
                  type="button"
                  disabled={guardando === alumna.id}
                  onClick={() => guardarAlumna(alumna)}
                  className="mt-3 flex h-10 items-center justify-center rounded-full bg-marca-rosa px-4 text-xs font-semibold text-marca-negro disabled:opacity-60"
                >
                  {guardando === alumna.id ? "Guardando…" : "Guardar"}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
