import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { conditions } from "@/data/conditions";
import { conditionImages } from "@/data/conditionImages";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function Conditions() {
  return (
    <section id="conditions" className="bg-surface py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Conditions We Treat"
          title="Expert care for a wide range of conditions"
          subtitle="From everyday aches to complex rehabilitation, we help you get back to doing what you love. Tap any condition to learn more."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {conditions.map((c, i) => (
            <Reveal key={c.slug} anim="up" delay={(i % 3) * 70}>
              <Link
                to="/conditions/$slug"
                params={{ slug: c.slug }}
                className="hover-lift group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-soft"
              >
                <div className="aspect-[4/3] overflow-hidden bg-surface">
                  <img
                    src={conditionImages[c.slug]}
                    alt={`Illustration representing ${c.title}`}
                    loading="lazy"
                    decoding="async"
                    width={700}
                    height={525}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-heading text-lg font-bold text-foreground">{c.title}</h3>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">{c.summary}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    Learn more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/conditions"
            className="inline-flex items-center gap-2 rounded-2xl border border-secondary px-6 py-3.5 text-sm font-semibold text-secondary transition-colors hover:bg-secondary hover:text-secondary-foreground"
          >
            View All Conditions <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </section>
  );
}
