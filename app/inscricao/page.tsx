"use client";

import { useState } from "react";
import "./inscricao.css";

const DOUBLE_PRICE = 1399;
const SINGLE_SUPPLEMENT = 300;
const formatUsd = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(value);

export default function InscricaoPage() {
  const [room, setRoom] = useState<"duplo" | "single">("duplo");
  const [payment, setPayment] = useState<"pix" | "avista">("pix");
  const [installments, setInstallments] = useState(3);
  const [entryDate, setEntryDate] = useState("");
  const [done, setDone] = useState(false);

  const packagePrice = DOUBLE_PRICE + (room === "single" ? SINGLE_SUPPLEMENT : 0);
  const cashDiscount = payment === "avista" ? packagePrice * 0.05 : 0;
  const total = packagePrice - cashDiscount;
  const entry = payment === "pix" ? Math.round(total * 0.3 * 100) / 100 : total;
  const balance = Math.round((total - entry) * 100) / 100;
  const installment = Math.ceil((balance / installments) * 100) / 100;

  const submit = (event: React.FormEvent) => { event.preventDefault(); setDone(true); };

  return (
    <main className="booking-shell">
      <header><a href="/">Ekonova <span>Adventure</span></a><p>Inscrição de viagem</p></header>
      <section className="booking-hero">
        <p>10 A 17 DE MARÇO DE 2027 · MENDOZA, ARGENTINA</p>
        <h1>Trekking, altitude e vinhos nos Andes.</h1>
        <span>Andes Essencial: oito dias de montanha, cultura e gastronomia.</span>
        <div className="booking-highlights"><span>7 diárias com café da manhã</span><span>Aconcágua e Cordón del Plata</span><span>2 experiências harmonizadas</span></div>
      </section>
      <form onSubmit={submit} className="booking-layout">
        <section className="booking-card">
          <p className="booking-eyebrow">PRÉ-INSCRIÇÃO</p><h2>Reserve sua vaga</h2>
          <p className="booking-intro">Preencha seus dados. Na próxima etapa, você conclui sua ficha completa de viajante e recebe o resumo da reserva.</p>
          <label>Nome completo<input required placeholder="Como consta no documento" /></label>
          <label>E-mail<input type="email" required placeholder="voce@email.com" /></label>
          <label>WhatsApp<input required placeholder="(00) 00000-0000" /></label>
          <fieldset><legend>Hospedagem</legend>
            <button type="button" className={room === "duplo" ? "selected" : ""} onClick={() => setRoom("duplo")}><strong>Quarto duplo</strong><small>Valor padrão do pacote, por pessoa</small><b>{formatUsd(DOUBLE_PRICE)}</b></button>
            <button type="button" className={room === "single" ? "selected" : ""} onClick={() => setRoom("single")}><strong>Quarto single</strong><small>Hospedagem solo: adicional de US$ 300,00</small><b>{formatUsd(DOUBLE_PRICE + SINGLE_SUPPLEMENT)}</b></button>
          </fieldset>
          <fieldset><legend>Forma de pagamento</legend>
            <button type="button" className={payment === "pix" ? "selected" : ""} onClick={() => setPayment("pix")}><strong>Pix parcelado</strong><small>30% de entrada e saldo em Pix, com último pagamento em janeiro de 2027</small><b>30% agora</b></button>
            <button type="button" className={payment === "avista" ? "selected" : ""} onClick={() => setPayment("avista")}><strong>À vista</strong><small>5% de desconto sobre o valor do pacote</small><b>{formatUsd(packagePrice * 0.95)}</b></button>
          </fieldset>
          {payment === "pix" && <fieldset><legend>Planeje o Pix</legend>
            <label>Data desejada para a entrada de 30%<input type="date" value={entryDate} onChange={(event) => setEntryDate(event.target.value)} required /></label>
            <label>Parcelas do saldo<select value={installments} onChange={(event) => setInstallments(Number(event.target.value))}>{[1, 2, 3, 4, 5, 6].map((value) => <option key={value} value={value}>{value}x de {formatUsd(Math.ceil((balance / value) * 100) / 100)}</option>)}</select></label>
          </fieldset>}
          <button className="booking-submit">Continuar pré-inscrição</button>
          {done && <p className="booking-success">Pré-inscrição preparada. Seus dados serão conferidos antes da confirmação e do envio do resumo por e-mail.</p>}
        </section>
        <aside className="booking-summary">
          <p>Resumo da reserva</p><h2>Andes Essencial</h2>
          <div><span>Data</span><b>10-17 mar 2027</b></div><div><span>Hospedagem</span><b>Quarto {room}</b></div><div><span>Valor do pacote</span><b>{formatUsd(packagePrice)}</b></div>
          {cashDiscount > 0 && <div><span>Desconto à vista</span><b>- {formatUsd(cashDiscount)}</b></div>}
          {payment === "pix" ? <><div><span>Entrada Pix - 30%</span><b>{formatUsd(entry)}</b></div><div><span>Saldo parcelado</span><b>{installments}x de {formatUsd(installment)}</b></div></> : <div><span>Pagamento</span><b>À vista</b></div>}
          <hr /><strong>Total {formatUsd(total)}</strong>
          <small>{payment === "pix" ? (entryDate ? `Entrada prevista para ${new Date(`${entryDate}T12:00:00`).toLocaleDateString("pt-BR")}` : "Escolha a data da entrada") : "Desconto de 5% aplicado"}</small>
          <p className="booking-note">Não incluso: passagens aéreas, refeições não indicadas, bebidas e serviços não citados no roteiro.</p>
        </aside>
      </form>
    </main>
  );
}
