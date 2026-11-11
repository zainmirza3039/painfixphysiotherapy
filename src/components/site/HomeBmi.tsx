import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";
import { BmiCalculator } from "./BmiCalculator";

/**
 * One useful health tool on the homepage. The complete calculator collection
 * remains available on the dedicated Health Calculators page.
 */
export function HomeBmi() {
  return (
    <section id="health-tools" className="bg-surface py-14 sm:py-18">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Health tool"
          title="Check your BMI."
          subtitle="Get a general Body Mass Index estimate using your height and weight. BMI is a screening measure, not a diagnosis."
        />

        <div id="bmi-calculator" className="mt-8 scroll-mt-24">
          <Reveal anim="up">
            <BmiCalculator />
          </Reveal>
        </div>

        <div className="mt-5 text-center">
          <Link
            to="/health-calculators"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:text-secondary"
          >
            View all health tools
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
