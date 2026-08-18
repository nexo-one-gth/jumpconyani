"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SECCIONES } from "@/lib/secciones";

/** Aire entre el header sticky y el título de la sección a la que saltamos. */
const AIRE = 12;

/** Milisegundos por pixel recorrido, acotado: los saltos cortos son rápidos y los largos no se eternizan. */
const MS_POR_PIXEL = 0.35;
const DURACION_MINIMA = 420;
const DURACION_MAXIMA = 900;

function prefiereMenosMovimiento() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Arranca y frena suave (ease-in-out cúbica). Sin rebote: acá sobraría. */
function suavizar(avance: number) {
  return avance < 0.5 ? 4 * avance * avance * avance : 1 - Math.pow(-2 * avance + 2, 3) / 2;
}

/**
 * Desplaza la ventana hasta `destino` cuadro a cuadro y devuelve una función
 * para abortar.
 *
 * Lo hacemos a mano en vez de dejarlo en manos de `scroll-behavior: smooth`
 * porque el nativo va a velocidad fija y sin curva: en saltos largos
 * (inicio → sponsors) se siente un tirón. Cada paso pasa `behavior: "instant"`
 * a propósito — si no, el `smooth` del CSS se superpone a la animación y las
 * dos pelean por la misma posición.
 *
 * Si la persona toca la rueda, la pantalla o el teclado mientras viaja, gana
 * ella: se corta la animación ahí mismo.
 */
function desplazarSuave(destino: number, alTerminar: () => void): () => void {
  const inicio = window.scrollY;
  const distancia = destino - inicio;

  if (Math.abs(distancia) < 2 || prefiereMenosMovimiento()) {
    window.scrollTo({ top: destino, behavior: "instant" });
    alTerminar();
    return () => {};
  }

  const duracion = Math.min(
    DURACION_MAXIMA,
    Math.max(DURACION_MINIMA, Math.abs(distancia) * MS_POR_PIXEL)
  );
  const arranque = performance.now();
  let cuadro = 0;
  let vivo = true;

  function limpiar() {
    vivo = false;
    cancelAnimationFrame(cuadro);
    window.removeEventListener("wheel", limpiar);
    window.removeEventListener("touchstart", limpiar);
    window.removeEventListener("keydown", limpiar);
  }

  function paso(ahora: number) {
    if (!vivo) return;
    const avance = Math.min(1, (ahora - arranque) / duracion);
    window.scrollTo({ top: inicio + distancia * suavizar(avance), behavior: "instant" });
    if (avance < 1) {
      cuadro = requestAnimationFrame(paso);
      return;
    }
    limpiar();
    alTerminar();
  }

  window.addEventListener("wheel", limpiar, { passive: true });
  window.addEventListener("touchstart", limpiar, { passive: true });
  window.addEventListener("keydown", limpiar);
  cuadro = requestAnimationFrame(paso);

  return limpiar;
}

/**
 * Menú de secciones retráctil, fijo al costado izquierdo: cerrado es solo un
 * botón de tres barritas; abierto despliega la lista completa con la sección
 * que se está viendo marcada.
 *
 * Antes esto era un rail de puntos siempre visible, pero el sitio es
 * mobile-first y el contenido llega hasta el borde: cualquier cosa que quede
 * fija ahí termina tapando texto. Plegado, el botón ocupa 44px y nada más.
 */
export default function MenuSecciones() {
  const [abierto, setAbierto] = useState(false);
  const [activa, setActiva] = useState(SECCIONES[0]?.id ?? "");
  const botonRef = useRef<HTMLButtonElement>(null);
  const cancelarRef = useRef<(() => void) | null>(null);
  // Mientras viajamos, el observador ve pasar todas las secciones del camino.
  // Sin esto la marca parpadearía sección por sección hasta llegar.
  const viajandoRef = useRef(false);

  useEffect(() => {
    const nodos = SECCIONES.map(({ id }) => document.getElementById(id)).filter(
      (nodo): nodo is HTMLElement => nodo !== null
    );
    if (nodos.length === 0) return;

    // El observador avisa solo de los cambios, no del estado completo, así
    // que llevamos nosotros la cuenta de qué secciones siguen a la vista.
    const aLaVista = new Set<string>();

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) aLaVista.add(entrada.target.id);
          else aLaVista.delete(entrada.target.id);
        }
        if (viajandoRef.current) return;
        // Si dos secciones cortas comparten la banda, gana la de más arriba
        // en la página (por eso importa el orden de SECCIONES).
        const primera = SECCIONES.find(({ id }) => aLaVista.has(id));
        if (primera) setActiva(primera.id);
      },
      // Banda central de la pantalla: la sección se marca cuando llega al
      // medio, no apenas asoma un borde abajo.
      { rootMargin: "-45% 0px -45% 0px" }
    );

    nodos.forEach((nodo) => observador.observe(nodo));
    return () => {
      observador.disconnect();
      cancelarRef.current?.();
    };
  }, []);

  useEffect(() => {
    if (!abierto) return;
    function alTeclado(evento: KeyboardEvent) {
      if (evento.key !== "Escape") return;
      setAbierto(false);
      botonRef.current?.focus();
    }
    window.addEventListener("keydown", alTeclado);
    return () => window.removeEventListener("keydown", alTeclado);
  }, [abierto]);

  const irA = useCallback((id: string) => {
    const seccion = document.getElementById(id);
    if (!seccion) return;

    const header = document.querySelector("header");
    const tope = (header?.offsetHeight ?? 0) + AIRE;
    const destino = Math.max(0, seccion.getBoundingClientRect().top + window.scrollY - tope);

    cancelarRef.current?.();
    // Marcamos ya, sin esperar a llegar: el menú tiene que responder al toque.
    setActiva(id);
    setAbierto(false);
    viajandoRef.current = true;
    cancelarRef.current = desplazarSuave(destino, () => {
      viajandoRef.current = false;
      cancelarRef.current = null;
      // El hash queda para poder compartir el link, pero lo escribimos recién
      // al llegar y con replaceState, así el navegador no reposiciona por su
      // cuenta arriba de nuestra animación.
      history.replaceState(null, "", `#${id}`);
    });
  }, []);

  return (
    <>
      <div
        aria-hidden="true"
        onClick={() => setAbierto(false)}
        className={`fixed inset-0 z-40 bg-marca-negro/10 transition-opacity duration-200 ${
          abierto ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <nav
        aria-label="Secciones de la página"
        className="pointer-events-none fixed left-3 top-1/2 z-50 flex -translate-y-1/2 items-center gap-2"
      >
        <button
          ref={botonRef}
          type="button"
          onClick={() => setAbierto((estaba) => !estaba)}
          aria-expanded={abierto}
          aria-controls="menu-secciones"
          aria-label={abierto ? "Cerrar menú de secciones" : "Abrir menú de secciones"}
          className="pointer-events-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/5 bg-white shadow-md transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-rojo"
        >
          <span aria-hidden="true" className="relative block h-3.5 w-5">
            <span
              className={`absolute left-0 h-0.5 w-full rounded-full bg-marca-negro transition-all duration-200 ${
                abierto ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 rounded-full bg-marca-negro transition-opacity duration-200 ${
                abierto ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 h-0.5 w-full rounded-full bg-marca-negro transition-all duration-200 ${
                abierto ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0"
              }`}
            />
          </span>
        </button>

        <ul
          id="menu-secciones"
          aria-hidden={!abierto}
          className={`flex origin-left flex-col gap-0.5 rounded-2xl border border-black/5 bg-white/95 p-1.5 shadow-lg backdrop-blur transition duration-200 ${
            abierto
              ? "pointer-events-auto translate-x-0 scale-100 opacity-100"
              : "pointer-events-none -translate-x-3 scale-95 opacity-0"
          }`}
        >
          {SECCIONES.map((seccion) => {
            const esActiva = seccion.id === activa;

            return (
              <li key={seccion.id}>
                <a
                  href={`#${seccion.id}`}
                  tabIndex={abierto ? undefined : -1}
                  aria-current={esActiva ? "true" : undefined}
                  onClick={(evento) => {
                    evento.preventDefault();
                    irA(seccion.id);
                  }}
                  className={`flex items-center gap-2 rounded-xl py-2 pl-2 pr-4 text-xs font-semibold uppercase tracking-wide transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-marca-rojo ${
                    esActiva
                      ? "bg-marca-rosa/30 text-marca-rojo"
                      : "text-marca-negro hover:bg-marca-rosa/10"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors ${
                      esActiva ? "bg-marca-rojo" : "bg-zinc-300"
                    }`}
                  />
                  {seccion.rotulo}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
