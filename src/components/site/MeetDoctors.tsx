import { ArrowUpRight, BadgeCheck, MessageCircle } from "lucide-react";
import { usePublishedClinicians } from "@/lib/usePublishedClinicians";
import { toClinicianView } from "@/lib/clinician-view";
import { Reveal } from "./Reveal";
import { ClinicianPortrait } from "./ClinicianPortrait";
import type { PublicClinicianContent } from "@/lib/clinician-view";
import { clinicianServiceLabel, clinicianWhatsAppUrl } from "@/lib/clinician-service";

export function MeetDoctors({ initialProfiles }: { initialProfiles?: PublicClinicianContent[] }) {
  const { data: profiles, isLoading, isError, refetch } = usePublishedClinicians(initialProfiles);
  const clinicians = (profiles ?? []).map(toClinicianView);

  return (
    <section id="doctors" className="home-section home-section--tint scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-9 grid gap-4 md:grid-cols-[0.9fr_1.1fr] md:items-end md:gap-12">
          <div>
            <p className="home-eyebrow">
              <span aria-hidden="true" /> The clinicians
            </p>
            <h2 className="home-section-title mt-4">Meet the people behind your care.</h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            Meet the Doctors of Physical Therapy at PainFix. Our Multan clinic team provides
            clinic-based physiotherapy and rehabilitation, while individual profiles explain each
            clinician’s qualifications, areas of practice and available service modes.
          </p>
        </div>

        <div className="home-team-list" aria-live="polite" aria-busy={isLoading}>
          {isLoading &&
            Array.from({ length: 2 }).map((_, index) => (
              <div key={index} aria-hidden="true" className="home-team-card animate-pulse">
                <div className="home-team-card__media" />
                <div className="home-team-card__content w-full space-y-3">
                  <div className="h-3 w-28 rounded bg-muted" />
                  <div className="h-7 w-4/5 rounded bg-muted" />
                  <div className="h-4 w-2/3 rounded bg-muted" />
                  <div className="mt-3 h-8 w-full rounded bg-muted" />
                </div>
              </div>
            ))}

          {isError && (
            <div role="alert" className="rounded-2xl border border-border bg-card p-6 text-sm">
              <p className="text-foreground">The clinician directory could not be loaded.</p>
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
            <p className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
              No clinician profiles are currently published.
            </p>
          )}

          {!isLoading &&
            !isError &&
            clinicians.map((doc, index) => {
              const displayRole =
                doc.slug === "dr-zain-ul-abideen-pt-multan"
                  ? "Founder & Head Physiotherapist"
                  : doc.role;

              return (
                <Reveal key={doc.slug} anim="up" delay={index * 45}>
                  <article className="home-team-card">
                    <div className="home-team-card__media">
                      <ClinicianPortrait
                        photo={doc.photo}
                        name={doc.name}
                        role={displayRole}
                        className="home-team-card__portrait"
                      />
                    </div>
                    <div className="home-team-card__content min-w-0">
                      <p className="home-team-card__credentials">
                        <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                        {doc.credentials}
                      </p>
                      <h3 className="home-team-card__name">{doc.fullName}</h3>
                      <p className="home-team-card__role">{displayRole}</p>
                      <div className="home-team-card__meta">
                        <span className="home-team-card__meta-item">
                          {clinicianServiceLabel(doc)}
                        </span>
                        {doc.yearsExperience !== null && doc.yearsExperience !== undefined && (
                          <span className="home-team-card__meta-item">
                            {doc.yearsExperience} {doc.yearsExperience === 1 ? "year" : "years"} of
                            experience
                          </span>
                        )}
                      </div>
                      {doc.tags.length > 0 && (
                        <ul
                          className="home-team-card__specialties"
                          aria-label={`${doc.name} areas of practice`}
                        >
                          {doc.tags.slice(0, 3).map((tag) => (
                            <li key={tag}>{tag}</li>
                          ))}
                        </ul>
                      )}
                      <div className="home-team-card__actions">
                        <a
                          href={`/${doc.slug}`}
                          aria-label={`View profile of ${doc.fullName}`}
                          className="home-team-card__link home-team-card__link--primary"
                        >
                          View profile <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                        </a>
                        {doc.whatsapp && (
                          <a
                            href={clinicianWhatsAppUrl(doc) ?? undefined}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Ask about an appointment with ${doc.name} on WhatsApp`}
                            className="home-team-card__link home-team-card__link--secondary"
                          >
                            <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                </Reveal>
              );
            })}
        </div>
      </div>
    </section>
  );
}
