import { createFileRoute, Link } from "@tanstack/react-router";
import { Dumbbell, ArrowRight, Calculator, BookOpen, HeartHandshake, ClipboardCheck, Sparkles } from "lucide-react";
import { PageLayout } from "@/components/site/PageLayout";
import { PageHero } from "@/components/site/PageHero";
import { PageCTA } from "@/components/site/PageCTA";
import { Reveal } from "@/components/site/Reveal";
import { QuickAnswer } from "@/components/site/QuickAnswer";
import { FITNESS_GROUPS, fitnessPagesByCategory } from "@/data/fitness";
import { pageMeta, canonical, breadcrumbLd } from "@/lib/seo";
import { SITE_URL } from "@/components/site/constants";

const PATH = "/fitness";
const TITLE = "Fitness & Rehabilitation Platform in Multan | PainFix";
const DESCRIPTION =
  "PainFix's evidence-based fitness platform in Multan — physiotherapist-led strength, mobility, injury prevention, structured programmes, free calculators and resources.";

const HUB_LINKS = [
  { to: "/fitness-assessment", icon: ClipboardCheck, title: "Fitness Assessment", text: "BMI, posture and movement screening tools." },
  { to: "/health-calculators", icon: Calculator, title: "Health Calculators", text: "BMI, calorie, protein & water calculators." },
  { to: "/fitness-resources", icon: BookOpen, title: "Free Resources", text: "Educational exercise & recovery guides." },
  { to: "/membership", icon: HeartHandshake, title: "Membership Packages", text: "Physiotherapy + fitness plans." },
] as const;

export const Route = createFileRoute("/fitness/")({
  head: () => ({
    meta: pageMeta({ title: TITLE, description: DESCRIPTION, path: PATH }),
    links: canonical(PATH),
    scripts: [
      breadcrumbLd([
        { label: "Home", path: "/" },
        { label: "Fitness", path: PATH },
      ]),
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Fitness & Rehabilitation",
          description: DESCRIPTION,
          url: `${SITE_URL}${PATH}`,
          serviceType: "Fitness & Rehabilitation",
          areaServed: "Multan, Pakistan",
          provider: { "@type": "MedicalClinic", name: "PainFix Physiotherapy Clinic" },
        }),
      },
    ],
  }),
  component: FitnessHub,
});

function FitnessHub() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Physiotherapy + Fitness"
        title="Evidence-Based Fitness & Rehabilitation"
        subtitle="More than pain relief — restore movement, build strength, improve mobility, prevent injuries and achieve long-term physical health through physiotherapist-led programmes."
        icon={<Dumbbell className="h-8 w-8" />}
        crumbs={[
          { label: "Home", path: "/" },
          { label: "Fitness", path: PATH },
        ]}
      />

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <QuickAnswer
            answer="PainFix's fitness platform brings together physiotherapist-led fitness coaching, mobility and flexibility work, sport-specific injury prevention and structured online programmes — plus free health tools. Every plan is built around your assessment and adapted to your health, so you train safely and get lasting results."
            takeaways={[
              "Led by qualified physiotherapists, not generic gym plans",
              "Covers strength, mobility, injury prevention and rehab",
              "Free calculators, assessments and educational resources",
              "Every programme adapted to your individual assessment",
            ]}
          />
        </div>
      </section>

      {/* Categories */}
      {FITNESS_GROUPS.map((group, gi) => {
        const pages = fitnessPagesByCategory(group.category);
        return (
          <section key={group.category} className={gi % 2 === 0 ? "bg-surface py-14 sm:py-20" : "py-14 sm:py-20"}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <Reveal anim="up" className="mx-auto max-w-2xl text-center">
                <span className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-accent-foreground">
                  {group.eyebrow}
                </span>
                <h2 className="mt-4 font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
                  {group.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{group.intro}</p>
              </Reveal>
              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {pages.map((p, i) => (
                  <Reveal key={p.slug} anim="up" delay={(i % 3) * 60}>
                    <Link
                      to="/fitness/$slug"
                      params={{ slug: p.slug }}
                      aria-label={`Learn more about ${p.title}`}
                      className="hover-lift group flex h-full flex-col rounded-[1.75rem] border border-border bg-card p-6 shadow-soft focus-within:ring-2 focus-within:ring-primary"
                    >
                      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary/12 text-secondary">
                        <Sparkles className="h-5 w-5" />
                      </span>
                      <h3 className="mt-4 font-heading text-lg font-bold text-foreground">{p.title}</h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                        {p.heroSubtitle}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                        Learn more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* Tools & resources */}
      <section className="bg-surface py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
            Free Tools &amp; Resources
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {HUB_LINKS.map((l, i) => (
              <Reveal key={l.to} anim="up" delay={(i % 4) * 60}>
                <Link
                  to={l.to}
                  className="hover-lift group flex h-full flex-col rounded-[1.75rem] border border-border bg-card p-6 shadow-soft focus-within:ring-2 focus-within:ring-primary"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <l.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-heading text-base font-bold text-foreground">{l.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{l.text}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
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
