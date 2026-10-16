import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { conditions } from "@/data/conditions";
import {
  conditionImages,
  conditionImageAlt,
  conditionImageAltFallback,
} from "@/data/conditionImages";
import { PageLayout } from "@/components/site/PageLayout";
import { PageHero } from "@/components/site/PageHero";
import { PageCTA } from "@/components/site/PageCTA";
import { Reveal } from "@/components/site/Reveal";
import { pageMeta, canonical, breadcrumbLd } from "@/lib/seo";

const TITLE = "Conditions We Treat in Multan | PainFix Physiotherapy Clinic";
const DESCRIPTION =
  "From back pain and sciatica to sports injuries and stroke rehabilitation — explore the conditions we treat with evidence-based physiotherapy in Multan.";

export const Route = createFileRoute("/conditions/")({
  head: () => ({
    meta: pageMeta({ title: TITLE, description: DESCRIPTION, path: "/conditions" }),
    links: canonical("/conditions"),
    scripts: [
      breadcrumbLd([
        { label: "Home", path: "/" },
        { label: "Conditions", path: "/conditions" },
      ]),
    ],
  }),
  component: ConditionsIndex,
});

function ConditionsIndex() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Conditions We Treat"
        title="Expert Care for a Wide Range of Conditions"
        subtitle="Learn about the conditions we treat and how our physiotherapists can help you recover and move freely again."
        crumbs={[
          { label: "Home", path: "/" },
          { label: "Conditions", path: "/conditions" },
        ]}
      />
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {conditions.map((c, i) => (
              <Reveal key={c.slug} anim="up" delay={(i % 3) * 60}>
                <Link
                  to="/conditions/$slug"
                  params={{ slug: c.slug }}
                  className="group flex h-full flex-col overflow-hidden rounded-lg border border-border border-t-2 border-t-brand-green bg-card transition-colors hover:border-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-surface">
                    <img
                      src={conditionImages[c.slug]}
                      alt={conditionImageAlt[c.slug] ?? conditionImageAltFallback(c.title)}
                      loading="lazy"
                      decoding="async"
                      width={700}
                      height={525}
                      className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="font-heading text-lg font-bold text-foreground">{c.title}</h2>
                    <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {c.summary}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                      Learn more{" "}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <PageCTA />
    </PageLayout>
  );
}
