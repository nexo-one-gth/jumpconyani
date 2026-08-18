import Image from "next/image";
import RayasDiagonales from "./RayasDiagonales";
import { SPONSORS } from "@/lib/sponsors";

/**
 * Sección completa de sponsors (distinta de la cinta que vive dentro de
 * cada evento): acá cada uno puede llevar, además del logo, una reseña
 * corta y un link. Ninguno tiene reseña ni link cargados todavía, así que
 * hoy se ve solo logo + nombre — el componente tiene que andar igual de
 * bien vacío, con uno o con los doce, sin tocarlo cuando se complete la
 * data en sponsors.ts.
 */
export default function SeccionSponsors() {
  if (SPONSORS.length === 0) return null;

  return (
    <section id="sponsors" className="seccion-pantalla px-4">
      <RayasDiagonales className="mb-6 rounded-full" />
      <h2 className="font-titulo text-2xl uppercase text-marca-negro">Con el apoyo de</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Marcas y negocios que suman a los eventos de Jumping con Yani.
      </p>

      <div className="mt-5 flex flex-col gap-3">
        {SPONSORS.map((sponsor) => (
          <div
            key={sponsor.nombre}
            className="flex items-center gap-3 rounded-2xl border border-zinc-200 p-3"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-50">
              <Image
                src={sponsor.logo}
                alt={sponsor.nombre}
                width={56}
                height={56}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-marca-negro">{sponsor.nombre}</p>
              {sponsor.resena && (
                <p className="mt-1 text-sm leading-6 text-zinc-600">{sponsor.resena}</p>
              )}
              {sponsor.url && (
                <a
                  href={sponsor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-sm font-medium text-marca-rojo"
                >
                  Ver más
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
