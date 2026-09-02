"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { crearClienteSupabase } from "@/lib/supabase/client";
import {
  ICONOS_BENEFICIO,
  type BeneficioSponsor,
  type Evento,
  type IconoBeneficio,
  type OpcionTraslado,
  type PropuestaSponsors,
} from "@/lib/eventos";
import IconoDeBeneficio, { ETIQUETAS_ICONO_BENEFICIO } from "@/components/eventos/IconosBeneficio";

interface Props {
  /** Si viene, el formulario edita este evento. Si no viene, crea uno nuevo. */
  evento?: Evento;
}

function generarSlug(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // saca acentos (después de normalize("NFD"))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function formatearFechaInput(fecha: Date): string {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
}

const TAMANIO_MAXIMO_MB = 8;

/**
 * Formulario de alta/edición de un evento, usado tanto en
 * /admin/eventos/nuevo como en /admin/eventos/[id]. El slug se autogenera
 * del título mientras se está creando; en edición queda fijo para no romper
 * links que Yani ya haya compartido.
 */
export default function FormularioEvento({ evento }: Props) {
  const router = useRouter();
  const supabase = useMemo(() => crearClienteSupabase(), []);
  const esEdicion = !!evento;
  const detallesDatosRef = useRef<HTMLDetailsElement>(null);

  const [slug, setSlug] = useState(evento?.slug ?? "");
  const [slugTocado, setSlugTocado] = useState(esEdicion);
  const [titulo, setTitulo] = useState(evento?.titulo ?? "");
  const [fecha, setFecha] = useState(evento?.fecha ?? "");
  const [fechaOrden, setFechaOrden] = useState(evento ? formatearFechaInput(evento.fechaOrden) : "");
  const [horario, setHorario] = useState(evento?.horario ?? "");
  const [direccion, setDireccion] = useState(evento?.direccion ?? "");
  const [observacion, setObservacion] = useState(evento?.observacion ?? "");
  const [precio, setPrecio] = useState(evento?.precio ?? "");
  const [comoLlegar, setComoLlegar] = useState<OpcionTraslado[]>(evento?.comoLlegar ?? []);
  // Propuesta para sponsors: lo que ve el sponsor en /sponsors/[token] antes
  // de cargar su colaboración. Cada campo por separado; se guarda como un
  // solo JSON (o null si quedó todo vacío).
  const [propDescripcion, setPropDescripcion] = useState(evento?.propuestaSponsors?.descripcion ?? "");
  const [propAporte, setPropAporte] = useState(evento?.propuestaSponsors?.aporte ?? "");
  const [propPremio, setPropPremio] = useState(evento?.propuestaSponsors?.premio ?? "");
  const [propBeneficios, setPropBeneficios] = useState<BeneficioSponsor[]>(
    evento?.propuestaSponsors?.beneficios ?? [],
  );
  const [propCierre, setPropCierre] = useState(evento?.propuestaSponsors?.cierre ?? "");

  const [archivoFlyer, setArchivoFlyer] = useState<File | null>(null);
  const [previaFlyer, setPreviaFlyer] = useState<string | null>(
    evento && evento.flyer.tipo === "imagen" ? evento.flyer.src : null
  );

  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  function actualizarTitulo(valor: string) {
    setTitulo(valor);
    if (!slugTocado) setSlug(generarSlug(valor));
  }

  function elegirArchivo(archivo: File | null) {
    setError(null);
    if (!archivo) return;
    if (!archivo.type.startsWith("image/")) {
      setError("El flyer tiene que ser una imagen (jpg, png o webp).");
      return;
    }
    if (archivo.size > TAMANIO_MAXIMO_MB * 1024 * 1024) {
      setError(`La imagen pesa demasiado (máximo ${TAMANIO_MAXIMO_MB} MB).`);
      return;
    }
    setArchivoFlyer(archivo);
    setPreviaFlyer(URL.createObjectURL(archivo));
  }

  function medirImagen(archivo: File): Promise<{ ancho: number; alto: number }> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(archivo);
      const imagen = new window.Image();
      imagen.onload = () => {
        resolve({ ancho: imagen.naturalWidth, alto: imagen.naturalHeight });
        URL.revokeObjectURL(url);
      };
      imagen.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("No se pudo leer la imagen."));
      };
      imagen.src = url;
    });
  }

  function agregarOpcionTraslado() {
    setComoLlegar((actual) => [...actual, { titulo: "", detalle: "" }]);
  }

  function actualizarOpcionTraslado(indice: number, cambios: Partial<OpcionTraslado>) {
    setComoLlegar((actual) => actual.map((opcion, i) => (i === indice ? { ...opcion, ...cambios } : opcion)));
  }

  function quitarOpcionTraslado(indice: number) {
    setComoLlegar((actual) => actual.filter((_, i) => i !== indice));
  }

  function agregarBeneficio() {
    setPropBeneficios((actual) => [...actual, { icono: "bandera", texto: "" }]);
  }

  function actualizarBeneficio(indice: number, cambios: Partial<BeneficioSponsor>) {
    setPropBeneficios((actual) =>
      actual.map((beneficio, i) => (i === indice ? { ...beneficio, ...cambios } : beneficio)),
    );
  }

  function quitarBeneficio(indice: number) {
    setPropBeneficios((actual) => actual.filter((_, i) => i !== indice));
  }

  /** Arma el JSON de la propuesta con los campos que tengan contenido, o
   * null si Yani no cargó nada (así el formulario del sponsor no muestra
   * una sección vacía). */
  function armarPropuesta(): PropuestaSponsors | null {
    const beneficiosLimpios = propBeneficios
      .map((beneficio) => ({ icono: beneficio.icono, texto: beneficio.texto.trim() }))
      .filter((beneficio) => beneficio.texto);
    const propuesta: PropuestaSponsors = {};
    if (propDescripcion.trim()) propuesta.descripcion = propDescripcion.trim();
    if (propAporte.trim()) propuesta.aporte = propAporte.trim();
    if (propPremio.trim()) propuesta.premio = propPremio.trim();
    if (beneficiosLimpios.length > 0) propuesta.beneficios = beneficiosLimpios;
    if (propCierre.trim()) propuesta.cierre = propCierre.trim();
    return Object.keys(propuesta).length > 0 ? propuesta : null;
  }

  async function guardar(evento_: FormEvent) {
    evento_.preventDefault();
    setError(null);

    if (!slug.trim() || !titulo.trim() || !fecha.trim() || !fechaOrden) {
      setError("Faltan completar campos obligatorios (título, identificador, fecha).");
      // Esos campos viven dentro de "Datos del evento", que ahora se puede
      // contraer: si están vacíos porque la sección estaba cerrada, la
      // abrimos para que se vean los que faltan.
      if (detallesDatosRef.current) {
        detallesDatosRef.current.open = true;
        detallesDatosRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }
    if (!esEdicion && !archivoFlyer) {
      setError("Elegí una imagen de flyer.");
      return;
    }

    setGuardando(true);

    try {
      let flyerSrc = evento?.flyer.tipo === "imagen" ? evento.flyer.src : "";
      let flyerAncho = evento?.flyer.tipo === "imagen" ? evento.flyer.ancho : 0;
      let flyerAlto = evento?.flyer.tipo === "imagen" ? evento.flyer.alto : 0;

      if (archivoFlyer) {
        const { ancho, alto } = await medirImagen(archivoFlyer);
        const extension = archivoFlyer.name.split(".").pop()?.toLowerCase() || "jpg";
        const ruta = `${slug.trim()}-${Date.now()}.${extension}`;

        const { error: errorSubida } = await supabase.storage
          .from("flyers")
          .upload(ruta, archivoFlyer, { upsert: false });

        if (errorSubida) {
          throw new Error("No se pudo subir la imagen: " + errorSubida.message);
        }

        const { data: publico } = supabase.storage.from("flyers").getPublicUrl(ruta);
        flyerSrc = publico.publicUrl;
        flyerAncho = ancho;
        flyerAlto = alto;
      }

      const comoLlegarLimpio = comoLlegar
        .map((opcion) => ({ titulo: opcion.titulo.trim(), detalle: opcion.detalle.trim() }))
        .filter((opcion) => opcion.titulo || opcion.detalle);

      const registro = {
        slug: slug.trim(),
        titulo: titulo.trim(),
        flyer_src: flyerSrc,
        flyer_ancho: flyerAncho,
        flyer_alto: flyerAlto,
        flyer_alt: `Flyer de ${titulo.trim()}, ${fecha.trim()}`,
        fecha: fecha.trim(),
        fecha_orden: fechaOrden,
        horario: horario.trim() || null,
        direccion: direccion.trim() || null,
        observacion: observacion.trim() || null,
        precio: precio.trim() || null,
        como_llegar: comoLlegarLimpio.length > 0 ? comoLlegarLimpio : null,
        propuesta_sponsors: armarPropuesta(),
        actualizado_en: new Date().toISOString(),
      };

      const { error: errorGuardado } = evento
        ? await supabase.from("eventos").update(registro).eq("id", evento.id)
        : await supabase.from("eventos").insert(registro);

      if (errorGuardado) {
        throw new Error(
          errorGuardado.code === "23505"
            ? "Ya existe un evento con ese identificador. Cambialo e intentá de nuevo."
            : "No se pudo guardar: " + errorGuardado.message
        );
      }

      router.push("/admin/eventos");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={guardar} className="mt-6 flex flex-col gap-5 pb-10">
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-marca-rojo">{error}</p>}

      <div>
        <h2 className="font-titulo text-lg uppercase text-marca-negro">Flyer</h2>
        <p className="text-sm text-zinc-500">Imagen (jpg, png o webp), hasta {TAMANIO_MAXIMO_MB} MB.</p>

        {previaFlyer && (
          // Vista previa de un archivo local (blob: URL) o del flyer ya cargado:
          // next/image no acepta el esquema blob:, así que va sin optimizar.
          // eslint-disable-next-line @next/next/no-img-element -- previsualización de blob: URL
          <img
            src={previaFlyer}
            alt="Vista previa del flyer"
            className="mt-3 h-48 w-auto rounded-xl border border-zinc-200 object-contain"
          />
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) => elegirArchivo(e.target.files?.[0] ?? null)}
          className="mt-3 block w-full text-sm text-zinc-600 file:mr-3 file:h-10 file:rounded-full file:border-0 file:bg-marca-rosa file:px-4 file:text-sm file:font-semibold file:text-marca-negro"
        />
      </div>

      <details ref={detallesDatosRef} className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between font-titulo text-lg uppercase text-marca-negro [&::-webkit-details-marker]:hidden">
          Datos del evento
          <span aria-hidden className="text-base text-zinc-400 transition-transform duration-200 group-open:rotate-180">
            ▾
          </span>
        </summary>

        <label className="mt-3 flex flex-col gap-1">
          <span className="text-sm font-medium text-zinc-700">Título</span>
          <input
            type="text"
            required
            value={titulo}
            onChange={(e) => actualizarTitulo(e.target.value)}
            className="h-12 rounded-xl border border-zinc-300 px-3 text-base"
          />
        </label>

        <label className="mt-3 flex flex-col gap-1">
          <span className="text-sm font-medium text-zinc-700">
            Identificador (para el link){" "}
            {esEdicion && <span className="font-normal text-zinc-400">— no se puede cambiar</span>}
          </span>
          <input
            type="text"
            required
            disabled={esEdicion}
            value={slug}
            onChange={(e) => {
              setSlugTocado(true);
              setSlug(generarSlug(e.target.value));
            }}
            className="h-12 rounded-xl border border-zinc-300 px-3 text-base disabled:bg-zinc-100 disabled:text-zinc-400"
          />
          <span className="text-xs text-zinc-400">jumpingconyani.com/eventos/{slug || "…"}</span>
        </label>

        <label className="mt-3 flex flex-col gap-1">
          <span className="text-sm font-medium text-zinc-700">Fecha (como se muestra en el sitio)</span>
          <input
            type="text"
            required
            placeholder="ej: 26 de septiembre / 6, 7 y 8 de noviembre"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="h-12 rounded-xl border border-zinc-300 px-3 text-base"
          />
        </label>

        <label className="mt-3 flex flex-col gap-1">
          <span className="text-sm font-medium text-zinc-700">
            Fecha de inicio (para ordenar y ocultarlo cuando pase)
          </span>
          <input
            type="date"
            required
            value={fechaOrden}
            onChange={(e) => setFechaOrden(e.target.value)}
            className="h-12 rounded-xl border border-zinc-300 px-3 text-base"
          />
        </label>

        <label className="mt-3 flex flex-col gap-1">
          <span className="text-sm font-medium text-zinc-700">Horario (opcional)</span>
          <input
            type="text"
            placeholder="ej: 14:30 hs"
            value={horario}
            onChange={(e) => setHorario(e.target.value)}
            className="h-12 rounded-xl border border-zinc-300 px-3 text-base"
          />
        </label>

        <label className="mt-3 flex flex-col gap-1">
          <span className="text-sm font-medium text-zinc-700">Localidad (opcional)</span>
          <input
            type="text"
            placeholder="ej: Rafael Castillo (no hace falta la dirección exacta)"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            className="h-12 rounded-xl border border-zinc-300 px-3 text-base"
          />
        </label>

        <label className="mt-3 flex flex-col gap-1">
          <span className="text-sm font-medium text-zinc-700">Observación (opcional)</span>
          <textarea
            rows={2}
            placeholder="ej: Con muchos profes invitados."
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            className="rounded-xl border border-zinc-300 px-3 py-2 text-base"
          />
        </label>

        <label className="mt-3 flex flex-col gap-1">
          <span className="text-sm font-medium text-zinc-700">Precio de entrada (opcional)</span>
          <input
            type="text"
            placeholder="Dejalo vacío si todavía no hay precio publicado"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            className="h-12 rounded-xl border border-zinc-300 px-3 text-base"
          />
        </label>
      </details>

      <div>
        <h2 className="font-titulo text-lg uppercase text-marca-negro">Cómo llegar (opcional)</h2>
        <p className="text-sm text-zinc-500">
          Opciones de traslado. Si no cargás ninguna, esa sección no se muestra en el evento.
        </p>

        <div className="mt-3 flex flex-col gap-3">
          {comoLlegar.map((opcion, indice) => (
            <div key={indice} className="rounded-xl border border-zinc-200 p-3">
              <input
                type="text"
                placeholder="Título (ej: Micro contratado)"
                value={opcion.titulo}
                onChange={(e) => actualizarOpcionTraslado(indice, { titulo: e.target.value })}
                className="h-11 w-full rounded-lg border border-zinc-300 px-3 text-sm"
              />
              <textarea
                placeholder="Detalle"
                rows={2}
                value={opcion.detalle}
                onChange={(e) => actualizarOpcionTraslado(indice, { detalle: e.target.value })}
                className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => quitarOpcionTraslado(indice)}
                className="mt-2 text-xs font-medium text-zinc-500"
              >
                Quitar esta opción
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={agregarOpcionTraslado}
          className="mt-3 flex h-10 items-center justify-center rounded-full border border-dashed border-zinc-300 px-4 text-sm font-medium text-zinc-600"
        >
          + Agregar opción de traslado
        </button>
      </div>

      <details className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between font-titulo text-lg uppercase text-marca-negro [&::-webkit-details-marker]:hidden">
          Propuesta para sponsors (opcional)
          <span aria-hidden className="text-base text-zinc-400 transition-transform duration-200 group-open:rotate-180">
            ▾
          </span>
        </summary>
        <p className="mt-1 text-sm text-zinc-500">
          Es lo que ve cada sponsor al abrir su link, antes de cargar su colaboración. Si lo dejás vacío, no se
          muestra.
        </p>

        <label className="mt-3 flex flex-col gap-1">
          <span className="text-sm font-medium text-zinc-700">Sobre el evento</span>
          <textarea
            rows={3}
            placeholder="Ej: Primera Master Class del Team Superpoderosas: una jornada de Jumping con instructorxs y alumnas de distintas provincias."
            value={propDescripcion}
            onChange={(e) => setPropDescripcion(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-base"
          />
        </label>

        <label className="mt-3 flex flex-col gap-1">
          <span className="text-sm font-medium text-zinc-700">Valor del aporte</span>
          <input
            type="text"
            placeholder="Ej: $30.000"
            value={propAporte}
            onChange={(e) => setPropAporte(e.target.value)}
            className="h-11 w-full rounded-lg border border-zinc-300 px-3 text-base"
          />
        </label>

        <label className="mt-3 flex flex-col gap-1">
          <span className="text-sm font-medium text-zinc-700">Premio o colaboración extra</span>
          <input
            type="text"
            placeholder="Ej: 1 premio para sorteo (producto o servicio de tu emprendimiento)"
            value={propPremio}
            onChange={(e) => setPropPremio(e.target.value)}
            className="h-11 w-full rounded-lg border border-zinc-300 px-3 text-base"
          />
        </label>

        <div className="mt-4">
          <h3 className="text-sm font-medium text-zinc-700">Lo que recibe el sponsor</h3>
          <p className="text-xs text-zinc-500">Un beneficio por tarjeta, con su ícono. Se muestran en dos columnas.</p>

          <div className="mt-2 flex flex-col gap-2">
            {propBeneficios.map((beneficio, indice) => (
              <div key={indice} className="flex items-center gap-2 rounded-xl border border-zinc-200 p-2">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-marca-negro">
                  <IconoDeBeneficio nombre={beneficio.icono} className="h-5 w-5" />
                </span>
                <select
                  value={beneficio.icono}
                  onChange={(e) => actualizarBeneficio(indice, { icono: e.target.value as IconoBeneficio })}
                  aria-label="Ícono del beneficio"
                  className="h-11 w-28 shrink-0 rounded-lg border border-zinc-300 bg-white px-2 text-sm"
                >
                  {ICONOS_BENEFICIO.map((icono) => (
                    <option key={icono} value={icono}>
                      {ETIQUETAS_ICONO_BENEFICIO[icono]}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Ej: Logo en las banderas del evento"
                  value={beneficio.texto}
                  onChange={(e) => actualizarBeneficio(indice, { texto: e.target.value })}
                  className="h-11 min-w-0 flex-1 rounded-lg border border-zinc-300 px-3 text-sm"
                />
                <button
                  type="button"
                  onClick={() => quitarBeneficio(indice)}
                  aria-label="Quitar beneficio"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-zinc-500"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={agregarBeneficio}
            className="mt-3 flex h-10 items-center justify-center rounded-full border border-dashed border-zinc-300 px-4 text-sm font-medium text-zinc-600"
          >
            + Agregar beneficio
          </button>
        </div>

        <label className="mt-4 flex flex-col gap-1">
          <span className="text-sm font-medium text-zinc-700">Frase de cierre</span>
          <input
            type="text"
            placeholder="Ej: Gracias por ser parte de este sueño 💜"
            value={propCierre}
            onChange={(e) => setPropCierre(e.target.value)}
            className="h-11 w-full rounded-lg border border-zinc-300 px-3 text-base"
          />
        </label>
      </details>

      <button
        type="submit"
        disabled={guardando}
        className="flex h-12 w-full items-center justify-center rounded-full bg-marca-rosa px-5 text-base font-semibold text-marca-negro disabled:opacity-60"
      >
        {guardando ? "Guardando…" : esEdicion ? "Guardar cambios" : "Crear evento"}
      </button>
    </form>
  );
}
