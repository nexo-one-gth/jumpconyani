import Image from "next/image";
import RayasDiagonales from "./RayasDiagonales";
import { linkWhatsapp } from "@/lib/contacto";
import { obtenerConfiguracionHome } from "@/lib/configuracionHome";

// Las dos versiones del conjunto. Las imágenes son renders sobre fondo claro:
// se muestran completas (sin recorte) para que no se corte ni la manga ni el
// ruedo de la pollera.
const CONJUNTOS = [
  {
    version: "Manga corta",
    src: "/tienda/conjunto-manga-corta.jpeg",
    alt: "Conjunto Jumping con Yani en su versión de manga corta: remera blanca con vivos rojos y negros y pollera negra con ruedo a rayas.",
  },
  {
    version: "Musculosa",
    src: "/tienda/conjunto-musculosa.jpeg",
    alt: "Conjunto Jumping con Yani en su versión musculosa: top blanco sin mangas con vivos rojos y negros y pollera negra con ruedo a rayas.",
  },
];

export default async function SeccionTienda() {
  const { precioConjunto } = await obtenerConfiguracionHome();

  return (
    <section id="tienda" className="seccion-pantalla px-4">
      <RayasDiagonales className="mb-6 rounded-full" />
      <h2 className="font-titulo text-2xl uppercase text-marca-negro">Tienda</h2>
      <p className="mt-1 text-sm leading-6 text-zinc-600">
        El conjunto oficial para tus clases, en dos versiones. Se personaliza con
        tu nombre.{" "}
        {precioConjunto ? `Desde ${precioConjunto}. Consultá talles por WhatsApp.` : "Consultá talles y precio por WhatsApp."}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {CONJUNTOS.map((conjunto) => (
          <figure key={conjunto.src}>
            <div className="relative aspect-[4/7] overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
              <Image
                src={conjunto.src}
                alt={conjunto.alt}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-contain"
                loading="lazy"
              />
            </div>
            <figcaption className="mt-2 text-sm font-semibold text-marca-negro">
              {conjunto.version}
            </figcaption>
          </figure>
        ))}
      </div>

      <a
        href={linkWhatsapp(
          precioConjunto
            ? "Hola Yani! Quiero consultar talles del conjunto de Jumping con Yani."
            : "Hola Yani! Quiero consultar por el conjunto de Jumping con Yani (talles y precio)."
        )}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 flex h-12 w-full items-center justify-center rounded-full bg-marca-rosa px-5 text-base font-semibold text-marca-negro active:bg-marca-rosa/80"
      >
        {precioConjunto ? "Consultar talles" : "Consultar talles y precio"}
      </a>
    </section>
  );
}
