import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { conditionImages, conditionImageAlt } from "@/data/conditionImages";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

/**
 * "What are you suffering from?" — a fast, visual symptom navigator that sends
 * patients straight to the relevant condition page. Reuses the optimized,
 * lazy-loaded condition photographs (fixed dimensions to avoid layout shift).
 */
type Symptom = { label: string; slug: string };

const symptoms: Symptom[] = [
  { label: "Neck Pain", slug: "neck-pain" },
  { label: "Back Pain", slug: "back-pain" },
  { label: "Knee Pain", slug: "knee-pain" },
  { label: "Shoulder Pain", slug: "frozen-shoulder" },
  { label: "Heel Pain", slug: "plantar-fasciitis" },
  { label: "Sciatica", slug: "sciatica" },
  { label: "Sports Injury", slug: "sports-injuries" },
  { label: "Stroke Rehabilitation", slug: "stroke-rehabilitation" },
  { label: "Arthritis", slug: "osteoarthritis" },
];

export function SymptomNavigator() {
  return (
    <section id="symptoms" className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Find Your Care Fast"
          title="What are you suffering from?"
          subtitle="Tap your main complaint to see how our physiotherapists in Multan can help you recover."
        />
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
          {symptoms.map((s, i) => (
            <Reveal key={s.slug} anim="up" delay={(i % 3) * 60}>
              <Link
                to="/conditions/$slug"
                params={{ slug: s.slug }}
                aria-label={`${s.label} physiotherapy treatment in Multan`}
                className="hover-lift group flex h-full items-center gap-4 overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-soft transition-shadow hover:border-primary/40 hover:shadow-card focus:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:flex-col sm:items-stretch sm:gap-0 sm:p-0"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface sm:h-auto sm:w-full sm:rounded-none">
                  <img
                    src={conditionImages[s.slug]}
                    alt={conditionImageAlt[s.slug] ?? `${s.label} treatment at PainFix Physiotherapy Clinic in Multan`}
                    loading="lazy"
                    decoding="async"
                    width={700}
                    height={525}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:aspect-[4/3]"
                  />
                </div>
                <span className="flex min-w-0 flex-1 items-center justify-between gap-2 sm:p-4">
                  <span className="min-w-0 font-heading text-sm font-bold leading-snug text-foreground [overflow-wrap:anywhere] sm:text-base">{s.label}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-1 rtl:rotate-180" />
                </span>

              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
