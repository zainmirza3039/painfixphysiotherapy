import { Calendar, BadgeCheck, Stethoscope, Linkedin } from "lucide-react";
import { team } from "@/data/team";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { openCalendlyPopup } from "./calendly";
import { SOCIAL_LINKS } from "./constants";
import { GoogleReviewButton } from "./GoogleReviewButton";

export function MeetDoctors() {
  return (
    <section id="doctors" className="bg-surface py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Our Specialists"
          title="Meet Our Doctors"
          subtitle="Qualified, caring physiotherapists dedicated to evidence-based, personalized recovery for every patient in Multan."
        />

        <div className="mt-12 grid gap-6 sm:gap-8 lg:grid-cols-2">
          {team.map((doc, i) => (
            <Reveal key={doc.initials} anim="up" delay={i * 100}>
              <article className="group grid h-full gap-0 overflow-hidden rounded-[2rem] border border-border bg-card shadow-soft transition-shadow hover:shadow-card sm:grid-cols-[minmax(0,42%)_1fr]">
                <div className="relative overflow-hidden bg-accent/40">
                  <img
                    src={doc.photo}
                    alt={`Professional portrait of ${doc.name}, ${doc.role} at PainFix Physiotherapy Clinic, Multan`}
                    width={900}
                    height={900}
                    loading="lazy"
                    decoding="async"
                    className="h-56 w-full object-cover object-top transition-transform duration-500 group-hover:scale-105 sm:h-full"
                  />
                </div>

                <div className="flex flex-col p-6 sm:p-7">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary">
                    <BadgeCheck className="h-4 w-4" /> {doc.credentials}
                  </div>
                  <h3 className="mt-2 font-heading text-xl font-extrabold text-foreground">{doc.name}</h3>
                  <p className="text-sm font-semibold text-primary">{doc.role}</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{doc.bio}</p>

                  <p className="mt-5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Areas of Expertise
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {doc.specialties.map((s) => (
                      <li
                        key={s}
                        className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground"
                      >
                        <Stethoscope className="h-3 w-3 text-secondary" /> {s}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
                    <button
                      type="button"
                      onClick={() => openCalendlyPopup()}
                      className="ripple inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-card transition-transform hover:scale-[1.03]"
                    >
                      <Calendar className="h-4 w-4" /> Book Appointment
                    </button>
                    <a
                      href={SOCIAL_LINKS.linkedin.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${doc.name} on LinkedIn — PainFix Physiotherapy Clinic`}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      <Linkedin className="h-5 w-5" />
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
