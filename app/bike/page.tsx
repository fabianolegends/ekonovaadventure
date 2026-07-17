import type { Metadata } from "next";
import { Arrow } from "../components/Icons";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { TripCard } from "../components/TripCard";
import { trips } from "../data/trips";

export const metadata: Metadata = {
  title: "Expedições de cicloturismo",
  description: "Rotas de cicloturismo com autonavegação, briefing, bagagem, monitoramento e rede de apoio para pedalar com liberdade e segurança.",
  alternates: { canonical: "/bike" },
  openGraph: { url: "/bike", images: ["/images/card-cicloturismo.jpg"] },
  twitter: { images: ["/images/card-cicloturismo.jpg"] },
};

export default function BikePage() {
  const bike = trips.filter((trip) => trip.kind === "bike");
  return <main><SiteHeader />
    <section className="inner-hero inner-hero-bike"><div><p className="eyebrow">Expedições de cicloturismo</p><h1>Liberdade para pedalar. Suporte para seguir.</h1><p>Você navega no próprio ritmo. A Ekonova cuida do desenho da rota, briefing, bagagem, monitoramento e plano de apoio.</p><a className="button button-light" href="#como-funciona">Como funciona <Arrow /></a></div></section>
    <section className="section-shell bike-system" id="como-funciona"><div className="section-heading centered-heading"><p className="eyebrow">O sistema Ekonova Ride</p><h2>Autonomia não é ausência de suporte.</h2></div><div className="dimension-grid"><article><span>01</span><h3>Rota validada</h3><p>Traçado, etapas e pontos de atenção apresentados no briefing.</p></article><article><span>02</span><h3>Navegação</h3><p>Arquivos e orientações para usar seu dispositivo com confiança.</p></article><article><span>03</span><h3>Bagagem</h3><p>Transporte entre etapas conforme o formato de cada saída.</p></article><article><span>04</span><h3>Rede de apoio</h3><p>Monitoramento e protocolos definidos antes da partida.</p></article></div></section>
    <section className="section-shell" id="roteiros"><div className="section-heading split-heading"><div><p className="eyebrow">Rotas de bike</p><h2>Estradas que já conhecemos.</h2></div><p>A disponibilidade do formato assistido é confirmada para cada grupo e janela de operação.</p></div><div className="catalog-grid">{bike.map((trip) => <TripCard key={trip.slug} trip={trip} />)}</div></section>
    <section className="cta-band"><div><p className="eyebrow">Pedale do seu jeito</p><h2>Tem um grupo ou uma janela em mente?</h2><p>Conte seu ritmo, experiência e destino desejado.</p></div><a className="button button-light" href="https://wa.me/5554991195626?text=Ol%C3%A1%21%20Gostaria%20de%20planejar%20uma%20expedi%C3%A7%C3%A3o%20de%20cicloturismo%20com%20a%20Ekonova.">Planejar uma saída <Arrow /></a></section>
    <SiteFooter />
  </main>;
}
