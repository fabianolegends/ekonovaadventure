"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { PublicDeparture } from "../../lib/public-departures";
import { availableInstallments, bookingQuote, brazilDate, paymentTerms, type BookingPayment, type BookingRoom } from "../../lib/registration-payment";
import { paymentDateLabel } from "../../lib/atacama-payment";
import "./inscricao.css";

export function RegistrationForm({ departure }: { departure: PublicDeparture }) {
  const terms = paymentTerms(departure);
  const today = brazilDate();
  const firstPossibleEntry = terms.fixedEntry || today;
  const pixOpen = (!terms.entryDeadline || today <= terms.entryDeadline) && availableInstallments(departure, firstPossibleEntry) > 0;
  const [room, setRoom] = useState<BookingRoom>("duplo");
  const [payment, setPayment] = useState<BookingPayment>(pixOpen ? "pix" : "avista");
  const [selectedEntry, setEntry] = useState("");
  const [installments, setInstallments] = useState(3);
  const [completeForm, setCompleteForm] = useState(false);
  const [finalized, setFinalized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const entryDate = terms.fixedEntry || (payment === "avista" ? today : selectedEntry);
  const maximum = availableInstallments(departure, entryDate);
  const count = Math.min(installments, maximum);
  const quote = bookingQuote(departure, room, payment, entryDate, count);
  const money = (cents: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: departure.currency }).format(cents / 100);
  const dateRange = `${paymentDateLabel(departure.starts_on)} a ${paymentDateLabel(departure.ends_on)}`;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    if (!completeForm) {
      setCompleteForm(true);
      return;
    }
    setSaving(true);
    setSaveError("");
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") || "");
    try {
      const response = await fetch("/api/inscricao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: departure.trips.slug, departureId: departure.id, name: data.get("fullName"), email,
          room, payment, entryDate, installments: count, profile: Object.fromEntries(data),
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.saved) throw new Error(result.error || "Não foi possível concluir a inscrição.");
      setSubmittedEmail(email);
      setFinalized(true);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Não foi possível concluir a inscrição. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  if (finalized) {
    return <main className="welcome-shell"><section className="welcome-card"><p className="booking-eyebrow">INSCRIÇÃO RECEBIDA</p><h1>Cadastro preenchido com sucesso.</h1><p>Bem-vindo ao {departure.trips.title}. A equipe Ekonova entrará em contato com os próximos passos.</p><Link href={`/minha-area?email=${encodeURIComponent(submittedEmail)}`}>Criar acesso à minha área</Link><Link href="/">Voltar para a Ekonova Adventure</Link></section></main>;
  }

  return (
    <main className="booking-shell">
      <header><Link className="booking-logo" href="/"><Image src="/ekonova-adventure-registrada.png" alt="Ekonova Adventure®" width={531} height={188} priority /></Link><p>Inscrição de viagem</p></header>
      <section className="booking-hero">
        <p>{dateRange} · {departure.trips.destination}</p>
        <h1>{departure.trips.title}</h1>
      </section>
      <form onSubmit={submit} className="booking-layout">
        <section className="booking-card">
          <p className="booking-eyebrow">Inscrição</p><h2>Reserve sua vaga</h2>
          <p className="booking-intro">Informe seus dados e escolha a hospedagem e a forma de pagamento. Na próxima etapa, você completa a ficha do viajante.</p>
          <label>Nome completo<input name="fullName" required autoComplete="name" placeholder="Como consta no documento" /></label>
          <label>E-mail<input name="email" type="email" required autoComplete="email" placeholder="voce@email.com" /></label>
          <label>WhatsApp<input type="tel" name="phone" required autoComplete="tel" placeholder="(00) 00000-0000" /></label>
          <fieldset><legend>Hospedagem</legend>
            <button type="button" aria-pressed={room === "duplo"} className={room === "duplo" ? "selected" : ""} onClick={() => setRoom("duplo")}><strong>Quarto duplo</strong><small>Valor por pessoa</small><b>{money(departure.price_cents)}</b></button>
            <button type="button" aria-pressed={room === "single"} className={room === "single" ? "selected" : ""} onClick={() => setRoom("single")}><strong>Quarto single</strong><small>Adicional de {money(departure.single_supplement_cents)}</small><b>{money(departure.price_cents + departure.single_supplement_cents)}</b></button>
          </fieldset>
          <fieldset><legend>Forma de pagamento</legend>
            {pixOpen && <button type="button" aria-pressed={payment === "pix"} className={payment === "pix" ? "selected" : ""} onClick={() => setPayment("pix")}><strong>Pix parcelado</strong><small>Entrada de 30% e saldo em até {terms.maxInstallments} parcelas</small><b>{money(Math.round(quote.price * 0.3))}</b></button>}
            <button type="button" aria-pressed={payment === "avista"} className={payment === "avista" ? "selected" : ""} onClick={() => setPayment("avista")}><strong>Pagamento à vista</strong><small>{departure.cash_discount_percent > 0 ? `Desconto de ${departure.cash_discount_percent}%` : "Pagamento integral"}</small><b>{money(Math.round(quote.price * (100 - departure.cash_discount_percent) / 100))}</b></button>
          </fieldset>
          {payment === "pix" && <fieldset><legend>Planeje o Pix</legend>
            {terms.fixedEntry ? <label>Vencimento da entrada<input value={paymentDateLabel(entryDate)} readOnly /></label> : <label>Data da entrada de 30%<input type="date" value={selectedEntry} min={today} max={terms.entryDeadline || terms.finalDue || departure.starts_on} required onChange={(event) => setEntry(event.target.value)} /></label>}
            <label>Parcelas do saldo<select value={count} onChange={(event) => setInstallments(Number(event.target.value))}>{Array.from({ length: maximum }, (_, i) => i + 1).map((n) => <option value={n} key={n}>{n} {n === 1 ? "parcela" : "parcelas"}</option>)}</select></label>
            {terms.finalDue && <small>Último vencimento até {paymentDateLabel(terms.finalDue)}.</small>}
            {maximum === 0 && <p role="alert">Escolha uma entrada anterior para que o saldo caiba no prazo do roteiro, ou selecione pagamento à vista.</p>}
          </fieldset>}
          {!completeForm && <button className="booking-submit" disabled={payment === "pix" && !count}>Continuar para cadastro completo</button>}
          {completeForm && <section className="traveler-details">
            <p className="booking-eyebrow">Ficha do viajante</p><h2>Cadastro completo</h2>
            <p className="booking-intro">Preencha os dados dos documentos que serão utilizados na viagem.</p>
            <fieldset><legend>Documentos</legend>
              <label>CPF<input name="cpf" required placeholder="000.000.000-00" /></label>
              <label>RG<input name="rg" required placeholder="Número do RG" /></label>
              <label>Passaporte<input name="passport" required placeholder="Número do passaporte" /></label>
            </fieldset>
            <fieldset><legend>Endereço</legend>
              <label>Rua e número<input name="street" required placeholder="Rua, número e complemento" /></label>
              <label>Bairro<input name="neighborhood" required placeholder="Seu bairro" /></label>
              <label>Cidade / UF<input name="city" required placeholder="Cidade - Estado" /></label>
              <label>CEP<input name="postalCode" required placeholder="00000-000" /></label>
            </fieldset>
            <fieldset><legend>Segurança e saúde</legend>
              <label>Nome do contato de segurança<input name="emergencyName" required placeholder="Nome completo" /></label>
              <label>Telefone do contato de segurança<input name="emergencyPhone" required placeholder="(00) 00000-0000" /></label>
              <label>Plano de saúde / seguro viagem<input name="healthPlan" required placeholder="Nome do plano ou seguro" /></label>
              <label>Telefone do plano de saúde / seguro<input name="healthPhone" required placeholder="Telefone de atendimento" /></label>
            </fieldset>
            <button className="booking-submit" disabled={saving || (payment === "pix" && !count)}>{saving ? "Enviando…" : "Finalizar inscrição"}</button>
            {saveError && <p role="alert" className="booking-success">{saveError}</p>}
          </section>}
        </section>
        <aside className="booking-summary">
          <p>Resumo da reserva</p><h2>{departure.trips.title}</h2>
          <div><span>Data</span><b>{dateRange}</b></div>
          <div><span>Hospedagem</span><b>Quarto {room}</b></div>
          <div><span>Valor do pacote</span><b>{money(quote.price)}</b></div>
          {quote.total < quote.price && <div><span>Desconto à vista</span><b>− {money(quote.price - quote.total)}</b></div>}
          {quote.schedule.map((row, i) => <div key={i}><span>{payment === "avista" ? "À vista" : i === 0 ? "Entrada (30%)" : `Parcela ${i}`}{row.due_on && ` · ${paymentDateLabel(row.due_on)}`}</span><b>{money(row.amount_cents)}</b></div>)}
          <hr /><strong>Total {money(quote.total)}</strong>
        </aside>
      </form>
    </main>
  );
}
