import { NextResponse } from "next/server";

type BookingPayload = {
  name?: string; email?: string; room?: "duplo" | "single"; payment?: "pix" | "avista";
  total?: number; entry?: number; installments?: number; installment?: number; entryDate?: string;
  profile?: Record<string, string>;
};

const TRIP = { title: "Andes Essencial", slug: "andes-essencial", category: "Trekking", destination: "Mendoza, Argentina" };
const DEPARTURE = { starts_on: "2027-03-10", ends_on: "2027-03-17", capacity: 12, price_cents: 139900, status: "em_formacao", notes: "Valores em USD" };
const usd = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

function addMonths(date: string, amount: number) {
  const result = new Date(`${date}T12:00:00`);
  result.setMonth(result.getMonth() + amount);
  return result.toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  const booking = await request.json() as BookingPayload;
  const total = booking.total ?? 0;
  if (!booking.email || !booking.name || !booking.entryDate || !Number.isFinite(total)) {
    return NextResponse.json({ error: "Dados de inscrição incompletos." }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Banco de dados ainda não configurado." }, { status: 503 });
  }

  const rest = async (path: string, init: RequestInit = {}) => {
    const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
      ...init,
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json", Prefer: "return=representation", ...init.headers },
    });
    if (!response.ok) throw new Error(await response.text());
    return response.status === 204 ? [] : response.json();
  };

  try {
    const tripRows = await rest(`trips?slug=eq.${TRIP.slug}&select=id`);
    const trip = tripRows[0] || (await rest("trips", { method: "POST", body: JSON.stringify(TRIP) }))[0];
    const departureRows = await rest(`departures?trip_id=eq.${trip.id}&starts_on=eq.${DEPARTURE.starts_on}&select=id`);
    const departure = departureRows[0] || (await rest("departures", { method: "POST", body: JSON.stringify({ ...DEPARTURE, trip_id: trip.id }) }))[0];

    const profile = booking.profile || {};
    const clientData = {
      full_name: booking.name, email: booking.email, phone: profile.phone || null, city: profile.city || null,
      source: "inscricao_publica", whatsapp_opt_in: true,
      cpf: profile.cpf || null, rg: profile.rg || null, passport_number: profile.passport || null,
      street: profile.street || null, neighborhood: profile.neighborhood || null, postal_code: profile.postalCode || null,
      emergency_contact_name: profile.emergencyName || null, emergency_contact_phone: profile.emergencyPhone || null,
      health_plan: profile.healthPlan || null, health_plan_phone: profile.healthPhone || null,
    };
    const clientRows = await rest(`clients?email=eq.${encodeURIComponent(booking.email)}&select=id`);
    const client = clientRows[0]
      ? (await rest(`clients?id=eq.${clientRows[0].id}`, { method: "PATCH", body: JSON.stringify(clientData) }))[0]
      : (await rest("clients", { method: "POST", body: JSON.stringify(clientData) }))[0];

    const reservationData = {
      client_id: client.id, departure_id: departure.id, party_size: 1, status: "reserva", quoted_price_cents: Math.round(total * 100),
      room_type: booking.room, payment_plan: booking.payment === "avista" ? "avista_5_desconto" : `pix_30_${booking.installments}x`,
    };
    const reservation = (await rest("reservations?on_conflict=client_id,departure_id", {
      method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=representation" }, body: JSON.stringify(reservationData),
    }))[0];

    await rest(`payments?reservation_id=eq.${reservation.id}`, { method: "DELETE", headers: { Prefer: "return=minimal" } });
    const paymentRows = booking.payment === "avista"
      ? [{ reservation_id: reservation.id, amount_cents: Math.round(total * 100), due_on: booking.entryDate, method: "pix", status: "pendente", reference: "USD - pagamento à vista" }]
      : [
          { reservation_id: reservation.id, amount_cents: Math.round((booking.entry || 0) * 100), due_on: booking.entryDate, method: "pix", status: "pendente", reference: "USD - entrada 30%" },
          ...Array.from({ length: booking.installments || 0 }, (_, index) => ({ reservation_id: reservation.id, amount_cents: Math.round((booking.installment || 0) * 100), due_on: addMonths(booking.entryDate!, index + 1), method: "pix", status: "pendente", reference: `USD - parcela ${index + 1}` })),
        ];
    await rest("payments", { method: "POST", body: JSON.stringify(paymentRows) });

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;
    let emailSent = false;
    if (apiKey && from) {
      const paymentSummary = booking.payment === "avista" ? `Pagamento à vista: ${usd(total)}` : `Entrada Pix (30%): ${usd(booking.entry || 0)}<br/>Saldo: ${booking.installments}x de ${usd(booking.installment || 0)}`;
      const entryDate = new Date(`${booking.entryDate}T12:00:00`).toLocaleDateString("pt-BR");
      const html = `<main style="font-family:Arial,sans-serif;color:#173e31;max-width:600px;margin:auto;padding:32px"><p style="color:#a97920;font-weight:bold;letter-spacing:1px">EKONOVA ADVENTURE</p><h1>Bem-vindo ao Andes Essencial, ${booking.name}.</h1><p>Recebemos sua inscrição. A equipe Ekonova enviará o contrato para este e-mail.</p><section style="border:1px solid #d9ddd4;border-radius:10px;padding:22px;background:#f8f6ef"><h2 style="margin-top:0">Resumo da reserva</h2><p><strong>Hospedagem:</strong> Quarto ${booking.room}</p><p><strong>Valor total:</strong> ${usd(total)}</p><p><strong>Entrada prevista:</strong> ${entryDate}</p><p>${paymentSummary}</p></section></main>`;
      const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to: [booking.email], subject: "Sua inscrição - Andes Essencial | Ekonova Adventure", html }) });
      emailSent = response.ok;
    }
    return NextResponse.json({ saved: true, emailSent });
  } catch {
    return NextResponse.json({ error: "Não foi possível salvar sua inscrição." }, { status: 500 });
  }
}
