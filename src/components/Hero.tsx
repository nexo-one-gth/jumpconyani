import IconoWhatsapp from "./IconoWhatsapp";
import { linkWhatsapp, ZONA_CORTA } from "@/lib/contacto";
import { obtenerConfiguracionHome } from "@/lib/configuracionHome";

export default async function Hero() {
  const { heroTitulo, heroBajada, precioClase } = await obtenerConfiguracionHome();

  return (
    <section id="inicio" className="seccion-pantalla bg-marca-rosa/10 px-4">
      <p className="text-sm font-semibold uppercase tracking-wide text-marca-rojo">
        Jumping · {ZONA_CORTA}
      </p>
      <h1 className="mt-2 font-titulo text-4xl uppercase leading-tight text-marca-negro">
        {heroTitulo}
      </h1>
      <p className="mt-4 text-base leading-6 text-zinc-600">{heroBajada}</p>
      {precioClase && (
        <p className="mt-2 text-sm font-semibold text-marca-negro">{precioClase}</p>
      )}

      <div className="mt-6 flex flex-col gap-3">
        <a
          href="#horarios"
          className="flex h-12 w-full items-center justify-center rounded-full bg-marca-rosa px-5 text-base font-semibold text-marca-negro active:bg-marca-rosa/80"
        >
          Ver horarios y reservar
        </a>
        <a
          href={linkWhatsapp("Hola Yani! Quiero más info sobre las clases de Jumping.")}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-marca-negro px-5 text-base font-semibold text-marca-negro active:bg-marca-negro/5"
        >
          <IconoWhatsapp />
          Consultar por WhatsApp
        </a>
      </div>
    </section>
  );
}
