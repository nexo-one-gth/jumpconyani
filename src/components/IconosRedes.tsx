// Íconos de redes para el bloque de presencia de marca del Footer.
// Mismo criterio que IconoWhatsapp.tsx: SVG simple, currentColor, sin
// depender de ninguna librería de íconos.

export function IconoInstagram({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconoTikTok({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M16.5 2h-3.1v13.6a2.9 2.9 0 1 1-2.06-2.78V9.6a6.1 6.1 0 1 0 5.16 6.02V9.13a7.5 7.5 0 0 0 4.3 1.35V7.36a4.5 4.5 0 0 1-4.3-4.36V2Z" />
    </svg>
  );
}

export function IconoFacebook({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M14.5 8.5H16.8V5.4C16.4 5.34 15.14 5.23 13.68 5.23c-2.96 0-4.98 1.86-4.98 5.28V13.5H5.4v3.47h3.3V22h3.5v-5.03h3.16l.5-3.47H12.2v-2.6c0-1 .27-1.68 1.7-1.68Z" />
    </svg>
  );
}
