import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { services } from "@/data/services";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function Services() {
  return (
    <section id="services" className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Services"
          title="Treatments tailored to you"
          subtitle="A full spectrum of physiotherapy services delivered with precision and care. Tap any service to learn more."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.slug} anim="up" delay={(i % 3) * 80}>
              <Link
                to="/services/$slug"
                params={{ slug: s.slug }}
                className="hover-lift group flex h-full flex-col rounded-[1.75rem] border border-border bg-card p-7 shadow-soft"
              >
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground transition-transform group-hover:scale-110">
                  <s.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-heading text-lg font-bold text-foreground">{s.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{s.tagline}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  Learn more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
                </span>
              </Link>
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
