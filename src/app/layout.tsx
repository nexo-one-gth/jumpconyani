import type { Metadata, Viewport } from "next";
import { Anton, Caveat, Poppins } from "next/font/google";
import "./globals.css";

// Tipografías del manual de marca: Anton para títulos de impacto, Poppins
// para todo el texto funcional (horarios, descripciones), Caveat solo para
// acentos cortos tipo firma — nunca para párrafos largos.
const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jumping con Yani | Jumping Fitness en Morón",
  description:
    "Clases de Jumping Fitness con Yani en Morón Sur. Reservá tu lugar, consultá horarios y el conjunto oficial.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${anton.variable} ${poppins.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-marca-negro">{children}</body>
    </html>
  );
}
