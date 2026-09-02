import type { IconoBeneficio } from "@/lib/eventos";

/**
 * Íconos lineales para los beneficios de la propuesta a sponsors. SVG
 * inline (sin librería de íconos) para no sumar peso: se usan en el
 * formulario público /sponsors/[token] y como previa en el panel.
 * Trazo en currentColor para heredar el color del texto que los rodea.
 */

export const ETIQUETAS_ICONO_BENEFICIO: Record<IconoBeneficio, string> = {
  bandera: "Bandera",
  remera: "Remera",
  redes: "Redes sociales",
  radio: "Radio / vivos",
  camara: "Cámara / contenido",
};

const TRAZOS: Record<IconoBeneficio, React.ReactNode> = {
  bandera: (
    <>
      <path d="M5 21V4" />
      <path d="M5 4h12l-2.5 4L17 12H5" />
    </>
  ),
  remera: (
    <>
      <path d="M8 4 4 7l2 3 2-1v11h8V9l2 1 2-3-4-3a4 4 0 0 1-8 0Z" />
    </>
  ),
  redes: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18" />
      <path d="M12 3a14 14 0 0 0 0 18" />
    </>
  ),
  radio: (
    <>
      <rect x="3" y="9" width="18" height="11" rx="2" />
      <path d="m6 9 10-5" />
      <circle cx="9" cy="14.5" r="2.5" />
      <path d="M15 13h3M15 16h3" />
    </>
  ),
  camara: (
    <>
      <rect x="3" y="7" width="13" height="10" rx="2" />
      <path d="m16 10 5-2v8l-5-2" />
    </>
  ),
};

interface Props {
  nombre: IconoBeneficio;
  className?: string;
}

export default function IconoDeBeneficio({ nombre, className = "h-6 w-6" }: Props) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {TRAZOS[nombre]}
    </svg>
  );
}
