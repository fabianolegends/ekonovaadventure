import { notFound, redirect } from "next/navigation";
import { trips } from "../../data/trips";
import { registrationWhatsApp } from "../../data/trip-contact";

const legacySlugs: Record<string, string> = {
  "trekking-caminhos-do-ouro": "caminhos-do-ouro",
  "trekking-atacama-essencia-2027": "atacama-essencia",
};

export default async function RegistrationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const trip = trips.find((item) => item.slug === (legacySlugs[slug] ?? slug));
  if (!trip) notFound();
  if (trip.status === "Edição realizada") redirect(`/roteiros/${trip.slug}`);
  redirect(registrationWhatsApp(trip.title));
}
