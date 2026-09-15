"use client";

import Image from "next/image";
import { useRef } from "react";
import type { TripGalleryImage } from "../data/trips";

export function TripGallery({ images, title }: { images: Array<string | TripGalleryImage>; title: string }) {
  const track = useRef<HTMLDivElement>(null);
  const move = (direction: number) => track.current?.scrollBy({ left: direction * Math.min(720, window.innerWidth * .82), behavior: "smooth" });

  return (
    <section className="trip-gallery" aria-label={`Galeria de fotos de ${title}`}>
      <div className="gallery-heading">
        <div><p className="eyebrow">Imagens da experiência</p><h2>Paisagens que fazem parte desta jornada.</h2></div>
        <div className="gallery-controls">
          <button type="button" onClick={() => move(-1)} aria-label="Fotos anteriores">←</button>
          <button type="button" onClick={() => move(1)} aria-label="Próximas fotos">→</button>
        </div>
      </div>
      <div className="gallery-track" ref={track} tabIndex={0}>
        {images.map((image, index) => {
          const item = typeof image === "string"
            ? { src: image, alt: `${title} — foto ${index + 1}` }
            : image;

          return (
            <figure key={item.src}>
              <Image src={item.src} alt={item.alt} fill sizes="(max-width: 760px) 84vw, 760px" />
              {typeof image !== "string" && (
                <figcaption>
                  <strong>{image.caption}</strong>
                  <span>
                    Foto: <a href={image.source} target="_blank" rel="noreferrer">{image.credit}</a>
                    {" · "}
                    {image.licenseUrl
                      ? <a href={image.licenseUrl} target="_blank" rel="noreferrer">{image.license}</a>
                      : image.license}
                  </span>
                </figcaption>
              )}
            </figure>
          );
        })}
      </div>
    </section>
  );
}
