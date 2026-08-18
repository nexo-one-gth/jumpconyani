import { ZONA } from "@/lib/contacto";

export default function MapaZona() {
  const consulta = encodeURIComponent("Texalar, Morón, Buenos Aires");

  return (
    <section id="donde" className="seccion-pantalla px-4">
      <h2 className="font-titulo text-2xl uppercase text-marca-negro">Dónde son las clases</h2>
      <p className="mt-1 text-sm leading-6 text-zinc-600">
        Zona {ZONA}. La dirección exacta se comparte por WhatsApp al confirmar tu reserva.
      </p>
      <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200">
        <iframe
          title={`Zona ${ZONA}`}
          src={`https://www.google.com/maps?q=${consulta}&z=14&output=embed`}
          className="h-64 w-full sm:h-80"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </section>
  );
}
