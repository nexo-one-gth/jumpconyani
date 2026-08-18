/**
 * Banda de rayas diagonales blanco / negro / rojo a 135°, el patrón gráfico
 * oficial de la marca (ver Manual de Marca, sección 03). Se usa como acento
 * fino — cabecera de sección o separador — nunca como fondo detrás de texto.
 */
export default function RayasDiagonales({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`h-2 w-full ${className}`}
      style={{
        backgroundImage:
          "repeating-linear-gradient(135deg, #121014 0px, #121014 10px, #ffffff 10px, #ffffff 20px, #c41f2c 20px, #c41f2c 30px, #ffffff 30px, #ffffff 40px)",
      }}
    />
  );
}
