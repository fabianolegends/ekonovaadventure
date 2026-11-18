import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { trips } from "../../data/trips";
import { reservationsWhatsApp } from "../../data/trip-contact";
import { listPublicDepartures, managementSlug } from "../../../lib/public-departures";
import { paymentDateLabel } from "../../../lib/atacama-payment";
import { RegistrationForm } from "../RegistrationForm";
import "../inscricao.css";

export const dynamic = "force-dynamic";
type PageProps = { params: Promise<{ slug: string }>; searchParams: Promise<{ saida?: string }> };

function catalogTrip(slug: string) {
  return trips.find((trip) => managementSlug(trip.slug) === slug);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const trip = catalogTrip(managementSlug(slug));
  const title = trip ? `Inscrição · ${trip.title}` : "Inscrição de viagem";
  return {
    title, alternates: { canonical: `/inscricao/${managementSlug(slug)}` },
    openGraph: { title, images: trip ? [trip.image] : [] },
  };
}

export default async function RegistrationPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { saida } = await searchParams;
  const canonical = managementSlug(slug);
  if (canonical !== slug) redirect(`/inscricao/${canonical}${saida ? `?saida=${encodeURIComponent(saida)}` : ""}`);
  const trip = catalogTrip(slug);
  if (trip?.status === "Edição realizada") redirect(`/roteiros/${trip.slug}`);
  const all = await listPublicDepartures().catch(() => null);
  const matching = all?.filter((item) => item.trips.slug === slug) ?? [];
  const choices = saida ? matching.filter((item) => item.starts_on === saida) : matching;
  if (choices.length === 1) return <RegistrationForm key={choices[0].id} departure={choices[0]} />;
  if (all && !trip && !matching.length) notFound();
  const title = trip?.title ?? matching[0]?.trips.title ?? "Inscrição de viagem";
  return (
    <main className="welcome-shell"><section className="welcome-card">
      <p className="booking-eyebrow">Inscrição de viagem</p><h1>{title}</h1>
      {choices.length > 1 ? <>
        <p>Escolha sua data de saída.</p>
        {choices.map((item) => <Link key={item.id} href={`/inscricao/${slug}?saida=${item.starts_on}`}>{paymentDateLabel(item.starts_on)} a {paymentDateLabel(item.ends_on)}</Link>)}
      </> : <>
        <p>{all ? "A inscrição online para esta saída está indisponível." : "Não foi possível consultar as inscrições agora. Tente novamente ou fale com a equipe."}</p>
        <a href={reservationsWhatsApp(`Gostaria de consultar a inscrição para ${title}.`)}>Consultar a equipe pelo WhatsApp</a>
      </>}
      <Link href={trip ? `/roteiros/${trip.slug}` : "/#saidas"}>{trip ? "Ver roteiro" : "Ver próximas viagens"}</Link>
    </section></main>
  );
}
