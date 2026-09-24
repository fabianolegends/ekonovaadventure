alter table public.departures
  add column if not exists target_profit_cents integer not null default 0 check (target_profit_cents >= 0);

update public.departures d
set target_profit_cents = 250000,
    cost_reporting_currency = 'BRL',
    cost_exchange_rate = 5.15
from public.trips t
where t.id = d.trip_id
  and t.slug = 'trekking-atacama-essencia-2027'
  and d.target_profit_cents = 0;
