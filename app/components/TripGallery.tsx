"use client";

import { useRef } from "react";

export function TripGallery({ images, title }: { images: string[]; title: string }) {
  const track = useRef<HTMLDivElement>(null);
  const move = (direction: number) => track.current?.scrollBy({ left: direction * Math.min(720, window.innerWidth * .82), behavior: "smooth" });

  return (
    <section className="trip-gallery" aria-label={`Galeria de fotos de ${title}`}>
      <div className="gallery-heading">
        <div><p className="eyebrow">Imagens da experiência</p><h2>Um pouco do que já vivemos por aqui.</h2></div>
        <div className="gallery-controls">
          <button type="button" onClick={() => move(-1)} aria-label="Fotos anteriores">←</button>
          <button type="button" onClick={() => move(1)} aria-label="Próximas fotos">→</button>
        </div>
      </div>
      <div className="gallery-track" ref={track} tabIndex={0}>
        {images.map((image, index) => <figure key={image}><img src={image} alt={`${title} — foto ${index + 1}`} loading="lazy" /></figure>)}
      </div>
    </section>
  );
}
