import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Calculator, ArrowRight, Apple } from "lucide-react";
import { PageLayout } from "@/components/site/PageLayout";
import { PageHero } from "@/components/site/PageHero";
import { PageCTA } from "@/components/site/PageCTA";
import { Reveal } from "@/components/site/Reveal";
import { FaqAccordion } from "@/components/site/FaqAccordion";
import { DIET_NUTRITION_ENABLED } from "@/data/wellness";
import { pageMeta, canonical, breadcrumbLd } from "@/lib/seo";

const PATH = "/fitness-resources";
const TITLE = "Free Fitness & Exercise Resources in Multan | PainFix";
const DESCRIPTION =
  "Free, physiotherapist-approved fitness resources from PainFix Multan — exercise guides, mobility routines, injury-prevention tips, recovery advice and healthy-eating basics.";

const GUIDES = [
  {
    q: "How to warm up correctly before exercise",
    a: "Start with 5–10 minutes of light cardio to raise your heart rate, then do dynamic movements (leg swings, arm circles, hip openers) through the ranges you'll use. Avoid long static stretches before training — save those for cool-down. A good warm-up primes muscles and reduces injury risk.",
  },
  {
    q: "Simple mobility routine for stiff joints",
    a: "Spend 10 minutes daily on gentle, controlled movements: neck rotations, shoulder rolls, thoracic twists, cat-cow for the spine, hip circles and ankle mobility. Move slowly within a comfortable range and breathe. Consistency matters more than intensity for restoring stiff joints.",
  },
  {
    q: "Safe strength-training basics for beginners",
    a: "Begin with bodyweight movements (squats, wall push-ups, glute bridges) and master the form before adding load. Train 2–3 times weekly, progress gradually, and rest at least a day between sessions for the same muscle group. Stop and seek advice if you feel sharp or joint pain.",
  },
  {
    q: "Everyday posture tips for desk workers",
    a: "Keep your screen at eye level, feet flat, and lower back supported. Stand and move every 30–45 minutes, and add daily chest-opening and upper-back exercises. Small, frequent movement breaks beat one long stretch at the end of the day.",
  },
  {
    q: "How to prevent common gym and sports injuries",
    a: "Warm up properly, progress load gradually (roughly no more than ~10% per week), prioritise technique over weight, and don't skip rest and recovery. Address niggles early rather than pushing through pain, and include mobility and strength work for injury-prone areas.",
  },
  {
    q: "Cool-down and recovery after training",
    a: "Finish with 5–10 minutes of easy movement and gentle static stretching for the muscles you worked. Prioritise sleep, hydration and adequate protein. Light activity on rest days (walking, easy mobility) can aid recovery more than complete inactivity.",
  },
  {
    q: "Low back pain: safe movement do's and don'ts",
    a: "Most non-specific back pain improves with gentle movement, not bed rest. Keep active within comfort, avoid prolonged sitting, and build core and hip strength gradually. Seek assessment if pain is severe, spreading down the leg, or accompanied by numbness or weakness.",
  },
  {
    q: "Staying active and safe as you get older",
    a: "Aim for a mix of strength, balance and gentle cardio. Balance work (e.g. standing on one leg near support) reduces fall risk, while regular strength work preserves independence. Start light, progress slowly, and get a professional assessment if you have health conditions.",
  },
];

const NUTRITION_BASICS = [
  {
    q: "Balanced eating basics",
    a: "Build meals around vegetables, quality protein (dal, eggs, chicken, fish, dairy), whole grains and healthy fats. Watch portion sizes, limit sugary drinks and fried foods, and eat mindfully. Small sustainable changes beat restrictive crash diets.",
  },
  {
    q: "Protein for recovery and strength",
    a: "Protein supports muscle repair and recovery. Spread intake across the day with sources like eggs, dairy, lentils, beans, chicken and fish. Use our protein calculator for a personalised target based on your weight and activity.",
  },
  {
    q: "Staying hydrated",
    a: "Hydration supports energy, joint health and recovery. Needs rise with heat and activity — common in Multan's climate. Use our water-intake calculator as a starting guide and drink more around exercise.",
  },
];

export const Route = createFileRoute("/fitness-resources")({
  head: () => ({
    meta: pageMeta({ title: TITLE, description: DESCRIPTION, path: PATH }),
    links: canonical(PATH),
    scripts: [
      breadcrumbLd([
        { label: "Home", path: "/" },
        { label: "Fitness", path: "/fitness" },
        { label: "Resources", path: PATH },
      ]),
    ],
  }),
  component: FitnessResources,
});

function FitnessResources() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Free Resources"
        title="Fitness & Exercise Resources"
        subtitle="Physiotherapist-approved guides on warming up, mobility, strength, posture, injury prevention and recovery — plus free health calculators."
        icon={<BookOpen className="h-8 w-8" />}
        crumbs={[
          { label: "Home", path: "/" },
          { label: "Fitness", path: "/fitness" },
          { label: "Resources", path: PATH },
        ]}
      />

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-extrabold text-foreground sm:text-3xl">Exercise & Recovery Guides</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Practical, evidence-informed guidance. These tips are general — for pain or injury, get a personalised assessment.
          </p>
          <div className="mt-8">
            <FaqAccordion faqs={GUIDES} />
          </div>
        </div>
      </section>

      <section className="bg-surface py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="flex items-center gap-2 font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
            <Apple className="h-6 w-6 text-secondary" /> Healthy Eating Basics
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            General nutrition guidance to support your training and recovery.
            {!DIET_NUTRITION_ENABLED &&
              " Personalised diet plans from a qualified dietitian are launching soon."}
          </p>
          <div className="mt-8">
            <FaqAccordion faqs={NUTRITION_BASICS} />
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <Reveal anim="up">
              <Link
                to="/health-calculators"
                className="hover-lift group flex h-full flex-col rounded-[1.75rem] border border-border bg-card p-6 shadow-soft focus-within:ring-2 focus-within:ring-primary"
              >
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Calculator className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-heading text-lg font-bold text-foreground">Health Calculators</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">
                  Free BMI, calorie, protein and water-intake calculators.
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  Open calculators <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
            <Reveal anim="up" delay={80}>
              <Link
                to="/fitness-assessment"
                className="hover-lift group flex h-full flex-col rounded-[1.75rem] border border-border bg-card p-6 shadow-soft focus-within:ring-2 focus-within:ring-primary"
              >
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary/12 text-secondary">
                  <BookOpen className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-heading text-lg font-bold text-foreground">Fitness Assessment</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">
                  Check your BMI, estimate body fat and set your goals.
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  Start assessment <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      <PageCTA />
    </PageLayout>
  );
}
