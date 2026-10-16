import { ArrowUpRight, MapPin } from "lucide-react";
import clinicImg from "@/assets/clinic-exterior.webp";
import { MAP_PLACE_URL } from "./constants";
import { Reveal } from "./Reveal";

export function About() {
  return (
    <section id="about" className="home-section scroll-mt-24">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-8">
        <Reveal anim="left">
          <figure className="home-about-photo">
            <img
              src={clinicImg}
              alt="PainFix Physiotherapy Clinic storefront in Shalimar Colony, Multan"
              width={1100}
              height={1381}
              loading="lazy"
              decoding="async"
            />
            <figcaption>Our clinic in Shalimar Colony, Multan</figcaption>
          </figure>
        </Reveal>

        <Reveal anim="right">
          <p className="home-eyebrow">
            <span aria-hidden="true" /> About PainFix
          </p>
          <h2 className="home-section-title mt-4">
            A considered approach to getting you moving again.
          </h2>
          <p className="mt-5 text-base leading-7 text-muted-foreground">
            PainFix Physiotherapy Clinic provides physiotherapy and rehabilitation in Multan. We
            start by listening to what has changed, assessing how you move, and talking through the
            next steps with you.
          </p>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Care may include hands-on treatment, guided exercise and practical education, selected
            to suit your assessment and goals. Your plan is discussed with you—not handed over as a
            one-size-fits-all routine.
          </p>
          <a
            href={MAP_PLACE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:text-secondary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <MapPin className="h-4 w-4" aria-hidden="true" /> Find PainFix in Multan
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
