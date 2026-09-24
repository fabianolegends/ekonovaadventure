insert into public.trips (title, slug, category, destination, active)
values
  ('Andes Essencial', 'andes-essencial', 'Trekking', 'Mendoza, Argentina', true),
  ('Trekking Caminhos do Ouro', 'trekking-caminhos-do-ouro', 'Trekking', 'Ouro Preto, Tiradentes e Lavras Novas, MG', true),
  ('Biketour Caminhos do Ouro', 'biketour-caminhos-do-ouro', 'Biketour', 'Ouro Preto e região, MG', true),
  ('Trekking Atacama na sua Essência 2027', 'trekking-atacama-essencia-2027', 'Trekking', 'San Pedro de Atacama, Chile', true)
on conflict (slug) do update set title = excluded.title, category = excluded.category, destination = excluded.destination, active = true;

insert into public.departures (trip_id, starts_on, ends_on, capacity, price_cents, status, notes, single_supplement_cents, max_pix_installments, booking_enabled, currency, cash_discount_percent, pix_final_due_on, card_max_installments, public_registration_enabled)
select t.id, v.starts_on, v.ends_on, 12, v.price_cents, 'em_formacao', v.notes, v.single_cents, 6, v.booking_enabled, v.currency, 5, v.pix_final_due_on, v.card_max_installments, v.public_registration_enabled
from (values
  ('andes-essencial', date '2027-03-10', date '2027-03-17', 139900, 30000, 'USD', null::date, null::integer, true, true, 'Saída operacional. Valores em USD.'),
  ('trekking-caminhos-do-ouro', date '2027-06-10', date '2027-06-17', 399900, 70000, 'BRL', null::date, 12, false, false, 'Rascunho operacional. Sem roteiro detalhado nesta gestão.'),
  ('biketour-caminhos-do-ouro', date '2027-06-04', date '2027-06-10', 449900, 70000, 'BRL', null::date, 12, false, false, 'Rascunho operacional. Sem roteiro detalhado nesta gestão.'),
  ('trekking-atacama-essencia-2027', date '2027-09-16', date '2027-09-24', 179900, 45000, 'USD', date '2027-04-30', null::integer, false, false, 'Rascunho operacional. Saldo em Pix até abril de 2027.')
) as v(slug, starts_on, ends_on, price_cents, single_cents, currency, pix_final_due_on, card_max_installments, booking_enabled, public_registration_enabled, notes)
join public.trips t on t.slug = v.slug
on conflict (trip_id, starts_on) do update set
  ends_on = excluded.ends_on, capacity = excluded.capacity, price_cents = excluded.price_cents,
  notes = excluded.notes, single_supplement_cents = excluded.single_supplement_cents,
  currency = excluded.currency, cash_discount_percent = excluded.cash_discount_percent,
  pix_final_due_on = excluded.pix_final_due_on, card_max_installments = excluded.card_max_installments,
  booking_enabled = excluded.booking_enabled, public_registration_enabled = excluded.public_registration_enabled;
