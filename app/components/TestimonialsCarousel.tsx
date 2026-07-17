"use client";

import { useRef } from "react";
import { testimonials } from "../data/testimonials";

export function TestimonialsCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const move = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * Math.min(track.clientWidth * .86, 620), behavior: "smooth" });
  };

  return (
    <section className="home-testimonials" id="depoimentos" aria-labelledby="home-testimonials-title">
      <div className="home-testimonials-heading">
        <div><p className="eyebrow">Histórias de quem foi</p><h2 id="home-testimonials-title">Quem vive o caminho conta melhor.</h2></div>
        <div className="carousel-controls" aria-label="Controles dos depoimentos">
          <button type="button" onClick={() => move(-1)} aria-label="Depoimento anterior">←</button>
          <button type="button" onClick={() => move(1)} aria-label="Próximo depoimento">→</button>
        </div>
      </div>
      <div className="testimonial-carousel" ref={trackRef}>
        {testimonials.map((testimonial) => (
          <article className="carousel-testimonial" key={testimonial.name}>
            <div className="testimonial-person">
              {"image" in testimonial
                ? <img src={testimonial.image} alt={testimonial.name} />
                : <span className="testimonial-initials" aria-hidden="true">{testimonial.name.split(" ").slice(0, 2).map((part) => part[0]).join("")}</span>}
              <div><strong>{testimonial.name}</strong><span>{testimonial.activity}</span></div>
            </div>
            <blockquote>“{testimonial.quote}”</blockquote>
          </article>
        ))}
      </div>
    </section>
  );
}
