import { OpcionTraslado } from "@/lib/eventos";

/**
 * Opciones de traslado para un evento (transporte público, micros
 * contratados, punto de encuentro, etc). La cantidad y el tipo varían por
 * evento, así que el componente no asume ninguna — si el evento no trae
 * datos de traslado todavía, no se muestra nada.
 */
export default function ComoLlegar({ opciones }: { opciones?: OpcionTraslado[] }) {
  if (!opciones || opciones.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="font-titulo text-lg uppercase text-marca-negro">Cómo llegar</h3>
      <div className="mt-3 flex flex-col gap-3">
        {opciones.map((opcion) => (
          <div key={opcion.titulo} className="rounded-xl border border-zinc-200 p-3">
            <p className="text-sm font-semibold text-marca-negro">{opcion.titulo}</p>
            <p className="mt-1 text-sm leading-6 text-zinc-600">{opcion.detalle}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
