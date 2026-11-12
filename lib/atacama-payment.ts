export const ATACAMA_SLUG = "trekking-atacama-essencia-2027";
export const ATACAMA_DUE_DATES = [
  "2026-12-05", "2027-01-05", "2027-02-05", "2027-03-05", "2027-04-05", "2027-05-05",
] as const;
export const ATACAMA_MAX_INSTALLMENTS = ATACAMA_DUE_DATES.length - 1;

export function paymentDateLabel(date: string) {
  return date.split("-").reverse().join("/");
}

export const ATACAMA_PIX_TERMS = `Entrada de 30% em ${paymentDateLabel(ATACAMA_DUE_DATES[0])} e saldo em até ${ATACAMA_MAX_INSTALLMENTS} parcelas mensais via Pix, com vencimento no dia 5.`;

export function atacamaSchedule(totalCents: number, count: number) {
  if (!Number.isInteger(count) || count < 0 || count > ATACAMA_MAX_INSTALLMENTS) {
    throw new RangeError("Quantidade de parcelas inválida para o Atacama.");
  }
  const entry = count === 0 ? totalCents : Math.round(totalCents * 30 / 100);
  const rows = [{ due_on: ATACAMA_DUE_DATES[0] as string, amount_cents: entry }];
  if (!count) return rows;
  const balance = totalCents - entry;
  const base = Math.floor(balance / count);
  for (let i = 0; i < count; i++) {
    rows.push({ due_on: ATACAMA_DUE_DATES[i + 1], amount_cents: base + (i < balance % count ? 1 : 0) });
  }
  return rows;
}
