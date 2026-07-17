import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <img src="/ekonova-logo.png" alt="Ekonova Adventure" />
        <p>Turismo ativo para quem vive os 50+ com curiosidade, autonomia e segurança.</p>
      </div>
      <div>
        <p className="footer-label">Experiências</p>
        <Link href="/hiking">Hiking 50+ · Caminhadas</Link>
        <Link href="/bike">Bike com autonavegação</Link>
        <Link href="/#saidas">Próximas saídas</Link>
      </div>
      <div>
        <p className="footer-label">Ekonova</p>
        <Link href="/sobre">Nossa história</Link>
        <Link href="/#depoimentos">Depoimentos</Link>
        <Link href="https://wa.me/5554991195626?text=Ol%C3%A1%21%20Gostaria%20de%20planejar%20uma%20viagem%20com%20a%20Ekonova.">Planeje sua viagem</Link>
        <a href="https://www.instagram.com/ekonovaadventure/" target="_blank" rel="noreferrer">Instagram ↗</a>
      </div>
      <div className="footer-contact">
        <p className="footer-label">Contato</p>
        <a href="https://wa.me/5554991195626?text=Ol%C3%A1%21%20Gostaria%20de%20conversar%20com%20a%20Ekonova.">WhatsApp · +55 54 99119-5626</a>
        <span>Santa Catarina · Brasil</span>
      </div>
      <div className="footer-bottom">
        <span>© 2012–2026 Ekonova Adventure</span>
        <span>Natureza · cultura · movimento</span>
      </div>
    </footer>
  );
}
