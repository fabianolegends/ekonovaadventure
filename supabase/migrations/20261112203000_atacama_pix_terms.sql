update public.departures as d
set max_pix_installments = 5,
    pix_final_due_on = date '2027-05-05'
from public.trips as t
where d.trip_id = t.id
  and t.slug = 'trekking-atacama-essencia-2027'
  and d.starts_on = date '2027-09-16'
  and (d.max_pix_installments is distinct from 5 or d.pix_final_due_on is distinct from date '2027-05-05');
