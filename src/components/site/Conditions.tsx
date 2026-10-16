import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { conditions } from "@/data/conditions";
import { Reveal } from "./Reveal";

export function Conditions() {
  return (
    <section id="conditions" className="home-section home-section--tint scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
          <div>
            <p className="home-eyebrow">
              <span aria-hidden="true" /> Find a starting point
            </p>
            <h2 className="home-section-title mt-4">
              Support for the things that make movement harder.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
              Explore information about common concerns and the physiotherapy options available at
              PainFix. A clinician can help you decide what is appropriate for your situation.
            </p>
            <Link
              to="/conditions"
              className="mt-6 inline-flex min-h-11 items-center gap-2 border-b border-secondary pb-1 text-sm font-semibold text-primary hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Browse all conditions <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="home-condition-list">
            {conditions.slice(0, 8).map((condition, index) => (
              <Reveal key={condition.slug} anim="up" delay={(index % 4) * 40}>
                <Link
                  to="/conditions/$slug"
                  params={{ slug: condition.slug }}
                  className="home-condition-row group"
                >
                  <span className="home-condition-row__title">{condition.title}</span>
                  <span className="home-condition-row__summary">{condition.summary}</span>
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 text-primary/55 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-secondary"
                    aria-hidden="true"
                  />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
