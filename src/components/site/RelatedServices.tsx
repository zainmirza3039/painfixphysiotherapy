import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { serviceMap } from "@/data/services";
import { Reveal } from "./Reveal";

export function RelatedServices({ slugs }: { slugs: string[] }) {
  const items = slugs.map((s) => serviceMap[s]).filter(Boolean);
  if (items.length === 0) return null;

  return (
    <section className="bg-surface py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
          Related Services
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((service, i) => (
            <Reveal key={service.slug} anim="up" delay={i * 70}>
              <Link
                to="/services/$slug"
                params={{ slug: service.slug }}
                className="hover-lift group flex h-full flex-col rounded-[1.75rem] border border-border bg-card p-6 shadow-soft"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary/12 text-secondary">
                  <service.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-heading text-lg font-bold text-foreground">{service.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{service.tagline}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  Learn more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
