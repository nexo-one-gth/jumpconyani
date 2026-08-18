import IconoWhatsapp from "./IconoWhatsapp";
import { linkWhatsapp } from "@/lib/contacto";

const MENSAJE_POR_DEFECTO = "Hola Yani! Quiero reservar mi lugar en una clase de Jumping.";

interface BarraWhatsappProps {
  /** Mensaje precargado y texto del botón. Por defecto, el de reservar una clase. */
  mensaje?: string;
  texto?: string;
}

/**
 * Barra fija al pie, siempre al alcance del pulgar. Es la acción principal
 * del sitio en esta primera etapa (no hay reserva propia todavía, así que
 * todo termina derivando a WhatsApp). El mensaje es configurable para que
 * cada pantalla (clases, un evento puntual) derive con el contexto correcto.
 */
export default function BarraWhatsapp({ mensaje = MENSAJE_POR_DEFECTO, texto = "Reservar por WhatsApp" }: BarraWhatsappProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-white/95 px-4 py-2 backdrop-blur">
      <a
        href={linkWhatsapp(mensaje)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-marca-rosa text-base font-semibold text-marca-negro active:bg-marca-rosa/80"
      >
        <IconoWhatsapp />
        {texto}
      </a>
    </div>
  );
}
