alter table public.departures
  add column if not exists currency text not null default 'USD' check (currency in ('USD', 'BRL')),
  add column if not exists cash_discount_percent numeric(5,2) not null default 5,
  add column if not exists pix_final_due_on date,
  add column if not exists card_max_installments integer,
  add column if not exists public_registration_enabled boolean not null default false;

create unique index if not exists departures_trip_start_idx on public.departures(trip_id, starts_on);
