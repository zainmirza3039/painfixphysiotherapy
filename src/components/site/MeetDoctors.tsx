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
            PainFix’s clinical team includes Doctors of Physical Therapy working across clinic-based
            and online physiotherapy and rehabilitation. Check each profile for service mode and
            location.
          </p>
        </div>

        <div className="home-team-list" aria-live="polite" aria-busy={isLoading}>
          {isLoading &&
            Array.from({ length: 2 }).map((_, index) => (
              <div key={index} aria-hidden="true" className="home-team-card animate-pulse">
                <div className="home-team-card__media" />
                <div className="home-team-card__content w-full space-y-4">
                  <div className="h-3 w-36 rounded bg-muted" />
                  <div className="h-8 w-3/4 rounded bg-muted" />
                  <div className="h-4 w-2/5 rounded bg-muted" />
                  <div className="mt-4 h-4 w-full rounded bg-muted" />
                  <div className="h-4 w-5/6 rounded bg-muted" />
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
            clinicians.map((doc, index) => (
              <Reveal key={doc.slug} anim="up" delay={index * 45}>
                <article className="home-team-card">
                  <div className="home-team-card__media">
                    <ClinicianPortrait
                      photo={doc.photo}
                      name={doc.name}
                      role={doc.role}
                      className="home-team-card__portrait"
                    />
                  </div>
                  <div className="home-team-card__content min-w-0">
                    <p className="home-team-card__credentials">
                      <BadgeCheck className="h-4 w-4" aria-hidden="true" /> {doc.credentials}
                    </p>
                    <h3 className="home-team-card__name">{doc.fullName}</h3>
                    <p className="home-team-card__role">{doc.role}</p>
                    <div className="home-team-card__meta">
                      <span className="home-team-card__meta-item">{clinicianServiceLabel(doc)}</span>
                      {doc.yearsExperience !== null && doc.yearsExperience !== undefined && (
                        <span className="home-team-card__meta-item">
                          {doc.yearsExperience} {doc.yearsExperience === 1 ? "year" : "years"} of experience
                        </span>
                      )}
                    </div>
                    <p className="home-team-card__bio">
                      {doc.bio}
                    </p>
                    {doc.tags.length > 0 && (
                      <ul
                        className="home-team-card__specialties"
                        aria-label={`${doc.name} areas of practice`}
                      >
                        {doc.tags.slice(0, 3).map((tag) => (
                          <li key={tag} className="text-xs text-muted-foreground">
                            {tag}
                          </li>
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
            ))}
        </div>
      </div>
    </section>
  );
}
