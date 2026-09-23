alter table public.clients
  add column if not exists cpf text,
  add column if not exists rg text,
  add column if not exists passport_number text,
  add column if not exists street text,
  add column if not exists neighborhood text,
  add column if not exists postal_code text,
  add column if not exists emergency_contact_name text,
  add column if not exists emergency_contact_phone text,
  add column if not exists health_plan text,
  add column if not exists health_plan_phone text;
