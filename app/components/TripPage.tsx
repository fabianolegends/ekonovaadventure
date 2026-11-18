import type { Trip } from "../data/trips";
import { reservationsWhatsApp, tripRegistration } from "../data/trip-contact";
import { Arrow, RouteLine } from "./Icons";
import { ProfileBars } from "./ProfileBars";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { TripGallery } from "./TripGallery";

export function TripPage({ trip, onlineHref }: { trip: Trip; onlineHref?: string }) {
  const archived = trip.status === "Edição realizada";
  const { badge, action, status, href: registration } = tripRegistration(trip, onlineHref);
  const profileContact = reservationsWhatsApp(`Gostaria de conversar sobre meu preparo para o roteiro ${trip.title}.`);
  const editorial = trip.editorial ?? {
    kicker: trip.kind === "trekking" ? "Caminhar para conhecer" : "Pedalar para descobrir",
    title: trip.kind === "trekking" ? "Uma paisagem que se revela no ritmo dos passos." : "Uma rota desenhada para viver o caminho por inteiro.",
    paragraphs: [
      `${trip.summary} A proposta combina natureza, cultura e uma leitura cuidadosa do território, com tempo para perceber o que existe entre um ponto e outro.`,
      trip.kind === "trekking"
        ? "As caminhadas são organizadas em etapas compreensíveis, com orientação de preparo, logística e acompanhamento próximo. Antes da reserva, conversamos sobre sua experiência e o momento atual."
        : "Cada etapa é planejada com rota validada, arquivos de navegação e uma rede de suporte definida. Você pedala com autonomia, sabendo o que esperar do terreno e da jornada.",
    ],
  };
  const stages = trip.stages ?? [
    { title: "Preparação", meta: "Antes da partida", description: "Conversa individual, orientação de equipamentos e apresentação clara do perfil do roteiro." },
    { title: "Imersão no território", meta: "Durante a jornada", description: `Uma sequência de experiências entre ${trip.highlights.slice(0, 3).join(", ")}, respeitando o ritmo e as características do grupo.` },
    { title: "Chegada com significado", meta: "Encerramento", description: "Tempo para concluir a experiência, compartilhar impressões e levar consigo uma leitura mais próxima do lugar." },
  ];
  return (
    <main>
      <SiteHeader />
      <section className="trip-hero">
        <div className="trip-hero-image"><img src={trip.image} alt={`Paisagem de ${trip.title}`} /></div>
        <div className="trip-hero-copy">
          <p className="eyebrow">{trip.kind === "trekking" ? "Caminhada / Trekking" : "Expedições de cicloturismo"}</p>
          <span className={`trip-status ${badge}`}>{status}</span>
          <h1>{trip.title}</h1>
          <p>{trip.summary}</p>
          <div className="trip-hero-actions">
            <a className="button button-primary" href="#programa">Ver programa <Arrow /></a>
            {archived
              ? <a className="trip-hero-link" href="/#saidas">Ver próximas viagens</a>
              : <a className="trip-hero-link" href={registration}>{action}</a>}
          </div>
          <RouteLine />
        </div>
      </section>

      <section className="facts-strip" aria-label="Informações rápidas">
        <div><span>Destino</span><strong>{trip.place}</strong></div>
        <div><span>Quando</span><strong>{trip.date}</strong></div>
        <div><span>Duração</span><strong>{trip.duration}</strong></div>
        <div><span>Distância</span><strong>{trip.distance ?? "informada na proposta"}</strong></div>
      </section>

      <nav className="trip-section-nav" aria-label="Navegação desta experiência">
        <span>Nesta experiência</span>
        <a href="#visao-geral">Visão geral</a>
        <a href="#perfil">Perfil</a>
        <a href="#programa">Programa</a>
        {trip.gallery && <a href="#galeria">Galeria</a>}
        <a href="#inclui">O que inclui</a>
      </nav>

      <section className="detail-layout" id="visao-geral">
        <div className="detail-copy">
          <p className="eyebrow">{editorial.kicker}</p>
          <h2>{editorial.title}</h2>
          {editorial.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <h3>O que marca este roteiro</h3>
          <ul className="check-list">{trip.highlights.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <aside className="profile-panel" id="perfil">
          <p className="eyebrow">Perfil do roteiro</p>
          <ProfileBars profile={trip.profile} />
          <p className="profile-disclaimer">Escala comparativa de 1 a 5.{!archived && " A avaliação individual acontece antes da confirmação."}</p>
          {trip.note && <div className="attention-note"><strong>Ponto de atenção</strong><p>{trip.note}</p></div>}
          {!archived && <a className="profile-contact" href={profileContact}>Conversar sobre meu perfil <Arrow /></a>}
        </aside>
      </section>

      <section className="journey-section" id="programa">
        <div className="journey-heading">
          <p className="eyebrow">Como a experiência acontece</p>
          <h2>O roteiro, etapa por etapa.</h2>
          <p>{archived ? "Confira as etapas da edição realizada." : "O desenho definitivo pode variar conforme a data, o clima e o formato do grupo. Antes da confirmação, você recebe todas as informações atualizadas."}</p>
        </div>
        <div className="journey-list">
          {stages.map((stage, index) => (
            <article key={stage.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><p>{stage.meta}</p><h3>{stage.title}</h3><p>{stage.description}</p></div>
            </article>
          ))}
        </div>
      </section>

      {trip.gallery && <div id="galeria"><TripGallery images={trip.gallery} title={trip.title} /></div>}

      {trip.practical && (
        <section className="practical-strip" aria-label="Informações práticas">
          {trip.practical.map((item) => {
            const isInvestment = item.label.toLocaleLowerCase("pt-BR") === "investimento";

            return (
              <div key={item.label}>
                <span>{item.label}</span>
                {isInvestment ? (
                  <a
                    className="investment-whatsapp"
                    href={reservationsWhatsApp(`Gostaria de consultar o investimento do roteiro ${trip.title}.`)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Consultar pelo WhatsApp <b aria-hidden="true">→</b>
                  </a>
                ) : (
                  <strong>{item.value}</strong>
                )}
              </div>
            );
          })}
        </section>
      )}

      <section className="not-included-section included-list-section" id="inclui">
        <div><p className="eyebrow">Suporte Ekonova</p><h2>O que está incluído.</h2><p>{archived ? "Serviços que fizeram parte desta edição." : "Serviços e estruturas previstos para que você saiba exatamente com o que pode contar durante a experiência."}</p></div>
        <ul>{trip.included.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      {trip.notIncluded && (
        <section className="not-included-section">
          <div><p className="eyebrow">Planejamento transparente</p><h2>O que não está incluído.</h2><p>{archived ? "Itens que ficaram por conta dos participantes." : "Estes itens ficam sob responsabilidade de cada participante ou são contratados separadamente."}</p></div>
          <ul>{trip.notIncluded.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
      )}

      <section className="cta-band">
        {archived ? (
          <>
            <div><p className="eyebrow">Edição realizada</p><h2>Conheça as próximas viagens.</h2></div>
            <a className="button button-light" href="/#saidas">Ver inscrições abertas <Arrow /></a>
          </>
        ) : (
          <>
            {onlineHref ? <div><p className="eyebrow">Inscrições abertas</p><h2>Inscreva-se para esta saída.</h2><p>No formulário, confira a hospedagem e as condições de pagamento.</p></div> : <div><p className="eyebrow">Converse com quem opera</p><h2>Este roteiro combina com o seu momento?</h2><p>Fale com a equipe sobre datas, valores e o preparo para a viagem.</p></div>}
            <a className="button button-light" href={registration}>{action} <Arrow /></a>
          </>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
