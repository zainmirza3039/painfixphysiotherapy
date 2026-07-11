import { Link } from "@tanstack/react-router";
import { ArrowRight, MessageCircle } from "lucide-react";
import { services } from "@/data/services";
import { serviceImages, serviceImageAlt, serviceImageAltFallback } from "@/data/serviceImages";
import { WHATSAPP_CONSULT_URL } from "./constants";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function Services() {
  return (
    <section id="services" className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Services"
          title="Treatments tailored to you"
          subtitle="A full spectrum of physiotherapy services delivered with precision and care. Learn more or book your appointment in seconds."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => {
            const image = serviceImages[s.slug];
            return (
            <Reveal key={s.slug} anim="up" delay={(i % 3) * 80}>
              <article className="hover-lift group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-soft transition-shadow hover:border-primary/40 hover:shadow-card focus-within:ring-2 focus-within:ring-primary/50">
                {image && (
                  <div className="aspect-[16/9] overflow-hidden bg-surface">
                    <img
                      src={image}
                      alt={serviceImageAlt[s.slug] ?? serviceImageAltFallback(s.title)}
                      loading="lazy"
                      decoding="async"
                      width={700}
                      height={394}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-7">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground transition-transform group-hover:scale-110">
                  <s.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-heading text-lg font-bold text-foreground">{s.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{s.tagline}</p>
                <div className="mt-5 flex flex-wrap items-center gap-2.5">
                  <Link
                    to="/services/$slug"
                    params={{ slug: s.slug }}
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-primary px-4 py-2 text-sm font-semibold text-primary transition-colors after:absolute after:inset-0 after:rounded-[1.75rem] after:content-[''] hover:bg-primary hover:text-primary-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label={`Learn more about ${s.title}`}
                  >
                    Learn More <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </Link>
                  <a
                    href={WHATSAPP_CONSULT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative z-10 inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition-opacity hover:opacity-90"
                    aria-label={`Ask about ${s.title} on WhatsApp`}
                  >
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 rounded-2xl border border-secondary px-6 py-3.5 text-sm font-semibold text-secondary transition-colors hover:bg-secondary hover:text-secondary-foreground"
          >
            View All Services <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </section>
  );
}
