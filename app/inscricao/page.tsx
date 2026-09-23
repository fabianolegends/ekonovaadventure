"use client";

import { useMemo, useState } from "react";
import "./inscricao.css";

const base = 790000;
const format = (cents: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

export default function InscricaoPage() {
  const [room, setRoom] = useState<"duplo" | "single">("duplo");
  const [installments, setInstallments] = useState(3);
  const [entryDate, setEntryDate] = useState("");
  const [done, setDone] = useState(false);
  const total = base + (room === "single" ? 150000 : 0);
  const entry = Math.round(total * .3);
  const balance = total - entry;
  const installment = Math.ceil(balance / installments);
  const submit = (event: React.FormEvent) => { event.preventDefault(); setDone(true); };
  return <main className="booking-shell"><header><a href="/">Ekonova <span>Adventure</span></a><p>Inscrição de viagem</p></header><section className="booking-hero"><p>ANDES ESSENCIAL · 02–11 OUT 2026</p><h1>Uma jornada que começa antes do embarque.</h1><span>Chile e Argentina · trekking e cicloturismo</span></section><form onSubmit={submit} className="booking-layout"><section className="booking-card"><h2>Sua inscrição</h2><label>Nome completo<input required placeholder="Como consta no documento" /></label><label>E-mail<input type="email" required placeholder="voce@email.com" /></label><label>WhatsApp<input required placeholder="(00) 00000-0000" /></label><fieldset><legend>Hospedagem</legend><button type="button" className={room === "duplo" ? "selected" : ""} onClick={() => setRoom("duplo")}><strong>Quarto duplo</strong><small>Valor padrão do pacote</small><b>{format(base)}</b></button><button type="button" className={room === "single" ? "selected" : ""} onClick={() => setRoom("single")}><strong>Quarto single</strong><small>Mais privacidade durante a viagem</small><b>{format(total)}</b></button></fieldset><fieldset><legend>Pagamento</legend><label>Data para a entrada Pix de 30%<input type="date" value={entryDate} onChange={(event) => setEntryDate(event.target.value)} required /></label><label>Parcelas do saldo<select value={installments} onChange={(event) => setInstallments(Number(event.target.value))}>{[1,2,3,4,5,6].map((value) => <option key={value} value={value}>{value}x de {format(Math.ceil(balance / value))}</option>)}</select></label></fieldset><button className="booking-submit">Confirmar inscrição</button>{done && <p className="booking-success">Inscrição registrada. Você receberá o resumo e os próximos passos por e-mail.</p>}</section><aside className="booking-summary"><p>Resumo da reserva</p><h2>Andes Essencial</h2><div><span>Hospedagem</span><b>Quarto {room}</b></div><div><span>Valor da viagem</span><b>{format(total)}</b></div><div><span>Entrada Pix · 30%</span><b>{format(entry)}</b></div><div><span>Saldo parcelado</span><b>{installments}x de {format(installment)}</b></div><hr /><strong>Total {format(total)}</strong><small>{entryDate ? `Entrada em ${new Date(`${entryDate}T12:00:00`).toLocaleDateString("pt-BR")}` : "Escolha a data da entrada"}</small></aside></form></main>;
}
