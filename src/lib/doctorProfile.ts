import { team, type TeamMember } from "@/data/team";
import type { PublicProfile } from "@/lib/profiles.functions";

const has = (v: string | null | undefined): v is string =>
  typeof v === "string" && v.trim().length > 0;

/** Split a free-text qualifications field into clean lines. */
function splitLines(value: string): string[] {
  return value
    .split(/\r?\n|;/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Overlay an admin-managed published profile onto the rich static baseline.
 * Only fields the professional can edit in the Admin Panel are overridden;
 * everything else (SEO copy, intro, conditions, approach) falls back to static.
 * Passing `null`/`undefined` returns the untouched static member.
 */
export function mergeDoctor(base: TeamMember, p?: PublicProfile | null): TeamMember {
  if (!p) return base;

  const specialties = p.specialties?.filter(Boolean) ?? [];
  const qualifications = has(p.qualifications) ? splitLines(p.qualifications) : null;

  return {
    ...base,
    fullName: has(p.full_name) ? p.full_name : base.fullName,
    title: has(p.professional_title) ? p.professional_title : base.title,
    bio: has(p.bio) ? p.bio : base.bio,
    seoBio: has(p.bio) ? p.bio : base.seoBio,
    photo: has(p.photo_url) ? p.photo_url : base.photo,
    phoneDisplay: has(p.phone) ? p.phone : base.phoneDisplay,
    specialties: specialties.length ? specialties : base.specialties,
    profile: {
      ...base.profile,
      qualifications: qualifications?.length ? qualifications : base.profile.qualifications,
      expertise: specialties.length ? specialties : base.profile.expertise,
    },
  };
}

/** Merge a list of published profiles onto the full static team (by slug). */
export function mergeTeam(profiles?: PublicProfile[] | null): TeamMember[] {
  if (!profiles?.length) return team;
  const bySlug = new Map(profiles.filter((p) => p.slug).map((p) => [p.slug as string, p]));
  return team.map((m) => mergeDoctor(m, bySlug.get(m.slug)));
}
