import { createFileRoute } from "@tanstack/react-router";
import {
  ClipboardList,
  PhoneCall,
  CalendarCheck,
  Home as HomeIcon,
  Stethoscope,
  HeartPulse,
  MapPin,
  MessageCircle,
  Phone,
  CheckCircle2,
  BadgeDollarSign,
  Plus,
  Minus,
} from "lucide-react";
import { useState } from "react";
import homeVisitImg from "@/assets/home-visit.jpg";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFab } from "@/components/site/WhatsAppFab";
import { Reveal } from "@/components/site/Reveal";
import { HomeVisitForm } from "@/components/site/HomeVisitForm";
import { useI18n } from "@/i18n/LanguageProvider";
import { WHATSAPP_URL, PHONE_TEL, PHONE_DISPLAY } from "@/components/site/constants";

const TITLE = "Book a Home Visit — Home Physiotherapy in Multan | PainFix";
const DESCRIPTION =
  "Premium home physiotherapy in Multan. Licensed physiotherapists provide personalized assessment, treatment and rehabilitation at your home. Request a home visit today.";

export const Route = createFileRoute("/home-visit")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: "/home-visit" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: "/home-visit" }],
  }),
  component: HomeVisitPage,
});

const stepIcons = [ClipboardList, PhoneCall, CalendarCheck, HomeIcon, Stethoscope, HeartPulse];

function HomeVisitPage() {
  const { t } = useI18n();
  const hv = t.homeVisit;
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden pt-28 pb-14 sm:pt-36">
          <div className="pointer-events-none absolute -top-24 right-0 h-[26rem] w-[26rem] rounded-full bg-secondary/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-24 h-[24rem] w-[24rem] rounded-full bg-primary/10 blur-3xl" />
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <Reveal anim="up">
              <span className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">
                <HomeIcon className="h-4 w-4 text-secondary" /> {hv.hero.badge}
              </span>
              <h1 className="mt-6 font-heading text-4xl font-extrabold leading-[1.08] text-foreground sm:text-5xl">
                {hv.hero.title}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {hv.hero.subtitle}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#request"
                  className="ripple inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-card transition-transform hover:scale-[1.03]"
                >
                  <HeartPulse className="h-4 w-4" /> {t.actions.requestVisit}
                </a>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl border border-secondary bg-background px-6 py-3.5 text-sm font-semibold text-secondary transition-colors hover:bg-secondary hover:text-secondary-foreground"
                >
                  <MessageCircle className="h-4 w-4" /> {t.actions.whatsapp}
                </a>
                <a
                  href={PHONE_TEL}
                  className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-6 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
                >
                  <Phone className="h-4 w-4" /> {t.actions.callNow}
                </a>
              </div>
            </Reveal>

            <Reveal anim="right">
              <div className="overflow-hidden rounded-[2rem] shadow-glow ring-1 ring-border">
                <img
                  src={homeVisitImg}
                  alt="Home physiotherapy session with a licensed physiotherapist"
                  width={1280}
                  height={960}
                  className="h-full w-full object-cover"
                  fetchPriority="high"
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* Intro */}
        <section className="py-8">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <Reveal anim="up">
              <h2 className="font-heading text-2xl font-extrabold text-foreground sm:text-3xl">{hv.intro.title}</h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">{hv.intro.body}</p>
            </Reveal>
          </div>
        </section>

        {/* Suitable for */}
        <section className="py-10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Reveal anim="up">
              <h2 className="text-center font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
                {hv.suitableTitle}
              </h2>
            </Reveal>
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {t.homePhysio.suitable.map((item, i) => (
                <Reveal anim="up" key={item}>
                  <div className="hover-lift flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-secondary" />
                    <span className="text-sm font-medium text-foreground">{item}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* How it works — timeline */}
        <section className="bg-surface py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Reveal anim="up">
              <div className="text-center">
                <h2 className="font-heading text-2xl font-extrabold text-foreground sm:text-3xl">{hv.how.title}</h2>
                <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{hv.how.subtitle}</p>
              </div>
            </Reveal>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {hv.how.steps.map((step, i) => {
                const Icon = stepIcons[i] ?? ClipboardList;
                return (
                  <Reveal anim="up" key={step.title}>
                    <div className="hover-lift relative h-full rounded-[1.75rem] border border-border bg-card p-6 shadow-soft">
                      <span className="absolute end-5 top-5 font-heading text-4xl font-extrabold text-primary/10">
                        {i + 1}
                      </span>
                      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/12 text-primary">
                        <Icon className="h-6 w-6" />
                      </span>
                      <h3 className="mt-4 font-heading font-bold text-foreground">{step.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* Service areas + Scheduling */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <Reveal anim="left">
              <div className="h-full rounded-[1.75rem] border border-border bg-card p-8 shadow-soft">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary/12 text-secondary">
                  <MapPin className="h-6 w-6" />
                </span>
                <h2 className="mt-4 font-heading text-2xl font-extrabold text-foreground">{hv.areas.title}</h2>
                <p className="mt-3 text-base text-muted-foreground">{hv.areas.body}</p>
                <p className="mt-2 text-sm text-muted-foreground/80">{hv.areas.note}</p>
              </div>
            </Reveal>
            <Reveal anim="right">
              <div className="h-full rounded-[1.75rem] border border-border bg-card p-8 shadow-soft">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/12 text-primary">
                  <CalendarCheck className="h-6 w-6" />
                </span>
                <h2 className="mt-4 font-heading text-2xl font-extrabold text-foreground">{hv.scheduling.title}</h2>
                <p className="mt-3 text-base text-muted-foreground">{hv.scheduling.subtitle}</p>
                <ul className="mt-4 space-y-2">
                  {hv.scheduling.ways.map((w) => (
                    <li key={w} className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-secondary" /> {w}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Pricing */}
        <section className="bg-surface py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <Reveal anim="up">
              <div className="text-center">
                <span className="grid mx-auto h-12 w-12 place-items-center rounded-2xl bg-secondary/12 text-secondary">
                  <BadgeDollarSign className="h-6 w-6" />
                </span>
                <h2 className="mt-4 font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
                  {hv.pricing.title}
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{hv.pricing.subtitle}</p>
              </div>
            </Reveal>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {hv.pricing.items.map((item, i) => (
                <Reveal anim="up" key={item}>
                  <div className="hover-lift flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
                    <span className="font-medium text-foreground">{item}</span>
                    <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                      {t.actions.callNow}
                    </span>
                  </div>
                </Reveal>
              ))}
            </div>
            <p className="mt-6 text-center text-sm text-muted-foreground/80">{hv.pricing.travelNote}</p>
            <p className="mt-2 text-center font-heading text-lg font-semibold text-primary">{hv.pricing.note}</p>
          </div>
        </section>

        {/* Request form */}
        <section id="request" className="py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <Reveal anim="up">
              <div className="rounded-[2rem] border border-border bg-card p-6 shadow-card sm:p-9">
                <h2 className="font-heading text-2xl font-extrabold text-foreground sm:text-3xl">{hv.form.title}</h2>
                <p className="mt-2 text-muted-foreground">{hv.form.subtitle}</p>
                <div className="mt-7">
                  <HomeVisitForm />
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-surface py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <Reveal anim="up">
              <h2 className="text-center font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
                {hv.faq.title}
              </h2>
            </Reveal>
            <div className="mt-10 space-y-3">
              {hv.faq.items.map((item, i) => {
                const open = openFaq === i;
                return (
                  <div key={item.q} className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? null : i)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start"
                      aria-expanded={open}
                    >
                      <span className="font-heading font-semibold text-foreground">{item.q}</span>
                      {open ? (
                        <Minus className="h-5 w-5 shrink-0 text-primary" />
                      ) : (
                        <Plus className="h-5 w-5 shrink-0 text-primary" />
                      )}
                    </button>
                    {open && (
                      <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal anim="up">
              <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary via-primary to-secondary px-6 py-14 text-center shadow-card sm:px-12">
                <h2 className="font-heading text-3xl font-extrabold text-primary-foreground sm:text-4xl">
                  {t.actions.bookHomeVisit}
                </h2>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <a
                    href="#request"
                    className="ripple inline-flex items-center gap-2 rounded-2xl bg-background px-6 py-3.5 text-sm font-semibold text-primary shadow-soft transition-transform hover:scale-105"
                  >
                    <HeartPulse className="h-4 w-4" /> {t.actions.requestVisit}
                  </a>
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl border border-primary-foreground/40 px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
                  >
                    <MessageCircle className="h-4 w-4" /> {t.actions.whatsapp}
                  </a>
                  <a
                    href={PHONE_TEL}
                    className="inline-flex items-center gap-2 rounded-2xl border border-primary-foreground/40 px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
                  >
                    <Phone className="h-4 w-4" /> {PHONE_DISPLAY}
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
