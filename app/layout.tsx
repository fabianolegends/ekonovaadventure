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

export const metadata: Metadata = {
  title: "Ekonova Adventure | Turismo ativo 50+",
  description: "Hiking 50+ em pequenos grupos e cicloturismo com autonavegação assistida, suporte especializado e ritmo planejado.",
  keywords: ["turismo ativo 50+", "hiking", "caminhadas", "cicloturismo", "autonavegação", "Ekonova Adventure"],
  other: { "codex-preview": "development" },
  icons: {
    icon: "/ekonova-favicon.png",
    shortcut: "/ekonova-favicon.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${sans.variable} ${display.variable}`}>{children}</body>
    </html>
  );
}
