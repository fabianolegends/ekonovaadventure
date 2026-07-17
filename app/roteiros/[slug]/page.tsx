import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TripPage } from "../../components/TripPage";
import { trips } from "../../data/trips";

const BASE_URL = "https://www.ekonovaadv.com.br";

export function generateStaticParams() {
  return trips.map((trip) => ({ slug: trip.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const trip = trips.find((item) => item.slug === slug);

  if (!trip) return {};

  const title = `${trip.title} · ${trip.place}`;
  const description = `${trip.summary} ${trip.date} · ${trip.duration}.`;
  const url = `/roteiros/${trip.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: `${title} | Ekonova Adventure`,
      description,
      images: [{ url: trip.image, alt: `${trip.title}, ${trip.place}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Ekonova Adventure`,
      description,
      images: [trip.image],
    },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const trip = trips.find((item) => item.slug === slug);
  if (!trip) notFound();

  const categoryName =
    trip.kind === "bike" ? "Expedições de cicloturismo" : "Hiking 50+";
  const categoryUrl = trip.kind === "bike" ? "/bike" : "/hiking";
  const pageUrl = `${BASE_URL}/roteiros/${trip.slug}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Início",
            item: BASE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: categoryName,
            item: `${BASE_URL}${categoryUrl}`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: trip.title,
            item: pageUrl,
          },
        ],
      },
      {
        "@type": "TouristTrip",
        "@id": `${pageUrl}#trip`,
        name: trip.title,
        description: trip.summary,
        url: pageUrl,
        image: `${BASE_URL}${trip.image}`,
        touristType: trip.kind === "bike" ? "Cicloturismo" : "Hiking 50+",
        provider: {
          "@id": `${BASE_URL}/#organization`,
          "@type": "TravelAgency",
          name: "Ekonova Adventure",
          url: BASE_URL,
        },
        itinerary: {
          "@type": "ItemList",
          itemListElement: trip.highlights.map((highlight, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: highlight,
          })),
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <TripPage trip={trip} />
    </>
  );
}
