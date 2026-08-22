"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { crearClienteSupabase } from "@/lib/supabase/client";
import { NOMBRE_MARCA } from "@/lib/contacto";
import { DIAS_SEMANA } from "@/lib/paquetes";
import NavPanel from "@/components/admin/NavPanel";

interface FilaPaquete {
  id: string;
  clases_por_semana: number;
  precio: string;
  dias: string[];
  horarios: string[];
}

/** Chips de días, en el mismo orden fijo que usa la sección pública. Primero se eligen los días, después los horarios (van debajo). */
function SelectorDias({
  diasElegidos,
  onCambiar,
}: {
  diasElegidos: string[];
  onCambiar: (clave: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {DIAS_SEMANA.map((dia) => {
        const activo = diasElegidos.includes(dia.clave);
        return (
          <button
            key={dia.clave}
            type="button"
            onClick={() => onCambiar(dia.clave)}
            aria-pressed={activo}
            className={[
              "flex h-9 items-center justify-center rounded-full px-3 text-xs font-medium",
              activo ? "bg-marca-rosa font-semibold text-marca-negro" : "border border-zinc-300 text-zinc-500",
            ].join(" ")}
          >
            {dia.etiqueta}
          </button>
        );
      })}
    </div>
  );
}

/** Chips de horarios ya cargados (con botón para quitar) + un input para sumar uno nuevo. */
function SelectorHorarios({
  horarios,
  horarioPendiente,
  onCambiarPendiente,
  onAgregar,
  onQuitar,
}: {
  horarios: string[];
  horarioPendiente: string;
  onCambiarPendiente: (valor: string) => void;
  onAgregar: () => void;
  onQuitar: (horario: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {horarios.map((horario) => (
        <span
          key={horario}
          className="flex items-center gap-1 rounded-full bg-zinc-100 py-1.5 pl-3 pr-2 text-xs text-zinc-700"
        >
          {horario} hs
          <button
            type="button"
            onClick={() => onQuitar(horario)}
            aria-label={`Quitar horario ${horario}`}
            className="flex h-5 w-5 items-center justify-center rounded-full text-zinc-400 active:bg-zinc-200"
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="time"
        value={horarioPendiente}
        onChange={(e) => onCambiarPendiente(e.target.value)}
        className="h-9 rounded-lg border border-zinc-300 px-2 text-sm"
      />
      <button
        type="button"
        onClick={onAgregar}
        className="flex h-9 items-center justify-center rounded-full border border-zinc-300 px-3 text-xs font-medium text-zinc-600 active:bg-zinc-100"
      >
        Agregar horario
      </button>
    </div>
  );
}

export default function PanelPaquetes() {
  const router = useRouter();
  const supabase = useMemo(() => crearClienteSupabase(), []);

  const [paquetes, setPaquetes] = useState<FilaPaquete[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState<string | null>(null);
  const [horarioPendientePorFila, setHorarioPendientePorFila] = useState<Record<string, string>>({});

  const [nuevoClasesPorSemana, setNuevoClasesPorSemana] = useState("3");
  const [nuevoPrecio, setNuevoPrecio] = useState("");
  const [nuevosDias, setNuevosDias] = useState<string[]>([]);
  const [nuevosHorarios, setNuevosHorarios] = useState<string[]>([]);
  const [nuevoHorarioPendiente, setNuevoHorarioPendiente] = useState("");
  const [creando, setCreando] = useState(false);

  const [claveRecarga, setClaveRecarga] = useState(0);
  const recargar = useCallback(() => setClaveRecarga((c) => c + 1), []);

  useEffect(() => {
    let vigente = true;
    supabase
      .from("paquetes_semanales")
      .select("id, clases_por_semana, precio, dias, horarios")
      .order("clases_por_semana", { ascending: false })
      .then(({ data, error: errorConsulta }) => {
        if (!vigente) return;
        if (errorConsulta) {
          setError("No se pudo cargar los paquetes: " + errorConsulta.message);
          setPaquetes([]);
          return;
        }
        setError(null);
        setPaquetes(data ?? []);
      });
    return () => {
      vigente = false;
    };
  }, [supabase, claveRecarga]);

  function actualizarFilaLocal(id: string, cambios: Partial<FilaPaquete>) {
    setPaquetes((actual) => (actual ?? []).map((f) => (f.id === id ? { ...f, ...cambios } : f)));
  }

  function alternarDiaFila(id: string, clave: string) {
    setPaquetes((actual) =>
      (actual ?? []).map((f) =>
        f.id === id
          ? { ...f, dias: f.dias.includes(clave) ? f.dias.filter((d) => d !== clave) : [...f.dias, clave] }
          : f
      )
    );
  }

  function agregarHorarioFila(id: string) {
    const horario = horarioPendientePorFila[id];
    if (!horario) return;
    setPaquetes((actual) =>
      (actual ?? []).map((f) =>
        f.id === id && !f.horarios.includes(horario) ? { ...f, horarios: [...f.horarios, horario].sort() } : f
      )
    );
    setHorarioPendientePorFila((actual) => ({ ...actual, [id]: "" }));
  }

  function quitarHorarioFila(id: string, horario: string) {
    setPaquetes((actual) =>
      (actual ?? []).map((f) => (f.id === id ? { ...f, horarios: f.horarios.filter((h) => h !== horario) } : f))
    );
  }

  async function guardarFila(fila: FilaPaquete) {
    if (fila.dias.length === 0) {
      setError("El paquete de " + fila.clases_por_semana + " clases necesita al menos un día.");
      return;
    }
    if (fila.horarios.length === 0) {
      setError("El paquete de " + fila.clases_por_semana + " clases necesita al menos un horario.");
      return;
    }
    setGuardando(fila.id);
    setError(null);
    const { error: errorUpdate } = await supabase
      .from("paquetes_semanales")
      .update({
        clases_por_semana: fila.clases_por_semana,
        precio: fila.precio.trim(),
        dias: fila.dias,
        horarios: fila.horarios,
        actualizado_en: new Date().toISOString(),
      })
      .eq("id", fila.id);
    setGuardando(null);
    if (errorUpdate) {
      setError("No se pudo guardar: " + errorUpdate.message);
      return;
    }
    recargar();
  }

  async function borrarFila(id: string) {
    if (!confirm("¿Eliminar este paquete? Esta acción no se puede deshacer.")) return;
    setGuardando(id);
    setError(null);
    const { error: errorDelete } = await supabase.from("paquetes_semanales").delete().eq("id", id);
    setGuardando(null);
    if (errorDelete) {
      setError("No se pudo eliminar: " + errorDelete.message);
      return;
    }
    recargar();
  }

  async function crearPaquete(evento: FormEvent) {
    evento.preventDefault();
    if (nuevosDias.length === 0) {
      setError("Elegí al menos un día para el paquete nuevo.");
      return;
    }
    if (nuevosHorarios.length === 0) {
      setError("Agregá al menos un horario para el paquete nuevo.");
      return;
    }
    setCreando(true);
    setError(null);

    const { error: errorInsert } = await supabase.from("paquetes_semanales").insert({
      clases_por_semana: Number(nuevoClasesPorSemana) || 1,
      precio: nuevoPrecio.trim(),
      dias: nuevosDias,
      horarios: nuevosHorarios,
    });

    setCreando(false);

    if (errorInsert) {
      setError("No se pudo crear: " + errorInsert.message);
      return;
    }

    setNuevoClasesPorSemana("3");
    setNuevoPrecio("");
    setNuevosDias([]);
    setNuevosHorarios([]);
    setNuevoHorarioPendiente("");
    recargar();
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
          <p className="text-sm text-zinc-500">Paquetes de clases semanales</p>
        </div>
        <button
          type="button"
          onClick={cerrarSesion}
          className="flex h-11 items-center justify-center rounded-full border border-zinc-300 px-4 text-sm font-medium text-zinc-600 active:bg-zinc-100"
        >
          Cerrar sesión
        </button>
      </div>

      <NavPanel actual="paquetes" />

      {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-marca-rojo">{error}</p>}

      {paquetes === null && <p className="mt-6 text-sm text-zinc-500">Cargando…</p>}

      {paquetes !== null && paquetes.length === 0 && (
        <p className="mt-6 rounded-xl bg-zinc-50 p-4 text-sm text-zinc-500">Todavía no hay paquetes cargados.</p>
      )}

      <div className="mt-4 flex flex-col gap-4">
        {(paquetes ?? []).map((fila) => (
          <div key={fila.id} className="rounded-2xl border border-zinc-200 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-1 text-xs text-zinc-500">
                Clases por semana
                <input
                  type="number"
                  min={1}
                  value={fila.clases_por_semana}
                  onChange={(e) => actualizarFilaLocal(fila.id, { clases_por_semana: Number(e.target.value) })}
                  className="h-9 w-16 rounded-lg border border-zinc-300 px-2 text-sm"
                />
              </label>

              <label className="flex items-center gap-1 text-xs text-zinc-500">
                Precio
                <input
                  type="text"
                  value={fila.precio}
                  onChange={(e) => actualizarFilaLocal(fila.id, { precio: e.target.value })}
                  className="h-9 w-28 rounded-lg border border-zinc-300 px-2 text-sm"
                />
              </label>
            </div>

            <div className="mt-3">
              <p className="text-xs font-medium text-zinc-500">Días</p>
              <div className="mt-1">
                <SelectorDias diasElegidos={fila.dias} onCambiar={(clave) => alternarDiaFila(fila.id, clave)} />
              </div>
            </div>

            <div className="mt-3">
              <p className="text-xs font-medium text-zinc-500">Horarios</p>
              <div className="mt-1">
                <SelectorHorarios
                  horarios={fila.horarios}
                  horarioPendiente={horarioPendientePorFila[fila.id] ?? ""}
                  onCambiarPendiente={(valor) =>
                    setHorarioPendientePorFila((actual) => ({ ...actual, [fila.id]: valor }))
                  }
                  onAgregar={() => agregarHorarioFila(fila.id)}
                  onQuitar={(horario) => quitarHorarioFila(fila.id, horario)}
                />
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                disabled={guardando === fila.id}
                onClick={() => guardarFila(fila)}
                className="flex h-9 items-center justify-center rounded-full bg-marca-rosa px-3 text-xs font-semibold text-marca-negro disabled:opacity-60"
              >
                Guardar
              </button>
              <button
                type="button"
                disabled={guardando === fila.id}
                onClick={() => borrarFila(fila.id)}
                className="flex h-9 items-center justify-center rounded-full border border-zinc-300 px-3 text-xs font-medium text-zinc-500 disabled:opacity-60"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={crearPaquete}
        className="mt-6 flex flex-col gap-3 rounded-2xl border border-dashed border-zinc-300 p-3"
      >
        <p className="text-sm font-semibold text-marca-negro">Agregar paquete</p>

        <div className="flex flex-wrap gap-2">
          <label className="flex items-center gap-1 text-xs text-zinc-500">
            Clases por semana
            <input
              type="number"
              min={1}
              required
              value={nuevoClasesPorSemana}
              onChange={(e) => setNuevoClasesPorSemana(e.target.value)}
              className="h-9 w-16 rounded-lg border border-zinc-300 px-2 text-sm"
            />
          </label>
          <label className="flex items-center gap-1 text-xs text-zinc-500">
            Precio
            <input
              type="text"
              required
              placeholder="ej: $25.000"
              value={nuevoPrecio}
              onChange={(e) => setNuevoPrecio(e.target.value)}
              className="h-9 w-28 rounded-lg border border-zinc-300 px-2 text-sm"
            />
          </label>
        </div>

        <div>
          <p className="text-xs font-medium text-zinc-500">Días</p>
          <div className="mt-1">
            <SelectorDias
              diasElegidos={nuevosDias}
              onCambiar={(clave) =>
                setNuevosDias((actual) =>
                  actual.includes(clave) ? actual.filter((d) => d !== clave) : [...actual, clave]
                )
              }
            />
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-zinc-500">Horarios</p>
          <div className="mt-1">
            <SelectorHorarios
              horarios={nuevosHorarios}
              horarioPendiente={nuevoHorarioPendiente}
              onCambiarPendiente={setNuevoHorarioPendiente}
              onAgregar={() => {
                if (!nuevoHorarioPendiente) return;
                setNuevosHorarios((actual) =>
                  actual.includes(nuevoHorarioPendiente) ? actual : [...actual, nuevoHorarioPendiente].sort()
                );
                setNuevoHorarioPendiente("");
              }}
              onQuitar={(horario) => setNuevosHorarios((actual) => actual.filter((h) => h !== horario))}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={creando}
          className="flex h-11 items-center justify-center rounded-full bg-marca-rosa px-4 text-sm font-semibold text-marca-negro disabled:opacity-60"
        >
          {creando ? "Agregando…" : "Agregar paquete"}
        </button>
      </form>
    </main>
  );
}
