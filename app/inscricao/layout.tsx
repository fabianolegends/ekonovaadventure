import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inscrição · Trekking Andes Essencial",
  description: "Inscreva-se no Trekking Andes Essencial da Ekonova Adventure.",
  alternates: { canonical: "/inscricao" },
  openGraph: {
    type: "website",
    url: "/inscricao",
    title: "Trekking Andes Essencial | Ekonova Adventure",
    description: "Trekking, altitude e vinhos nos Andes. Inscrições abertas.",
    images: [{ url: "/images/inscricao/andes-essencial.jpg", width: 1080, height: 1350, alt: "Trekking Andes Essencial" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trekking Andes Essencial | Ekonova Adventure",
    description: "Trekking, altitude e vinhos nos Andes. Inscrições abertas.",
    images: ["/images/inscricao/andes-essencial.jpg"],
  },
};

export default function RegistrationLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
