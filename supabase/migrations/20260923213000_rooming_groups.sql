create table public.room_groups (
  id uuid primary key default gen_random_uuid(),
  departure_id uuid not null references public.departures(id) on delete cascade,
  label text not null,
  room_type text not null check (room_type in ('matrimonial', 'twin', 'single')),
  notes text,
  created_at timestamptz not null default now()
);

create table public.room_group_members (
  id uuid primary key default gen_random_uuid(),
  room_group_id uuid not null references public.room_groups(id) on delete cascade,
  reservation_id uuid not null unique references public.reservations(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index room_groups_departure_idx on public.room_groups(departure_id);

alter table public.room_groups enable row level security;
alter table public.room_group_members enable row level security;

grant select, insert, update, delete on public.room_groups, public.room_group_members to authenticated;

create policy "staff read room groups" on public.room_groups for select to authenticated using ((select public.is_active_member()));
create policy "operations manage room groups" on public.room_groups for all to authenticated using ((select public.has_role(array['admin','operacoes']::public.team_role[]))) with check ((select public.has_role(array['admin','operacoes']::public.team_role[])));
create policy "staff read room group members" on public.room_group_members for select to authenticated using ((select public.is_active_member()));
create policy "operations manage room group members" on public.room_group_members for all to authenticated using ((select public.has_role(array['admin','operacoes']::public.team_role[]))) with check ((select public.has_role(array['admin','operacoes']::public.team_role[])));
