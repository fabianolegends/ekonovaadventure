alter table public.departures
  add column if not exists cost_reporting_currency text not null default 'BRL' check (cost_reporting_currency in ('USD', 'BRL')),
  add column if not exists cost_exchange_rate numeric(12,4) not null default 1 check (cost_exchange_rate > 0),
  add column if not exists target_margin_percent numeric(7,2) not null default 0 check (target_margin_percent >= 0 and target_margin_percent < 100);

update public.departures d
set cost_reporting_currency = 'USD', cost_exchange_rate = 5.15, target_margin_percent = 28.3
from public.trips t
where t.id = d.trip_id and t.slug = 'trekking-atacama-essencia-2027';

create table public.departure_costs (
  id uuid primary key default gen_random_uuid(),
  departure_id uuid not null references public.departures(id) on delete cascade,
  category text not null,
  description text not null,
  supplier text,
  cost_basis text not null check (cost_basis in ('por_viajante', 'grupo')),
  planned_quantity numeric(12,2) not null default 1 check (planned_quantity >= 0),
  planned_unit_cents integer not null check (planned_unit_cents >= 0),
  actual_quantity numeric(12,2) check (actual_quantity >= 0),
  actual_unit_cents integer check (actual_unit_cents >= 0),
  currency text not null check (currency in ('USD', 'BRL')),
  notes text,
  created_at timestamptz not null default now()
);

create index departure_costs_departure_idx on public.departure_costs(departure_id, category);

alter table public.departure_costs enable row level security;
grant select, insert, update, delete on public.departure_costs to authenticated;

create policy "staff read departure costs" on public.departure_costs for select to authenticated using ((select public.is_active_member()));
create policy "operations manage departure costs" on public.departure_costs for all to authenticated using ((select public.has_role(array['admin','operacoes','financeiro']::public.team_role[]))) with check ((select public.has_role(array['admin','operacoes','financeiro']::public.team_role[])));

-- Referência inicial importada da planilha de formação de preço do Atacama.
-- Os valores são previstos em BRL e poderão ser atualizados pela equipe.
insert into public.departure_costs (departure_id, category, description, cost_basis, planned_quantity, planned_unit_cents, currency)
select d.id, item.category, item.description, item.cost_basis, item.quantity, item.unit_cents, 'BRL'
from public.departures d
join public.trips t on t.id = d.trip_id
cross join (values
  ('Hospedagem', 'Hotel', 'por_viajante', 1::numeric, 280000),
  ('Transporte', 'Transportes e transfers', 'por_viajante', 1::numeric, 171000),
  ('Alimentação', 'Almoços', 'por_viajante', 1::numeric, 16000),
  ('Materiais', 'Camiseta', 'por_viajante', 1::numeric, 10000),
  ('Passeios', 'Ingressos e passeios', 'por_viajante', 1::numeric, 36000),
  ('Equipe', 'Hospedagem, alimentação e transporte dos guias', 'grupo', 1::numeric, 1448000)
) as item(category, description, cost_basis, quantity, unit_cents)
where t.slug = 'trekking-atacama-essencia-2027'
  and not exists (select 1 from public.departure_costs existing where existing.departure_id = d.id);
