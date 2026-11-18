import { ATACAMA_DUE_DATES, ATACAMA_MAX_INSTALLMENTS, ATACAMA_SLUG, atacamaSchedule } from "./atacama-payment";
import type { PublicDeparture } from "./public-departures";

export type BookingRoom = "duplo" | "single";
export type BookingPayment = "pix" | "avista";

export function brazilDate() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

export function paymentTerms(departure: PublicDeparture) {
  const slug = departure.trips.slug;
  const atacama = slug === ATACAMA_SLUG && departure.starts_on === "2027-09-16";
  const andes = slug === "andes-essencial" && departure.starts_on === "2027-03-10";
  const bikeOuro = slug === "biketour-caminhos-do-ouro" && departure.starts_on === "2027-06-04";
  return {
    fixedEntry: atacama ? ATACAMA_DUE_DATES[0] : "",
    entryDeadline: andes ? "2026-11-04" : bikeOuro ? "2026-12-05" : "",
    finalDue: departure.pix_final_due_on || (andes ? "2027-02-10" : ""),
    maxInstallments: atacama ? Math.min(ATACAMA_MAX_INSTALLMENTS, departure.max_pix_installments) : departure.max_pix_installments,
  };
}

function dueAfterMonths(date: string, months: number) {
  const [year, month, day] = date.split("-").map(Number);
  const last = new Date(Date.UTC(year, month + months, 0));
  last.setUTCDate(Math.min(day, last.getUTCDate()));
  return last.toISOString().slice(0, 10);
}

export function availableInstallments(departure: PublicDeparture, entryDate: string) {
  const terms = paymentTerms(departure);
  let count = terms.maxInstallments;
  if (entryDate && terms.finalDue) {
    while (count > 0 && dueAfterMonths(entryDate, count) > terms.finalDue) count--;
  }
  return count;
}

export function bookingQuote(departure: PublicDeparture, room: BookingRoom, payment: BookingPayment, entryDate: string, installments: number) {
  const price = departure.price_cents + (room === "single" ? departure.single_supplement_cents : 0);
  const total = payment === "avista" ? Math.round(price * (100 - departure.cash_discount_percent) / 100) : price;
  const entry = payment === "avista" ? total : Math.round(total * 0.3);
  const terms = paymentTerms(departure);
  const schedule = [{ due_on: terms.fixedEntry || entryDate, amount_cents: entry }];
  if (terms.fixedEntry) {
    return { price, total, entry, schedule: atacamaSchedule(total, payment === "pix" ? installments : 0) };
  }
  if (payment === "pix" && entryDate && installments > 0) {
    const amount = Math.floor((total - entry) / installments);
    const remainder = (total - entry) % installments;
    for (let i = 1; i <= installments; i++) {
      schedule.push({ due_on: dueAfterMonths(entryDate, i), amount_cents: amount + (i <= remainder ? 1 : 0) });
    }
  }
  return { price, total, entry, schedule };
}
