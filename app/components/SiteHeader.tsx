import Link from "next/link";

type SocialKind = "facebook" | "instagram" | "whatsapp" | "email";

function SocialIcon({ kind }: { kind: SocialKind }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (kind === "facebook") {
    return <svg {...common}><path d="M14 8h3V4h-3c-3 0-5 2-5 5v3H6v4h3v6h4v-6h3.3l.7-4h-4V9c0-.7.3-1 1-1Z" /></svg>;
  }
  if (kind === "instagram") {
    return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none" /></svg>;
  }
  if (kind === "whatsapp") {
    return <svg {...common}><path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.4-4.7A8.5 8.5 0 1 1 20.5 11.6Z" /><path d="M8.1 7.7c.2-.4.4-.4.7-.4h.4c.2 0 .4 0 .5.4l.8 1.9c.1.3.1.5-.1.7l-.6.8c-.2.2-.2.4 0 .7.7 1.2 1.7 2.2 3 2.8.3.2.6.1.8-.1l.9-1.1c.2-.3.5-.3.8-.2l1.8.9c.3.2.5.3.5.5 0 .3-.2 1.5-1 2.1-.7.6-1.7.9-2.7.6-1.2-.3-2.8-.9-4.6-2.5-1.5-1.4-2.5-3.1-2.8-4.3-.3-1.1 0-2.1.5-2.6.3-.3.8-.5 1.2-.2Z" /></svg>;
  }
  return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg>;
}

const socials: Array<{ kind: SocialKind; label: string; href: string }> = [
  { kind: "facebook", label: "Facebook da Ekonova", href: "https://www.facebook.com/EkonovaAdventure/" },
  { kind: "instagram", label: "Instagram da Ekonova", href: "https://www.instagram.com/ekonovaadventure/" },
  { kind: "whatsapp", label: "WhatsApp da Ekonova", href: "https://wa.me/5554991195626?text=Ol%C3%A1%21%20Gostaria%20de%20conhecer%20melhor%20as%20experi%C3%AAncias%20da%20Ekonova." },
  { kind: "email", label: "E-mail da Ekonova", href: "mailto:contato@ekonovaadv.com.br" },
];

function SocialLinks({ mobile = false }: { mobile?: boolean }) {
  return (
    <div className={mobile ? "header-socials mobile-socials" : "header-socials"} aria-label="Redes sociais e contatos">
      {socials.map(({ kind, label, href }) => (
        <a key={kind} className="social-link" href={href} aria-label={label} title={label} target={kind === "email" ? undefined : "_blank"} rel={kind === "email" ? undefined : "noreferrer"}>
          <SocialIcon kind={kind} />
        </a>
      ))}
    </div>
  );
}

export function SiteHeader({ overlay = true }: { overlay?: boolean }) {
  return (
    <header className={`site-header${overlay ? " site-header-overlay" : ""}`}>
      <Link className="brand" href="/" aria-label="Ekonova Adventure — início">
        <img src="/ekonova-logo.png" alt="Ekonova Adventure" />
      </Link>
      <nav className="desktop-nav" aria-label="Navegação principal">
        <Link href="/hiking">Hiking 50+</Link>
        <Link href="/bike">Expedições de cicloturismo</Link>
        <Link href="/#saidas">Próximas saídas</Link>
        <Link href="/#depoimentos">Depoimentos</Link>
        <Link href="/sobre">Sobre</Link>
      </nav>
      <SocialLinks />
      <details className="mobile-menu">
        <summary aria-label="Abrir menu">Menu</summary>
        <nav aria-label="Navegação móvel">
          <Link href="/hiking">Hiking 50+</Link>
          <Link href="/bike">Expedições de cicloturismo</Link>
          <Link href="/#saidas">Próximas saídas</Link>
          <Link href="/#depoimentos">Depoimentos</Link>
          <Link href="/sobre">Sobre</Link>
          <SocialLinks mobile />
        </nav>
      </details>
    </header>
  );
}
