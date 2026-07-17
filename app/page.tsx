import type { Metadata } from "next";
import { Arrow, RouteLine } from "./components/Icons";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { TripCard } from "./components/TripCard";
import { ProfileBars } from "./components/ProfileBars";
import { TestimonialsCarousel } from "./components/TestimonialsCarousel";
import { OrganizationSchema } from "./components/OrganizationSchema";
import { featuredTrips } from "./data/trips";

export const metadata: Metadata = {
  title: "Turismo ativo 50+ em pequenos grupos",
  description: "Experiências de hiking e cicloturismo para quem busca natureza, autonomia, pequenos grupos e suporte especializado no Brasil e na América do Sul.",
  alternates: { canonical: "/" },
  openGraph: { url: "/", images: ["/images/clientes-trilha.jpeg"] },
  twitter: { images: ["/images/clientes-trilha.jpeg"] },
};

export default function Home() {
  return (
    <main>
      <OrganizationSchema />
      <SiteHeader overlay />

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Turismo ativo 50+</p>
          <h1>Viva a aventura no seu ritmo.</h1>
          <p className="hero-lede">Pequenos grupos, caminhos autênticos e suporte especializado para viver a natureza com autonomia e segurança.</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#saidas">Ver próximas saídas <Arrow /></a>
            <a className="button button-secondary" href="/sobre">Conheça a Ekonova</a>
          </div>
          <div className="trust-row" aria-label="Diferenciais Ekonova">
            <div><strong>14 anos</strong><span>de experiência</span></div>
            <div><strong>Até 12 pessoas</strong><span>por grupo</span></div>
            <div><strong>Guias</strong><span>especializados</span></div>
          </div>
        </div>
      </section>

      <section className="section-shell pillars-section" id="experiencias">
        <div className="section-heading split-heading">
          <div><p className="eyebrow">Duas formas de explorar</p><h2>Autonomia com uma rede de cuidado.</h2></div>
          <p>Escolha caminhar em pequenos grupos ou pedalar com navegação própria. Em ambos, o planejamento começa pela sua experiência e pelo seu momento.</p>
        </div>
        <div className="pillar-grid">
          <a className="pillar-card" href="/hiking">
            <img src="/images/clientes-trilha.jpeg" alt="Clientes Ekonova caminhando em grupo em uma trilha vulcânica" />
            <div className="pillar-overlay"><span>01 · Caminhada</span><h3>Hiking 50+</h3><p>Caminhadas de um dia, pequenos grupos e natureza com contexto.</p><i><Arrow /></i></div>
          </a>
          <a className="pillar-card" href="/bike">
            <img src="/images/card-cicloturismo.jpg" alt="Ciclista Ekonova pedalando por uma paisagem de campos verdes" />
            <div className="pillar-overlay"><span>02 · Cicloturismo</span><h3>Expedições de cicloturismo</h3><p>Liberdade para pedalar e suporte quando ele realmente importa.</p><i><Arrow /></i></div>
          </a>
        </div>
      </section>

      <div className="moving-trail-divider" aria-hidden="true">
        <span className="trail-caption">Do primeiro passo à próxima estrada</span>
        <div className="trail-line"><i /><i /><i /></div>
        <span className="moving-hiker"><img src="/images/divisor-caminhante.png" alt="" /></span>
        <span className="moving-cyclist"><img src="/images/divisor-ciclista.png" alt="" /></span>
      </div>

      <section className="section-shell departures-section" id="saidas">
        <div className="section-heading split-heading">
          <div><p className="eyebrow">Próximas saídas</p><h2>Próximas aventuras. Escolha a sua.</h2></div>
          <p>Confira as datas confirmadas, acompanhe os grupos em formação e converse com a equipe para encontrar a experiência que combina com você.</p>
        </div>
        <div className="featured-grid">{featuredTrips.map((trip) => <TripCard key={trip.slug} trip={trip} />)}</div>
      </section>

      <section className="method-section" id="metodo">
        <div className="method-visual">
          <img src="/images/jeito-ekonova-vulcao-estrelas-v2.webp" alt="Vulcão sob um céu estrelado em uma experiência Ekonova" />
          <RouteLine />
        </div>
        <div className="method-copy">
          <p className="eyebrow">O jeito Ekonova</p>
          <h2>Segurança também é saber o que vem pela frente.</h2>
          <p>Não reduzimos um roteiro a “fácil, médio ou difícil”. Antes da reserva, explicamos terreno, esforço, altitude, técnica, conforto e rotina de cada dia.</p>
          <ol className="method-steps">
            <li><span>01</span><div><strong>Conversa inicial</strong><p>Histórico, expectativas e momento atual.</p></div></li>
            <li><span>02</span><div><strong>Preparação sem improviso</strong><p>Equipamentos, condicionamento e briefing.</p></div></li>
            <li><span>03</span><div><strong>Acompanhamento presente</strong><p>Decisões responsáveis antes e durante a viagem.</p></div></li>
            <li><span>04</span><div><strong>Ritmo com propósito</strong><p>Tempo para observar, conversar e viver o lugar.</p></div></li>
          </ol>
        </div>
      </section>

      <section className="section-shell profile-method">
        <div className="section-heading centered-heading">
          <p className="eyebrow">Um nível que você entende</p>
          <h2>Quatro dimensões. Uma escolha mais consciente.</h2>
          <p>Cada roteiro apresenta um perfil visual comparável. Assim, você identifica onde está o desafio — e não apenas recebe uma nota genérica.</p>
        </div>
        <div className="profile-example">
          <div><span>Exemplo de leitura</span><strong>Perfil de um roteiro</strong><p>Cada barra vai de 1 a 5 e mostra onde a experiência exige mais atenção.</p></div>
          <ProfileBars profile={{ effort: 4, technique: 2, exposure: 3, comfort: 4 }} />
        </div>
        <div className="dimension-grid">
          <article><span>01</span><h3>Esforço físico</h3><p>Duração das etapas, desnível e recuperação.</p></article>
          <article><span>02</span><h3>Técnica</h3><p>Tipo de terreno e habilidades específicas.</p></article>
          <article><span>03</span><h3>Altitude e exposição</h3><p>Clima, elevação e distância de apoio.</p></article>
          <article><span>04</span><h3>Conforto logístico</h3><p>Hospedagem, bagagem e estrutura disponível.</p></article>
        </div>
      </section>

      <section className="catalog-section">
        <div className="section-shell">
          <div className="section-heading split-heading">
            <div><p className="eyebrow">Explore os roteiros</p><h2>Escolha como quer viver o caminho.</h2></div>
            <p>Conheça as saídas programadas e as experiências disponíveis sob consulta em cada modalidade.</p>
          </div>
          <nav className="route-category-links" aria-label="Catálogos de experiências">
            <a href="/hiking"><span>01</span><div><strong>Hiking 50+ · Caminhadas</strong><p>Caminhadas diárias e jornadas culturais no Brasil e nos Andes.</p></div><Arrow /></a>
            <a href="/bike"><span>02</span><div><strong>Expedições de cicloturismo</strong><p>Rotas com autonavegação, planejamento e rede de suporte.</p></div><Arrow /></a>
          </nav>
        </div>
      </section>

      <section className="planning-band">
        <div><p className="eyebrow">Locais que estamos pesquisando</p><h2>Novos caminhos no Brasil e na América do Sul.</h2></div>
        <div><p><strong>Estrada Real, Rota do Café na Colômbia, litoral uruguaio e Pampa Gaúcho.</strong> Estamos estudando os percursos, a melhor época e o formato de cada experiência. Quem entra nessa conversa acompanha a curadoria e ajuda a definir as próximas saídas.</p><a className="text-link light-link" href="https://wa.me/5554991195626?text=Ol%C3%A1%21%20Quero%20entrar%20na%20lista%20de%20interesse%20dos%20novos%20roteiros%20da%20Ekonova.">Entrar na lista de interesse <Arrow /></a></div>
      </section>

      <section className="about-preview" id="sobre">
        <div className="about-photo"><img src="/images/cliente-contemplacao.jpeg" alt="Cliente Ekonova contemplando uma paisagem de lagos e montanhas" /></div>
        <div className="about-copy"><p className="eyebrow">Desde 2012</p><h2>Aventura não precisa provar nada para ninguém.</h2><p>Para a Ekonova, viver a natureza é uma forma de presença. Há 14 anos desenhamos experiências em que segurança, autonomia e prazer caminham juntos.</p><blockquote>“O desafio certo é aquele que amplia o mundo sem diminuir a pessoa.”</blockquote><a className="text-link" href="/sobre">Conheça nossa história <Arrow /></a></div>
      </section>

      <TestimonialsCarousel />

      <section className="section-shell faq-section">
        <div className="section-heading"><p className="eyebrow">Perguntas importantes</p><h2>Antes de escolher, vale conversar.</h2></div>
        <div className="faq-grid">
          <details><summary>Preciso ter mais de 50 anos?</summary><p>Não. O 50+ define nosso jeito de planejar: clareza, ritmo responsável, boa logística e respeito à autonomia. Pessoas alinhadas a esse estilo são bem-vindas.</p></details>
          <details><summary>Como sei se o roteiro combina comigo?</summary><p>Começamos por uma conversa sobre sua experiência atual. Depois apresentamos o perfil completo do roteiro e os pontos que pedem preparação.</p></details>
          <details><summary>Autonavegação significa pedalar sozinho?</summary><p>Não necessariamente. Significa que você ou seu pequeno grupo segue a rota com autonomia, apoiado por briefing, arquivos de navegação, monitoramento e plano logístico.</p></details>
          <details><summary>As vagas mostradas são garantidas?</summary><p>O site informa o estágio real do grupo. A disponibilidade e a adequação ao roteiro são confirmadas individualmente pela equipe.</p></details>
        </div>
      </section>

      <section className="cta-band">
        <div><p className="eyebrow">Seu próximo caminho</p><h2>Vamos descobrir qual experiência combina com você?</h2><p>Conte como você caminha ou pedala hoje. A orientação começa antes da reserva.</p></div>
        <a className="button button-light" href="https://wa.me/5554991195626?text=Ol%C3%A1%21%20Gostaria%20de%20descobrir%20qual%20experi%C3%AAncia%20da%20Ekonova%20combina%20comigo.">Conversar com a Ekonova <Arrow /></a>
      </section>
      <SiteFooter />
    </main>
  );
}
