import type { ComponentType } from "react";
import RayasDiagonales from "./RayasDiagonales";
import { IconoFacebook, IconoInstagram, IconoTikTok } from "./IconosRedes";
import { FACEBOOK_URL, INSTAGRAM_URL, NOMBRE_MARCA, TIKTOK_URL, ZONA } from "@/lib/contacto";

interface RedSocial {
  nombre: string;
  url?: string;
  Icono: ComponentType<{ className?: string }>;
}

const REDES: RedSocial[] = [
  { nombre: "Instagram", url: INSTAGRAM_URL, Icono: IconoInstagram },
  { nombre: "TikTok", url: TIKTOK_URL, Icono: IconoTikTok },
  { nombre: "Facebook", url: FACEBOOK_URL, Icono: IconoFacebook },
];

/**
 * Botones de redes. Los perfiles todavía no existen (ver contacto.ts), así
 * que se muestran igual pero desactivados: el estado "pronto" es visible
 * siempre (no depende de hover, que en celular no existe) y cada botón se
 * activa solo apenas su URL se carga en contacto.ts.
 */
function BotonRed({ nombre, url, Icono }: RedSocial) {
  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={nombre}
        className="flex flex-col items-center gap-1"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-marca-negro text-white active:bg-marca-negro/80">
          <Icono />
        </span>
        <span className="text-[11px] text-zinc-500">{nombre}</span>
      </a>
    );
  }

  return (
    <span aria-disabled="true" className="flex flex-col items-center gap-1">
      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-300 text-zinc-300">
        <Icono />
      </span>
      <span className="text-[11px] text-zinc-400">Pronto</span>
    </span>
  );
}

export default function Footer() {
  return (
    <footer className="pb-24 pt-6">
      <RayasDiagonales />
      <div className="flex justify-center gap-6 px-4 pt-6">
        {REDES.map((red) => (
          <BotonRed key={red.nombre} {...red} />
        ))}
      </div>
      <div className="px-4 pt-4 text-center text-xs text-zinc-400">
        <p className="font-semibold text-marca-negro">{NOMBRE_MARCA} · {ZONA}</p>
        <p className="mt-1">Sitio en construcción — versión de muestra.</p>
      </div>
    </footer>
  );
}
