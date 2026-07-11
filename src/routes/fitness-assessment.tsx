import { createFileRoute } from "@tanstack/react-router";
import { Activity, CheckCircle2, ClipboardCheck } from "lucide-react";
import { PageLayout } from "@/components/site/PageLayout";
import { PageHero } from "@/components/site/PageHero";
import { PageCTA } from "@/components/site/PageCTA";
import { Reveal } from "@/components/site/Reveal";
import { QuickAnswer } from "@/components/site/QuickAnswer";
import { BmiCalculator } from "@/components/site/BmiCalculator";
import { BodyFatEstimator, FitnessGoalForm } from "@/components/site/FitnessAssessmentTools";
import { FaqAccordion } from "@/components/site/FaqAccordion";
import { pageMeta, canonical, breadcrumbLd, faqLd } from "@/lib/seo";
import { SITE_URL } from "@/components/site/constants";

const PATH = "/fitness-assessment";
const TITLE = "Free Fitness Assessment in Multan | BMI, Body Fat & Goals | PainFix";
const DESCRIPTION =
  "Free online fitness assessment at PainFix Multan — check your BMI, estimate body fat, screen your posture and set fitness goals with physiotherapist guidance.";

const POSTURE_CHECKS = [
  "Do your ears sit forward of your shoulders (forward head)?",
  "Do your shoulders round forward when relaxed?",
  "Is there an exaggerated curve in your upper back?",
  "Does your lower back arch excessively or flatten?",
  "Do your knees roll inward when you squat?",
  "Do you feel stiffness or pain after sitting for long periods?",
];

const FAQS = [
  {
    q: "Is this fitness assessment a medical diagnosis?",
    a: "No. These tools give helpful estimates and screening prompts only. For an accurate assessment of your movement, strength and body composition, book an in-clinic evaluation with our physiotherapists.",
  },
  {
    q: "What is a Functional Movement Screen (FMS)?",
    a: "FMS is a series of movement tests physiotherapists use to spot limitations, asymmetries and injury risk. We perform a full movement screen in clinic and use it to design a safe programme.",
  },
  {
    q: "How accurate is the body-fat estimate?",
    a: "It's a statistical estimate based on your BMI, age and sex — useful as a rough guide but not a measurement. In-clinic assessment gives far more accurate body-composition results.",
  },
  {
    q: "What should I do after completing the assessment?",
    a: "Share your goals with us on WhatsApp. We'll review your results, arrange a proper assessment and build a personalised, physiotherapist-led programme.",
  },
];

export const Route = createFileRoute("/fitness-assessment")({
  head: () => ({
    meta: pageMeta({ title: TITLE, description: DESCRIPTION, path: PATH }),
    links: canonical(PATH),
    scripts: [
      breadcrumbLd([
        { label: "Home", path: "/" },
        { label: "Fitness", path: "/fitness" },
        { label: "Fitness Assessment", path: PATH },
      ]),
      faqLd(FAQS),
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "PainFix Fitness Assessment",
          applicationCategory: "HealthApplication",
          operatingSystem: "Web",
          url: `${SITE_URL}${PATH}`,
          offers: { "@type": "Offer", price: "0", priceCurrency: "PKR" },
        }),
      },
    ],
  }),
  component: FitnessAssessment,
});

function FitnessAssessment() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Free Assessment"
        title="Fitness Assessment"
        subtitle="Check your BMI, estimate body fat, screen your posture and set clear fitness goals — then get a physiotherapist-led plan built around your results."
        icon={<ClipboardCheck className="h-8 w-8" />}
        crumbs={[
          { label: "Home", path: "/" },
          { label: "Fitness", path: "/fitness" },
          { label: "Fitness Assessment", path: PATH },
        ]}
      />

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <QuickAnswer
            answer="PainFix's free fitness assessment combines a BMI check, a body-fat estimate, a quick posture self-screen and a goal questionnaire. It gives you a helpful starting picture of your fitness, then connects you to our physiotherapists for an accurate in-clinic evaluation and a personalised programme."
            takeaways={[
              "Free BMI and body-fat estimation tools",
              "Simple posture self-screening checklist",
              "Set your goals and send them securely via WhatsApp",
              "Backed by professional in-clinic assessment",
            ]}
          />
        </div>
      </section>

      <section className="pb-4">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <Reveal anim="up"><BmiCalculator /></Reveal>
          <Reveal anim="up" delay={80}><BodyFatEstimator /></Reveal>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Reveal anim="up">
            <div className="rounded-[1.75rem] border border-border bg-card p-6 shadow-soft sm:p-8">
              <h2 className="flex items-center gap-2 font-heading text-xl font-extrabold text-foreground">
                <Activity className="h-5 w-5 text-secondary" /> Posture Self-Screen
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Answer these honestly. If several apply to you, a professional posture and movement assessment
                is recommended.
              </p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {POSTURE_CHECKS.map((c) => (
                  <li key={c} className="flex items-start gap-2.5 rounded-xl bg-surface p-3.5 text-sm text-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary" /> {c}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="pb-14 sm:pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Reveal anim="up"><FitnessGoalForm /></Reveal>
        </div>
      </section>

      <section className="bg-surface py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
            Fitness Assessment FAQs
          </h2>
          <div className="mt-8">
            <FaqAccordion faqs={FAQS} />
          </div>
        </div>
      </section>

      <PageCTA />
    </PageLayout>
  );
}
