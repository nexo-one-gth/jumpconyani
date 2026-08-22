"use client";

import { use, useEffect, useMemo, useState, type FormEvent } from "react";
import { crearClienteSupabase } from "@/lib/supabase/client";
import { NOMBRE_MARCA } from "@/lib/contacto";
import CintaSponsors from "@/components/eventos/CintaSponsors";

interface Props {
  params: Promise<{ token: string }>;
}

interface DatosFormulario {
  encontrado: boolean;
  sponsor_nombre?: string;
  sponsor_logo?: string | null;
  evento_titulo?: string;
  evento_fecha?: string;
  evento_horario?: string | null;
  evento_fecha_orden?: string;
  cerrado?: boolean;
  aporte?: string | null;
  detalle?: string | null;
  alias_pago?: string | null;
  colaboradores?: { id: string; nombre: string }[];
}

/** "2026-09-24" -> "24/9". Mismo criterio que el resto del proyecto: se arma
 * a mano para no correr riesgo de que el huso horario la corra un día. */
function formatearDiaMes(fechaISO: string): string {
  const [, mes, dia] = fechaISO.split("-").map(Number);
  return `${dia}/${mes}`;
}

/**
 * Formulario público (sin login) para que un sponsor invitado a un evento
 * cargue su propia colaboración: con qué aporta, el detalle, y los nombres
 * de los colaboradores que va a llevar. El link (/sponsors/[token]) lo
 * genera y comparte Yani desde /admin/eventos/[id] (ver
 * SeccionSponsorsEvento.tsx).
 *
 * Mismo patrón de seguridad que /profesoras/[token]: el token es la única
 * credencial, y toda la lógica de qué se puede leer/escribir vive en las
 * funciones SECURITY DEFINER obtener_formulario_sponsor /
 * guardar_datos_sponsor, no en una policy de RLS abierta.
 *
 * El alias que se muestra acá es el de Yani (alias_pago, el mismo dato que
 * ya se le mostraba a las profesoras) — de solo lectura, con botón de
 * copiar. El sponsor no carga un alias propio: no hay ningún reintegro de
 * Yani hacia el sponsor en este flujo.
 */
export default function FormularioSponsor({ params }: Props) {
  const { token } = use(params);
  const supabase = useMemo(() => crearClienteSupabase(), []);

  const [datos, setDatos] = useState<DatosFormulario | null>(null);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [aporte, setAporte] = useState("");
  const [detalle, setDetalle] = useState("");
  const [colaboradores, setColaboradores] = useState<string[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null);
  const [guardadoOk, setGuardadoOk] = useState(false);
  const [aliasCopiado, setAliasCopiado] = useState(false);

  async function cargarFormulario() {
    setErrorCarga(null);
    try {
      const { data, error } = await supabase.rpc("obtener_formulario_sponsor", { p_token: token });
      if (error) throw error;
      const resultado = data as DatosFormulario;
      setDatos(resultado);
      if (resultado.encontrado) {
        setAporte(resultado.aporte ?? "");
        setDetalle(resultado.detalle ?? "");
        setColaboradores((resultado.colaboradores ?? []).map((c) => c.nombre));
      }
    } catch {
      setErrorCarga("No se pudo cargar este link. Probá de nuevo en un rato o avisale a Yani.");
    }
  }

  useEffect(() => {
    document.title = `Colaboración con evento | ${NOMBRE_MARCA}`;
    cargarFormulario();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al montar, con el token de la URL
  }, [token]);

  function agregarColaborador() {
    setColaboradores((actual) => [...actual, ""]);
  }

  function actualizarColaborador(indice: number, valor: string) {
    setColaboradores((actual) => actual.map((nombre, i) => (i === indice ? valor : nombre)));
  }

  function quitarColaborador(indice: number) {
    setColaboradores((actual) => actual.filter((_, i) => i !== indice));
  }

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setErrorGuardado(null);
    setGuardadoOk(false);

    const nombresLimpios = colaboradores.map((n) => n.trim()).filter((n) => n.length > 0);

    setGuardando(true);
    try {
      const { error } = await supabase.rpc("guardar_datos_sponsor", {
        p_token: token,
        p_aporte: aporte,
        p_detalle: detalle,
        p_nombres: nombresLimpios,
      });

      if (error) {
        if (error.message.includes("formulario_cerrado")) {
          setErrorGuardado("La carga para este evento ya se cerró.");
        } else {
          setErrorGuardado("No se pudo guardar: " + error.message);
        }
        await cargarFormulario();
        return;
      }

      setGuardadoOk(true);
      await cargarFormulario();
    } finally {
      setGuardando(false);
    }
  }

  async function copiarAlias() {
    if (!datos?.alias_pago) return;
    try {
      await navigator.clipboard.writeText(datos.alias_pago);
      setAliasCopiado(true);
      setTimeout(() => setAliasCopiado(false), 2000);
    } catch {
      // Sin permiso de portapapeles: el alias ya está visible en la pantalla
      // para copiarlo a mano, así que no hace falta mostrar un error.
    }
  }

  if (errorCarga) {
    return (
      <main className="flex min-h-full flex-col justify-center px-4 py-10 text-center">
        <p className="text-sm text-marca-rojo">{errorCarga}</p>
      </main>
    );
  }

  if (!datos) {
    return (
      <main className="flex min-h-full flex-col justify-center px-4 py-10 text-center">
        <p className="text-sm text-zinc-500">Cargando…</p>
      </main>
    );
  }

  if (!datos.encontrado) {
    return (
      <main className="flex min-h-full flex-col justify-center px-4 py-10 text-center">
        <h1 className="font-titulo text-xl uppercase text-marca-negro">Link no válido</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Este link no corresponde a ningún evento. Consultale a Yani por WhatsApp si necesitás uno nuevo.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-full px-4 py-8">
      <h1 className="font-titulo text-2xl uppercase text-marca-negro">{NOMBRE_MARCA}</h1>
      <p className="mt-1 text-lg text-zinc-600">Hola {datos.sponsor_nombre} 👋</p>

      <div className="mt-4 rounded-2xl bg-zinc-50 p-4">
        <p className="font-titulo text-lg uppercase leading-tight text-marca-negro">{datos.evento_titulo}</p>
        <p className="mt-1 text-sm text-zinc-600">
          {datos.evento_fecha}
          {datos.evento_horario ? ` · ${datos.evento_horario}` : ""}
        </p>
      </div>

      {datos.cerrado ? (
        <div className="mt-6">
          <p className="rounded-xl bg-amber-50 p-3 text-sm text-marca-negro">
            La carga para este evento ya se cerró. Esto es lo último que quedó guardado — si hace falta corregir
            algo, avisale a Yani por WhatsApp.
          </p>
          <div className="mt-4 flex flex-col gap-2 text-sm text-marca-negro">
            <p className="rounded-xl border border-zinc-200 px-3 py-3">Aporte: {datos.aporte || "sin cargar"}</p>
            <p className="rounded-xl border border-zinc-200 px-3 py-3">Detalle: {datos.detalle || "sin cargar"}</p>
          </div>
          <div className="mt-4">
            <h2 className="font-titulo text-lg uppercase text-marca-negro">Colaboradores ({colaboradores.length})</h2>
            <div className="mt-2 flex flex-col gap-2">
              {colaboradores.length === 0 && <p className="text-sm text-zinc-500">No se cargó ningún colaborador.</p>}
              {colaboradores.map((nombre, i) => (
                <p key={i} className="rounded-xl border border-zinc-200 px-3 py-3 text-sm text-marca-negro">
                  {nombre}
                </p>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={guardar} className="mt-6 flex flex-col gap-4">
          <p className="text-sm text-zinc-500">
            Contanos tu colaboración con este evento. Podés volver a entrar a este mismo link para corregir hasta el
            día {datos.evento_fecha_orden ? formatearDiaMes(datos.evento_fecha_orden) : "del evento"}.
          </p>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-marca-negro">¿Con qué aportás al evento?</span>
            <input
              type="text"
              placeholder="Ej: Productos para sorteo"
              value={aporte}
              onChange={(e) => setAporte(e.target.value)}
              className="h-12 rounded-xl border border-zinc-300 px-3 text-base"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-marca-negro">Detalle de la colaboración</span>
            <textarea
              placeholder="Contanos más: qué traen, cantidad, algo que Yani tenga que saber para el día del evento"
              value={detalle}
              onChange={(e) => setDetalle(e.target.value)}
              rows={4}
              className="rounded-xl border border-zinc-300 px-3 py-3 text-base"
            />
          </label>

          <div>
            <h2 className="font-titulo text-lg uppercase text-marca-negro">Colaboradores ({colaboradores.length})</h2>
            <p className="text-sm text-zinc-500">
              Cargá el nombre de cada colaborador que va a estar presente en el evento.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {colaboradores.map((nombre, indice) => (
              <div key={indice} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nombre y apellido"
                  value={nombre}
                  onChange={(e) => actualizarColaborador(indice, e.target.value)}
                  className="h-12 flex-1 rounded-xl border border-zinc-300 px-3 text-base"
                />
                <button
                  type="button"
                  onClick={() => quitarColaborador(indice)}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-zinc-300 text-zinc-500"
                  aria-label="Quitar colaborador"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={agregarColaborador}
            className="flex h-12 items-center justify-center rounded-full border border-dashed border-zinc-300 px-4 text-sm font-medium text-zinc-600"
          >
            + Agregar colaborador
          </button>

          {errorGuardado && <p className="rounded-xl bg-red-50 p-3 text-sm text-marca-rojo">{errorGuardado}</p>}
          {guardadoOk && !errorGuardado && (
            <p className="rounded-xl bg-green-50 p-3 text-sm text-marca-negro">Datos guardados.</p>
          )}

          <button
            type="submit"
            disabled={guardando}
            className="flex h-12 w-full items-center justify-center rounded-full bg-marca-rosa px-5 text-base font-semibold text-marca-negro disabled:opacity-60"
          >
            {guardando ? "Guardando…" : "Guardar"}
          </button>
        </form>
      )}

      {datos.alias_pago && (
        <div className="mt-6 rounded-2xl bg-zinc-50 p-4">
          <h3 className="font-titulo text-base uppercase text-marca-negro">Alias de pago</h3>
          <div className="mt-2 flex items-center gap-2">
            <p className="flex-1 truncate text-sm font-medium text-marca-negro">{datos.alias_pago}</p>
            <button
              type="button"
              onClick={copiarAlias}
              className="flex h-10 shrink-0 items-center justify-center rounded-full border border-zinc-300 px-3 text-xs font-medium text-zinc-600"
            >
              {aliasCopiado ? "¡Copiado!" : "Copiar"}
            </button>
          </div>
        </div>
      )}

      <CintaSponsors />
    </main>
  );
}
