import type { CSSProperties, ReactNode } from "react";

/**
 * Panel de vidrio líquido.
 *
 * El efecto sólo existe si hay algo con color detrás: sobre blanco no refracta
 * nada y sería pura decoración. Por eso `fondo` es obligatorio — es la misma
 * imagen que ocupa la sección — y el panel la vuelve a dibujar por dentro,
 * desenfocada y deformada, para doblarle los colores de verdad.
 *
 * El truco de alineación: la capa refractada es `fixed inset-0` con
 * `background-size: cover`, exactamente como el flyer de la sección, que ocupa
 * la pantalla completa. Al estar recortada por el `overflow-hidden` del panel,
 * calza sola con lo que hay detrás sin cálculos de posición. Requiere que
 * ningún ancestro tenga `transform`, `filter` ni `backdrop-filter`, porque eso
 * rompería el posicionamiento fijo.
 */
export default function Vidrio({
  fondo,
  children,
  className = "",
  intensidad = "media",
}: {
  fondo: string;
  children: ReactNode;
  className?: string;
  intensidad?: "suave" | "media";
}) {
  const capaRefractada: CSSProperties = {
    backgroundImage: `url("${fondo}")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    filter: intensidad === "media" ? "blur(18px) saturate(1.9)" : "blur(26px) saturate(1.5)",
  };

  return (
    <div className={`relative isolate overflow-hidden rounded-[26px] ${className}`}>
      {/* Los colores del flyer, doblados. */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 vidrio-refraccion" style={capaRefractada} />
      </div>

      {/* Velo: lo que convierte la mancha de color en vidrio. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-white/25 backdrop-blur-[2px] supports-[not_(backdrop-filter:blur(1px))]:bg-white/80"
      />

      {/* Reflejo especular y canto iluminado, como el borde de un vidrio real. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 rounded-[26px] bg-gradient-to-br from-white/55 via-transparent to-white/20"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[26px] ring-1 ring-inset ring-white/50"
      />

      {children}
    </div>
  );
}
