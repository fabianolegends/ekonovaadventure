"use client";

import { useState } from "react";
import { trips, type TripKind } from "../data/trips";
import { TripCard } from "./TripCard";

type Filter = "todos" | TripKind;

export function RouteExplorer() {
  const [filter, setFilter] = useState<Filter>("todos");
  const filtered = filter === "todos" ? trips : trips.filter((trip) => trip.kind === filter);

  return (
    <div>
      <div className="route-filters" aria-label="Filtrar roteiros">
        {(["todos", "trekking", "bike"] as Filter[]).map((item) => (
          <button key={item} type="button" aria-pressed={filter === item} onClick={() => setFilter(item)}>
            {item === "todos" ? "Todos" : item === "trekking" ? "Hiking" : "Bike"}
          </button>
        ))}
      </div>
      <div className="catalog-grid">
        {filtered.map((trip) => <TripCard key={trip.slug} trip={trip} compact />)}
      </div>
    </div>
  );
}
