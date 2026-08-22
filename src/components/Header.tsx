import type { ReactNode } from "react";
import Image from "next/image";
import IconoWhatsapp from "./IconoWhatsapp";
import RayasDiagonales from "./RayasDiagonales";
import { NOMBRE_MARCA, linkWhatsapp } from "@/lib/contacto";

/**
 * Barra superior fija. El slot `menu` es para el menú de secciones: entra a la
 * izquierda del logo, antes que la marca. Va por prop y no importado acá
 * porque las secciones existen solo en la home — la ficha de un evento usa el
 * mismo header sin menú.
 */
export default function Header({ menu }: { menu?: ReactNode }) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur">
      <RayasDiagonales />
      <div className="flex items-center justify-between gap-3 border-b border-black/5 px-4 py-2">
        <div className="flex items-center gap-2">
          {menu}
          <Image
            src="/logo.png"
            alt={NOMBRE_MARCA}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
            priority
          />
          <span className="leading-none">
            <span className="block font-titulo text-sm uppercase tracking-wide text-marca-negro">
              Jumping
            </span>
            <span className="block font-firma text-lg leading-none text-marca-rosa">con Yani</span>
          </span>
        </div>
        <a
          href={linkWhatsapp("Hola Yani! Quiero consultar por las clases de Jumping.")}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 items-center justify-center gap-2 rounded-full bg-marca-rosa px-4 text-sm font-semibold text-marca-negro active:bg-marca-rosa/80"
        >
          <IconoWhatsapp />
          WhatsApp
        </a>
      </div>
    </header>
  );
}
