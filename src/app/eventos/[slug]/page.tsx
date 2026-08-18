import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import BarraWhatsapp from "@/components/BarraWhatsapp";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ComoLlegar from "@/components/eventos/ComoLlegar";
import CintaSponsors from "@/components/eventos/CintaSponsors";
import MapaEvento from "@/components/eventos/MapaEvento";
import { obtenerEventoPorSlug } from "@/lib/eventos";
import { linkWhatsapp } from "@/lib/contacto";

interface PaginaEventoProps {
  params: Promise<{ slug: string }>;
}

// Cada evento queda como página propia (no un modal): así Yani puede
// compartir el link de un evento puntual, distinto del link general del
// sitio, según lo que esté publicando en cada momento.
//
// La página se renderiza siempre en el momento (sin generateStaticParams ni
// caché): los eventos se cargan desde /admin/eventos y tienen que aparecer
// en el sitio apenas se guardan, sin esperar un redeploy.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PaginaEventoProps): Promise<Metadata> {
  const { slug } = await params;
  const evento = await obtenerEventoPorSlug(slug);
  if (!evento) return {};

  const descripcion = [evento.fecha, evento.horario, evento.direccion].filter(Boolean).join(" · ");
  const imagenFlyer = evento.flyer.tipo === "imagen" ? evento.flyer.src : undefined;

  return {
    title: `${evento.titulo} | Jumping con Yani`,
    description: descripcion || evento.titulo,
    openGraph: {
      title: evento.titulo,
      description: descripcion || undefined,
      images: imagenFlyer ? [imagenFlyer] : undefined,
    },
  };
}

export default async function PaginaEvento({ params }: PaginaEventoProps) {
  const { slug } = await params;
  const evento = await obtenerEventoPorSlug(slug);

  if (!evento) notFound();

  const mensajeWhatsapp = `Hola Yani! Te escribo por "${evento.titulo}" (${evento.fecha}).`;

  return (
    <>
      <Header />
      <main className="flex-1 pb-24">
        <div className="px-4 pt-6">
          <Link href="/#eventos" className="text-sm font-medium text-marca-rojo">
            ‹ Volver a eventos
          </Link>
        </div>

        <div className="mt-4 px-4">
          {evento.flyer.tipo === "imagen" ? (
            <Image
              src={evento.flyer.src}
              alt={evento.flyer.alt}
              width={evento.flyer.ancho}
              height={evento.flyer.alto}
              className="mx-auto h-auto w-full max-w-sm rounded-2xl"
              priority
            />
          ) : (
            <video
              src={evento.flyer.src}
              controls
              playsInline
              className="mx-auto w-full max-w-sm rounded-2xl"
            />
          )}
        </div>

        <div className="px-4 pt-6">
          <h1 className="font-titulo text-3xl uppercase leading-tight text-marca-negro">
            {evento.titulo}
          </h1>
          <p className="mt-2 text-base font-semibold text-marca-rojo">
            {evento.fecha}
            {evento.horario ? ` · ${evento.horario}` : ""}
          </p>

          {evento.observacion && (
            <p className="mt-3 text-sm leading-6 text-zinc-600">{evento.observacion}</p>
          )}

          {evento.precio && (
            <p className="mt-3 text-sm font-medium text-marca-negro">Entrada: {evento.precio}</p>
          )}

          <a
            href={linkWhatsapp(mensajeWhatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 flex h-12 w-full items-center justify-center rounded-full bg-marca-rosa px-5 text-base font-semibold text-marca-negro active:bg-marca-rosa/80"
          >
            {evento.precio ? "Consultar por WhatsApp" : "Consultar precio de entrada"}
          </a>

          <MapaEvento direccion={evento.direccion} />
          <ComoLlegar opciones={evento.comoLlegar} />
          <CintaSponsors />
        </div>

        <div className="mt-8">
          <Footer />
        </div>
      </main>
      <BarraWhatsapp mensaje={mensajeWhatsapp} texto="Consultar por este evento" />
    </>
  );
}
