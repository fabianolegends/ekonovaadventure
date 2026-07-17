import type { Metadata } from "next";
import { Arrow } from "../components/Icons";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

export const metadata: Metadata = {
  title: "Sobre a Ekonova",
  description: "Conheça a história de Fabiano e Cristiane Pellenz e os 14 anos da Ekonova criando experiências de turismo ativo com cuidado e segurança.",
  alternates: { canonical: "/sobre" },
  openGraph: { url: "/sobre", images: ["/images/fabiano-cristiane-ekonova.jpg"] },
  twitter: { images: ["/images/fabiano-cristiane-ekonova.jpg"] },
};

export default function AboutPage() {
  return <main><SiteHeader />
    <section className="section-shell story-grid"><div><p className="eyebrow">Nossa história</p><h2>Quatorze anos transformando caminhos em encontros.</h2></div><div><p>A Ekonova foi fundada em 2012, em Nova Petrópolis, na Serra Gaúcha. O primeiro evento aconteceu em novembro daquele ano, quando o cicloturismo e a bicicleta como lazer ainda começavam a ganhar espaço no Brasil.</p><p>Desde então, foram mais de 180 eventos e jornadas entre mountain bike, hiking, corridas de aventura, trail running e viagens internacionais.</p><p>Hoje, essa experiência ganha um foco mais nítido: turismo ativo para um público 50+ que procura autonomia, boa companhia, segurança e experiências com significado.</p></div></section>

    <section className="founders-section">
      <div className="founders-photo"><img src="/images/fabiano-cristiane-ekonova.jpg" alt="Fabiano e Cristiane Pellenz, criadores da Ekonova Adventure" /></div>
      <div className="founders-copy">
        <p className="eyebrow">Quem criou a Ekonova</p>
        <h2>Uma empresa que nasceu de uma escolha de família.</h2>
        <p>Fabiano e Cristiane Pellenz eram um jovem casal quando a chegada da filha, Maria Cristina, mudou a forma como enxergavam o tempo, o trabalho e aquilo que realmente permanece. Dessa reflexão nasceu a vontade de construir uma vida baseada menos em acumular coisas e mais em viver experiências.</p>
        <p>A Ekonova cresceu com essa essência familiar: conhecer lugares, superar desafios e estar presente nos momentos que formam uma história. Fabiano, Cristiane e Maria Cristina passaram a levar outras pessoas para descobrir novos caminhos com o mesmo cuidado que teriam entre eles.</p>
        <blockquote>“A Ekonova é uma família. E cuidamos para que você possa se desafiar com segurança e, ao mesmo tempo, se sentir em casa.”</blockquote>
        <div className="founders-profiles">
          <article><span>Fabiano Pellenz</span><strong>Fundador e guia principal</strong><p>Guia Cadastur, credenciado no Parque Estadual da Serra do Tabuleiro e certificado internacionalmente em primeiros socorros em áreas remotas.</p></article>
          <article><span>Cristiane M. Pellenz</span><strong>Fundadora e guia</strong><p>Formação em condução de ecoturismo e turismo de aventura, navegação, orientação e normas técnicas de segurança.</p></article>
        </div>
      </div>
    </section>
    <section className="values-section"><article><span>01</span><h3>Clareza</h3><p>O roteiro é apresentado sem esconder esforço, altitude, terreno ou limitações.</p></article><article><span>02</span><h3>Autonomia</h3><p>Cada pessoa participa das decisões e entende o próprio papel na jornada.</p></article><article><span>03</span><h3>Presença</h3><p>Viajar bem é ter tempo para perceber o lugar e as pessoas ao redor.</p></article><article><span>04</span><h3>Responsabilidade</h3><p>Segurança, território e relações locais fazem parte do mesmo compromisso.</p></article></section>
    <section className="cta-band"><div><p className="eyebrow">Próximo passo</p><h2>Conheça o nosso jeito de viajar na prática.</h2><p>Comece por uma conversa sobre o que você procura.</p></div><a className="button button-light" href="https://wa.me/5554991195626?text=Ol%C3%A1%21%20Gostaria%20de%20conhecer%20o%20jeito%20Ekonova%20de%20viajar.">Falar com a Ekonova <Arrow /></a></section>
    <SiteFooter />
  </main>;
}
