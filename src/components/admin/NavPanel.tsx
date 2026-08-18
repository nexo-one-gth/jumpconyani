import Link from "next/link";

const PANTALLAS = [
  { href: "/admin", clave: "horarios", etiqueta: "Horarios" },
  { href: "/admin/precios-textos", clave: "precios", etiqueta: "Precios y textos" },
  { href: "/admin/eventos", clave: "eventos", etiqueta: "Eventos" },
] as const;

/**
 * Nav simple entre las pantallas del panel. Se agregó al sumar la tercera
 * pantalla (eventos) para no repetir links sueltos en cada página.
 */
export default function NavPanel({ actual }: { actual: (typeof PANTALLAS)[number]["clave"] }) {
  return (
    <nav className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
      {PANTALLAS.map((pantalla) =>
        pantalla.clave === actual ? (
          <span key={pantalla.clave} className="text-sm font-semibold text-marca-negro">
            {pantalla.etiqueta}
          </span>
        ) : (
          <Link key={pantalla.clave} href={pantalla.href} className="text-sm font-medium text-marca-rojo">
            {pantalla.etiqueta}
          </Link>
        )
      )}
    </nav>
  );
}
