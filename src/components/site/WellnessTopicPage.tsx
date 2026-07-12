import { CheckCircle2, Users, Sparkles, Clock, Info } from "lucide-react";
import type { WellnessPage } from "@/data/wellness";
import { relatedArticlesForWellness } from "@/data/wellness";
import { PageLayout } from "./PageLayout";
import { PageHero } from "./PageHero";
import { QuickAnswer } from "./QuickAnswer";
import { FaqAccordion } from "./FaqAccordion";
import { PageCTA } from "./PageCTA";
import { RelatedServices } from "./RelatedServices";
import { RelatedArticles } from "./RelatedArticles";
import { Reveal } from "./Reveal";

interface WellnessTopicPageProps {
  page: WellnessPage;
  /** Breadcrumbs for the hero. */
  crumbs: { label: string; path: string }[];
  /** Show a "launching soon" notice (used for hidden diet pages). */
  comingSoon?: boolean;
}

export function WellnessTopicPage({ page, crumbs, comingSoon = false }: WellnessTopicPageProps) {
  const relatedPosts = relatedArticlesForWellness(page);

  return (
    <PageLayout>
      <PageHero
        eyebrow={page.eyebrow}
        title={page.title}
        subtitle={page.heroSubtitle}
        crumbs={crumbs}
      />

      {comingSoon && (
        <section className="pt-10">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Reveal anim="up">
              <div
                role="status"
                className="flex items-start gap-3 rounded-[1.5rem] border border-primary/30 bg-primary/5 p-6 shadow-soft"
              >
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <p className="text-sm leading-relaxed text-foreground">
                  <strong className="font-semibold">Launching soon.</strong> Our Diet &amp;
                  Nutrition service will be delivered by a qualified dietitian who is joining
                  PainFix shortly. Message us on WhatsApp to register your interest and we&apos;ll
                  contact you as soon as it&apos;s available.
                </p>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* Quick Summary (AEO / GEO) */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <QuickAnswer answer={page.quickSummary} takeaways={page.keyTakeaways} />
        </div>
      </section>

      {/* Features / Programmes */}
      {page.features && page.features.length > 0 && (
        <section className="bg-surface py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="flex items-center justify-center gap-2 text-center font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
              <Sparkles className="h-6 w-6 text-primary" />{" "}
              {page.featuresHeading ?? "What We Offer"}
            </h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {page.features.map((f, i) => (
                <Reveal key={f.title} anim="up" delay={(i % 3) * 70}>
                  <div className="hover-lift h-full rounded-[1.75rem] border border-border bg-card p-6 shadow-soft">
                    <h3 className="font-heading text-lg font-bold text-foreground">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {f.description}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Who Can Benefit */}
      {page.whoCanBenefit.length > 0 && (
        <section className="py-14 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="flex items-center justify-center gap-2 text-center font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
              <Users className="h-6 w-6 text-primary" /> Who Can Benefit
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {page.whoCanBenefit.map((b, i) => (
                <Reveal key={b} anim="up" delay={i * 60}>
                  <div className="flex h-full items-start gap-3 rounded-[1.5rem] border border-border bg-card p-6 shadow-soft">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                    <span className="text-sm leading-relaxed text-foreground">{b}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Patient Journey */}
      {page.journey && page.journey.length > 0 && (
        <section className="bg-surface py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="flex items-center justify-center gap-2 text-center font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
              <Clock className="h-6 w-6 text-primary" /> {page.journeyHeading ?? "Your Journey"}
            </h2>
            <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {page.journey.map((step, i) => (
                <Reveal key={step.title} anim="up" delay={i * 70}>
                  <li className="hover-lift h-full rounded-[1.75rem] border border-border bg-card p-6 shadow-soft">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 font-heading text-lg font-bold text-primary">
                      {i + 1}
                    </span>
                    <h3 className="mt-4 font-heading font-bold text-foreground">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
            Frequently Asked Questions
          </h2>
          <div className="mt-10">
            <FaqAccordion faqs={page.faqs} />
          </div>
        </div>
      </section>

      <PageCTA />
      <RelatedServices slugs={page.relatedServiceSlugs} />
      <RelatedArticles posts={relatedPosts} />
    </PageLayout>
  );
}
