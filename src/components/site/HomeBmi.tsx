import { ArrowRight, Calculator, Droplets, Flame, Scale, Beef, Star } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";
import { BmiCalculator } from "./BmiCalculator";

/**
 * Featured "Free Health Assessment Tools" section, placed high on the homepage
 * (right after the Hero) so the interactive BMI tool is one of the first things
 * visitors see. Uses the shared, purely client-side BmiCalculator (no charting
 * library, no network) so it adds no layout shift and no Core Web Vitals cost.
 * The other four calculators are lightweight cards that link to the Health
 * Tools hub instead of loading their logic here.
 */

const TOOLS = [
  {
    icon: Calculator,
    title: "BMI Calculator",
    text: "Check your Body Mass Index and WHO category.",
    featured: true,
  },
  {
    icon: Flame,
    title: "Calorie Calculator",
    text: "Estimate your daily energy needs.",
    featured: false,
  },
  {
    icon: Droplets,
    title: "Water Intake",
    text: "Find your recommended daily hydration.",
    featured: false,
  },
  {
    icon: Beef,
    title: "Protein Intake",
    text: "Estimate your daily protein target.",
    featured: false,
  },
  {
    icon: Scale,
    title: "Ideal Weight",
    text: "See your healthy weight range.",
    featured: false,
  },
];

export function HomeBmi() {
  return (
    <section id="health-tools" className="bg-surface py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Free Health Tools"
          title="Free Health Assessment Tools"
          subtitle="Check your health indicators instantly using our evidence-based calculators."
        />

        {/* Tool cards — BMI featured, others link to the Health Tools hub */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {TOOLS.map((tool, i) => {
            const Icon = tool.icon;
            const cardBase =
              "group flex h-full flex-col rounded-2xl border p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card";

            const inner = (
              <>
                <div className="flex items-center justify-between">
                  <span
                    className={`grid h-11 w-11 place-items-center rounded-2xl transition-colors ${
                      tool.featured
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  {tool.featured && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-secondary">
                      <Star className="h-3 w-3 fill-current" aria-hidden="true" /> Featured
                    </span>
                  )}
                </div>
                <h3 className="mt-4 font-heading text-sm font-bold text-foreground">{tool.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{tool.text}</p>
                <span className="mt-auto pt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                  {tool.featured ? "Try it below" : "Open tool"}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </>
            );

            return (
              <Reveal key={tool.title} anim="up" delay={i * 60}>
                {tool.featured ? (
                  <a
                    href="#bmi-calculator"
                    className={`${cardBase} border-primary/40 bg-card ring-1 ring-primary/20`}
                  >
                    {inner}
                  </a>
                ) : (
                  <Link
                    to="/health-calculators"
                    className={`${cardBase} border-border bg-card`}
                  >
                    {inner}
                  </Link>
                )}
              </Reveal>
            );
          })}
        </div>

        {/* Featured BMI calculator — expanded by default */}
        <div id="bmi-calculator" className="mt-10 scroll-mt-24">
          <Reveal anim="up">
            <BmiCalculator />
          </Reveal>
        </div>

        <Reveal anim="up" delay={120}>
          <div className="mt-6 text-center">
            <Link
              to="/health-calculators"
              className="inline-flex items-center gap-2 rounded-2xl border border-primary/25 bg-primary/5 px-6 py-3.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              Explore All Health Tools <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
