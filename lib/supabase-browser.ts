"use client";

type Session = { access_token: string; refresh_token: string; user: { id: string; email?: string } };

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
    body: JSON.stringify({ email, redirect_to: `${window.location.origin}/gestao/login` }),
  });
  if (!response.ok) throw new Error("Não foi possível enviar o e-mail de recuperação.");
}
