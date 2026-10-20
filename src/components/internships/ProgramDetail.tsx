import { Check, ClipboardList, GraduationCap, ShieldCheck } from "lucide-react";
import type { Program } from "@/lib/internships.contract";
import { isApplicationOpen } from "@/lib/internships.contract";
import { ApplicationForm } from "./ApplicationForm";

const notConfirmed = (value: string | number | null | undefined) =>
  value === null || value === undefined || value === "" ? "Not yet confirmed" : String(value);

function formatDate(value: string | null) {
  if (!value) return "Not yet confirmed";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not yet confirmed"
    : date.toLocaleDateString(undefined, { dateStyle: "long" });
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <h2 className="font-heading text-2xl font-semibold text-foreground">{title}</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-7 text-muted-foreground">
            <Check className="mt-1 h-4 w-4 shrink-0 text-secondary" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ProgramDetail({
  program,
  disableApplication = false,
}: {
  program: Program;
  /** Render the program as a read-only preview, without an application form. */
  disableApplication?: boolean;
}) {
  const open = isApplicationOpen(program) && !disableApplication;
  const isDraftPreview = disableApplication || program.status === "draft";
  const isClinicalInternship = program.slug === "clinical-physiotherapy-internship";
  const details: Array<[string, string]> = [
    ["Duration", notConfirmed(program.duration)],
    ["Location", notConfirmed(program.location)],
    ["Schedule", notConfirmed(program.schedule)],
    ["Seats", notConfirmed(program.seats)],
    ["Minimum attendance", `${program.minimum_attendance}%`],
    ["Fees", notConfirmed(program.fees)],
    ["Application deadline", formatDate(program.application_close_at)],
  ];

  return (
    <>
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_.8fr] lg:px-8">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-secondary">
              {program.discipline}
            </span>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
              {program.delivery_mode}
            </span>
            {isDraftPreview && (
              <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-700">
                Draft preview — not published
              </span>
            )}
          </div>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">{program.description}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {details.map(([label, value]) => (
              <div key={label} className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-secondary">{label}</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>
        <aside className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <GraduationCap className="h-8 w-8 text-secondary" />
          <h2 className="mt-4 font-heading text-xl font-bold text-foreground">Who this is for</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{program.eligibility}</p>
          <div className="mt-5 border-t border-border pt-5">
            <p className="text-sm font-semibold text-foreground">Application status</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {disableApplication
                ? "Read-only preview. Applications are not available from this view."
                : open
                  ? "Applications are currently being accepted."
                  : "Applications are currently closed for this program."}
            </p>
          </div>
          <div className="mt-5 border-t border-border pt-5">
            <p className="text-sm font-semibold text-foreground">Professional supervision</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {notConfirmed(program.supervisor)}
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Participants are expected to follow PainFix clinic policies, maintain professional
              conduct, protect patient privacy, and work within their level of training under the
              assigned supervisor.
            </p>
          </div>
        </aside>
      </section>
      <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <List
          title={isClinicalInternship ? "40-day learning roadmap" : "Learning objectives"}
          items={program.objectives}
        />
        <List title="Requirements" items={program.requirements} />
        <List
          title="Required documents"
          items={
            program.required_documents.length ? program.required_documents : ["Not yet confirmed"]
          }
        />
        <List title="Selection criteria" items={[program.selection_criteria]} />
        <List
          title="Completion criteria"
          items={[
            program.completion_criteria,
            `Minimum attendance: ${program.minimum_attendance}%`,
          ]}
        />
      </section>
      {program.faqs.length > 0 && (
        <section className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            Frequently asked questions
          </h2>
          <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-card">
            {program.faqs.map((faq) => (
              <details key={faq.q} className="p-5">
                <summary className="cursor-pointer font-semibold text-foreground">{faq.q}</summary>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}
      {open ? (
        <section id="apply" className="mx-auto max-w-3xl scroll-mt-24 px-4 pb-20 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
            <div className="flex gap-3">
              <ClipboardList className="h-6 w-6 shrink-0 text-secondary" />
              <div>
                <h2 className="font-heading text-2xl font-semibold text-foreground">
                  Apply for this program
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Applications are reviewed by the PainFix team. Selection and certificate
                  eligibility are separate decisions.
                </p>
              </div>
            </div>
            <div className="mt-7">
              <ApplicationForm program={program} />
            </div>
          </div>
        </section>
      ) : (
        <section className="mx-auto max-w-3xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-border bg-muted p-6 text-center">
            <ShieldCheck className="mx-auto h-8 w-8 text-muted-foreground" />
            <h2 className="mt-3 font-heading text-xl font-bold text-foreground">
              {disableApplication ? "Read-only program preview" : "Applications are closed"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {disableApplication
                ? "This draft is for internal review only and is not published or accepting applications."
                : "This program is not accepting new applications right now. Please check back for future published programs."}
            </p>
            {!disableApplication && (
              <a
                href="/internships"
                className="mt-5 inline-flex text-sm font-semibold text-primary hover:underline"
              >
                Browse programs
              </a>
            )}
          </div>
        </section>
      )}
    </>
  );
}

/** Alias for admin consumers that want to make the read-only intent explicit. */
export const ProgramPreview = ({ program }: { program: Program }) => (
  <ProgramDetail program={program} disableApplication />
);
