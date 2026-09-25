"use client";

type Session = { access_token: string; refresh_token: string; user: { id: string; email?: string } };
export type ClientRecord = { id: string; full_name: string; email: string | null; phone: string | null; city: string | null; cpf: string | null; rg: string | null; passport_number: string | null; street: string | null; neighborhood: string | null; postal_code: string | null; emergency_contact_name: string | null; emergency_contact_phone: string | null; health_plan: string | null; health_plan_phone: string | null; created_at: string };
export type PaymentRecord = { id: string; reservation_id: string; amount_cents: number; due_on: string; paid_on: string | null; status: string; reference: string | null; reservations: { departure_id: string; status: string; clients: { id: string; full_name: string } | null; departures: { currency: "USD" | "BRL"; trips: { title: string } | null } | null } | null };
export type ReservationRecord = { id: string; departure_id: string; room_type: "duplo" | "single" | null; status: string; payment_plan: string | null; created_at: string; clients: { id: string; full_name: string; email: string | null; phone: string | null; city: string | null; state: string | null; street: string | null; neighborhood: string | null; postal_code: string | null; cpf: string | null; rg: string | null; passport_number: string | null; emergency_contact_name: string | null; emergency_contact_phone: string | null; health_plan: string | null; health_plan_phone: string | null } | null };
export type RoomGroupRecord = { id: string; departure_id: string; label: string; room_type: "matrimonial" | "twin" | "single"; notes: string | null; room_group_members: { reservation_id: string }[] };
export type ContactLogRecord = { id: string; client_id: string; channel: string; template_name: string; message: string; created_at: string; clients: { full_name: string } | null };
export type DepartureCostRecord = { id: string; departure_id: string; cost_on: string; category: string; description: string; supplier: string | null; cost_basis: "por_viajante" | "grupo"; planned_quantity: number; planned_unit_cents: number; actual_quantity: number | null; actual_unit_cents: number | null; currency: "USD" | "BRL"; notes: string | null; created_at: string };
export type TeamMemberRecord = { id: string; full_name: string; role: string; active: boolean; avatar_url: string | null };\nexport type DepartureRecord = { id: string; starts_on: string; ends_on: string; capacity: number; price_cents: number; status: string; notes: string | null; single_supplement_cents: number; max_pix_installments: number; booking_enabled: boolean; currency: "USD" | "BRL"; cash_discount_percent: number; pix_final_due_on: string | null; card_max_installments: number | null; public_registration_enabled: boolean; cost_reporting_currency: "USD" | "BRL"; cost_exchange_rate: number; target_margin_percent: number; target_profit_cents: number; trips: { title: string; slug: string; category: string; destination: string } | null };

const storageKey = "ekonova-management-session";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabaseConfigured = Boolean(url && key);

function endpoint(path: string) {
  if (!url || !key) throw new Error("Supabase ainda não foi configurado.");
  return `${url.replace(/\/$/, "")}${path}`;
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(window.localStorage.getItem(storageKey) ?? "null") as Session | null; } catch { return null; }
}

async function getValidSession(): Promise<Session | null> {
  const current = getSession();
  if (!current) return null;

  try {
    const encodedPayload = current.access_token.split(".")[1];
    const payload = JSON.parse(atob(encodedPayload.replace(/-/g, "+").replace(/_/g, "/"))) as { exp?: number };
    // Renova com antecedência para que a gestão não fique vazia quando a aba
    // permanece aberta por algum tempo.
    if (!payload.exp || payload.exp * 1000 > Date.now() + 60_000) return current;
  } catch {
    return current;
  }

  const response = await fetch(endpoint("/auth/v1/token?grant_type=refresh_token"), {
    method: "POST",
    headers: { apikey: key!, "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: current.refresh_token }),
  });
  const refreshed = await response.json() as Partial<Session> & { error_description?: string; msg?: string };
  if (!response.ok || !refreshed.access_token || !refreshed.refresh_token) {
    signOut();
    throw new Error(refreshed.error_description ?? refreshed.msg ?? "Sua sessão expirou. Entre novamente.");
  }

  const session: Session = {
    ...current,
    ...refreshed,
    user: refreshed.user ?? current.user,
  };
  window.localStorage.setItem(storageKey, JSON.stringify(session));
  return session;
}

export function signOut() {
  if (typeof window !== "undefined") window.localStorage.removeItem(storageKey);
}

export async function signInWithPassword(email: string, password: string) {
  const response = await fetch(endpoint("/auth/v1/token?grant_type=password"), {
    method: "POST",
    headers: { apikey: key!, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const payload = await response.json() as Session & { error_description?: string; msg?: string };
  if (!response.ok || !payload.access_token) throw new Error(payload.error_description ?? payload.msg ?? "Não foi possível entrar.");
  window.localStorage.setItem(storageKey, JSON.stringify(payload));
  return payload;
}

export async function requestPasswordReset(email: string) {
  const response = await fetch(endpoint("/auth/v1/recover"), {
    method: "POST",
    headers: { apikey: key!, "Content-Type": "application/json" },
    body: JSON.stringify({ email, redirect_to: "https://www.ekonovaadv.com.br/gestao/login" }),
  });
  if (!response.ok) throw new Error("Não foi possível enviar o e-mail de recuperação.");
}

export async function updatePassword(accessToken: string, password: string) {
  const response = await fetch(endpoint("/auth/v1/user"), {
    method: "PUT",
    headers: { apikey: key!, Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  const payload = await response.json() as Session & { message?: string };
  if (!response.ok) throw new Error(payload.message ?? "Não foi possível definir a nova senha.");
  return payload;
}

export async function getMyProfile() {
  const session = await getValidSession(); if (!session) throw new Error("Sua sessão expirou. Entre novamente.");
  const response = await fetch(endpoint(`/rest/v1/team_members?id=eq.${encodeURIComponent(session.user.id)}&select=id,full_name,role,active,avatar_url`), { headers: { apikey: key!, Authorization: `Bearer ${session.access_token}` } });
  const payload = await response.json() as TeamMemberRecord[] & { message?: string };
  if (!response.ok) throw new Error(payload.message ?? "Não foi possível carregar o perfil.");
  return payload[0] ?? null;
}

export async function updateMyProfile(input: Pick<TeamMemberRecord, "full_name" | "avatar_url">) {
  const session = await getValidSession(); if (!session) throw new Error("Sua sessão expirou. Entre novamente.");
  const response = await fetch(endpoint(`/rest/v1/team_members?id=eq.${encodeURIComponent(session.user.id)}`), { method: "PATCH", headers: { apikey: key!, Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify(input) });
  const payload = await response.json() as TeamMemberRecord[] & { message?: string };
  if (!response.ok || !payload[0]) throw new Error(payload.message ?? "Não foi possível atualizar o perfil.");
  return payload[0];
}

export async function uploadProfilePhoto(file: File) {
  const session = await getValidSession(); if (!session) throw new Error("Sua sessão expirou. Entre novamente.");
  if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) throw new Error("Escolha uma imagem de até 5 MB.");
  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${session.user.id}/perfil.${extension}`;
  const response = await fetch(endpoint(`/storage/v1/object/team-avatars/${path}`), { method: "POST", headers: { apikey: key!, Authorization: `Bearer ${session.access_token}`, "Content-Type": file.type, "x-upsert": "true" }, body: file });
  if (!response.ok) throw new Error("Não foi possível enviar a foto agora.");
  return endpoint(`/storage/v1/object/public/team-avatars/${path}?v=${Date.now()}`);
}

export async function listClients() {
  const session = await getValidSession();
  if (!session) throw new Error("Sua sessão expirou. Entre novamente.");
  const response = await fetch(endpoint("/rest/v1/clients?select=*&order=created_at.desc"), {
    headers: { apikey: key!, Authorization: `Bearer ${session.access_token}` },
  });
  const payload = await response.json() as ClientRecord[] & { message?: string };
  if (!response.ok) throw new Error(payload.message ?? "Não foi possível carregar os clientes.");
  return payload as ClientRecord[];
}

export async function createClient(input: Omit<ClientRecord, "id" | "created_at">) {
  const session = await getValidSession(); if (!session) throw new Error("Sua sessão expirou. Entre novamente.");
  const response = await fetch(endpoint("/rest/v1/clients"), { method: "POST", headers: { apikey: key!, Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify(input) });
  const payload = await response.json() as ClientRecord[] & { message?: string };
  if (!response.ok) throw new Error(payload.message ?? "Não foi possível cadastrar o cliente.");
  return payload[0] as ClientRecord;
}

export async function updateClient(clientId: string, input: Omit<ClientRecord, "id" | "created_at">) {
  const session = await getValidSession(); if (!session) throw new Error("Sua sessão expirou. Entre novamente.");
  const response = await fetch(endpoint(`/rest/v1/clients?id=eq.${encodeURIComponent(clientId)}`), { method: "PATCH", headers: { apikey: key!, Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify(input) });
  const payload = await response.json() as ClientRecord[] & { message?: string };
  if (!response.ok) throw new Error(payload.message ?? "Não foi possível atualizar o cadastro.");
  return payload[0] as ClientRecord;
}

export async function deleteReservation(reservationId: string) {
  const session = await getValidSession();
  if (!session) throw new Error("Sua sessão expirou. Entre novamente.");
  const response = await fetch(endpoint(`/rest/v1/reservations?id=eq.${encodeURIComponent(reservationId)}`), {
    method: "DELETE",
    headers: { apikey: key!, Authorization: `Bearer ${session.access_token}`, Prefer: "return=minimal" },
  });
  if (!response.ok) throw new Error("Não foi possível excluir a inscrição.");
}

export async function deleteClientWithReservations(clientId: string) {
  const session = await getValidSession();
  if (!session) throw new Error("Sua sessão expirou. Entre novamente.");
  const headers = { apikey: key!, Authorization: `Bearer ${session.access_token}`, Prefer: "return=minimal" };
  const reservations = await fetch(endpoint(`/rest/v1/reservations?client_id=eq.${encodeURIComponent(clientId)}`), { method: "DELETE", headers });
  if (!reservations.ok) throw new Error("Não foi possível excluir as inscrições do cliente.");
  const client = await fetch(endpoint(`/rest/v1/clients?id=eq.${encodeURIComponent(clientId)}`), { method: "DELETE", headers });
  if (!client.ok) throw new Error("Não foi possível excluir o cadastro do cliente.");
}

export async function listPayments() {
  const session = await getValidSession(); if (!session) throw new Error("Sua sessão expirou. Entre novamente.");
  const response = await fetch(endpoint("/rest/v1/payments?select=id,reservation_id,amount_cents,due_on,paid_on,status,reference,reservations(departure_id,status,clients(id,full_name),departures(currency,trips(title)))&order=due_on.asc"), { headers: { apikey: key!, Authorization: `Bearer ${session.access_token}` } });
  const payload = await response.json() as PaymentRecord[] & { message?: string };
  if (!response.ok) throw new Error(payload.message ?? "Não foi possível carregar os pagamentos.");
  return payload as PaymentRecord[];
}

export async function markPaymentAsPaid(paymentId: string) {
  const session = await getValidSession(); if (!session) throw new Error("Sua sessão expirou. Entre novamente.");
  const response = await fetch(endpoint(`/rest/v1/payments?id=eq.${encodeURIComponent(paymentId)}`), { method: "PATCH", headers: { apikey: key!, Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify({ status: "pago", paid_on: new Date().toISOString().slice(0, 10) }) });
  const payload = await response.json() as PaymentRecord[] & { message?: string };
  if (!response.ok) throw new Error(payload.message ?? "Não foi possível confirmar o pagamento.");
  return payload[0] as PaymentRecord;
}

export async function replacePendingPaymentPlan(input: { reservationId: string; totalCents: number; entranceCents: number; installments: number; firstDueOn: string; currency: "USD" | "BRL" }) {
  const session = await getValidSession(); if (!session) throw new Error("Sua sessão expirou. Entre novamente.");
  const { reservationId, totalCents, entranceCents, installments, firstDueOn, currency } = input;
  if (!reservationId || !firstDueOn || !Number.isInteger(totalCents) || !Number.isInteger(entranceCents) || !Number.isInteger(installments) || totalCents <= 0 || entranceCents < 0 || entranceCents > totalCents || installments < 0) throw new Error("Revise os dados da condição especial.");
  const remaining = totalCents - entranceCents;
  if ((remaining > 0 && installments === 0) || (remaining === 0 && installments > 0)) throw new Error("Defina parcelas compatíveis com o saldo restante.");
  const headers = { apikey: key!, Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" };
  const currentResponse = await fetch(endpoint(`/rest/v1/payments?reservation_id=eq.${encodeURIComponent(reservationId)}&select=id,status`), { headers });
  const current = await currentResponse.json() as { id: string; status: string }[] & { message?: string };
  if (!currentResponse.ok) throw new Error(current.message ?? "Não foi possível validar os pagamentos.");
  if (current.some((payment) => payment.status === "pago")) throw new Error("Não é possível alterar a condição após um pagamento confirmado.");
  const deleteResponse = await fetch(endpoint(`/rest/v1/payments?reservation_id=eq.${encodeURIComponent(reservationId)}&status=eq.pendente`), { method: "DELETE", headers });
  if (!deleteResponse.ok) throw new Error("Não foi possível atualizar as cobranças pendentes.");
  const addMonths = (date: string, months: number) => { const item = new Date(`${date}T12:00:00`); item.setMonth(item.getMonth() + months); return item.toISOString().slice(0, 10); };
  const rows: { reservation_id: string; amount_cents: number; due_on: string; status: string; method: string; reference: string }[] = [];
  if (entranceCents > 0) rows.push({ reservation_id: reservationId, amount_cents: entranceCents, due_on: firstDueOn, status: "pendente", method: "pix", reference: `${currency} · condição especial · entrada` });
  if (installments > 0) { const base = Math.floor(remaining / installments); for (let index = 0; index < installments; index += 1) rows.push({ reservation_id: reservationId, amount_cents: index === installments - 1 ? remaining - base * (installments - 1) : base, due_on: addMonths(firstDueOn, index + 1), status: "pendente", method: "pix", reference: `${currency} · condição especial · parcela ${index + 1}` }); }
  const createResponse = await fetch(endpoint("/rest/v1/payments"), { method: "POST", headers: { ...headers, Prefer: "return=representation" }, body: JSON.stringify(rows) });
  const created = await createResponse.json() as { message?: string };
  if (!createResponse.ok) throw new Error(created.message ?? "Não foi possível criar a nova condição.");
}

export async function listReservations() {
  const session = await getValidSession();
  if (!session) throw new Error("Sua sessão expirou. Entre novamente.");
  const response = await fetch(endpoint("/rest/v1/reservations?select=id,departure_id,room_type,status,payment_plan,created_at,clients(id,full_name,email,phone,city,state,street,neighborhood,postal_code,cpf,rg,passport_number,emergency_contact_name,emergency_contact_phone,health_plan,health_plan_phone)&order=created_at.desc"), { headers: { apikey: key!, Authorization: `Bearer ${session.access_token}` } });
  const payload = await response.json() as ReservationRecord[] & { message?: string };
  if (!response.ok) throw new Error(payload.message ?? "Não foi possível carregar as reservas.");
  return payload as ReservationRecord[];
}

export async function listDepartures() {
  const session = await getValidSession();
  if (!session) throw new Error("Sua sessão expirou. Entre novamente.");
  const fields = "id,starts_on,ends_on,capacity,price_cents,status,notes,single_supplement_cents,max_pix_installments,booking_enabled,currency,cash_discount_percent,pix_final_due_on,card_max_installments,public_registration_enabled,cost_reporting_currency,cost_exchange_rate,target_margin_percent,target_profit_cents,trips(title,slug,category,destination)";
  const response = await fetch(endpoint(`/rest/v1/departures?select=${encodeURIComponent(fields)}&order=starts_on.asc`), { headers: { apikey: key!, Authorization: `Bearer ${session.access_token}` } });
  const payload = await response.json() as DepartureRecord[] & { message?: string };
  if (!response.ok) throw new Error(payload.message ?? "Não foi possível carregar as saídas.");
  return payload as DepartureRecord[];
}

export async function listRoomGroups(departureId: string) {
  const session = await getValidSession(); if (!session) throw new Error("Sua sessão expirou. Entre novamente.");
  const response = await fetch(endpoint(`/rest/v1/room_groups?departure_id=eq.${encodeURIComponent(departureId)}&select=id,departure_id,label,room_type,notes,room_group_members(reservation_id)&order=created_at.asc`), { headers: { apikey: key!, Authorization: `Bearer ${session.access_token}` } });
  const payload = await response.json() as RoomGroupRecord[] & { message?: string };
  if (!response.ok) throw new Error(payload.message ?? "Não foi possível carregar os quartos.");
  return payload as RoomGroupRecord[];
}

export async function createRoomGroup(input: Pick<RoomGroupRecord, "departure_id" | "label" | "room_type">) {
  const session = await getValidSession(); if (!session) throw new Error("Sua sessão expirou. Entre novamente.");
  const response = await fetch(endpoint("/rest/v1/room_groups"), { method: "POST", headers: { apikey: key!, Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify(input) });
  const payload = await response.json() as RoomGroupRecord[] & { message?: string };
  if (!response.ok) throw new Error(payload.message ?? "Não foi possível criar o quarto.");
  return payload[0] as RoomGroupRecord;
}

export async function assignReservationToRoom(reservationId: string, roomGroupId: string) {
  const session = await getValidSession(); if (!session) throw new Error("Sua sessão expirou. Entre novamente.");
  const headers = { apikey: key!, Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" };
  const remove = await fetch(endpoint(`/rest/v1/room_group_members?reservation_id=eq.${encodeURIComponent(reservationId)}`), { method: "DELETE", headers });
  if (!remove.ok) throw new Error("Não foi possível atualizar a alocação anterior.");
  const response = await fetch(endpoint("/rest/v1/room_group_members"), { method: "POST", headers, body: JSON.stringify({ reservation_id: reservationId, room_group_id: roomGroupId }) });
  if (!response.ok) { const payload = await response.json() as { message?: string }; throw new Error(payload.message ?? "Não foi possível alocar o viajante."); }
}

export async function listContactLogs() {
  const session = await getValidSession(); if (!session) throw new Error("Sua sessão expirou. Entre novamente.");
  const response = await fetch(endpoint("/rest/v1/client_contact_logs?select=id,client_id,channel,template_name,message,created_at,clients(full_name)&order=created_at.desc&limit=8"), { headers: { apikey: key!, Authorization: `Bearer ${session.access_token}` } });
  const payload = await response.json() as ContactLogRecord[] & { message?: string };
  if (!response.ok) throw new Error(payload.message ?? "Não foi possível carregar o histórico de contatos.");
  return payload as ContactLogRecord[];
}

export async function listDepartureCosts(departureId: string) {
  const session = await getValidSession(); if (!session) throw new Error("Sua sessão expirou. Entre novamente.");
  const response = await fetch(endpoint(`/rest/v1/departure_costs?departure_id=eq.${encodeURIComponent(departureId)}&select=*&order=category.asc,created_at.asc`), { headers: { apikey: key!, Authorization: `Bearer ${session.access_token}` } });
  const payload = await response.json() as DepartureCostRecord[] & { message?: string };
  if (!response.ok) throw new Error(payload.message ?? "Não foi possível carregar os custos deste roteiro.");
  return payload as DepartureCostRecord[];
}

export async function createDepartureCost(input: Omit<DepartureCostRecord, "id" | "created_at" | "actual_quantity" | "actual_unit_cents">) {
  const session = await getValidSession(); if (!session) throw new Error("Sua sessão expirou. Entre novamente.");
  const response = await fetch(endpoint("/rest/v1/departure_costs"), { method: "POST", headers: { apikey: key!, Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify(input) });
  const payload = await response.json() as DepartureCostRecord[] & { message?: string };
  if (!response.ok) throw new Error(payload.message ?? "Não foi possível registrar a despesa.");
  return payload[0] as DepartureCostRecord;
}

export async function updateDepartureCostActual(costId: string, input: Pick<DepartureCostRecord, "actual_quantity" | "actual_unit_cents">) {
  const session = await getValidSession(); if (!session) throw new Error("Sua sessão expirou. Entre novamente.");
  const response = await fetch(endpoint(`/rest/v1/departure_costs?id=eq.${encodeURIComponent(costId)}`), { method: "PATCH", headers: { apikey: key!, Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify(input) });
  const payload = await response.json() as DepartureCostRecord[] & { message?: string };
  if (!response.ok) throw new Error(payload.message ?? "Não foi possível atualizar o custo realizado.");
  return payload[0] as DepartureCostRecord;
}

export async function updateDepartureCostSettings(departureId: string, input: Pick<DepartureRecord, "cost_reporting_currency" | "cost_exchange_rate" | "target_margin_percent" | "target_profit_cents">) {
  const session = await getValidSession(); if (!session) throw new Error("Sua sessão expirou. Entre novamente.");
  const response = await fetch(endpoint(`/rest/v1/departures?id=eq.${encodeURIComponent(departureId)}`), { method: "PATCH", headers: { apikey: key!, Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify(input) });
  const payload = await response.json() as DepartureRecord[] & { message?: string };
  if (!response.ok) throw new Error(payload.message ?? "Não foi possível atualizar as definições de precificação.");
  return payload[0] as DepartureRecord;
}

export async function updateDepartureCapacity(departureId: string, capacity: number) {
  const session = await getValidSession(); if (!session) throw new Error("Sua sessão expirou. Entre novamente.");
  const response = await fetch(endpoint(`/rest/v1/departures?id=eq.${encodeURIComponent(departureId)}`), { method: "PATCH", headers: { apikey: key!, Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify({ capacity }) });
  const payload = await response.json() as DepartureRecord[] & { message?: string };
  if (!response.ok) throw new Error(payload.message ?? "Não foi possível atualizar a quantidade de vagas.");
  return payload[0] as DepartureRecord;
}

export async function createContactLog(input: Pick<ContactLogRecord, "client_id" | "channel" | "template_name" | "message">) {
  const session = await getValidSession(); if (!session) throw new Error("Sua sessão expirou. Entre novamente.");
  const response = await fetch(endpoint("/rest/v1/client_contact_logs"), { method: "POST", headers: { apikey: key!, Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify(input) });
  const payload = await response.json() as ContactLogRecord[] & { message?: string };
  if (!response.ok) throw new Error(payload.message ?? "Não foi possível registrar o contato.");
  return payload[0] as ContactLogRecord;
}
