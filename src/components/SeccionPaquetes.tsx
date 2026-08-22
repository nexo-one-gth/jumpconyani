"use client";

import { useEffect, useState } from "react";
import { Paquete, formatearDias, formatearHora, obtenerPaquetes } from "@/lib/paquetes";
import { linkWhatsapp } from "@/lib/contacto";

export default function SeccionPaquetes() {
  const [paquetes, setPaquetes] = useState<Paquete[]>([]);
  const [cargando, setCargando] = useState(true);
  const [paqueteSeleccionadoId, setPaqueteSeleccionadoId] = useState<string | null>(null);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;
    obtenerPaquetes().then((datos) => {
      if (!vigente) return;
      setPaquetes(datos);
      setCargando(false);
    });
    return () => {
      vigente = false;
    };
  }, []);

  const paqueteSeleccionado = paquetes.find((p) => p.id === paqueteSeleccionadoId) ?? null;

  function elegirPaquete(paquete: Paquete) {
    setPaqueteSeleccionadoId(paquete.id);
    setHorarioSeleccionado(paquete.horarios[0] ?? null);
  }

  const mensajeWhatsapp = paqueteSeleccionado
    ? [
        `Hola Yani! Quiero anotarme al plan de ${paqueteSeleccionado.clasesPorSemana} clases semanales`,
        `(${formatearDias(paqueteSeleccionado.dias)})`,
        horarioSeleccionado ? `a las ${horarioSeleccionado} hs.` : ".",
        `Precio: ${paqueteSeleccionado.precio}.`,
      ].join(" ")
    : "";

  return (
    <section id="planes" className="seccion-pantalla px-4">
      <h2 className="font-titulo text-2xl uppercase text-marca-negro">Planes semanales</h2>
      <p className="mt-1 text-sm text-zinc-500">Elegí cuántas veces por semana querés venir.</p>

      {cargando && (
        <p className="mt-4 rounded-xl bg-zinc-50 p-3 text-center text-sm text-zinc-500">Cargando planes…</p>
      )}

      {!cargando && paquetes.length === 0 && (
        <p className="mt-4 rounded-xl bg-zinc-50 p-3 text-center text-sm text-zinc-500">
          Todavía no hay planes cargados.
        </p>
      )}

      <div className="mt-5 flex flex-col gap-3">
        {paquetes.map((paquete) => {
          const seleccionado = paquete.id === paqueteSeleccionadoId;
          return (
            <button
              key={paquete.id}
              type="button"
              onClick={() => elegirPaquete(paquete)}
              aria-pressed={seleccionado}
              className={[
                "rounded-2xl border p-4 text-left transition-colors",
                seleccionado ? "border-marca-rosa bg-marca-rosa/10" : "border-zinc-200 active:bg-zinc-50",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-titulo text-base uppercase text-marca-negro">
                  {paquete.clasesPorSemana} clases semanales
                </span>
                <span className="shrink-0 font-semibold text-marca-negro">{paquete.precio}</span>
              </div>
              <p className="mt-1 text-xs text-zinc-500">{formatearDias(paquete.dias)}</p>
            </button>
          );
        })}
      </div>

      {paqueteSeleccionado && (
        <div className="mt-5 rounded-2xl border border-zinc-200 p-4">
          {paqueteSeleccionado.horarios.length > 1 && (
            <div>
              <p className="text-xs font-medium text-zinc-500">Elegí el horario</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {paqueteSeleccionado.horarios.map((horario) => {
                  const activo = horario === horarioSeleccionado;
                  return (
                    <button
                      key={horario}
                      type="button"
                      onClick={() => setHorarioSeleccionado(horario)}
                      aria-pressed={activo}
                      className={[
                        "flex h-11 items-center justify-center rounded-full px-4 text-sm font-medium",
                        activo
                          ? "bg-marca-rosa font-semibold text-marca-negro"
                          : "border border-zinc-300 text-zinc-600 active:bg-zinc-100",
                      ].join(" ")}
                    >
                      {formatearHora(horario)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between rounded-xl bg-zinc-50 p-3">
            <span className="text-sm text-zinc-600">Precio del plan elegido</span>
            <span className="text-lg font-semibold text-marca-negro">{paqueteSeleccionado.precio}</span>
          </div>

          <a
            href={linkWhatsapp(mensajeWhatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex h-12 w-full items-center justify-center rounded-full bg-marca-rosa px-5 text-base font-semibold text-marca-negro active:bg-marca-rosa/80"
          >
            Consultar por WhatsApp
          </a>
        </div>
      )}
    </section>
  );
}
