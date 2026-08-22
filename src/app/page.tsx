import BarraWhatsapp from "@/components/BarraWhatsapp";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import MapaZona from "@/components/MapaZona";
import QueEsJumping from "@/components/QueEsJumping";
import MenuSecciones from "@/components/MenuSecciones";
import SeccionPaquetes from "@/components/SeccionPaquetes";
import SeccionSponsors from "@/components/SeccionSponsors";
import SeccionTienda from "@/components/SeccionTienda";
import SelectorHorarios from "@/components/SelectorHorarios";
import ListaEventos from "@/components/eventos/ListaEventos";

// Hero, SeccionTienda y ListaEventos leen contenido editable desde
// /admin (precios y textos, eventos). Sin esto Next arma esta página como
// HTML estático en el build y los cambios del panel no se verían en el
// sitio hasta el próximo redeploy — justo lo que el panel busca evitar.
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <Header menu={<MenuSecciones />} />
      <main className="flex-1 pb-4">
        <Hero />
        <SelectorHorarios />
        <SeccionPaquetes />
        <ListaEventos />
        <QueEsJumping />
        <SeccionTienda />
        <MapaZona />
        <SeccionSponsors />
        <Footer />
      </main>
      <BarraWhatsapp />
    </>
  );
}
