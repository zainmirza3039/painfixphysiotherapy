import { ArrowUpRight, MessageCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import homeVisitImg from "@/assets/home-visit.webp";
import { WHATSAPP_URL } from "./constants";

const HOME_VISIT_WHATSAPP_URL = `${WHATSAPP_URL}?text=${encodeURIComponent(
  "Hi PainFix Physiotherapy, I'd like to ask about a home physiotherapy visit in Multan.",
)}`;

export function HomePhysio() {
  return (
    <section
      id="home-physio"
      aria-labelledby="home-physio-title"
      className="scroll-mt-24 bg-surface py-8 sm:py-10"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-border bg-background">
          <Link
            to="/home-visit"
            className="group grid text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset md:grid-cols-[1.1fr_0.9fr]"
          >
            <div className="flex flex-col items-start justify-center p-6 sm:p-8 lg:p-10">
              <p className="home-eyebrow">
                <span aria-hidden="true" /> Home physiotherapy in Multan
              </p>
              <h2
                id="home-physio-title"
                className="mt-4 max-w-xl font-heading text-3xl font-semibold leading-tight tracking-[-0.03em] text-foreground sm:text-4xl"
              >
                When getting to the clinic is difficult, care can come to you.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
                Explore PainFix home visits, then send a request so the team can discuss your needs
                and location.
              </p>
              <span className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors group-hover:bg-primary/90">
                View home visits and request a visit
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
            <div className="relative min-h-56 overflow-hidden bg-muted sm:min-h-72 md:min-h-full">
              <img
                src={homeVisitImg}
                alt="PainFix physiotherapist providing a home physiotherapy session to a patient."
                width={720}
                height={1280}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover object-[50%_55%] transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </div>
          </Link>
          <div className="flex flex-col gap-3 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
            <p className="text-sm leading-6 text-muted-foreground">
              Prefer to ask first? Message the team about home-visit availability.
            </p>
            <a
              href={HOME_VISIT_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-md border border-secondary/40 px-4 py-2.5 text-sm font-semibold text-secondary transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Ask about a home visit on WhatsApp
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
