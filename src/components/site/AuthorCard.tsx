import { getTeamMember } from "@/data/team";
import { BadgeCheck, Stethoscope } from "lucide-react";

/** EEAT "Reviewed by" author card shown on every blog article. */
export function AuthorCard({ authorKey, updated }: { authorKey: string; updated?: string }) {
  const member = getTeamMember(authorKey) ?? getTeamMember("ZA");
  if (!member) return null;
  return (
    <div className="rounded-[1.75rem] border border-border bg-card p-6 shadow-soft">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary">
        <BadgeCheck className="h-4 w-4" /> Medically Reviewed By
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
          <span key={s} className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
            <Stethoscope className="h-3 w-3" /> {s}
          </span>
        ))}
      </div>
      {updated && (
        <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
          Last reviewed and updated:{" "}
          {new Date(updated).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      )}
    </div>
  );
}
