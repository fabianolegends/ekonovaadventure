import { NextResponse } from "next/server";
import { listPublicDepartures, type PublicDeparture } from "../../../lib/public-departures";
import { availableInstallments, bookingQuote, brazilDate, paymentTerms, type BookingPayment, type BookingRoom } from "../../../lib/registration-payment";

type BookingPayload = {
  name?: string; email?: string; room?: BookingRoom; payment?: BookingPayment;
  installments?: number; entryDate?: string; slug?: string; departureId?: string;
  profile?: Record<string, string>;
};

export async function POST(request: Request) {
  const booking: BookingPayload | null = await request.json().catch(() => null);
  const name = typeof booking?.name === "string" ? booking.name.trim() : "";
  const email = typeof booking?.email === "string" ? booking.email.trim() : "";
  if (!booking?.slug || !name || !email || !["duplo", "single"].includes(booking.room ?? "") || !["pix", "avista"].includes(booking.payment ?? "")) {
    return NextResponse.json({ error: "Confira o roteiro, seus dados, a hospedagem e a forma de pagamento." }, { status: 400 });
  }
  let departures: PublicDeparture[];
  try {
    departures = (await listPublicDepartures()).filter((item) => item.trips.slug === booking.slug);
  } catch {
    return NextResponse.json({ error: "A gestão está temporariamente indisponível. Tente novamente." }, { status: 503 });
  }
  const departure = booking.departureId
    ? departures.find((item) => item.id === booking.departureId)
    : departures.length === 1 ? departures[0] : undefined;
  if (!departure) return NextResponse.json({ error: "Esta saída não está disponível. Abra novamente o link de inscrição." }, { status: 409 });

  const terms = paymentTerms(departure);
  const today = brazilDate();
  const payment = booking.payment!;
  const entryDate = terms.fixedEntry || (payment === "avista" ? today : booking.entryDate || "");
  const installments = payment === "pix" ? booking.installments ?? 0 : 0;
  if (payment === "pix") {
    const parsed = /^\d{4}-\d{2}-\d{2}$/.test(entryDate) ? new Date(`${entryDate}T12:00:00Z`) : null;
    const latestEntry = terms.entryDeadline || terms.finalDue || departure.starts_on;
    if (!parsed || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== entryDate ||
        (!terms.fixedEntry && (entryDate < today || entryDate > latestEntry)) ||
        (terms.fixedEntry && booking.entryDate && booking.entryDate !== terms.fixedEntry) ||
        !Number.isInteger(installments) || installments < 1 || installments > availableInstallments(departure, entryDate)) {
      return NextResponse.json({ error: "Confira a entrada e as parcelas disponíveis para esta saída." }, { status: 400 });
    }
  }
  const quote = bookingQuote(departure, booking.room!, payment, entryDate, installments);

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
    const profile = booking.profile || {};
    const clientData = {
      full_name: name, email, phone: profile.phone || null, city: profile.city || null,
      source: "inscricao_publica", whatsapp_opt_in: true,
      cpf: profile.cpf || null, rg: profile.rg || null, passport_number: profile.passport || null,
      street: profile.street || null, neighborhood: profile.neighborhood || null, postal_code: profile.postalCode || null,
      emergency_contact_name: profile.emergencyName || null, emergency_contact_phone: profile.emergencyPhone || null,
      health_plan: profile.healthPlan || null, health_plan_phone: profile.healthPhone || null,
    };
    const clientRows = await rest(`clients?email=eq.${encodeURIComponent(email)}&select=id`);
    if (clientRows[0]) {
      const existing = await rest(`reservations?client_id=eq.${clientRows[0].id}&departure_id=eq.${departure.id}&select=id&limit=1`);
      if (existing.length) return NextResponse.json({ error: "Já existe uma reserva para este viajante nesta saída. Consulte a equipe para alterá-la." }, { status: 409 });
    }
    const client = clientRows[0]
      ? (await rest(`clients?id=eq.${clientRows[0].id}`, { method: "PATCH", body: JSON.stringify(clientData) }))[0]
      : (await rest("clients", { method: "POST", body: JSON.stringify(clientData) }))[0];

    const reservationData = {
      client_id: client.id, departure_id: departure.id, party_size: 1, status: "reserva", quoted_price_cents: quote.total,
      room_type: booking.room, payment_plan: payment === "avista" ? `avista_${departure.cash_discount_percent}_desconto` : `pix_30_${installments}x`,
    };
    const reservation = (await rest("reservations?on_conflict=client_id,departure_id", {
      method: "POST", headers: { Prefer: "resolution=ignore-duplicates,return=representation" }, body: JSON.stringify(reservationData),
    }))[0];

    if (!reservation) return NextResponse.json({ error: "Já existe uma reserva para este viajante nesta saída. Consulte a equipe para alterá-la." }, { status: 409 });
    const paymentRows = quote.schedule.map((row, index) => ({
      ...row, reservation_id: reservation.id, method: "pix", status: "pendente",
      reference: `${departure.currency} - ${payment === "avista" ? "pagamento à vista" : index === 0 ? "entrada 30%" : `parcela ${index}`}`,
    }));
    try {
      await rest("payments", { method: "POST", body: JSON.stringify(paymentRows) });
    } catch (error) {
      // Uma resposta pode se perder depois de o banco gravar a programação.
      const saved = await rest(`payments?reservation_id=eq.${reservation.id}&select=id&limit=1`);
      if (!saved.length) {
        await rest(`reservations?id=eq.${reservation.id}`, { method: "DELETE" });
        throw error;
      }
    }

    return NextResponse.json({ saved: true });
  } catch {
    return NextResponse.json({ error: "Não foi possível salvar sua inscrição." }, { status: 500 });
  }
}
