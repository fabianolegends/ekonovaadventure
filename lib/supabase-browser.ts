"use client";

type Session = { access_token: string; refresh_token: string; user: { id: string; email?: string } };
export type ClientRecord = { id: string; full_name: string; email: string | null; phone: string | null; city: string | null; cpf: string | null; rg: string | null; passport_number: string | null; street: string | null; neighborhood: string | null; postal_code: string | null; emergency_contact_name: string | null; emergency_contact_phone: string | null; health_plan: string | null; health_plan_phone: string | null; created_at: string };
export type PaymentRecord = { id: string; amount_cents: number; due_on: string; paid_on: string | null; status: string; reference: string | null; reservations: { departure_id: string; status: string; clients: { id: string; full_name: string } | null; departures: { currency: "USD" | "BRL"; trips: { title: string } | null } | null } | null };
export type ReservationRecord = { id: string; departure_id: string; room_type: "duplo" | "single" | null; status: string; payment_plan: string | null; created_at: string; clients: { id: string; full_name: string; email: string | null; phone: string | null; city: string | null; state: string | null; cpf: string | null; rg: string | null; passport_number: string | null; emergency_contact_name: string | null; emergency_contact_phone: string | null; health_plan: string | null; health_plan_phone: string | null } | null };
export type RoomGroupRecord = { id: string; departure_id: string; label: string; room_type: "matrimonial" | "twin" | "single"; notes: string | null; room_group_members: { reservation_id: string }[] };
export type ContactLogRecord = { id: string; client_id: string; channel: string; template_name: string; message: string; created_at: string; clients: { full_name: string } | null };
export type DepartureRecord = { id: string; starts_on: string; ends_on: string; capacity: number; price_cents: number; status: string; notes: string | null; single_supplement_cents: number; max_pix_installments: number; booking_enabled: boolean; currency: "USD" | "BRL"; cash_discount_percent: number; pix_final_due_on: string | null; card_max_installments: number | null; public_registration_enabled: boolean; trips: { title: string; slug: string; category: string; destination: string } | null };

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

export async function listPayments() {
  const session = await getValidSession(); if (!session) throw new Error("Sua sessão expirou. Entre novamente.");
  const response = await fetch(endpoint("/rest/v1/payments?select=id,amount_cents,due_on,paid_on,status,reference,reservations(departure_id,status,clients(id,full_name),departures(currency,trips(title)))&order=due_on.asc"), { headers: { apikey: key!, Authorization: `Bearer ${session.access_token}` } });
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

export async function listReservations() {
  const session = await getValidSession();
  if (!session) throw new Error("Sua sessão expirou. Entre novamente.");
  const response = await fetch(endpoint("/rest/v1/reservations?select=id,departure_id,room_type,status,payment_plan,created_at,clients(id,full_name,email,phone,city,state,cpf,rg,passport_number,emergency_contact_name,emergency_contact_phone,health_plan,health_plan_phone)&order=created_at.desc"), { headers: { apikey: key!, Authorization: `Bearer ${session.access_token}` } });
  const payload = await response.json() as ReservationRecord[] & { message?: string };
  if (!response.ok) throw new Error(payload.message ?? "Não foi possível carregar as reservas.");
  return payload as ReservationRecord[];
}

export async function listDepartures() {
  const session = await getValidSession();
  if (!session) throw new Error("Sua sessão expirou. Entre novamente.");
  const fields = "id,starts_on,ends_on,capacity,price_cents,status,notes,single_supplement_cents,max_pix_installments,booking_enabled,currency,cash_discount_percent,pix_final_due_on,card_max_installments,public_registration_enabled,trips(title,slug,category,destination)";
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

export async function createContactLog(input: Pick<ContactLogRecord, "client_id" | "channel" | "template_name" | "message">) {
  const session = await getValidSession(); if (!session) throw new Error("Sua sessão expirou. Entre novamente.");
  const response = await fetch(endpoint("/rest/v1/client_contact_logs"), { method: "POST", headers: { apikey: key!, Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify(input) });
  const payload = await response.json() as ContactLogRecord[] & { message?: string };
  if (!response.ok) throw new Error(payload.message ?? "Não foi possível registrar o contato.");
  return payload[0] as ContactLogRecord;
}
