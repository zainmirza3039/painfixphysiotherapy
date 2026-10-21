import {
  GraduationCap,
  Stethoscope,
  ClipboardList,
  HeartPulse,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";
import type { TeamMember } from "@/data/team";
import { PageLayout } from "./PageLayout";
import { PageHero } from "./PageHero";
import { PageCTA } from "./PageCTA";
import { Reveal } from "./Reveal";
import { ClinicianPortrait } from "./ClinicianPortrait";
import {
  clinicianServiceLabel,
  clinicianWhatsAppUrl,
  isOnlineClinician,
} from "@/lib/clinician-service";
import {
  CLINIC_NAME,
  CLINIC_ADDRESS,
  MAP_DIRECTIONS_URL,
  OPENING_HOURS,
  PHONE_TEL,
} from "./constants";

/** Dedicated, SEO-optimized profile page for a single physiotherapist. */
export function DoctorProfile({ doc }: { doc: TeamMember }) {
  const onlineOnly = isOnlineClinician(doc);
  const whatsappUrl = clinicianWhatsAppUrl(doc);
  const phoneHref = doc.whatsapp
    ? `tel:+${doc.whatsapp}`
    : doc.phoneDisplay
      ? `tel:${doc.phoneDisplay.replace(/[^0-9+]/g, "")}`
      : null;

  return (
    <PageLayout onlineClinician={onlineOnly ? doc : undefined}>
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

      {onlineOnly && (
        <section className="border-b border-border bg-surface py-8 sm:py-10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-lg border border-secondary/30 bg-card p-5 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-secondary">
                Online-only service · {doc.city || "Pakistan"}
              </p>
              <h2 className="mt-2 font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
                Online Video Physiotherapy Consultation
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                Consult with {doc.fullName} through an online video consultation from{" "}
                {doc.city || "Pakistan"}. If you are looking for an online physiotherapist in{" "}
                {doc.city || "Pakistan"}, message on WhatsApp to ask about availability and whether
                remote care is suitable for you.
              </p>
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Start an online physiotherapy consultation with ${doc.name} on WhatsApp`}
                  className="ripple mt-4 inline-flex items-center gap-2 rounded-2xl bg-secondary px-5 py-3 text-sm font-semibold text-secondary-foreground shadow-card transition-transform hover:scale-[1.03]"
                >
                  <MessageCircle className="h-4 w-4" /> Start on WhatsApp
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Intro + portrait */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,340px)_1fr] lg:px-8">
          <Reveal anim="left">
            <div className="aspect-square overflow-hidden rounded-lg border border-border border-l-[5px] border-l-brand-green bg-card">
              <ClinicianPortrait
                photo={doc.photo}
                name={doc.fullName}
                role={doc.title}
                className="h-full w-full"
                loading="eager"
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
            <p className="mt-3 text-sm font-semibold text-primary">{clinicianServiceLabel(doc)}</p>
            <div className="mt-5 space-y-4">
              {doc.profile.intro.map((p) => (
                <p key={p} className="break-words text-base leading-relaxed text-muted-foreground">
                  {p}
                </p>
              ))}
            </div>
            {doc.yearsExperience !== null && doc.yearsExperience !== undefined && (
              <p className="mt-4 text-sm font-medium text-muted-foreground">
                {doc.yearsExperience} {doc.yearsExperience === 1 ? "year" : "years"} of experience
              </p>
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Chat with ${doc.name} on WhatsApp`}
                  className="ripple inline-flex items-center gap-2 rounded-2xl bg-secondary px-6 py-3.5 text-sm font-semibold text-secondary-foreground shadow-card transition-transform hover:scale-[1.03]"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp Consultation
                </a>
              )}
              {phoneHref && (
                <a
                  href={phoneHref}
                  aria-label={`Call ${doc.name}${doc.phoneDisplay ? ` (${doc.phoneDisplay})` : ""}`}
                  className="inline-flex items-center gap-2 rounded-2xl border border-primary px-6 py-3.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  <Phone className="h-4 w-4" /> Call Now
                </a>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Qualifications + optional expertise */}
      <section className="bg-surface py-14 sm:py-20">
        <div
          className={`mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:px-8 ${
            doc.profile.expertise.length > 0 ? "lg:grid-cols-2" : "lg:grid-cols-1"
          }`}
        >
          <Reveal anim="left">
            <div className="h-full rounded-lg border border-border border-t-2 border-t-brand-green bg-card p-6 shadow-none sm:p-7">
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
          {doc.profile.expertise.length > 0 && (
            <Reveal anim="right">
              <div className="h-full rounded-lg border border-border border-t-2 border-t-brand-green bg-card p-6 shadow-none sm:p-7">
                <h2 className="flex items-center gap-2 font-heading text-xl font-bold text-foreground">
                  <Stethoscope className="h-5 w-5 text-primary" />{" "}
                  {onlineOnly ? "Clinical Skills" : "Areas of Expertise"}
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
          )}
        </div>
      </section>

      {/* Conditions treated */}
      {doc.profile.conditionsTreated.length > 0 && (
        <section className="py-14 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Reveal anim="up">
              <h2 className="flex items-center gap-2 font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
                <ClipboardList className="h-6 w-6 text-primary" /> Conditions Treated
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                {onlineOnly
                  ? `${doc.fullName} offers online physiotherapy guidance following an individual assessment of suitability.`
                  : `${doc.fullName} treats a wide range of conditions with evidence-based physiotherapy in Multan.`}
              </p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {doc.profile.conditionsTreated.map((c) => (
                  <li
                    key={c}
                    className="flex items-start gap-3 rounded-md border border-border bg-card p-4 text-sm text-foreground"
                  >
                    <HeartPulse className="mt-0.5 h-5 w-5 shrink-0 text-secondary" /> {c}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>
      )}

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

      {(
        [
          ["Clinical Experience", doc.profile.experience],
          [onlineOnly ? "Supervised Training" : "Training & Volunteer Work", doc.profile.training],
          ["Research", doc.profile.research],
        ] as const
      ).map(
        ([heading, items]) =>
          items &&
          items.length > 0 && (
            <section key={heading} className="py-10 sm:py-14">
              <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <Reveal anim="up">
                  <h2 className="font-heading text-2xl font-extrabold text-foreground">
                    {heading}
                  </h2>
                  {onlineOnly &&
                    (heading === "Clinical Experience" || heading === "Supervised Training") && (
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        The details below describe supervised clinical exposure, not independent
                        specialist qualifications or in-person treatment at PainFix.
                      </p>
                    )}
                  <ul className="mt-5 space-y-4">
                    {items.map((item) => (
                      <li
                        key={item}
                        className="rounded-lg border border-border bg-card p-4 text-sm leading-relaxed text-muted-foreground"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </div>
            </section>
          ),
      )}

      {/* Clinic information */}
      {onlineOnly ? (
        <section className="py-14 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Reveal anim="up">
              <div className="rounded-lg border border-border border-t-2 border-t-brand-green bg-card p-6 sm:p-7">
                <h2 className="font-heading text-xl font-bold text-foreground">
                  Online Consultation Information
                </h2>
                <p className="mt-3 text-sm font-semibold text-primary">
                  {clinicianServiceLabel(doc)}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Consultations with {doc.name} are online only and are arranged as video
                  consultations where clinically suitable. Message her directly on WhatsApp to
                  discuss availability and whether remote care is suitable. No physical PainFix
                  clinic or walk-in appointments are offered at this location.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Hands-on techniques and supervised hospital experience describe clinical training,
                  not treatments delivered online. An in-person assessment may be recommended when
                  needed.
                </p>
              </div>
            </Reveal>
          </div>
        </section>
      ) : (
        <section className="py-14 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Reveal anim="up">
              <div className="rounded-lg border border-border border-t-2 border-t-brand-green bg-card p-6 shadow-none sm:p-7">
                <h2 className="font-heading text-xl font-bold text-foreground">
                  Clinic Information
                </h2>
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
                  {phoneHref && doc.phoneDisplay && (
                    <li className="flex items-start gap-3">
                      <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <a href={phoneHref} className="transition-colors hover:text-primary">
                        {doc.phoneDisplay}
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      <PageCTA
        title={
          onlineOnly
            ? `Enquire about online physiotherapy with ${doc.fullName}`
            : `Book an appointment with ${doc.fullName}`
        }
        subtitle={
          onlineOnly
            ? `Contact ${doc.name} directly on WhatsApp for online physiotherapy availability and booking. Based in ${doc.city || "Pakistan"}; online consultations only.`
            : `Get evidence-based physiotherapy in Multan with ${doc.name}. Book online, message on WhatsApp or call the clinic today.`
        }
        {...(onlineOnly
          ? { whatsappUrl, phoneHref, phoneDisplay: doc.phoneDisplay, contactName: doc.name }
          : {})}
      />
    </PageLayout>
  );
}
