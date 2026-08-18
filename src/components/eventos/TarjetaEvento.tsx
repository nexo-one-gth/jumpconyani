import Image from "next/image";
import Link from "next/link";
import { Evento } from "@/lib/eventos";

/**
 * Tarjeta comprimida de un evento para el listado. El flyer se ve completo
 * dentro de una caja fija (object-contain, sin recortar): los dos flyers
 * reales tienen proporciones distintas entre sí y no hay que forzarlos a
 * una relación común (ver PRODUCT.md, Evidence on Hand).
 */
export default function TarjetaEvento({ evento }: { evento: Evento }) {
  return (
    <Link
      href={`/eventos/${evento.slug}`}
      className="flex min-h-[7rem] gap-3 rounded-2xl border border-zinc-200 p-3 active:bg-zinc-50"
    >
      <div className="flex h-28 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-50">
        {evento.flyer.tipo === "imagen" ? (
          <Image
            src={evento.flyer.src}
            alt={evento.flyer.alt}
            width={evento.flyer.ancho}
            height={evento.flyer.alto}
            className="h-full w-full object-contain"
          />
        ) : (
          <video src={evento.flyer.src} className="h-full w-full object-contain" muted playsInline />
        )}
      </div>

      <div className="flex flex-1 flex-col justify-center gap-1">
        <h3 className="font-titulo text-base uppercase leading-tight text-marca-negro">
          {evento.titulo}
        </h3>
        <p className="text-sm font-medium text-marca-rojo">
          {evento.fecha}
          {evento.horario ? ` · ${evento.horario}` : ""}
        </p>
        {evento.direccion && <p className="text-sm text-zinc-500">{evento.direccion}</p>}
      </div>
    </Link>
  );
}
