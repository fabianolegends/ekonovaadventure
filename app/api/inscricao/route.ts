import { NextResponse } from "next/server";

type BookingPayload = {
  name?: string;
  email?: string;
  room?: "duplo" | "single";
  payment?: "pix" | "avista";
  total?: number;
  entry?: number;
  installments?: number;
  installment?: number;
  entryDate?: string;
};

const usd = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

export async function POST(request: Request) {
  const booking = await request.json() as BookingPayload;
  if (!booking.email || !booking.name || !Number.isFinite(booking.total)) {
    return NextResponse.json({ error: "Dados de inscrição incompletos." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    return NextResponse.json({ error: "Serviço de e-mail ainda não configurado." }, { status: 503 });
  }
  const total = booking.total ?? 0;

  const paymentSummary = booking.payment === "avista"
    ? `Pagamento à vista: ${usd(total)}`
    : `Entrada Pix (30%): ${usd(booking.entry || 0)}<br/>Saldo: ${booking.installments}x de ${usd(booking.installment || 0)}`;
  const entryDate = booking.entryDate ? new Date(`${booking.entryDate}T12:00:00`).toLocaleDateString("pt-BR") : "a definir";
  const html = `<main style="font-family:Arial,sans-serif;color:#173e31;max-width:600px;margin:auto;padding:32px"><p style="color:#a97920;font-weight:bold;letter-spacing:1px">EKONOVA ADVENTURE</p><h1>Bem-vindo ao Andes Essencial, ${booking.name}.</h1><p>Recebemos sua pré-inscrição. A equipe Ekonova enviará o contrato para este e-mail.</p><section style="border:1px solid #d9ddd4;border-radius:10px;padding:22px;background:#f8f6ef"><h2 style="margin-top:0">Resumo da reserva</h2><p><strong>Roteiro:</strong> Andes Essencial - 10 a 17 de março de 2027</p><p><strong>Hospedagem:</strong> Quarto ${booking.room}</p><p><strong>Valor total:</strong> ${usd(total)}</p><p><strong>Entrada prevista:</strong> ${entryDate}</p><p>${paymentSummary}</p></section><p style="color:#63776d">Este e-mail é um resumo da sua inscrição e não substitui o contrato de viagem.</p></main>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [booking.email], subject: "Sua inscrição - Andes Essencial | Ekonova Adventure", html }),
  });
  if (!response.ok) {
    return NextResponse.json({ error: "Não foi possível enviar o resumo." }, { status: 502 });
  }
  return NextResponse.json({ sent: true });
}
