"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./inscricao.css";

const ROUTES = {
  "andes-essencial": { title: "Andes Essencial", date: "10 a 17 de março de 2027", shortDate: "10–17 mar 2027", destination: "Mendoza, Argentina", hero: "Trekking, altitude e vinhos nos Andes.", description: "Andes Essencial: oito dias de montanha, cultura e gastronomia.", price: 1399, single: 300, currency: "USD", locale: "en-US", pix: "30% de entrada e saldo em Pix", finalDue: "", entryDeadline: "", finalPaymentDue: "", installments: 6 },
  "trekking-caminhos-do-ouro": { title: "Trekking Caminhos do Ouro", date: "10 a 17 de junho de 2027", shortDate: "10–17 jun 2027", destination: "Ouro Preto, Tiradentes e Lavras Novas, MG", hero: "Caminhe pela história e pelas montanhas de Minas.", description: "Oito dias de trekking, cultura e natureza pelos Caminhos do Ouro.", price: 3999, single: 700, currency: "BRL", locale: "pt-BR", pix: "30% de entrada e saldo em Pix", finalDue: "", entryDeadline: "", finalPaymentDue: "", installments: 6 },
  "biketour-caminhos-do-ouro": { title: "Biketour Caminhos do Ouro", date: "4 a 10 de junho de 2027", shortDate: "4–10 jun 2027", destination: "Ouro Preto e região, MG", hero: "Pedale por paisagens, história e cultura mineira.", description: "Sete dias de bike, natureza e experiências pelos Caminhos do Ouro.", price: 4499, single: 700, currency: "BRL", locale: "pt-BR", pix: "30% de entrada e saldo em Pix", finalDue: "", entryDeadline: "2026-12-05", finalPaymentDue: "", installments: 6 },
  "trekking-atacama-essencia-2027": { title: "Trekking Atacama na sua Essência 2027", date: "16 a 24 de setembro de 2027", shortDate: "16–24 set 2027", destination: "San Pedro de Atacama, Chile", hero: "Viva o deserto do Atacama na sua essência.", description: "Nove dias de trekking, cultura andina e paisagens únicas no norte do Chile.", price: 1799, single: 450, currency: "USD", locale: "en-US", pix: "30% de entrada e saldo em Pix, com última parcela até 45 dias antes da viagem", finalDue: "02 de agosto de 2027", entryDeadline: "2026-11-04", finalPaymentDue: "2027-08-02", installments: 10 },
} as const;

export default function InscricaoPage() {
  const pathname = usePathname();
  const slug = pathname.split("/").filter(Boolean).at(-1) || "andes-essencial";
  const route = ROUTES[slug as keyof typeof ROUTES] ?? ROUTES["andes-essencial"];
  const formatMoney = (value: number) => new Intl.NumberFormat(route.locale, { style: "currency", currency: route.currency, minimumFractionDigits: 2 }).format(value);
  const [room, setRoom] = useState<"duplo" | "single">("duplo");
  const [payment, setPayment] = useState<"pix" | "avista">("pix");
  const [installments, setInstallments] = useState(3);
  const [entryDate, setEntryDate] = useState("");
  const [done, setDone] = useState(false);
  const [completeForm, setCompleteForm] = useState(false);
  const [finalized, setFinalized] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const addMonths = (value: string, amount: number) => { const result = new Date(`${value}T12:00:00`); result.setMonth(result.getMonth() + amount); return result.toISOString().slice(0, 10); };
  const availableInstallments = !route.finalPaymentDue || !entryDate ? route.installments : Math.max(1, Math.min(route.installments, Array.from({ length: route.installments }, (_, index) => index + 1).filter((value) => addMonths(entryDate, value) <= route.finalPaymentDue).at(-1) ?? 1));

  const packagePrice = route.price + (room === "single" ? route.single : 0);
  const cashDiscount = payment === "avista" ? packagePrice * 0.05 : 0;
  const total = packagePrice - cashDiscount;
  const entry = payment === "pix" ? Math.round(total * 0.3 * 100) / 100 : total;
  const balance = Math.round((total - entry) * 100) / 100;
  const installment = Math.ceil((balance / installments) * 100) / 100;

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!completeForm) {
      setDone(true);
      setCompleteForm(true);
      return;
    }
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") || "");
    setSaveError("");
    try {
      const response = await fetch("/api/inscricao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("fullName"),
          email,
          room,
          payment,
          total,
          entry,
          installments,
          installment,
          entryDate,
          slug,
          profile: Object.fromEntries(data.entries()) as Record<string, string>,
        }),
      });
      const result = await response.json().catch(() => null) as { error?: string } | null;
      if (!response.ok) throw new Error(result?.error || "Não foi possível concluir o cadastro agora.");
      setSubmittedEmail(email);
      setFinalized(true);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Não foi possível concluir o cadastro agora. Tente novamente.");
    }
  };

  if (finalized) {
    return <main className="welcome-shell"><section className="welcome-card"><p className="booking-eyebrow">INSCRIÇÃO RECEBIDA</p><h1>Cadastro preenchido com sucesso.</h1><p>Bem-vindo ao {route.title}. A equipe Ekonova entrará em contato com os próximos passos.</p><Link href={`/minha-area?email=${encodeURIComponent(submittedEmail)}`}>Criar acesso à minha área</Link><Link href="/">Voltar para a Ekonova Adventure</Link></section></main>;
  }

  return (
    <main className="booking-shell">
      <header><Link className="booking-logo" href="/"><Image src="/ekonova-logo.png" alt="Ekonova Adventure" width={204} height={75} priority /></Link><p>Inscrição de viagem</p></header>
      <section className="booking-hero">
        <p>{route.date.toUpperCase()} · {route.destination.toUpperCase()}</p>
        <h1>{route.hero}</h1>
        <span>{route.description}</span>
      </section>
      <form onSubmit={submit} className="booking-layout">
        <section className="booking-card">
          <p className="booking-eyebrow">PRÉ-INSCRIÇÃO</p><h2>Reserve sua vaga</h2>
          <p className="booking-intro">Preencha seus dados. Na próxima etapa, você conclui sua ficha completa de viajante e recebe o resumo da reserva.</p>
          <label>Nome completo<input name="fullName" required placeholder="Como consta no documento" /></label>
          <label>E-mail<input name="email" type="email" required placeholder="voce@email.com" /></label>
          <label>WhatsApp<input name="phone" required placeholder="(00) 00000-0000" /></label>
          <fieldset><legend>Hospedagem</legend>
            <button type="button" className={room === "duplo" ? "selected" : ""} onClick={() => setRoom("duplo")}><strong>Quarto duplo</strong><small>Valor padrão do pacote, por pessoa</small><b>{formatMoney(route.price)}</b></button>
            <button type="button" className={room === "single" ? "selected" : ""} onClick={() => setRoom("single")}><strong>Quarto single</strong><small>Hospedagem solo: adicional de {formatMoney(route.single)}</small><b>{formatMoney(route.price + route.single)}</b></button>
          </fieldset>
          <fieldset><legend>Forma de pagamento</legend>
            <button type="button" className={payment === "pix" ? "selected" : ""} onClick={() => setPayment("pix")}><strong>Pix parcelado</strong><small>{route.pix}</small><b>30% · {formatMoney(entry)}</b></button>
            <button type="button" className={payment === "avista" ? "selected" : ""} onClick={() => setPayment("avista")}><strong>Pagamento à vista</strong><small>Desconto de 5% sobre o valor do pacote</small><b>{formatMoney(packagePrice * 0.95)}</b></button>
          </fieldset>
          {payment === "pix" && <fieldset><legend>Planeje o Pix</legend>
            <label>Data desejada para a entrada de 30%<input type="date" value={entryDate} onChange={(event) => { const value = event.target.value; setEntryDate(value); if (route.finalPaymentDue) { const allowed = Math.max(1, Math.min(route.installments, Array.from({ length: route.installments }, (_, index) => index + 1).filter((count) => addMonths(value, count) <= route.finalPaymentDue).at(-1) ?? 1)); if (installments > allowed) setInstallments(allowed); } }} max={route.entryDeadline || undefined} required />{route.entryDeadline && <small>Entrada até {new Date(`${route.entryDeadline}T12:00:00`).toLocaleDateString("pt-BR")}.</small>}</label>
            <label>Parcelas do saldo<select value={Math.min(installments, availableInstallments)} onChange={(event) => setInstallments(Number(event.target.value))}>{Array.from({ length: availableInstallments }, (_, index) => index + 1).map((value) => <option key={value} value={value}>{value}x de {formatMoney(Math.ceil((balance / value) * 100) / 100)}</option>)}</select>{route.finalPaymentDue && <small>A última parcela será até {new Date(`${route.finalPaymentDue}T12:00:00`).toLocaleDateString("pt-BR")}.</small>}</label>
          </fieldset>}
          <button className="booking-submit">Continuar para cadastro completo</button>
          {done && <p className="booking-success">Agora complete sua ficha de viajante abaixo. Esses dados serão usados para a room list e a operação da viagem.</p>}

          {completeForm && <section className="traveler-details">
            <p className="booking-eyebrow">FICHA DO VIAJANTE</p>
            <h2>Cadastro completo</h2>
            <p className="booking-intro">Preencha exatamente como consta nos documentos que serão utilizados na viagem.</p>
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
            <button className="booking-submit">Finalizar cadastro do viajante</button>
            {saveError && <p className="booking-success">{saveError}</p>}
          </section>}
        </section>
        <aside className="booking-summary">
          <p>Resumo da reserva</p><h2>{route.title}</h2>
          <div><span>Data</span><b>{route.shortDate}</b></div><div><span>Hospedagem</span><b>Quarto {room}</b></div><div><span>Valor do pacote</span><b>{formatMoney(packagePrice)}</b></div>
          {cashDiscount > 0 && <div><span>Desconto à vista</span><b>- {formatMoney(cashDiscount)}</b></div>}
          {payment === "pix" ? <><div><span>Entrada Pix - 30%</span><b>{formatMoney(entry)}</b></div><div><span>Saldo parcelado</span><b>{installments}x de {formatMoney(installment)}</b></div></> : <div><span>Pagamento</span><b>À vista</b></div>}
          <hr /><strong>Total {formatMoney(total)}</strong>
          <small>{payment === "pix" ? (entryDate ? `Entrada prevista para ${new Date(`${entryDate}T12:00:00`).toLocaleDateString("pt-BR")}` : "Escolha a data da entrada") : "Desconto de 5% aplicado"}</small>
          <p className="booking-note">Não incluso: passagens aéreas, refeições não indicadas, bebidas e serviços não citados no roteiro.</p>
        </aside>
      </form>
    </main>
  );
}
