// Sponsors leídos de la lámina que pasó el cliente (ver PRODUCT.md, Evidence
// on Hand). Todavía no hay reseña ni redes cargadas para ninguno — el
// cliente los va completando. `resena` y `url` quedan opcionales a
// propósito: la Sección de sponsors y la cinta del evento tienen que andar
// igual de bien vacías, con nombre y logo solo, o con todo cargado.
//
// Data en archivo plano a propósito: agregar, sacar, reordenar o completar
// un sponsor es editar este array, sin tocar ningún componente.
//
// Logos actualizados el 22/8 con los archivos que mandó el cliente por
// separado (antes eran recortes de una sola lámina/foto). Se sumó Resortes
// (Ingeniero Allan) como sponsor nuevo. Joyas Stylo sumado el 3/9.

export interface Sponsor {
  nombre: string;
  logo: string;
  /** Reseña corta que el propio sponsor quiera mostrar. Opcional. */
  resena?: string;
  /** Sitio o red social del sponsor. Opcional. */
  url?: string;
}

export const SPONSORS: Sponsor[] = [
  { nombre: "Tienda Morón", logo: "/sponsors/tienda-moron.webp" },
  { nombre: "Encanto", logo: "/sponsors/encanto.webp" },
  { nombre: "Impresión Arte", logo: "/sponsors/impresion-arte.webp" },
  { nombre: "Helado Móvil", logo: "/sponsors/helado-movil.webp" },
  { nombre: "El Banderazo", logo: "/sponsors/el-banderazo.webp" },
  { nombre: "NA Jump", logo: "/sponsors/na-jump.webp" },
  { nombre: "Jump Moda Fit", logo: "/sponsors/jump-moda-fit.webp" },
  { nombre: "Lucho M&A Personalizados", logo: "/sponsors/lucho-personalizados.webp" },
  { nombre: "Nutri Sport", logo: "/sponsors/nutri-sport.webp" },
  { nombre: "Amarcel", logo: "/sponsors/amarcel.webp" },
  { nombre: "Across Sport Nutrition", logo: "/sponsors/across.webp" },
  { nombre: "M&A (Dios en los detalles)", logo: "/sponsors/m-a.webp" },
  { nombre: "Resortes Ingeniero Allan", logo: "/sponsors/resortes.webp" },
  { nombre: "Joyas Stylo", logo: "/sponsors/joyas-stylo.webp" },
];
