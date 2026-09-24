alter table public.departure_costs
  add column if not exists cost_on date;

update public.departure_costs c
set cost_on = d.starts_on
from public.departures d
where d.id = c.departure_id
  and c.cost_on is null;

alter table public.departure_costs
  alter column cost_on set not null;

create index if not exists departure_costs_day_idx
  on public.departure_costs(departure_id, cost_on, created_at);
