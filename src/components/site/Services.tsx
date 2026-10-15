import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import clinicTreatment from "@/assets/clinic-photo-4.webp";
import { services } from "@/data/services";
import { Reveal } from "./Reveal";

export function Services() {
  return (
    <section id="services" className="home-section bg-background scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 grid gap-5 md:grid-cols-[0.9fr_1.1fr] md:items-end md:gap-12">
          <div>
            <p className="home-eyebrow">
              <span aria-hidden="true" /> How we can help
            </p>
            <h2 className="home-section-title mt-4 max-w-xl">
              Care for movement, strength and recovery.
            </h2>
          </div>
          <div className="md:pb-1">
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              Treatment begins with understanding what is limiting you. Your physiotherapist can
              discuss appropriate options after an individual assessment.
            </p>
            <Link
              to="/services"
              className="mt-5 inline-flex min-h-11 items-center gap-2 border-b border-secondary pb-1 text-sm font-semibold text-primary transition-colors hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Explore all services <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:gap-14">
          <Reveal anim="left" className="home-service-photo-wrap">
            <figure className="home-service-photo">
              <img
                src={clinicTreatment}
                alt="Physiotherapist guiding a patient through a supported movement during a treatment session at PainFix"
                width={720}
                height={1280}
                loading="lazy"
                decoding="async"
              />
              <figcaption>
                <span className="home-service-photo__index">01 / PERSONAL CARE</span>
                <span>Movement with purpose.</span>
              </figcaption>
            </figure>
          </Reveal>

          <div className="home-service-list" aria-label="Physiotherapy services">
            {services.map((service, index) => (
              <Reveal key={service.slug} anim="up" delay={Math.min(index, 5) * 45}>
                <Link
                  to="/services/$slug"
                  params={{ slug: service.slug }}
                  className="home-service-row group"
                >
                  <span className="home-service-row__number" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="home-service-row__title">{service.shortTitle}</span>
                    <span className="home-service-row__copy">{service.tagline}</span>
                  </span>
                  <ArrowUpRight
                    className="h-5 w-5 shrink-0 text-primary/60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-secondary"
                    aria-hidden="true"
                  />
                </Link>
              </Reveal>
            ))}
            <div className="home-service-more">
              <span>Looking for a particular treatment?</span>
              <Link
                to="/services"
                className="font-semibold text-primary underline-offset-4 hover:text-secondary hover:underline"
              >
                View the full service list
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
