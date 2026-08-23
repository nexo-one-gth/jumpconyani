import type { Metadata } from "next";
import Link from "next/link";
import BarraWhatsapp from "@/components/BarraWhatsapp";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SeccionPaquetes from "@/components/SeccionPaquetes";
import { NOMBRE_MARCA } from "@/lib/contacto";

// Página propia para poder compartir un link que muestre solo los planes
// semanales (sin el resto de la home) — mismo criterio que la ficha de un
// evento (src/app/eventos/[slug]/page.tsx): un link aparte, no un modal.
//
// SeccionPaquetes ya se encarga de traer los datos del lado del cliente
// (mismo criterio que en la home), así que esta página no necesita leer
// Supabase del lado del servidor ni forzar renderizado dinámico.

export const metadata: Metadata = {
  title: `Planes semanales | ${NOMBRE_MARCA}`,
  description: "Elegí cuántas veces por semana querés venir a Jumping Fitness y consultá el precio del plan.",
};

export default function PaginaPlanes() {
  return (
    <>
      <Header />
      <main className="flex-1 pb-24">
        <div className="px-4 pt-6">
          <Link href="/" className="text-sm font-medium text-marca-rojo">
            ‹ Volver al inicio
          </Link>
        </div>

        <div className="mt-2">
          <SeccionPaquetes />
        </div>

        <div className="mt-8">
          <Footer />
        </div>
      </main>
      <BarraWhatsapp mensaje="Hola Yani! Quiero consultar por los planes semanales." texto="Consultar por WhatsApp" />
    </>
  );
}
