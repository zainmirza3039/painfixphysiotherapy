import {
  ArrowDownRight,
  CalendarDays,
  Clock3,
  MapPin,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import heroImg from "@/assets/hero.webp";
import heroAvif480 from "@/assets/hero-480.avif";
import heroAvif768 from "@/assets/hero-768.avif";
import heroAvif960 from "@/assets/hero-960.avif";
import heroWebp480 from "@/assets/hero-480.webp";
import heroWebp768 from "@/assets/hero-768.webp";
import heroWebp960 from "@/assets/hero-960.webp";
import { team } from "@/data/team";
import { ClinicianPortrait } from "./ClinicianPortrait";
import { Reveal } from "./Reveal";
import { WHATSAPP_URL } from "./constants";
import { openCalendlyPopup } from "./calendly";

// Responsive srcsets keep the hero quick to load on smaller screens.
const HERO_SIZES = "(min-width: 1024px) 600px, (min-width: 640px) 448px, 90vw";
const HERO_AVIF_SRCSET = `${heroAvif480} 480w, ${heroAvif768} 768w, ${heroAvif960} 960w`;
const HERO_WEBP_SRCSET = `${heroWebp480} 480w, ${heroWebp768} 768w, ${heroWebp960} 960w`;
const leadClinician = team[0];

export function Hero() {
  return (
    <section
      id="home"
      aria-labelledby="home-heading"
      className="hero-section relative isolate overflow-hidden pb-16 pt-28 sm:pb-20 sm:pt-36 lg:pb-24"
    >
      <div className="pointer-events-none absolute -right-28 top-0 h-[26rem] w-[26rem] rounded-full bg-secondary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-36 -left-24 h-[25rem] w-[25rem] rounded-full bg-primary/10 blur-3xl" />

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:px-8">
        <Reveal anim="up" className="relative z-10 order-2 lg:order-1">
          <span className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-background/90 px-4 py-2 text-sm font-semibold text-accent-foreground shadow-soft">
            <MapPin className="h-4 w-4 text-secondary" aria-hidden="true" />
            Physiotherapy in Multan · PainFix
          </span>

          <h1
            id="home-heading"
            className="mt-6 max-w-2xl font-heading text-4xl font-extrabold leading-[1.06] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            Move forward
            <br />
            with a plan.
            <br />
            <span className="text-gradient">Feel like you again.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            PainFix brings DPT-led physiotherapy and thoughtful rehabilitation together in Multan.
            Start with a careful assessment, then take the next steps at a pace and plan shaped
            around your needs.
          </p>

          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-foreground">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-secondary" aria-hidden="true" />
              DPT-led care
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-secondary" aria-hidden="true" />A plan made for
              you
            </span>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => openCalendlyPopup()}
              className="ripple inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-card transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <CalendarDays className="h-4 w-4" aria-hidden="true" /> Book an appointment
            </button>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border border-secondary/35 bg-background/85 px-6 py-3.5 text-sm font-semibold text-secondary transition-colors hover:bg-secondary hover:text-secondary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> Talk to our team
            </a>
          </div>

          <div className="mt-7 flex max-w-xl items-start gap-3 rounded-2xl border border-border/80 bg-card/90 p-4 shadow-soft">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-secondary">
              <Clock3 className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-bold text-foreground">Clinic hours</p>
              <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                Monday–Saturday, 11:00 AM–4:00 PM · Sunday by appointment
              </p>
            </div>
          </div>

          <a
            href="#doctors"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary underline-offset-4 transition-colors hover:text-secondary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Meet the PainFix team <ArrowDownRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </Reveal>

        <Reveal anim="right" className="order-1 lg:order-2">
          <div className="hero-photo-frame relative mx-auto max-w-md lg:max-w-none">
            <div className="aspect-[4/5] max-h-[680px] overflow-hidden rounded-[2rem] shadow-glow ring-1 ring-border/80">
              <picture>
                <source type="image/avif" srcSet={HERO_AVIF_SRCSET} sizes={HERO_SIZES} />
                <source type="image/webp" srcSet={HERO_WEBP_SRCSET} sizes={HERO_SIZES} />
                <img
                  src={heroImg}
                  alt="Physiotherapist providing hands-on care to a patient at PainFix Physiotherapy Clinic in Multan"
                  width={853}
                  height={1280}
                  className="h-full w-full object-cover"
                  fetchPriority="high"
                  decoding="async"
                />
              </picture>
            </div>

            <div className="glass absolute -left-3 top-8 hidden items-center gap-2.5 rounded-2xl px-4 py-3 shadow-card sm:flex lg:-left-6">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-secondary/15 text-secondary">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold text-foreground">Assessment first</span>
            </div>

            <div className="glass absolute -right-3 top-1/3 hidden items-center gap-2.5 rounded-2xl px-4 py-3 shadow-card sm:flex lg:-right-6">
              <span className="text-sm font-semibold text-foreground">Care built around you</span>
            </div>

            <div className="glass absolute bottom-4 left-4 flex max-w-[calc(100%-2rem)] items-center gap-3 rounded-2xl p-3 shadow-card sm:bottom-5 sm:left-5">
              <ClinicianPortrait
                photo={leadClinician.photo}
                name={leadClinician.name}
                role={leadClinician.role}
                className="h-12 w-12 shrink-0 rounded-xl ring-2 ring-background"
              />
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
                  Your PainFix team
                </p>
                <p className="truncate font-heading text-sm font-bold text-foreground sm:text-base">
                  DPT-led physiotherapy
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  Multan · Patient-first care
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
