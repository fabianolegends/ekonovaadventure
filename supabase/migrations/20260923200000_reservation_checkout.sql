alter table public.departures
  add column if not exists single_supplement_cents integer not null default 0,
  add column if not exists max_pix_installments integer not null default 6,
  add column if not exists booking_enabled boolean not null default true;

alter table public.reservations
  add column if not exists room_type text check (room_type in ('duplo','single')),
  add column if not exists registration_token uuid default gen_random_uuid() unique,
  add column if not exists payment_plan text,
  add column if not exists proposal_pdf_url text,
  add column if not exists proposal_sent_at timestamptz;
