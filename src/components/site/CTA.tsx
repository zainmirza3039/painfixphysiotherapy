import { MapPin, Navigation } from "lucide-react";
import { Reveal } from "./Reveal";
import { CLINIC_ADDRESS, MAP_DIRECTIONS_URL, MAP_EMBED_URL } from "./constants";

export function CTA() {
  return (
    <section className="home-cta-section" aria-labelledby="clinic-location-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal anim="up">
          <div className="home-cta grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div className="max-w-2xl">
              <p className="home-eyebrow home-eyebrow--light">
                <span aria-hidden="true" /> Find our clinic
              </p>
              <h2
                id="clinic-location-heading"
                className="mt-4 font-heading text-4xl font-semibold leading-tight tracking-[-0.025em] text-white sm:text-5xl"
              >
                Visit PainFix Physiotherapy Clinic
              </h2>
              <p className="mt-4 flex items-start gap-2 text-base leading-7 text-white/80">
                <MapPin className="mt-1 h-5 w-5 shrink-0" aria-hidden="true" />
                <span>{CLINIC_ADDRESS}</span>
              </p>
              <a
                href={MAP_DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-brand-navy transition-colors hover:bg-[#EAF5EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy"
              >
                <Navigation className="h-4 w-4" aria-hidden="true" />
                Get Directions on Google Maps
              </a>
            </div>
            <a
              href={MAP_DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open directions to PainFix Physiotherapy Clinic on Google Maps"
              className="block min-h-56 overflow-hidden rounded-xl border border-white/20 bg-white/10 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy sm:min-h-72"
            >
              <iframe
                src={MAP_EMBED_URL}
                title="Google Maps location of PainFix Physiotherapy Clinic, Shalimar Colony, Multan"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                tabIndex={-1}
                aria-hidden="true"
                className="pointer-events-none h-56 w-full border-0 sm:h-72"
              />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
