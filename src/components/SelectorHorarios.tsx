"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DiaConHorarios,
  formatearFechaCorta,
  obtenerGrillaDelMes,
  mismaFecha,
} from "@/lib/horarios";
import { linkWhatsapp } from "@/lib/contacto";

const NOMBRES_DIAS = ["L", "M", "M", "J", "V", "S", "D"];

/** Arma la grilla de 7 columnas (lunes a domingo) con relleno para alinear el mes. */
function celdasDelMes(anio: number, mes: number): (Date | null)[] {
  const primerDia = new Date(anio, mes, 1);
  const offsetLunes = (primerDia.getDay() + 6) % 7; // 0 = lunes
  const celdas: (Date | null)[] = Array(offsetLunes).fill(null);

  const cursor = new Date(anio, mes, 1);
  while (cursor.getMonth() === mes) {
    celdas.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  while (celdas.length % 7 !== 0) {
    celdas.push(null);
  }
  return celdas;
}

export default function SelectorHorarios() {
  const hoy = useMemo(() => new Date(), []);
  // Sin hora: para comparar "es un día pasado" contra fechas que vienen a
  // las 00:00 (las de la grilla) sin que la hora actual meta ruido.
  const inicioDeHoy = useMemo(() => new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()), [hoy]);
  const [mesVisible, setMesVisible] = useState(() => new Date(hoy.getFullYear(), hoy.getMonth(), 1));
  // Arranca en hoy: así se ven los horarios del día apenas se entra, sin
  // tener que tocar el calendario primero (si hoy no tiene clase, el
  // mensaje de "ese día no hay clases" ya lo explica solo).
  const [diaSeleccionado, setDiaSeleccionado] = useState<Date | null>(hoy);

  const [grilla, setGrilla] = useState<DiaConHorarios[]>([]);
  // Arranca en true (todavía no llegó la primera respuesta). Al cambiar de
  // mes no se vuelve a poner en true: se sigue mostrando la grilla anterior
  // hasta que llega la nueva, en vez de parpadear un estado de carga.
  const [cargando, setCargando] = useState(true);
  const hayGrillaCargada = !cargando && grilla.length > 0;

  useEffect(() => {
    let vigente = true;
    obtenerGrillaDelMes(mesVisible.getFullYear(), mesVisible.getMonth()).then((dias) => {
      if (vigente) {
        setGrilla(dias);
        setCargando(false);
      }
    });
    return () => {
      vigente = false;
    };
  }, [mesVisible]);

  const celdas = useMemo(
    () => celdasDelMes(mesVisible.getFullYear(), mesVisible.getMonth()),
    [mesVisible]
  );

  const diasConClase = useMemo(() => {
    const mapa = new Map<string, DiaConHorarios>();
    grilla.forEach((dia) => mapa.set(dia.fecha.toDateString(), dia));
    return mapa;
  }, [grilla]);

  const horariosDelDiaSeleccionado = diaSeleccionado
    ? diasConClase.get(diaSeleccionado.toDateString())
    : undefined;

  function irAMesAnterior() {
    setDiaSeleccionado(null);
    setMesVisible((actual) => new Date(actual.getFullYear(), actual.getMonth() - 1, 1));
  }

  function irAMesSiguiente() {
    setDiaSeleccionado(null);
    setMesVisible((actual) => new Date(actual.getFullYear(), actual.getMonth() + 1, 1));
  }

  return (
    <section id="horarios" className="seccion-pantalla px-4">
      <h2 className="font-titulo text-2xl uppercase text-marca-negro">Horarios de este mes</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Horarios de muestra para ver el diseño — todavía no están conectados a la agenda real de Yani.
      </p>

      <div className="mt-5 rounded-2xl border border-zinc-200 p-3">
        <div className="flex items-center justify-between px-1">
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

        {cargando && (
          <p className="mt-3 rounded-xl bg-zinc-50 p-3 text-center text-sm text-zinc-500">
            Cargando horarios…
          </p>
        )}

        {!cargando && !hayGrillaCargada && (
          <p className="mt-3 rounded-xl bg-zinc-50 p-3 text-center text-sm text-zinc-500">
            Todavía no hay agenda cargada para este mes.
          </p>
        )}

        <div className="mt-2 grid grid-cols-7 gap-y-1 text-center">
          {NOMBRES_DIAS.map((nombre, indice) => (
            <span key={`${nombre}-${indice}`} className="text-xs font-medium text-zinc-400">
              {nombre}
            </span>
          ))}

          {celdas.map((fecha, indice) => {
            if (!fecha) return <span key={`vacio-${indice}`} />;

            const tieneClase = diasConClase.has(fecha.toDateString());
            // Un día pasado no se puede reservar aunque haya tenido clase
            // cargada: se ve apagado igual que un día sin clase, en vez de
            // quedar clickeable como si todavía se pudiera anotar.
            const esPasado = fecha < inicioDeHoy;
            const disponible = tieneClase && !esPasado;
            const esSeleccionado = diaSeleccionado ? mismaFecha(fecha, diaSeleccionado) : false;
            const esHoy = mismaFecha(fecha, hoy);

            return (
              <button
                key={fecha.toDateString()}
                type="button"
                disabled={!disponible}
                onClick={() => setDiaSeleccionado(fecha)}
                className={[
                  "mx-auto flex h-11 w-11 items-center justify-center rounded-full text-sm",
                  !disponible && "text-zinc-300",
                  disponible && !esSeleccionado && "font-medium text-marca-negro active:bg-marca-rosa/20",
                  esSeleccionado && "bg-marca-rosa font-semibold text-marca-negro",
                  esHoy && !esSeleccionado && "ring-1 ring-marca-rosa",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {fecha.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5">
        {!diaSeleccionado && hayGrillaCargada && (
          <p className="rounded-xl bg-zinc-50 p-4 text-sm text-zinc-500">
            Elegí un día con clase (resaltado en el calendario) para ver los horarios disponibles.
          </p>
        )}

        {diaSeleccionado && !horariosDelDiaSeleccionado && (
          <p className="rounded-xl bg-zinc-50 p-4 text-sm text-zinc-500">
            Ese día no hay clases. Probá con otro día resaltado.
          </p>
        )}

        {horariosDelDiaSeleccionado && (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium capitalize text-zinc-700">
              {formatearFechaCorta(horariosDelDiaSeleccionado.fecha)}
            </p>
            {horariosDelDiaSeleccionado.horarios.map((horario) => {
              const sinCupo = horario.cupoDisponible === 0;
              return (
                <div
                  key={horario.hora}
                  className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 p-3"
                >
                  <div>
                    <p className="text-base font-semibold text-marca-negro">{horario.hora} hs</p>
                    <p className={`text-xs ${sinCupo ? "text-marca-rojo" : "text-zinc-500"}`}>
                      {sinCupo
                        ? "Sin cupo disponible"
                        : `Quedan ${horario.cupoDisponible} de ${horario.cupoTotal} lugares`}
                    </p>
                  </div>
                  {sinCupo ? (
                    <span className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-400">
                      Completo
                    </span>
                  ) : (
                    <a
                      href={linkWhatsapp(
                        `Hola Yani! Quiero reservar mi lugar en la clase del ${formatearFechaCorta(
                          horariosDelDiaSeleccionado.fecha
                        )} a las ${horario.hora}.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-11 shrink-0 items-center justify-center rounded-full bg-marca-rosa px-4 text-sm font-semibold text-marca-negro active:bg-marca-rosa/80"
                    >
                      Reservar
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
