import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { conditions } from "@/data/conditions";
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {conditions.map((c, i) => (
              <Reveal key={c.slug} anim="up" delay={(i % 3) * 60}>
                <Link
                  to="/conditions/$slug"
                  params={{ slug: c.slug }}
                  className="hover-lift group flex h-full items-center justify-between gap-3 rounded-2xl border border-border bg-card px-6 py-5 shadow-soft"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-2xl" aria-hidden="true">{c.icon}</span>
                    <span className="font-heading font-bold text-foreground">{c.title}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1 rtl:rotate-180" />
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
