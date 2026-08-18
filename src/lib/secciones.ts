// Registro único de las secciones de la home.
//
// El menú lateral, el observador de posición y el orden de la página se leen
// todos de acá: agregar una sección es agregar una entrada, no tocar tres
// archivos. El `id` tiene que coincidir con el `id` del <section> del
// componente, y el orden con el orden real en page.tsx (el menú usa ese
// orden para decidir qué sección marcar cuando hay dos a la vista).

export interface Seccion {
  id: string;
  /** Etiqueta del rail. Corta, porque el rail es angosto. */
  rotulo: string;
  /** Nombre accesible completo, para lectores de pantalla. */
  titulo: string;
}

export const SECCIONES: Seccion[] = [
  { id: "inicio", rotulo: "Inicio", titulo: "Inicio" },
  { id: "horarios", rotulo: "Horarios", titulo: "Horarios de este mes" },
  { id: "eventos", rotulo: "Eventos", titulo: "Eventos y masterclasses" },
  { id: "clases", rotulo: "Clases", titulo: "Sobre las clases" },
  { id: "tienda", rotulo: "Tienda", titulo: "Tienda" },
  { id: "donde", rotulo: "Dónde", titulo: "Dónde son las clases" },
  { id: "sponsors", rotulo: "Sponsors", titulo: "Sponsors" },
];
