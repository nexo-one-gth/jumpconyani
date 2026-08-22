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
 *
 * Cajas al doble de tamaño (22/8, pedido del cliente): 128x224 en vez de
 * 64x112. La velocidad de la animación se ajustó en globals.css para que,
 * con logos más grandes, no se sienta más rápida que antes.
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
              className="flex h-32 w-56 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white p-4"
            >
              <Image
                src={sponsor.logo}
                alt={sponsor.nombre}
                width={192}
                height={96}
                className="h-full w-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
