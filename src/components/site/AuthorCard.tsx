import { getTeamMember } from "@/data/team";
import { BadgeCheck, Stethoscope, ArrowRight } from "lucide-react";

/**
 * EEAT "Reviewed by" author card shown on blog articles.
 * Uses medicalReviewer from Supabase, falls back to authorKey, then Dr. Zain.
 */
export function AuthorCard({
  authorKey,
  medicalReviewer,
  updated,
}: {
  authorKey: string;
  medicalReviewer?: string;
  updated?: string;
}) {
  const member = getTeamMember(medicalReviewer || authorKey) ?? getTeamMember("ZA");

  if (!member) return null;

  return (
    <div className="group relative cursor-pointer rounded-[1.75rem] border border-border bg-card p-6 shadow-soft transition-shadow hover:border-primary/40 hover:shadow-card focus-within:ring-2 focus-within:ring-primary/50">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary">
        <BadgeCheck className="h-4 w-4" />
        Medically Reviewed By
      </div>

      <div className="mt-4 flex items-start gap-4">
        <img
          src={member.photo}
          alt={`Portrait of ${member.name}, ${member.role} at PainFix Physiotherapy Clinic, Multan`}
          width={56}
          height={56}
          loading="lazy"
          decoding="async"
          className="h-14 w-14 shrink-0 rounded-2xl object-cover object-top ring-1 ring-border"
        />

        <div className="min-w-0">
          <p className="font-heading text-lg font-bold text-foreground">{member.name}</p>

          <p className="text-sm font-medium text-secondary">{member.role}</p>

          <p className="text-xs text-muted-foreground">{member.credentials}</p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{member.bio}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {member.specialties.map((s) => (
          <span
            key={s}
            className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground"
          >
            <Stethoscope className="h-3 w-3" />
            {s}
          </span>
        ))}
      </div>

      <a
        href={`/${member.slug}`}
        aria-label={`View full profile of ${member.name}, physiotherapist in Multan`}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary after:absolute after:inset-0 after:rounded-[1.75rem] after:content-[''] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        View full profile
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
      </a>

      {updated && (
        <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
          Last reviewed and updated:{" "}
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
