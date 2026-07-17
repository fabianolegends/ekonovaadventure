import type { Trip } from "../data/trips";
import { Arrow } from "./Icons";

const statusClass: Record<Trip["status"], string> = {
  "Saída programada": "status-confirmed",
  "Grupo em formação": "status-forming",
  "Sob consulta": "status-consult",
  "Lista de interesse": "status-interest",
};

export function TripCard({ trip, compact = false }: { trip: Trip; compact?: boolean }) {
  const href = trip.href ?? `/roteiros/${trip.slug}`;
  return (
    <article className={`trip-card${compact ? " trip-card-compact" : ""}`}>
      <a className="trip-image" href={href} aria-label={`Conhecer ${trip.title}`}>
        <img src={trip.image} alt={`Paisagem de ${trip.title}`} />
        <span className={`trip-status ${statusClass[trip.status]}`}>{trip.status}</span>
      </a>
      <div className="trip-content">
        <p className="trip-place">{trip.place}</p>
        <h3><a href={href}>{trip.title}</a></h3>
        <p className="trip-date">{trip.date} · {trip.duration}</p>
        {!compact && <p className="trip-summary">{trip.summary}</p>}
        <a className="text-link" href={href}>{trip.href ? "Ver experiência" : "Manifestar interesse"} <Arrow /></a>
      </div>
    </article>
  );
}
