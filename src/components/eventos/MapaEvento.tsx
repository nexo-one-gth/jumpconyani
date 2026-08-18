/**
 * Mapa embebido del evento, mismo patrón que MapaZona.tsx: como la
 * dirección exacta no siempre está disponible (o directamente no se
 * publica), el pin apunta a la localidad conocida, no a un punto preciso.
 * Si el evento todavía no tiene dirección cargada, no se muestra nada.
 */
export default function MapaEvento({ direccion }: { direccion?: string }) {
  if (!direccion) return null;

  const consulta = encodeURIComponent(direccion);

  return (
    <div className="mt-6">
      <h3 className="font-titulo text-lg uppercase text-marca-negro">Dónde es</h3>
      <p className="mt-1 text-sm text-zinc-600">{direccion}</p>
      <div className="mt-3 overflow-hidden rounded-2xl border border-zinc-200">
        <iframe
          title={`Ubicación: ${direccion}`}
          src={`https://www.google.com/maps?q=${consulta}&z=13&output=embed`}
          className="h-56 w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}
