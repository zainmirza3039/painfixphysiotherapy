import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  MapPin,
  Phone,
  Clock,
  Stethoscope,
  BookOpen,
  CalendarCheck,
} from "lucide-react";
import type { LocalPage } from "@/data/localPages";
import clinicExterior from "@/assets/clinic-exterior.webp";
import { serviceMap } from "@/data/services";
import { conditionMap } from "@/data/conditions";
import { blogMap } from "@/data/blog";
import { ClinicianPortrait } from "./ClinicianPortrait";
import { usePublishedClinicians } from "@/lib/usePublishedClinicians";
import { toClinicianView, type PublicClinicianContent } from "@/lib/clinician-view";
import { isClinicClinicianInCity } from "@/lib/clinician-service";
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
  GOOGLE_BUSINESS_PROFILE_URL,
  GOOGLE_REVIEW_URL,
} from "./constants";

export function LocalLandingPage({
  page,
  initialProfiles,
}: {
  page: LocalPage;
  initialProfiles?: PublicClinicianContent[];
}) {
  const services = page.serviceSlugs.map((s) => serviceMap[s]).filter(Boolean);
  const conditions = page.conditionSlugs.map((c) => conditionMap[c]).filter(Boolean);
  const blogs = page.blogSlugs.map((b) => blogMap[b]).filter(Boolean);
  const {
    data: clinicianProfiles,
    isLoading,
    isError,
    refetch,
  } = usePublishedClinicians(initialProfiles);
  const clinicians = (clinicianProfiles ?? [])
    .map(toClinicianView)
    .filter((clinician) => isClinicClinicianInCity(clinician, "Multan"));

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

      {/* Direct booking CTA for the appointment-intent landing page */}
      {page.slug === "physiotherapist-in-multan" && (
        <section className="pb-8">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Link
              to="/book-appointment"
              search={{ city: "multan", service: "clinic" }}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-center text-sm font-semibold text-primary-foreground shadow-card transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 sm:w-auto"
            >
              <CalendarCheck className="h-4 w-4" aria-hidden="true" />
              Book a Clinic Appointment
            </Link>
          </div>
        </section>
      )}

      {/* Content sections */}
      <section className="pb-4">
        <div className="mx-auto max-w-4xl space-y-12 px-4 sm:px-6 lg:px-8">
          {page.sections.map((s) => (
            <Reveal key={s.heading} anim="up">
              <h2 className="font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
                {s.heading}
              </h2>
              <div className="mt-4 space-y-4">
                {s.paragraphs.map((p) => (
                  <p key={p} className="text-base leading-relaxed text-muted-foreground">
                    {p}
                  </p>
                ))}
              </div>
              {s.list && s.list.length > 0 && (
                <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                  {s.list.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-foreground">
                      <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-secondary rtl:rotate-180" />{" "}
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </Reveal>
          ))}
        </div>
      </section>

      {/* Service-information page routes visitors to the relevant next step. */}
      {page.slug === "physiotherapy-in-multan" && (
        <section className="bg-surface py-12 sm:py-16">
          <div className="mx-auto grid max-w-4xl gap-4 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <Link
              to="/physiotherapist-in-multan"
              className="group rounded-2xl border border-border bg-card p-6 shadow-soft transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <h2 className="font-heading text-lg font-bold text-foreground">
                Book a Physiotherapy Assessment
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Review the first-appointment process and arrange an in-clinic assessment at PainFix.
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                Appointment information{" "}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
              </span>
            </Link>
            <Link
              to="/home-visit"
              className="group rounded-2xl border border-border bg-card p-6 shadow-soft transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <h2 className="font-heading text-lg font-bold text-foreground">
                Physiotherapy Home Visits Across Multan
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Check home-visit suitability, address coverage and appointment availability.
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                Home-visit details{" "}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
              </span>
            </Link>
          </div>
        </section>
      )}

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
                    className="hover-lift group flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-soft"
                  >
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary/12 text-secondary">
                      <service.icon className="h-6 w-6" />
                    </span>
                    <h3 className="mt-4 font-heading text-lg font-bold text-foreground">
                      {service.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {service.tagline}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                      Learn more{" "}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
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
                      <span className="text-2xl" aria-hidden="true">
                        {c.icon}
                      </span>
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
          <div className="mt-10 grid gap-5 sm:grid-cols-2" aria-live="polite" aria-busy={isLoading}>
            {isLoading &&
              Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={index}
                  aria-hidden="true"
                  className="h-40 animate-pulse rounded-xl bg-muted"
                />
              ))}
            {isError && (
              <div
                role="alert"
                className="rounded-xl border border-border bg-card p-6 text-sm"
              >
                <p className="text-foreground">Clinician information could not be loaded.</p>
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="mt-3 min-h-11 font-semibold text-primary underline underline-offset-4"
                >
                  Try again
                </button>
              </div>
            )}
            {!isLoading && !isError && clinicians.length === 0 && (
              <p className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
                No clinician profiles are currently published.
              </p>
            )}
            {!isLoading &&
              !isError &&
              clinicians.map((m, i) => (
                <Reveal key={m.slug} anim="up" delay={i * 80}>
                  <div className="flex h-full gap-4 rounded-xl border border-border bg-card p-6 shadow-soft">
                    <ClinicianPortrait
                      photo={m.photo}
                      name={m.name}
                      role={m.role}
                      className="h-[4.5rem] w-[4.5rem] shrink-0 rounded-2xl"
                    />
                    <div className="min-w-0">
                      <h3 className="font-heading text-lg font-bold text-foreground">{m.name}</h3>
                      <p className="text-sm font-semibold text-primary">{m.role}</p>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.bio}</p>
                      <a
                        href={`/${m.slug}`}
                        className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                        aria-label={`View profile of ${m.fullName}`}
                      >
                        View profile <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                </Reveal>
              ))}
          </div>
        </div>
      </section>

      {/* Local proof: real clinic photography, consistent NAP and live review source */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <figure className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
              <img
                src={clinicExterior}
                alt="PainFix Physiotherapy Clinic storefront in Shalimar Colony, Multan"
                width={1100}
                height={1381}
                loading="lazy"
                decoding="async"
                className="aspect-[4/5] w-full object-cover"
              />
              <figcaption className="px-5 py-3 text-sm text-muted-foreground">
                The PainFix clinic in Shalimar Colony, Multan
              </figcaption>
            </figure>

            <div className="rounded-xl border border-border bg-card p-7 shadow-soft sm:p-8">
              <h2 className="font-heading text-xl font-bold text-foreground">
                Visit PainFix Physiotherapy Clinic
              </h2>
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
                  <a
                    href={PHONE_TEL}
                    className="flex items-center gap-2.5 transition-colors hover:text-primary"
                  >
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
                className="ripple mt-6 inline-flex min-h-11 items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-card transition-transform hover:scale-[1.03]"
              >
                <MapPin className="h-4 w-4" /> Get Directions
              </a>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-5 rounded-xl border border-border bg-surface p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="max-w-2xl">
              <h3 className="font-heading text-lg font-bold text-foreground">
                Patient feedback on Google
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Read current patient feedback directly on PainFix’s Google Business Profile. Ratings
                and review counts are maintained by Google and may change over time.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <a
                href={GOOGLE_BUSINESS_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-primary px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
              >
                Read Google Reviews
              </a>
              <a
                href={GOOGLE_REVIEW_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Leave a Review
              </a>
            </div>
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
                    className="hover-lift group flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-soft"
                  >
                    <h3 className="font-heading text-lg font-bold text-foreground">{post.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                      {post.excerpt}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                      Read article{" "}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
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
