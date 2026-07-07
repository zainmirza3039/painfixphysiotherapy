import { Link } from "@tanstack/react-router";
import { HeartPulse, Home, CheckCircle2, ArrowRight } from "lucide-react";
import homeVisitImg from "@/assets/home-visit.jpg";
import { Reveal } from "./Reveal";
import { useI18n } from "@/i18n/LanguageProvider";

export function HomePhysio() {
  const { t } = useI18n();
  const p = t.homePhysio;

  return (
    <section id="home-physio" className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-10">
          <Reveal anim="left">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="overflow-hidden rounded-[2rem] shadow-glow ring-1 ring-border">
                <img
                  src={homeVisitImg}
                  alt="Physiotherapist providing home physiotherapy to an elderly patient"
                  width={1280}
                  height={960}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="glass animate-float absolute -bottom-5 left-4 flex items-center gap-2.5 rounded-2xl px-4 py-3 shadow-card sm:left-6">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-secondary/15 text-secondary">
                  <Home className="h-4 w-4" />
                </span>
                <span className="text-sm font-semibold text-foreground">{p.eyebrow}</span>
              </div>
            </div>
          </Reveal>

          <Reveal anim="right">
            <span className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">
              <HeartPulse className="h-4 w-4 text-secondary" /> {p.eyebrow}
            </span>
            <h2 className="mt-5 font-heading text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
              {p.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">{p.intro}</p>

            <p className="mt-6 text-sm font-semibold text-foreground">{p.suitableTitle}:</p>
            <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {p.suitable.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-secondary" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Link
                to="/home-visit"
                className="ripple inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-card transition-transform hover:scale-[1.03]"
              >
                {t.actions.bookHomeVisit} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
