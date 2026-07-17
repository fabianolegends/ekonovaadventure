import { Arrow } from "../components/Icons";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

export const metadata = { title: "Contato | Ekonova Adventure" };

export default function ContactPage() {
  return <main><SiteHeader />
    <section className="contact-page"><div className="contact-intro"><p className="eyebrow">Vamos conversar</p><h1>Antes da rota, vem a escuta.</h1><p>Conte o que você gostaria de viver, como caminha ou pedala hoje e qual janela de viagem tem em mente.</p></div><div className="contact-options"><a href="https://wa.me/5554991195626?text=Ol%C3%A1%21%20Gostaria%20de%20planejar%20uma%20experi%C3%AAncia%20com%20a%20Ekonova."><span>WhatsApp</span><strong>+55 54 99119-5626</strong><Arrow /></a><a href="https://www.instagram.com/ekonovaadventure/" target="_blank" rel="noreferrer"><span>Instagram</span><strong>@ekonovaadventure</strong><Arrow /></a><div><span>Para agilizar</span><p>Inclua destino de interesse, faixa de datas, quantidade de pessoas e sua experiência atual.</p></div></div></section>
    <section className="contact-checklist"><p className="eyebrow">Uma boa conversa inclui</p><div><span>01</span><p>Seu ritmo e experiência recente</p></div><div><span>02</span><p>O tipo de desafio que faz sentido</p></div><div><span>03</span><p>Conforto e suporte desejados</p></div><div><span>04</span><p>Datas e formato do grupo</p></div></section>
    <SiteFooter />
  </main>;
}
