import { createFileRoute } from "@tanstack/react-router";
import { Calculator, Info } from "lucide-react";
import { PageLayout } from "@/components/site/PageLayout";
import { PageHero } from "@/components/site/PageHero";
import { BmiCalculator } from "@/components/site/BmiCalculator";
import { HealthCalculators } from "@/components/site/HealthCalculators";
import { FaqAccordion } from "@/components/site/FaqAccordion";
import { PageCTA } from "@/components/site/PageCTA";
import { Reveal } from "@/components/site/Reveal";
import { SITE_URL } from "@/components/site/constants";
import { pageMeta, canonical, breadcrumbLd, faqLd } from "@/lib/seo";

const PATH = "/health-calculators";
const TITLE = "Free Health Calculators | BMI, Calorie, Protein & Water — PainFix";
const DESCRIPTION =
  "Free, accurate health calculators from PainFix Multan — BMI, daily calories, ideal weight, protein and water intake. Educational estimates to guide your fitness journey.";

const FAQS = [
  {
    q: "Are these health calculators accurate?",
    a: "They use recognised, evidence-based formulas (WHO BMI categories, the Mifflin–St Jeor equation for calories). They give reliable estimates for most people, but they are general guides — not a medical diagnosis or a personalised programme.",
  },
  {
    q: "Should I rely on BMI alone?",
    a: "No. BMI is a useful screening tool but it does not measure body fat, muscle mass or fitness. Muscular or athletic people can read as 'overweight' despite being healthy. Use it alongside a proper assessment.",
  },
  {
    q: "Do I need to enter personal details?",
    a: "No. All calculations run privately in your browser. Nothing you type is stored or sent anywhere.",
  },
  {
    q: "How can PainFix help me act on these results?",
    a: "Our physiotherapists can turn these numbers into a safe, personalised plan — a fitness, rehabilitation or mobility programme built around a full assessment. Message us on WhatsApp to get started.",
  },
];

export const Route = createFileRoute("/health-calculators")({
  head: () => ({
    meta: pageMeta({ title: TITLE, description: DESCRIPTION, path: PATH }),
    links: canonical(PATH),
    scripts: [
      breadcrumbLd([
        { label: "Home", path: "/" },
        { label: "Health Calculators", path: PATH },
      ]),
      faqLd(FAQS),
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "PainFix Health Calculators",
          applicationCategory: "HealthApplication",
          operatingSystem: "Web",
          url: `${SITE_URL}${PATH}`,
          offers: { "@type": "Offer", price: "0", priceCurrency: "PKR" },
        }),
      },
    ],
  }),
  component: HealthCalculatorsPage,
});

function HealthCalculatorsPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Free Tools"
        title="Health & Fitness Calculators"
        subtitle="Quick, private, evidence-based tools to help you understand your body and plan your fitness journey. All calculations run in your browser — nothing is stored."
        crumbs={[
          { label: "Home", path: "/" },
          { label: "Health Calculators", path: PATH },
        ]}
        icon={<Calculator className="h-8 w-8" />}
      />

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Reveal anim="up">
            <BmiCalculator />
          </Reveal>
        </div>
      </section>

      <section className="bg-surface py-14 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
            More Health Calculators
          </h2>
          <div className="mt-10">
            <HealthCalculators />
          </div>
          <Reveal anim="up">
            <div
              role="note"
              className="mx-auto mt-8 flex max-w-3xl items-start gap-3 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground shadow-soft"
            >
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <p className="leading-relaxed">
                These calculators provide general educational estimates only and are not a
                substitute for professional medical or dietary advice. Personalised diet plans will
                be available from a qualified dietitian once they join PainFix.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
            Frequently Asked Questions
          </h2>
          <div className="mt-10">
            <FaqAccordion faqs={FAQS} />
          </div>
        </div>
      </section>

      <PageCTA />
    </PageLayout>
  );
}
