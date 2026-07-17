import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

const sans = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600"],
});

const siteDescription =
  "Turismo ativo 50+ em pequenos grupos: hiking, caminhadas e expedições de cicloturismo com planejamento, segurança e suporte especializado.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ekonovaadv.com.br"),
  title: {
    default: "Ekonova Adventure | Turismo ativo 50+",
    template: "%s | Ekonova Adventure",
  },
  description: siteDescription,
  applicationName: "Ekonova Adventure",
  authors: [{ name: "Ekonova Adventure", url: "https://www.ekonovaadv.com.br" }],
  creator: "Ekonova Adventure",
  publisher: "Ekonova Adventure",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: "Ekonova Adventure",
    title: "Ekonova Adventure | Turismo ativo 50+",
    description: siteDescription,
    images: [
      {
        url: "/images/clientes-trilha.jpeg",
        width: 1200,
        height: 630,
        alt: "Clientes Ekonova vivendo uma experiência de turismo ativo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ekonova Adventure | Turismo ativo 50+",
    description: siteDescription,
    images: ["/images/clientes-trilha.jpeg"],
  },
  icons: {
    icon: "/ekonova-favicon.png",
    shortcut: "/ekonova-favicon.png",
    apple: "/ekonova-favicon.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${sans.variable} ${display.variable}`}>{children}</body>
    </html>
  );
}
