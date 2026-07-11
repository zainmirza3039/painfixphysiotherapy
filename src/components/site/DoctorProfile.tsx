import {
  GraduationCap,
  Stethoscope,
  ClipboardList,
  HeartPulse,
  MapPin,
  Clock,
  Phone,
  Calendar,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";
import type { TeamMember } from "@/data/team";
import { PageLayout } from "./PageLayout";
import { PageHero } from "./PageHero";
import { PageCTA } from "./PageCTA";
import { Reveal } from "./Reveal";
import { openCalendlyPopup } from "./calendly";
import {
  CLINIC_NAME,
  CLINIC_ADDRESS,
  MAP_DIRECTIONS_URL,
  OPENING_HOURS,
  PHONE_TEL,
} from "./constants";

/** Dedicated, SEO-optimized profile page for a single physiotherapist. */
export function DoctorProfile({ doc }: { doc: TeamMember }) {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Meet Our Doctors"
        title={doc.fullName}
        subtitle={doc.title}
        crumbs={[
          { label: "Home", path: "/" },
          { label: doc.fullName, path: `/${doc.slug}` },
        ]}
        showActions={false}
      />

      {/* Intro + portrait */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,340px)_1fr] lg:px-8">
          <Reveal anim="left">
            <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-soft">
              <img
                src={doc.photo}
                alt={`Professional portrait of ${doc.fullName}, ${doc.title} at ${CLINIC_NAME}, Multan`}
                width={900}
                height={900}
                loading="eager"
                decoding="async"
                className="h-full w-full object-cover object-top"
              />
            </div>
          </Reveal>
          <Reveal anim="right">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary">
              <Stethoscope className="h-4 w-4" /> {doc.credentials}
            </div>
            <h2 className="mt-3 font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
              About {doc.fullName}
            </h2>
            <div className="mt-5 space-y-4">
              {doc.profile.intro.map((p) => (
                <p key={p} className="text-base leading-relaxed text-muted-foreground">
                  {p}
                </p>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => openCalendlyPopup()}
                className="ripple inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-card transition-transform hover:scale-[1.03]"
              >
                <Calendar className="h-4 w-4" /> Book Appointment
              </button>
              <a
                href={`https://wa.me/${doc.whatsapp}?text=${encodeURIComponent(
                  `Hi, I'd like to book an appointment with ${doc.name} at ${CLINIC_NAME}.`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Message ${doc.name} on WhatsApp (${doc.phoneDisplay})`}
                className="inline-flex items-center gap-2 rounded-2xl border border-secondary px-6 py-3.5 text-sm font-semibold text-secondary transition-colors hover:bg-secondary hover:text-secondary-foreground"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Qualifications + Expertise */}
      <section className="bg-surface py-14 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <Reveal anim="left">
            <div className="h-full rounded-[1.75rem] border border-border bg-card p-8 shadow-soft">
              <h2 className="flex items-center gap-2 font-heading text-xl font-bold text-foreground">
                <GraduationCap className="h-5 w-5 text-primary" /> Qualifications
              </h2>
              <ul className="mt-5 space-y-3">
                {doc.profile.qualifications.map((q) => (
                  <li key={q} className="flex items-start gap-3 text-sm text-foreground">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary" /> {q}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal anim="right">
            <div className="h-full rounded-[1.75rem] border border-border bg-card p-8 shadow-soft">
              <h2 className="flex items-center gap-2 font-heading text-xl font-bold text-foreground">
                <Stethoscope className="h-5 w-5 text-primary" /> Areas of Expertise
              </h2>
              <ul className="mt-5 flex flex-wrap gap-2">
                {doc.profile.expertise.map((e) => (
                  <li
                    key={e}
                    className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground"
                  >
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Conditions treated */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Reveal anim="up">
            <h2 className="flex items-center gap-2 font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
              <ClipboardList className="h-6 w-6 text-primary" /> Conditions Treated
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {doc.fullName} treats a wide range of conditions with evidence-based physiotherapy in Multan.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {doc.profile.conditionsTreated.map((c) => (
                <li
                  key={c}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 text-sm text-foreground shadow-soft"
                >
                  <HeartPulse className="mt-0.5 h-5 w-5 shrink-0 text-secondary" /> {c}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Treatment approach */}
      <section className="bg-surface py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Reveal anim="up">
            <h2 className="font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
              Treatment Approach
            </h2>
            <div className="mt-5 space-y-4">
              {doc.profile.approach.map((p) => (
                <p key={p} className="text-base leading-relaxed text-muted-foreground">
                  {p}
                </p>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Clinic information */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Reveal anim="up">
            <div className="rounded-[1.75rem] border border-border bg-card p-8 shadow-soft">
              <h2 className="font-heading text-xl font-bold text-foreground">Clinic Information</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                See {doc.fullName} at {CLINIC_NAME}, Multan.
              </p>
              <ul className="mt-6 space-y-4 text-sm text-foreground">
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <a
                    href={MAP_DIRECTIONS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-primary"
                  >
                    {CLINIC_ADDRESS}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span>
                    {OPENING_HOURS.map((h) => (
                      <span key={h.days} className="block">
                        <span className="font-medium">{h.days}:</span> {h.time}
                      </span>
                    ))}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <a href={PHONE_TEL} className="transition-colors hover:text-primary">
                    {doc.phoneDisplay}
                  </a>
                </li>
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <PageCTA
        title={`Book an appointment with ${doc.fullName}`}
        subtitle={`Get evidence-based physiotherapy in Multan with ${doc.name}. Book online, message on WhatsApp or call the clinic today.`}
      />
    </PageLayout>
  );
}
