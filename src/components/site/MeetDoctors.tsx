import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUpRight, BadgeCheck, MessageCircle } from "lucide-react";
import { listPublishedProfiles } from "@/lib/profiles.functions";
import { mergeTeam } from "@/lib/doctorProfile";
import { Reveal } from "./Reveal";
import { ClinicianPortrait } from "./ClinicianPortrait";

export function MeetDoctors() {
  const listProfiles = useServerFn(listPublishedProfiles);
  const { data: profiles } = useQuery({
    queryKey: ["public-profiles"],
    queryFn: () => listProfiles(),
    staleTime: 5 * 60_000,
  });
  const team = mergeTeam(profiles);

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
            PainFix’s clinical team includes Doctors of Physical Therapy working across
            physiotherapy and rehabilitation in Multan.
          </p>
        </div>

        <div className="home-team-list">
          {team.map((doc, index) => (
            <Reveal key={doc.slug} anim="up" delay={index * 45}>
              <article className="home-team-row">
                <ClinicianPortrait
                  photo={doc.photo}
                  name={doc.name}
                  role={doc.role}
                  className="home-team-row__portrait"
                />
                <div className="min-w-0">
                  <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.11em] text-secondary">
                    <BadgeCheck className="h-4 w-4" aria-hidden="true" /> {doc.credentials}
                  </p>
                  <h3 className="mt-2 font-heading text-2xl font-semibold leading-tight text-foreground">
                    {doc.fullName}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-primary">{doc.role}</p>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                    {doc.bio}
                  </p>
                  {doc.tags.length > 0 && (
                    <ul
                      className="mt-3 flex flex-wrap gap-x-4 gap-y-1"
                      aria-label={`${doc.name} areas of practice`}
                    >
                      {doc.tags.slice(0, 3).map((tag) => (
                        <li key={tag} className="text-xs text-muted-foreground">
                          {tag}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                    <a
                      href={`/${doc.slug}`}
                      aria-label={`View profile of ${doc.fullName}`}
                      className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:text-secondary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      View profile <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                    <a
                      href={`https://wa.me/${doc.whatsapp}?text=${encodeURIComponent(`Hi, I'd like a physiotherapy consultation with ${doc.name} at PainFix Physiotherapy Clinic.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Ask about an appointment with ${doc.name} on WhatsApp`}
                      className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:text-secondary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp
                    </a>
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
