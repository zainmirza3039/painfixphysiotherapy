import { ArrowUpRight, CheckCircle2, MessageCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import homeVisitImg from "@/assets/home-visit.webp";
import { useI18n } from "@/i18n/LanguageProvider";
import { WHATSAPP_URL } from "./constants";

const HOME_VISIT_WHATSAPP_URL = `${WHATSAPP_URL}?text=${encodeURIComponent(
  "Hi PainFix Physiotherapy, I'd like to ask about a home physiotherapy visit in Multan.",
)}`;

export function HomePhysio() {
  const { t } = useI18n();
  const home = t.homePhysio;

  return (
    <section
      id="home-physio"
      aria-labelledby="home-physio-title"
      className="scroll-mt-24 bg-surface py-10 sm:py-14"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-soft">
          <Link
            to="/home-visit"
            className="group grid text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset md:grid-cols-[1.1fr_0.9fr]"
          >
            <div className="flex flex-col items-start justify-center p-6 sm:p-8 lg:p-10">
              <p className="home-eyebrow">
                <span aria-hidden="true" /> {home.eyebrow}
              </p>
              <h2
                id="home-physio-title"
                className="mt-4 max-w-xl font-heading text-3xl font-semibold leading-tight tracking-[-0.03em] text-foreground sm:text-4xl"
              >
                {home.title}
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
                {home.subtitle}
              </p>

              <ul className="mt-5 grid w-full gap-2 sm:grid-cols-2">
                {home.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-secondary"
                      aria-hidden="true"
                    />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>

              <span className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors group-hover:bg-primary/90">
                {home.requestButton}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
            <div className="relative min-h-64 overflow-hidden bg-muted sm:min-h-72 md:min-h-full">
              <img
                src={homeVisitImg}
                alt="PainFix physiotherapist in scrubs attending to a patient at home."
                width={720}
                height={1280}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover object-[50%_55%] transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </div>
          </Link>
          <div className="flex flex-col gap-3 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
            <p className="text-sm leading-6 text-muted-foreground">{home.askFirst}</p>
            <a
              href={HOME_VISIT_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-md border border-secondary/40 px-4 py-2.5 text-sm font-semibold text-secondary transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              {t.actions.whatsapp}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
