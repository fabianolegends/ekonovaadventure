import { cache } from "react";
import { brazilDate } from "./registration-payment";

export type PublicDeparture = {
  id: string;
  starts_on: string;
  ends_on: string;
  price_cents: number;
  single_supplement_cents: number;
  currency: "BRL" | "USD";
  cash_discount_percent: number;
  max_pix_installments: number;
  pix_final_due_on: string | null;
  trips: { slug: string; title: string; destination: string };
};

export const listPublicDepartures = cache(async (): Promise<PublicDeparture[]> => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Gestão indisponível.");
  const query = new URLSearchParams({
    select: "id,starts_on,ends_on,price_cents,single_supplement_cents,currency,cash_discount_percent,max_pix_installments,pix_final_due_on,trips!inner(slug,title,destination)",
    public_registration_enabled: "eq.true",
    starts_on: `gte.${brazilDate()}`,
    order: "starts_on.asc",
  });
  const response = await fetch(`${url}/rest/v1/departures?${query}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Gestão indisponível.");
  return response.json();
});

export function managementSlug(slug: string) {
  if (slug === "atacama-essencia") return "trekking-atacama-essencia-2027";
  if (slug === "caminhos-do-ouro") return "trekking-caminhos-do-ouro";
  return slug;
}

type CatalogTrip = { slug: string; startDate?: string; status: string };

export function registrationLinkFor(trip: CatalogTrip, departures: PublicDeparture[]) {
  if (trip.status === "Edição realizada") return undefined;
  const slug = managementSlug(trip.slug);
  const matches = departures.filter((item) => item.trips.slug === slug);
  const departure = matches.find((item) => !trip.startDate || item.starts_on === trip.startDate);
  if (!departure) return undefined;
  const path = `/inscricao/${encodeURIComponent(slug)}`;
  return matches.length > 1 && trip.startDate ? `${path}?saida=${departure.starts_on}` : path;
}

export async function catalogDepartures() {
  return listPublicDepartures().catch(() => []);
}
