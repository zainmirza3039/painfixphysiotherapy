import { ArrowUpRight, House, Check } from "lucide-react";
import { Link } from "@tanstack/react-router";

const suitableFor = [
  "Older adults",
  "Post-surgical recovery",
  "Stroke rehabilitation",
  "People with limited mobility",
];

export function HomePhysio() {
  return (
    <section id="home-physio" className="home-section home-section--homevisit scroll-mt-24">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16 lg:px-8">
        <div>
          <p className="home-eyebrow">
            <span aria-hidden="true" /> Home physiotherapy
          </p>
          <h2 className="home-section-title mt-4 max-w-2xl">
            When getting to the clinic is difficult, ask about care at home.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
            PainFix offers home physiotherapy visits in Multan. Share your location and needs with
            the team to discuss whether a home appointment is available and suitable.
          </p>
          <Link
            to="/home-visit"
            className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Ask about a home visit <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <aside className="home-homevisit-panel" aria-label="Home physiotherapy information">
          <div className="flex items-center gap-3 border-b border-white/20 pb-5">
            <span className="grid h-11 w-11 place-items-center bg-white/10 text-white">
              <House className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/65">
                A practical option
              </p>
              <p className="mt-1 font-heading text-xl font-semibold text-white">
                Home visits in Multan
              </p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-6 text-white/75">
            Home physiotherapy may be useful to discuss for:
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {suitableFor.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-white/90">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#48D28F]" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
