import { createFileRoute } from "@tanstack/react-router";
import { Trophy, ArrowRight, Quote } from "lucide-react";
import { PageLayout } from "@/components/site/PageLayout";
import { PageHero } from "@/components/site/PageHero";
import { PageCTA } from "@/components/site/PageCTA";
import { Reveal } from "@/components/site/Reveal";
import { GoogleReviews } from "@/components/site/GoogleReviews";
import { GoogleReviewButton } from "@/components/site/GoogleReviewButton";
import { pageMeta, canonical, breadcrumbLd } from "@/lib/seo";

const PATH = "/success-stories";
const TITLE = "Patient Success Stories | PainFix Physiotherapy Multan";
const DESCRIPTION =
  "Real recovery journeys from PainFix Physiotherapy Clinic in Multan — see how physiotherapist-led fitness and rehabilitation helps patients move, work and live better.";

/**
 * Representative recovery journeys. These illustrate the TYPES of outcomes our
 * physiotherapy + fitness programmes aim for. They are educational and
 * anonymised; individual results vary. Named, identifiable patient stories are
 * published only with the patient's documented written consent.
 */
const JOURNEYS = [
  {
    title: "Return to running after knee pain",
    profile: "Recreational runner, ongoing knee pain",
    journey:
      "After assessment, a graded strengthening and mobility programme reduced pain and rebuilt confidence, supporting a structured return-to-running plan.",
    focus: ["Knee rehab", "Strength & conditioning", "Return to sport"],
  },
  {
    title: "Desk worker beats recurring back pain",
    profile: "Office professional, long sitting hours",
    journey:
      "Posture correction, core strengthening and ergonomic advice helped ease recurring lower-back pain and build lasting daily habits.",
    focus: ["Posture", "Core strength", "Ergonomics"],
  },
  {
    title: "Rebuilding strength after surgery",
    profile: "Post-surgical recovery",
    journey:
      "A carefully progressed rehabilitation programme restored movement and strength step by step, with home exercises to maintain gains.",
    focus: ["Post-surgical rehab", "Mobility", "Home programme"],
  },
  {
    title: "Staying active in later years",
    profile: "Senior adult, general fitness goals",
    journey:
      "A gentle, individualised senior-fitness plan improved balance, strength and confidence for safer everyday movement.",
    focus: ["Senior fitness", "Balance", "Functional strength"],
  },
];

export const Route = createFileRoute("/success-stories")({
  head: () => ({
    meta: pageMeta({ title: TITLE, description: DESCRIPTION, path: PATH }),
    links: canonical(PATH),
    scripts: [
      breadcrumbLd([
        { label: "Home", path: "/" },
        { label: "Success Stories", path: PATH },
      ]),
    ],
  }),
  component: SuccessStories,
});

function SuccessStories() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Success Stories"
        title="Real Recovery Journeys"
        subtitle="See the kinds of outcomes our patients achieve with physiotherapist-led fitness and rehabilitation — then read genuine reviews from people across Multan."
        icon={<Trophy className="h-8 w-8" />}
        crumbs={[
          { label: "Home", path: "/" },
          { label: "Success Stories", path: PATH },
        ]}
      />

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2">
            {JOURNEYS.map((j, i) => (
              <Reveal key={j.title} anim="up" delay={(i % 2) * 80}>
                <article className="flex h-full flex-col rounded-[1.75rem] border border-border bg-card p-7 shadow-soft">
                  <Quote className="h-7 w-7 text-secondary/50" />
                  <h2 className="mt-3 font-heading text-lg font-bold text-foreground">{j.title}</h2>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {j.profile}
                  </p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{j.journey}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {j.focus.map((f) => (
                      <span key={f} className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                        {f}
                      </span>
                    ))}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-relaxed text-muted-foreground">
            The journeys above are representative and anonymised to protect privacy; individual results vary.
            Identifiable patient stories are shared only with documented written consent.
          </p>
        </div>
      </section>

      <GoogleReviews />

      <section className="py-14 text-center sm:py-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
            Recovered with PainFix?
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Share your experience to help others in Multan take the first step towards recovery.
          </p>
          <div className="mt-6 flex justify-center">
            <GoogleReviewButton />
          </div>
        </div>
      </section>

      <PageCTA />
    </PageLayout>
  );
}
