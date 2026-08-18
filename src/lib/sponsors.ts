// Sponsors leídos de la lámina que pasó el cliente (ver PRODUCT.md, Evidence
// on Hand). Todavía no hay reseña ni redes cargadas para ninguno — el
// cliente los va completando. `resena` y `url` quedan opcionales a
// propósito: la Sección de sponsors y la cinta del evento tienen que andar
// igual de bien vacías, con nombre y logo solo, o con todo cargado.
//
// Data en archivo plano a propósito: agregar, sacar, reordenar o completar
// un sponsor es editar este array, sin tocar ningún componente.

export interface Sponsor {
  nombre: string;
  logo: string;
  /** Reseña corta que el propio sponsor quiera mostrar. Opcional. */
  resena?: string;
  /** Sitio o red social del sponsor. Opcional. */
  url?: string;
}

export const SPONSORS: Sponsor[] = [
  { nombre: "Tienda Morón", logo: "/sponsors/tienda-moron.png" },
  { nombre: "Encanto", logo: "/sponsors/encanto.png" },
  { nombre: "Impresión Arte", logo: "/sponsors/impresion-arte.png" },
  { nombre: "Helado Móvil", logo: "/sponsors/helado-movil.png" },
  { nombre: "El Banderazo", logo: "/sponsors/el-banderazo.png" },
  { nombre: "NA Jump", logo: "/sponsors/na-jump.png" },
  { nombre: "Jump Moda Fit", logo: "/sponsors/jump-moda-fit.png" },
  { nombre: "Lucho M&A Personalizados", logo: "/sponsors/lucho-personalizados.png" },
  { nombre: "Nutri Sport", logo: "/sponsors/nutri-sport.png" },
  { nombre: "Amarcel", logo: "/sponsors/amarcel.png" },
  { nombre: "Across Sport Nutrition", logo: "/sponsors/across.png" },
  { nombre: "M&A (Dios en los detalles)", logo: "/sponsors/m-a.png" },
];
