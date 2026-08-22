"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { crearClienteSupabase } from "@/lib/supabase/client";
import { NOMBRE_MARCA } from "@/lib/contacto";
import { DIAS_HABILES, DIAS_SEMANA } from "@/lib/dias";
import NavPanel from "@/components/admin/NavPanel";

interface FilaClase {
  id: string;
  fecha: string; // "2026-08-03"
  hora: string; // "09:00:00"
  cupo_total: number;
  cupo_disponible: number;
}

function formatearFecha(fechaISO: string): string {
  // fechaISO llega como "2026-08-03"; se arma la fecha local a mano para
  // no correr el riesgo de que el huso horario la mueva un día.
  const [anio, mes, dia] = fechaISO.split("-").map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  return fecha.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
}

function formatearHora(horaISO: string): string {
  return horaISO.slice(0, 5); // "09:00:00" -> "09:00"
}

/** Todas las fechas ("2026-08-03") del mes pedido cuyo día de la semana está entre los elegidos. */
function fechasDelMesQueCaenEn(anio: number, mes: number, diasElegidos: string[]): string[] {
  const indicesElegidos = new Set<number>(
    DIAS_SEMANA.filter((dia) => diasElegidos.includes(dia.clave)).map((dia) => dia.indiceJs)
  );
  const fechas: string[] = [];
  const cursor = new Date(anio, mes, 1);
  while (cursor.getMonth() === mes) {
    if (indicesElegidos.has(cursor.getDay())) {
      fechas.push(
        `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`
      );
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return fechas;
}

export default function PanelHorarios() {
  const router = useRouter();
  const supabase = useMemo(() => crearClienteSupabase(), []);

  const hoy = useMemo(() => new Date(), []);
  const [mesVisible, setMesVisible] = useState(() => new Date(hoy.getFullYear(), hoy.getMonth(), 1));
  const [filas, setFilas] = useState<FilaClase[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState<string | null>(null); // id de la fila que se está guardando/borrando

  const [nuevaFecha, setNuevaFecha] = useState("");
  const [nuevaHora, setNuevaHora] = useState("");
  const [nuevoCupo, setNuevoCupo] = useState("13");
  const [creando, setCreando] = useState(false);

  // Carga de clases semanales por lote: días de la semana + un horario ->
  // crea una clase en cada fecha del mes visible que caiga en esos días.
  const [diasLote, setDiasLote] = useState<string[]>([]);
  const [horarioLote, setHorarioLote] = useState("");
  const [cupoLote, setCupoLote] = useState("13");
  const [generando, setGenerando] = useState(false);
  const [resultadoLote, setResultadoLote] = useState<string | null>(null);

  const inicioMes = useMemo(() => {
    const d = mesVisible;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
  }, [mesVisible]);

  const finMes = useMemo(() => {
    const ultimoDia = new Date(mesVisible.getFullYear(), mesVisible.getMonth() + 1, 0).getDate();
    return `${mesVisible.getFullYear()}-${String(mesVisible.getMonth() + 1).padStart(2, "0")}-${String(ultimoDia).padStart(2, "0")}`;
  }, [mesVisible]);

  // Se incrementa después de guardar/borrar/crear para forzar una nueva
  // consulta sin duplicar la lógica de fetch fuera del efecto.
  const [claveRecarga, setClaveRecarga] = useState(0);

  useEffect(() => {
    let vigente = true;
    supabase
      .from("clases")
      .select("id, fecha, hora, cupo_total, cupo_disponible")
      .gte("fecha", inicioMes)
      .lte("fecha", finMes)
      .order("fecha", { ascending: true })
      .order("hora", { ascending: true })
      .then(({ data, error: errorConsulta }) => {
        if (!vigente) return;
        if (errorConsulta) {
          setError("No se pudo cargar la grilla: " + errorConsulta.message);
          setFilas([]);
          return;
        }
        setError(null);
        setFilas(data ?? []);
      });
    return () => {
      vigente = false;
    };
  }, [supabase, inicioMes, finMes, claveRecarga]);

  const recargar = useCallback(() => setClaveRecarga((c) => c + 1), []);

  const diasAgrupados = useMemo(() => {
    const mapa = new Map<string, FilaClase[]>();
    (filas ?? []).forEach((fila) => {
      const lista = mapa.get(fila.fecha) ?? [];
      lista.push(fila);
      mapa.set(fila.fecha, lista);
    });
    return Array.from(mapa.entries());
  }, [filas]);

  async function guardarFila(fila: FilaClase) {
    setGuardando(fila.id);
    setError(null);
    const { error: errorUpdate } = await supabase
      .from("clases")
      .update({
        cupo_total: fila.cupo_total,
        cupo_disponible: fila.cupo_disponible,
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
    if (!confirm("¿Eliminar este horario? Esta acción no se puede deshacer.")) return;
    setGuardando(id);
    setError(null);
    const { error: errorDelete } = await supabase.from("clases").delete().eq("id", id);
    setGuardando(null);
    if (errorDelete) {
      setError("No se pudo eliminar: " + errorDelete.message);
      return;
    }
    recargar();
  }

  function actualizarFilaLocal(id: string, cambios: Partial<FilaClase>) {
    setFilas((actual) => (actual ?? []).map((f) => (f.id === id ? { ...f, ...cambios } : f)));
  }

  async function crearHorario(evento: React.FormEvent) {
    evento.preventDefault();
    if (!nuevaFecha || !nuevaHora) return;
    setCreando(true);
    setError(null);

    const cupo = Number(nuevoCupo) || 0;
    const { error: errorInsert } = await supabase.from("clases").insert({
      fecha: nuevaFecha,
      hora: nuevaHora,
      cupo_total: cupo,
      cupo_disponible: cupo,
    });

    setCreando(false);

    if (errorInsert) {
      setError(
        errorInsert.code === "23505"
          ? "Ya existe un horario cargado para ese día y esa hora."
          : "No se pudo crear: " + errorInsert.message
      );
      return;
    }

    setNuevaHora("");
    recargar();
  }

  function alternarDiaLote(clave: string) {
    setDiasLote((actual) => (actual.includes(clave) ? actual.filter((d) => d !== clave) : [...actual, clave]));
  }

  async function generarClasesSemanales(evento: React.FormEvent) {
    evento.preventDefault();
    setError(null);
    setResultadoLote(null);

    if (diasLote.length === 0) {
      setError("Elegí al menos un día para generar las clases.");
      return;
    }
    if (!horarioLote) {
      setError("Elegí un horario para generar las clases.");
      return;
    }
    const cupo = Number(cupoLote) || 0;
    if (cupo <= 0) {
      setError("El cupo tiene que ser mayor a 0.");
      return;
    }

    const fechas = fechasDelMesQueCaenEn(mesVisible.getFullYear(), mesVisible.getMonth(), diasLote);
    if (fechas.length === 0) {
      setError("Ese mes no tiene ningún día de los elegidos.");
      return;
    }

    setGenerando(true);

    // Primero se fija cuántas de esas fecha+hora ya existen, para poder
    // avisar antes de borrar nada (el borrado es "silencioso" en la base:
    // sin este chequeo Yani no se enteraría qué se reemplazó).
    const { data: existentes, error: errorConsultaExistentes } = await supabase
      .from("clases")
      .select("fecha")
      .eq("hora", horarioLote)
      .in("fecha", fechas);

    if (errorConsultaExistentes) {
      setGenerando(false);
      setError("No se pudo generar: " + errorConsultaExistentes.message);
      return;
    }

    const cantidadExistentes = existentes?.length ?? 0;
    const confirmacion =
      cantidadExistentes > 0
        ? `Se van a cargar ${fechas.length} clases a las ${horarioLote} hs. ${cantidadExistentes} de esas fechas ya tenían una clase cargada a esa hora: se reemplaza y vuelve a quedar con el cupo lleno. ¿Continuar?`
        : `¿Cargar ${fechas.length} clases nuevas a las ${horarioLote} hs?`;

    if (!confirm(confirmacion)) {
      setGenerando(false);
      return;
    }

    // Se borran solo las que coinciden en fecha Y hora con el lote: las
    // clases de ese mismo día a otro horario (cargadas en otra tanda) no se
    // tocan.
    const { error: errorDelete } = await supabase.from("clases").delete().eq("hora", horarioLote).in("fecha", fechas);
    if (errorDelete) {
      setGenerando(false);
      setError("No se pudo generar: " + errorDelete.message);
      return;
    }

    const { error: errorInsertLote } = await supabase
      .from("clases")
      .insert(fechas.map((fecha) => ({ fecha, hora: horarioLote, cupo_total: cupo, cupo_disponible: cupo })));

    setGenerando(false);

    if (errorInsertLote) {
      setError("No se pudo generar: " + errorInsertLote.message);
      return;
    }

    setResultadoLote(
      cantidadExistentes > 0
        ? `Listo: ${fechas.length} clases cargadas a las ${horarioLote} hs (${cantidadExistentes} reemplazadas, ${
            fechas.length - cantidadExistentes
          } nuevas).`
        : `Listo: ${fechas.length} clases nuevas cargadas a las ${horarioLote} hs.`
    );
    setDiasLote([]);
    setHorarioLote("");
    recargar();
  }

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  function irAMesAnterior() {
    setMesVisible((actual) => new Date(actual.getFullYear(), actual.getMonth() - 1, 1));
  }

  function irAMesSiguiente() {
    setMesVisible((actual) => new Date(actual.getFullYear(), actual.getMonth() + 1, 1));
  }

  return (
    <main className="min-h-full px-4 py-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-titulo text-xl uppercase text-marca-negro">Panel de {NOMBRE_MARCA}</h1>
          <p className="text-sm text-zinc-500">Grilla de horarios</p>
        </div>
        <button
          type="button"
          onClick={cerrarSesion}
          className="flex h-11 items-center justify-center rounded-full border border-zinc-300 px-4 text-sm font-medium text-zinc-600 active:bg-zinc-100"
        >
          Cerrar sesión
        </button>
      </div>

      <NavPanel actual="horarios" />

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-marca-rojo">{error}</p>
      )}

      <div className="mt-5 flex items-center justify-between">
        <button
          type="button"
          onClick={irAMesAnterior}
          aria-label="Mes anterior"
          className="flex h-11 w-11 items-center justify-center rounded-full text-lg text-zinc-600 active:bg-zinc-100"
        >
          ‹
        </button>
        <span className="font-titulo text-base uppercase text-marca-negro">
          {mesVisible.toLocaleDateString("es-AR", { month: "long", year: "numeric" })}
        </span>
        <button
          type="button"
          onClick={irAMesSiguiente}
          aria-label="Mes siguiente"
          className="flex h-11 w-11 items-center justify-center rounded-full text-lg text-zinc-600 active:bg-zinc-100"
        >
          ›
        </button>
      </div>

      <form
        onSubmit={generarClasesSemanales}
        className="mt-5 flex flex-col gap-3 rounded-2xl border border-zinc-200 p-3"
      >
        <div>
          <p className="text-sm font-semibold text-marca-negro">Cargar clases semanales</p>
          <p className="text-xs text-zinc-500">
            Elegí los días y un horario: se crea una clase en cada fecha del mes que estás viendo. Si ya
            había una clase cargada en esa fecha y ese horario, se reemplaza (vuelve a quedar con el cupo
            lleno).
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-zinc-500">Días</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {DIAS_HABILES.map((dia) => {
              const activo = diasLote.includes(dia.clave);
              return (
                <button
                  key={dia.clave}
                  type="button"
                  onClick={() => alternarDiaLote(dia.clave)}
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
        </div>

        <div className="flex flex-wrap gap-2">
          <label className="flex items-center gap-1 text-xs text-zinc-500">
            Horario
            <input
              type="time"
              required
              value={horarioLote}
              onChange={(e) => setHorarioLote(e.target.value)}
              className="h-11 rounded-xl border border-zinc-300 px-2 text-sm"
            />
          </label>
          <label className="flex items-center gap-1 text-xs text-zinc-500">
            Cupo
            <input
              type="number"
              min={1}
              required
              value={cupoLote}
              onChange={(e) => setCupoLote(e.target.value)}
              className="h-11 w-20 rounded-xl border border-zinc-300 px-2 text-sm"
            />
          </label>
        </div>

        {resultadoLote && (
          <p className="rounded-xl bg-green-50 p-3 text-sm text-green-700">{resultadoLote}</p>
        )}

        <button
          type="submit"
          disabled={generando}
          className="flex h-11 items-center justify-center rounded-full bg-marca-rosa px-4 text-sm font-semibold text-marca-negro disabled:opacity-60"
        >
          {generando ? "Generando…" : "Generar clases del mes"}
        </button>
      </form>

      {filas === null && <p className="mt-6 text-sm text-zinc-500">Cargando…</p>}

      {filas !== null && diasAgrupados.length === 0 && (
        <p className="mt-6 rounded-xl bg-zinc-50 p-4 text-sm text-zinc-500">
          Todavía no hay horarios cargados para este mes.
        </p>
      )}

      <div className="mt-4 flex flex-col gap-4">
        {diasAgrupados.map(([fecha, horarios]) => (
          <div key={fecha} className="rounded-2xl border border-zinc-200 p-3">
            <p className="text-sm font-semibold capitalize text-marca-negro">{formatearFecha(fecha)}</p>
            <div className="mt-3 flex flex-col gap-2">
              {horarios.map((fila) => (
                <div key={fila.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-zinc-50 p-2">
                  <span className="w-14 text-sm font-semibold text-marca-negro">
                    {formatearHora(fila.hora)}
                  </span>

                  <label className="flex items-center gap-1 text-xs text-zinc-500">
                    Total
                    <input
                      type="number"
                      min={1}
                      value={fila.cupo_total}
                      onChange={(e) =>
                        actualizarFilaLocal(fila.id, { cupo_total: Number(e.target.value) })
                      }
                      className="h-9 w-16 rounded-lg border border-zinc-300 px-2 text-sm"
                    />
                  </label>

                  <label className="flex items-center gap-1 text-xs text-zinc-500">
                    Disponible
                    <input
                      type="number"
                      min={0}
                      value={fila.cupo_disponible}
                      onChange={(e) =>
                        actualizarFilaLocal(fila.id, { cupo_disponible: Number(e.target.value) })
                      }
                      className="h-9 w-16 rounded-lg border border-zinc-300 px-2 text-sm"
                    />
                  </label>

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
              ))}
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={crearHorario}
        className="mt-6 flex flex-col gap-3 rounded-2xl border border-dashed border-zinc-300 p-3"
      >
        <div>
          <p className="text-sm font-semibold text-marca-negro">Agregar una clase suelta</p>
          <p className="text-xs text-zinc-500">Para una fecha puntual que no sigue el lote de arriba (ej. una clase especial).</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            type="date"
            required
            value={nuevaFecha}
            onChange={(e) => setNuevaFecha(e.target.value)}
            className="h-11 flex-1 rounded-xl border border-zinc-300 px-2 text-sm"
          />
          <input
            type="time"
            required
            value={nuevaHora}
            onChange={(e) => setNuevaHora(e.target.value)}
            className="h-11 w-28 rounded-xl border border-zinc-300 px-2 text-sm"
          />
          <input
            type="number"
            min={1}
            required
            value={nuevoCupo}
            onChange={(e) => setNuevoCupo(e.target.value)}
            placeholder="Cupo"
            className="h-11 w-20 rounded-xl border border-zinc-300 px-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={creando}
          className="flex h-11 items-center justify-center rounded-full bg-marca-rosa px-4 text-sm font-semibold text-marca-negro disabled:opacity-60"
        >
          {creando ? "Agregando…" : "Agregar"}
        </button>
      </form>
    </main>
  );
}
