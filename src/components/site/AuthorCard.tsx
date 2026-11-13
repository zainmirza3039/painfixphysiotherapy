import { getTeamMember } from "@/data/team";
import { BadgeCheck, Stethoscope, ArrowRight } from "lucide-react";
import { ClinicianPortrait } from "./ClinicianPortrait";

/** Display authorship separately from an explicitly assigned clinical reviewer. */
export function AuthorCard({
  authorKey,
  authorName,
  medicalReviewerKey,
  updated,
}: {
  authorKey: string;
  authorName?: string;
  medicalReviewerKey?: string;
  updated?: string;
}) {
  const author = authorKey ? getTeamMember(authorKey) : undefined;
  const reviewer =
    medicalReviewerKey && medicalReviewerKey !== authorKey
      ? getTeamMember(medicalReviewerKey)
      : undefined;
  const reviewerClassName =
    author || authorName ? "relative mt-5 border-t border-border pt-5" : "relative";

  if (!author && !authorName && !reviewer) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
      {(author || authorName) && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Written by
          </p>
          <div className="mt-3 flex items-start gap-4">
            {author && (
              <ClinicianPortrait
                photo={author.photo}
                name={author.name}
                role={author.role}
                className="h-12 w-12 shrink-0 rounded-xl ring-1 ring-border"
              />
            )}
            <div className="min-w-0">
              <p className="font-heading text-base font-bold text-foreground">
                {author?.name ?? authorName}
              </p>
              {author && <p className="text-sm font-medium text-secondary">{author.role}</p>}
              {author && <p className="text-xs text-muted-foreground">{author.credentials}</p>}
            </div>
          </div>
          {author && (
            <a
              href={`/${author.slug}`}
              aria-label={`View full profile of ${author.name}, physiotherapist in Multan`}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
            >
              View author profile <ArrowRight className="h-4 w-4" />
            </a>
          )}
        </div>
      )}

      {reviewer && (
        <div className={reviewerClassName}>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary">
            <BadgeCheck className="h-4 w-4" />
            Medically reviewed by
          </div>
          <div className="mt-3 flex items-start gap-4">
            <ClinicianPortrait
              photo={reviewer.photo}
              name={reviewer.name}
              role={reviewer.role}
              className="h-12 w-12 shrink-0 rounded-xl ring-1 ring-border"
            />
            <div className="min-w-0">
              <p className="font-heading text-base font-bold text-foreground">{reviewer.name}</p>
              <p className="text-sm font-medium text-secondary">{reviewer.role}</p>
              <p className="text-xs text-muted-foreground">{reviewer.credentials}</p>
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{reviewer.bio}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {reviewer.specialties.map((specialty) => (
              <span
                key={specialty}
                className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground"
              >
                <Stethoscope className="h-3 w-3" />
                {specialty}
              </span>
            ))}
          </div>
          <a
            href={`/${reviewer.slug}`}
            aria-label={`View full profile of ${reviewer.name}, physiotherapist in Multan`}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
          >
            View reviewer profile <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      )}

      {updated && (
        <p className="mt-5 border-t border-border pt-3 text-xs text-muted-foreground">
          Last updated:{" "}
          {new Date(updated).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      )}
    </div>
  );
}
