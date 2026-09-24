import type { Metadata } from "next";
import InscricaoPage from "../page";

const shareData = {
  "trekking-caminhos-do-ouro": {
    title: "Trekking Caminhos do Ouro",
    description: "Cinco dias de trilhas pelas montanhas de Minas Gerais.",
    image: "/images/inscricao/trekking-caminhos-do-ouro.jpg",
  },
  "biketour-caminhos-do-ouro": {
    title: "Biketour Caminhos do Ouro",
    description: "Uma aventura de MTB pelas montanhas de Minas Gerais.",
    image: "/images/inscricao/biketour-caminhos-do-ouro.jpg",
  },
  "andes-essencial": {
    title: "Trekking Andes Essencial",
    description: "Trekking, altitude e vinhos nos Andes.",
    image: "/images/inscricao/andes-essencial.jpg",
  },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const route = shareData[slug as keyof typeof shareData];
  if (!route) return {};

  const url = `/inscricao/${slug}`;
  return {
    title: `Inscrição · ${route.title}`,
    description: route.description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title: `${route.title} | Ekonova Adventure`, description: route.description, images: [{ url: route.image, width: 1080, height: 1350, alt: route.title }] },
    twitter: { card: "summary_large_image", title: `${route.title} | Ekonova Adventure`, description: route.description, images: [route.image] },
  };
}

export default function Page() {
  return <InscricaoPage />;
}
