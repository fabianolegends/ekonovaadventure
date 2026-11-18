import type { Trip } from "../data/trips";
import { registrationWhatsApp, tripPresentation } from "../data/trip-contact";
import { Arrow } from "./Icons";

export function TripCard({ trip, compact = false }: { trip: Trip; compact?: boolean }) {
  const href = trip.href ?? `/roteiros/${trip.slug}`;
  const archived = trip.status === "Edição realizada";
  const { badge, action } = tripPresentation[trip.status];
  return (
    <article className={`trip-card${compact ? " trip-card-compact" : ""}`}>
      <a className="trip-image" href={href} aria-label={`Conhecer ${trip.title}`}>
        <img src={trip.image} alt={`Paisagem de ${trip.title}`} />
        <span className={`trip-status ${badge}`}>{trip.status}</span>
      </a>
      <div className="trip-content">
        <p className="trip-place">{trip.place}</p>
        <h3><a href={href}>{trip.title}</a></h3>
        <p className="trip-date">{trip.date} · {trip.duration}</p>
        {!compact && <p className="trip-summary">{trip.summary}</p>}
        <div className="trip-card-actions">
          <a className="text-link" href={href}>{archived ? action : "Ver roteiro"} <Arrow /></a>
          {!archived && <a className="text-link" href={registrationWhatsApp(trip.title)}>{action} <Arrow /></a>}
        </div>
      </div>
    </article>
  );
}
