import Link from "next/link";

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
      <Link className="header-cta" href="https://wa.me/5554991195626?text=Ol%C3%A1%21%20Gostaria%20de%20conhecer%20melhor%20as%20experi%C3%AAncias%20da%20Ekonova.">Fale com a Ekonova</Link>
      <details className="mobile-menu">
        <summary aria-label="Abrir menu">Menu</summary>
        <nav aria-label="Navegação móvel">
          <Link href="/hiking">Hiking 50+</Link>
          <Link href="/bike">Expedições de cicloturismo</Link>
          <Link href="/#saidas">Próximas saídas</Link>
          <Link href="/#depoimentos">Depoimentos</Link>
          <Link href="/sobre">Sobre</Link>
          <Link href="https://wa.me/5554991195626?text=Ol%C3%A1%21%20Gostaria%20de%20conhecer%20melhor%20as%20experi%C3%AAncias%20da%20Ekonova.">Contato</Link>
        </nav>
      </details>
    </header>
  );
}
