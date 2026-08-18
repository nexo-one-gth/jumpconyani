import { eventosProximos } from "@/lib/eventos";
import TarjetaEvento from "./TarjetaEvento";

/**
 * Vista comprimida de eventos y masterclasses para la home. Ver PRODUCT.md:
 * a diferencia del calendario de clases, acá cada ficha se explica sola y
 * lleva a un detalle propio (con su propio link, para que Yani lo pueda
 * compartir por separado).
 */
export default async function ListaEventos() {
  const eventos = await eventosProximos();

  if (eventos.length === 0) {
    return (
      <section id="eventos" className="seccion-pantalla px-4">
        <h2 className="font-titulo text-2xl uppercase text-marca-negro">Eventos y masterclasses</h2>
        <p className="mt-3 rounded-xl bg-zinc-50 p-4 text-sm text-zinc-500">
          Por ahora no hay eventos próximos confirmados. Seguí las novedades de Yani por WhatsApp.
        </p>
      </section>
    );
  }

  return (
    <section id="eventos" className="seccion-pantalla px-4">
      <h2 className="font-titulo text-2xl uppercase text-marca-negro">Eventos y masterclasses</h2>
      <p className="mt-1 text-sm text-zinc-500">
        La clase semanal es de Yani. Estos son eventos grandes y masterclasses puntuales.
      </p>
      <div className="mt-5 flex flex-col gap-3">
        {eventos.map((evento) => (
          <TarjetaEvento key={evento.slug} evento={evento} />
        ))}
      </div>
    </section>
  );
}
