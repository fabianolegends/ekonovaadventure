import { notFound } from "next/navigation";
import { TripPage } from "../../components/TripPage";
import { trips } from "../../data/trips";

export function generateStaticParams() {
  return trips.map((trip) => ({ slug: trip.slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const trip = trips.find((item) => item.slug === slug);
  if (!trip) notFound();
  return <TripPage trip={trip} />;
}
