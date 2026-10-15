import { BadgeCheck, Stethoscope, MessageCircle, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listPublishedProfiles } from "@/lib/profiles.functions";
import { mergeTeam } from "@/lib/doctorProfile";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { GoogleReviewButton } from "./GoogleReviewButton";
import { ClinicianPortrait } from "./ClinicianPortrait";

export function MeetDoctors() {
  const listProfiles = useServerFn(listPublishedProfiles);
  // SSR renders the static team; after publish, admin edits overlay on the client.
  const { data: profiles } = useQuery({
    queryKey: ["public-profiles"],
    queryFn: () => listProfiles(),
    staleTime: 5 * 60_000,
  });
  const team = mergeTeam(profiles);

  return (
    <section id="doctors" className="bg-surface py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Our Specialists"
          title="Meet Our Doctors"
          subtitle="Qualified, caring physiotherapists dedicated to evidence-based, personalized recovery for every patient in Multan."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
          {team.map((doc, i) => (
            <Reveal key={doc.initials} anim="up" delay={i * 100}>
              <article className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-border bg-card shadow-soft transition-shadow hover:border-primary/40 hover:shadow-card focus-within:ring-2 focus-within:ring-primary/50">
                <div className="relative h-60 shrink-0 overflow-hidden bg-accent/40">
                  <ClinicianPortrait
                    photo={doc.photo}
                    name={doc.name}
                    role={doc.role}
                    className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-col p-6 sm:p-7">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary">
                    <BadgeCheck className="h-4 w-4" /> {doc.credentials}
                  </div>
                  <h3 className="mt-2 font-heading text-xl font-extrabold text-foreground">
                    {doc.fullName}
                  </h3>
                  <p className="text-sm font-semibold text-primary">{doc.title}</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{doc.seoBio}</p>

                  {doc.tags.length > 0 && (
                    <>
                      <p className="mt-5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Areas of Expertise
                      </p>
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {doc.tags.map((s) => (
                          <li
                            key={s}
                            className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground"
                          >
                            <Stethoscope className="h-3 w-3 text-secondary" /> {s}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
                    <a
                      href={`https://wa.me/${doc.whatsapp}?text=${encodeURIComponent(
                        `Hi, I'd like a physiotherapy consultation with ${doc.name} at PainFix Physiotherapy Clinic.`,
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Chat with ${doc.name} on WhatsApp (${doc.phoneDisplay})`}
                      className="ripple relative z-10 inline-flex items-center gap-2 rounded-2xl bg-secondary px-5 py-3 text-sm font-semibold text-secondary-foreground shadow-card transition-transform hover:scale-[1.03]"
                    >
                      <MessageCircle className="h-4 w-4" /> WhatsApp Consultation
                    </a>
                    <a
                      href={`/${doc.slug}`}
                      aria-label={`View full profile of ${doc.fullName}, physiotherapist in Multan`}
                      className="inline-flex items-center gap-2 rounded-2xl border border-primary px-5 py-3 text-sm font-semibold text-primary transition-colors after:absolute after:inset-0 after:rounded-[2rem] after:content-[''] hover:bg-primary hover:text-primary-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      View Profile <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal anim="up" className="mt-10 flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted-foreground">
            Treated by our team? Share your recovery story with others.
          </p>
          <GoogleReviewButton variant="outline" />
        </Reveal>
      </div>
    </section>
  );
}
