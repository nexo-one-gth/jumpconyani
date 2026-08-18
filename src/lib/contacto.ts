// Datos de contacto y helpers para derivar a WhatsApp.
// Esta es la única fuente de verdad para el número y el nombre de marca:
// si algo cambia, se edita acá y se propaga a todo el sitio.

export const NUMERO_WHATSAPP = "5491132548231"; // +54 9 11 3254-8231, formato wa.me
export const NOMBRE_MARCA = "Jumping con Yani";
export const ZONA = "Morón Sur, zona Texalar";
// Versión corta para lugares donde la zona es un dato de contexto y no la
// dirección (el volanteo del hero, por ejemplo). La larga sigue valiendo
// donde importa la ubicación concreta: mapa y pie de página.
export const ZONA_CORTA = "Morón";

// Todavía no hay perfil de Instagram, TikTok ni Facebook registrado (ver
// PRODUCT.md, Decisiones abiertas). Los botones correspondientes se
// muestran igual, pero desactivados con estado "pronto" — es una decisión
// del cliente, no un olvido. En cuanto exista el perfil, completar la URL
// acá activa ese botón solo, sin tocar ningún componente.
export const INSTAGRAM_URL: string | undefined = undefined;
export const TIKTOK_URL: string | undefined = undefined;
export const FACEBOOK_URL: string | undefined = undefined;

/**
 * Arma un link de WhatsApp con un mensaje precargado.
 * Usamos esto en vez de un formulario propio: en esta primera etapa
 * no hay backend, así que toda "reserva" o consulta se deriva a WhatsApp.
 */
export function linkWhatsapp(mensaje: string): string {
  const mensajeCodificado = encodeURIComponent(mensaje);
  return `https://wa.me/${NUMERO_WHATSAPP}?text=${mensajeCodificado}`;
}
