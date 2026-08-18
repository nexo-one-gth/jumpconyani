import Image from "next/image";
import { SPONSORS } from "@/lib/sponsors";

/**
 * Cinta continua de logos de sponsors dentro de la vista de un evento.
 * La animación está resuelta en CSS puro (ver .cinta-sponsors-track en
 * globals.css) y respeta prefers-reduced-motion, quedando legible y
 * detenida para quien lo pida.
 *
 * La lista se duplica una vez para que el loop sea continuo (cuando la
 * primera copia termina de desplazarse, la segunda ocupa su lugar).
 */
export default function CintaSponsors() {
  if (SPONSORS.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="font-titulo text-lg uppercase text-marca-negro">Con el apoyo de</h3>
      <div className="cinta-sponsors-viewport mt-3">
        <div className="cinta-sponsors-track">
          {[...SPONSORS, ...SPONSORS].map((sponsor, indice) => (
            <div
              key={`${sponsor.nombre}-${indice}`}
              className="flex h-16 w-28 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white p-2"
            >
              <Image
                src={sponsor.logo}
                alt={sponsor.nombre}
                width={96}
                height={48}
                className="h-full w-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
