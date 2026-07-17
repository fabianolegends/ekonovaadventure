import { Arrow } from "../components/Icons";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { TripCard } from "../components/TripCard";
import { trips } from "../data/trips";

export const metadata = { title: "Hiking 50+ · Caminhadas | Ekonova Adventure" };

export default function HikingPage() {
  const hiking = trips.filter((trip) => trip.kind === "trekking");
  return <main><SiteHeader />
    <section className="inner-hero inner-hero-trekking"><div><p className="eyebrow">Hiking 50+ · Caminhadas</p><h1>Caminhar amplia o tempo.</h1><p>Caminhadas de um dia, mochila de ataque, pequenos grupos e uma condução que respeita o ritmo sem apagar a aventura.</p><a className="button button-light" href="#roteiros">Conhecer roteiros <Arrow /></a></div></section>
    <section className="section-shell editorial-intro"><div className="editorial-copy"><p className="eyebrow">O que muda no 50+</p><h2>Mais clareza.<br />Menos pressa.</h2><p>O roteiro não é adaptado depois. Ele já nasce com etapas compreensíveis, pausas úteis, logística cuidadosa e tempo para realmente estar no lugar.</p></div><div className="editorial-points"><p><span>01</span>Grupos de até 12 pessoas</p><p><span>02</span>Conversa individual antes da reserva</p><p><span>03</span>Preparação e equipamentos orientados</p><p><span>04</span>Decisões de segurança durante a jornada</p></div></section>
    <section className="section-shell" id="roteiros"><div className="section-heading split-heading"><div><p className="eyebrow">Roteiros de hiking</p><h2>Do Brasil aos Andes.</h2></div><p>Caminhadas diárias com mochila de ataque, saídas com data e experiências sob consulta para grupos privados.</p></div><div className="catalog-grid">{hiking.map((trip) => <TripCard key={trip.slug} trip={trip} />)}</div></section>
    <section className="cta-band"><div><p className="eyebrow">Encontre seu ritmo</p><h2>Não sabe por onde começar?</h2><p>Conte sua experiência atual e o tipo de paisagem que procura.</p></div><a className="button button-light" href="https://wa.me/5554991195626?text=Ol%C3%A1%21%20Gostaria%20de%20conversar%20sobre%20as%20experi%C3%AAncias%20de%20Hiking%20da%20Ekonova.">Conversar com a equipe <Arrow /></a></section>
    <SiteFooter />
  </main>;
}
