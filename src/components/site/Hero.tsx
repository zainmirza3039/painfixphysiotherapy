import { Calendar, MessageCircle, ShieldCheck, HeartPulse, Stethoscope } from "lucide-react";
import heroImg from "@/assets/hero.webp";
import { Reveal } from "./Reveal";
import { WHATSAPP_URL } from "./constants";
import { openCalendlyPopup } from "./calendly";

const floatingCards = [
  { icon: ShieldCheck, label: "Evidence-Based Care", pos: "left-2 top-8 sm:-left-6", anim: "left" as const },
  { icon: HeartPulse, label: "Personalized Treatment", pos: "right-2 top-1/3 sm:-right-6", anim: "right" as const },
  { icon: Stethoscope, label: "Professional Rehabilitation", pos: "bottom-6 left-1/4", anim: "up" as const },
];

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden pt-28 pb-16 sm:pt-36 lg:pb-24">
      <div className="pointer-events-none absolute -top-24 right-0 h-[28rem] w-[28rem] rounded-full bg-secondary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-[26rem] w-[26rem] rounded-full bg-primary/10 blur-3xl" />

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8">
        <Reveal anim="up" className="order-2 lg:order-1">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">
            <span className="h-2 w-2 rounded-full bg-secondary" /> Trusted Physiotherapy in Multan
          </span>
          <h1 className="mt-6 font-heading text-4xl font-extrabold leading-[1.05] text-foreground sm:text-5xl lg:text-6xl">
            Move Better.
            <br />
            Recover Faster.
            <br />
            <span className="text-gradient">Live Pain-Free.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            PainFix Physiotherapy Clinic provides evidence-based physiotherapy and rehabilitation to help patients
            overcome pain, recover from injuries, and restore movement through personalized treatment plans.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => openCalendlyPopup()}
              className="ripple inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-card transition-transform hover:scale-[1.03]"
            >
              <Calendar className="h-4 w-4" /> Book Appointment
            </button>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border border-secondary bg-background px-6 py-3.5 text-sm font-semibold text-secondary transition-colors hover:bg-secondary hover:text-secondary-foreground"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp Now
            </a>
          </div>
        </Reveal>

        <Reveal anim="right" className="order-1 lg:order-2">
          <div className="relative mx-auto max-w-md lg:max-w-none">
            <div className="overflow-hidden rounded-[2rem] shadow-glow ring-1 ring-border">
              <img
                src={heroImg}
                alt="Professional physiotherapist treating a patient at PainFix Physiotherapy Clinic"
                width={1100}
                height={1100}
                className="h-full w-full object-cover"
                fetchPriority="high"
              />
            </div>
            {floatingCards.map((c) => (
              <div
                key={c.label}
                className={`glass animate-float absolute hidden items-center gap-2.5 rounded-2xl px-4 py-3 shadow-card sm:flex ${c.pos}`}
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-secondary/15 text-secondary">
                  <c.icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-semibold text-foreground">{c.label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
