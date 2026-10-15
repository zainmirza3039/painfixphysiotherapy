import { ArrowUpRight, Dumbbell, Activity, HeartPulse, ShieldPlus } from "lucide-react";
import { Link } from "@tanstack/react-router";

const focusAreas = [
  { icon: Dumbbell, label: "Strength" },
  { icon: Activity, label: "Mobility" },
  { icon: ShieldPlus, label: "Injury prevention" },
  { icon: HeartPulse, label: "Rehabilitation" },
];

export function PhysioFitness() {
  return (
    <section id="physiotherapy-fitness" className="home-fitness-band scroll-mt-24">
      <div className="mx-auto grid max-w-7xl gap-7 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
            Physiotherapy + fitness
          </p>
          <h2 className="mt-2 font-heading text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
            Recovery should carry into everyday movement.
          </h2>
          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
            {focusAreas.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground"
              >
                <Icon className="h-4 w-4 text-secondary" aria-hidden="true" /> {label}
              </li>
            ))}
          </ul>
        </div>
        <Link
          to="/fitness-rehabilitation"
          className="inline-flex min-h-11 items-center justify-center gap-2 border border-primary px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Explore fitness &amp; rehabilitation{" "}
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
