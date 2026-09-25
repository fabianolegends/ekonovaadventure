import { NextResponse } from "next/server";

type BookingPayload = {
  name?: string; email?: string; room?: "duplo" | "single"; payment?: "pix" | "avista";
  total?: number; entry?: number; installments?: number; installment?: number; entryDate?: string;
  slug?: string;
  profile?: Record<string, string>;
};

const ROUTES = {
  "andes-essencial": { trip: { title: "Andes Essencial", slug: "andes-essencial", category: "Trekking", destination: "Mendoza, Argentina" }, departure: { starts_on: "2027-03-10", ends_on: "2027-03-17", capacity: 12, price_cents: 139900, single_supplement_cents: 30000, currency: "USD", public_registration_enabled: true } },
  "trekking-caminhos-do-ouro": { trip: { title: "Trekking Caminhos do Ouro", slug: "trekking-caminhos-do-ouro", category: "Trekking", destination: "Ouro Preto, Tiradentes e Lavras Novas, MG" }, departure: { starts_on: "2027-06-10", ends_on: "2027-06-17", capacity: 12, price_cents: 399900, single_supplement_cents: 70000, currency: "BRL", public_registration_enabled: true } },
  "biketour-caminhos-do-ouro": { trip: { title: "Biketour Caminhos do Ouro", slug: "biketour-caminhos-do-ouro", category: "Biketour", destination: "Ouro Preto e região, MG" }, departure: { starts_on: "2027-06-04", ends_on: "2027-06-10", capacity: 12, price_cents: 449900, single_supplement_cents: 70000, currency: "BRL", public_registration_enabled: true }, maxPixInstallments: 6, entryDeadline: "2026-12-05" },
  "trekking-atacama-essencia-2027": { trip: { title: "Trekking Atacama na sua Essência 2027", slug: "trekking-atacama-essencia-2027", category: "Trekking", destination: "San Pedro de Atacama, Chile" }, departure: { starts_on: "2027-09-16", ends_on: "2027-09-24", capacity: 12, price_cents: 179900, single_supplement_cents: 45000, currency: "USD", public_registration_enabled: true } },
} as const;

function addMonths(date: string, amount: number) {
  const result = new Date(`${date}T12:00:00`);
  result.setMonth(result.getMonth() + amount);
  return result.toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  const booking = await request.json() as BookingPayload;
  const route = ROUTES[booking.slug as keyof typeof ROUTES];
  const total = booking.total ?? 0;
  if (!route || !booking.email || !booking.name || !Number.isFinite(total)) {
    return NextResponse.json({ error: "Dados de inscrição incompletos." }, { status: 400 });
  }
  if (booking.payment === "pix") {
    if (!booking.entryDate) return NextResponse.json({ error: "Escolha a data da entrada." }, { status: 400 });
    if ("entryDeadline" in route && route.entryDeadline && booking.entryDate > route.entryDeadline) return NextResponse.json({ error: "Para o Biketour, a entrada deve ser agendada até 05/12/2026." }, { status: 400 });
    if ("maxPixInstallments" in route && route.maxPixInstallments && (!Number.isInteger(booking.installments) || (booking.installments ?? 0) < 1 || (booking.installments ?? 0) > route.maxPixInstallments)) return NextResponse.json({ error: "Para o Biketour, o saldo pode ser parcelado em até 6x." }, { status: 400 });
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
    const dueDate = booking.entryDate || new Date().toISOString().slice(0, 10);
    const tripRows = await rest(`trips?slug=eq.${route.trip.slug}&select=id`);
    const trip = tripRows[0] || (await rest("trips", { method: "POST", body: JSON.stringify(route.trip) }))[0];
    const departureRows = await rest(`departures?trip_id=eq.${trip.id}&starts_on=eq.${route.departure.starts_on}&select=id,public_registration_enabled`);
    const departure = departureRows[0] || (await rest("departures", { method: "POST", body: JSON.stringify({ ...route.departure, trip_id: trip.id, status: "em_formacao", booking_enabled: true, cash_discount_percent: 5, max_pix_installments: 6 }) }))[0];
    if (!departure.public_registration_enabled) return NextResponse.json({ error: "As inscrições para esta saída ainda não estão abertas." }, { status: 403 });

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
      ? [{ reservation_id: reservation.id, amount_cents: Math.round(total * 100), due_on: dueDate, method: "pix", status: "pendente", reference: `${route.departure.currency} - pagamento à vista` }]
      : [
          { reservation_id: reservation.id, amount_cents: Math.round((booking.entry || 0) * 100), due_on: dueDate, method: "pix", status: "pendente", reference: `${route.departure.currency} - entrada 30%` },
          ...Array.from({ length: booking.installments || 0 }, (_, index) => ({ reservation_id: reservation.id, amount_cents: Math.round((booking.installment || 0) * 100), due_on: addMonths(dueDate, index + 1), method: "pix", status: "pendente", reference: `${route.departure.currency} - parcela ${index + 1}` })),
        ];
    await rest("payments", { method: "POST", body: JSON.stringify(paymentRows) });

    return NextResponse.json({ saved: true });
  } catch {
    return NextResponse.json({ error: "Não foi possível salvar sua inscrição." }, { status: 500 });
  }
}
