import { Link } from "@tanstack/react-router";
import { ArrowRight, MapPin, Phone, Clock, Stethoscope, BookOpen } from "lucide-react";
import type { LocalPage } from "@/data/localPages";
import { serviceMap } from "@/data/services";
import { conditionMap } from "@/data/conditions";
import { blogPostMap } from "@/data/blog";
import { team } from "@/data/team";
import { PageLayout } from "./PageLayout";
import { PageHero } from "./PageHero";
import { PageCTA } from "./PageCTA";
import { QuickAnswer } from "./QuickAnswer";
import { FaqAccordion } from "./FaqAccordion";
import { Reveal } from "./Reveal";
import {
  CLINIC_ADDRESS,
  MAP_PLACE_URL,
  MAP_DIRECTIONS_URL,
  PHONE_DISPLAY,
  PHONE_TEL,
  OPENING_HOURS,
} from "./constants";

export function LocalLandingPage({ page }: { page: LocalPage }) {
  const services = page.serviceSlugs.map((s) => serviceMap[s]).filter(Boolean);
  const conditions = page.conditionSlugs.map((c) => conditionMap[c]).filter(Boolean);
  const blogs = page.blogSlugs.map((b) => blogPostMap[b]).filter(Boolean);

  return (
    <PageLayout>
      <PageHero
        eyebrow={page.eyebrow}
        title={page.title}
        subtitle={page.heroSubtitle}
        crumbs={[
          { label: "Home", path: "/" },
          { label: page.title, path: `/${page.slug}` },
        ]}
      />

      {/* Quick Answer + Key Takeaways (AEO/GEO) */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <QuickAnswer answer={page.quickAnswer} takeaways={page.keyTakeaways} />
        </div>
      </section>

      {/* Content sections */}
      <section className="pb-4">
        <div className="mx-auto max-w-4xl space-y-12 px-4 sm:px-6 lg:px-8">
          {page.sections.map((s) => (
            <Reveal key={s.heading} anim="up">
              <h2 className="font-heading text-2xl font-extrabold text-foreground sm:text-3xl">{s.heading}</h2>
              <div className="mt-4 space-y-4">
                {s.paragraphs.map((p) => (
                  <p key={p} className="text-base leading-relaxed text-muted-foreground">{p}</p>
                ))}
              </div>
              {s.list && s.list.length > 0 && (
                <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                  {s.list.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-foreground">
                      <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-secondary rtl:rotate-180" /> {item}
                    </li>
                  ))}
                </ul>
              )}
            </Reveal>
          ))}
        </div>
      </section>

      {/* Services offered */}
      {services.length > 0 && (
        <section className="bg-surface py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
              Physiotherapy Services We Offer
            </h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service, i) => (
                <Reveal key={service.slug} anim="up" delay={(i % 3) * 70}>
                  <Link
                    to="/services/$slug"
                    params={{ slug: service.slug }}
                    className="hover-lift group flex h-full flex-col rounded-[1.75rem] border border-border bg-card p-6 shadow-soft"
                  >
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary/12 text-secondary">
                      <service.icon className="h-6 w-6" />
                    </span>
                    <h3 className="mt-4 font-heading text-lg font-bold text-foreground">{service.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{service.tagline}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                      Learn more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Conditions treated */}
      {conditions.length > 0 && (
        <section className="py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
              Conditions We Treat in Multan
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {conditions.map((c, i) => (
                <Reveal key={c.slug} anim="up" delay={(i % 3) * 60}>
                  <Link
                    to="/conditions/$slug"
                    params={{ slug: c.slug }}
                    className="hover-lift group flex h-full items-center justify-between gap-3 rounded-2xl border border-border bg-card px-6 py-5 shadow-soft"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-2xl" aria-hidden="true">{c.icon}</span>
                      <span className="font-heading font-bold text-foreground">{c.title}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1 rtl:rotate-180" />
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Meet the doctors (E-E-A-T) */}
      <section className="bg-surface py-14 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="flex items-center justify-center gap-2 text-center font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
            <Stethoscope className="h-6 w-6 text-primary" /> Meet Your Physiotherapists
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {team.map((m, i) => (
              <Reveal key={m.name} anim="up" delay={i * 80}>
                <div className="flex h-full gap-4 rounded-[1.75rem] border border-border bg-card p-6 shadow-soft">
                  <img
                    src={m.photo}
                    alt={`${m.name}, ${m.role} at PainFix Physiotherapy Clinic, Multan`}
                    width={72}
                    height={72}
                    loading="lazy"
                    className="h-18 w-18 shrink-0 rounded-2xl object-cover"
                  />
                  <div className="min-w-0">
                    <h3 className="font-heading text-lg font-bold text-foreground">{m.name}</h3>
                    <p className="text-sm font-semibold text-primary">{m.role}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.bio}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Location / NAP */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[1.75rem] border border-border bg-card p-8 shadow-soft">
            <h2 className="font-heading text-xl font-bold text-foreground">Visit PainFix Physiotherapy Clinic</h2>
            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              <li>
                <a
                  href={MAP_PLACE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 transition-colors hover:text-primary"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-secondary" /> {CLINIC_ADDRESS}
                </a>
              </li>
              <li>
                <a href={PHONE_TEL} className="flex items-center gap-2.5 transition-colors hover:text-primary">
                  <Phone className="h-4 w-4 shrink-0 text-secondary" /> {PHONE_DISPLAY}
                </a>
              </li>
              {OPENING_HOURS.map((h) => (
                <li key={h.days} className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 shrink-0 text-secondary" /> {h.days}: {h.time}
                </li>
              ))}
            </ul>
            <a
              href={MAP_DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="ripple mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-card transition-transform hover:scale-[1.03]"
            >
              <MapPin className="h-4 w-4" /> Get Directions
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-surface py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
            Frequently Asked Questions
          </h2>
          <div className="mt-10">
            <FaqAccordion faqs={page.faqs} />
          </div>
        </div>
      </section>

      {/* Related reading */}
      {blogs.length > 0 && (
        <section className="py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="flex items-center justify-center gap-2 text-center font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
              <BookOpen className="h-6 w-6 text-primary" /> Helpful Reading
            </h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {blogs.map((post, i) => (
                <Reveal key={post.slug} anim="up" delay={(i % 3) * 70}>
                  <Link
                    to="/blog/$slug"
                    params={{ slug: post.slug }}
                    className="hover-lift group flex h-full flex-col rounded-[1.75rem] border border-border bg-card p-6 shadow-soft"
                  >
                    <h3 className="font-heading text-lg font-bold text-foreground">{post.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">{post.excerpt}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                      Read article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <PageCTA />
    </PageLayout>
  );
}
