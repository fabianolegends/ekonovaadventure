create table public.client_contact_logs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  channel text not null default 'whatsapp',
  template_name text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create index client_contact_logs_client_idx on public.client_contact_logs(client_id, created_at desc);

alter table public.client_contact_logs enable row level security;

grant select, insert on public.client_contact_logs to authenticated;

create policy "staff read contact logs" on public.client_contact_logs for select to authenticated using ((select public.is_active_member()));
create policy "operations add contact logs" on public.client_contact_logs for insert to authenticated with check ((select public.has_role(array['admin','operacoes']::public.team_role[])));
