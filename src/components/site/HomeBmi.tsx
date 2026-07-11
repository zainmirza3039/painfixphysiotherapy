import { ArrowRight, HeartPulse, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";
import { BmiCalculator } from "./BmiCalculator";

const POINTS = [
  {
    icon: HeartPulse,
    title: "Know your number",
    text: "Instantly see your Body Mass Index and the World Health Organisation category it falls into.",
  },
  {
    icon: ShieldCheck,
    title: "Private & instant",
    text: "Everything is calculated in your browser — nothing you enter is stored or sent anywhere.",
  },
  {
    icon: Sparkles,
    title: "A starting point",
    text: "BMI is a general screening guide, not a diagnosis. Our physiotherapists turn it into a real plan.",
  },
];

/**
 * Featured, interactive BMI section for the homepage. Uses the shared, purely
 * client-side BmiCalculator (no charting library, no network) so it adds no
 * layout shift and no Core Web Vitals cost.
 */
export function HomeBmi() {
  return (
    <section id="bmi-calculator" className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Free Health Tool"
          title="Check your BMI in seconds"
          subtitle="Understand where you stand today, then let our team help you move, recover and get stronger. A quick, private estimate to kick-start your health journey."
        />

        <div className="mt-12 grid items-center gap-8 lg:grid-cols-2">
          {/* Educational copy */}
          <div className="order-2 lg:order-1">
            <ul className="grid gap-4">
              {POINTS.map((p, i) => (
                <Reveal key={p.title} anim="up" delay={i * 70}>
                  <li className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                      <p.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="font-heading text-base font-bold text-foreground">{p.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ul>

            <Reveal anim="up" delay={210}>
              <Link
                to="/health-calculators"
                className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-primary/25 bg-primary/5 px-6 py-3.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
              >
                Explore All Health Tools <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Reveal>
          </div>

          {/* Calculator */}
          <Reveal anim="up" className="order-1 lg:order-2">
            <BmiCalculator compact />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
