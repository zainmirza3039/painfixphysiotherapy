import type {
  AdminClinicianProfile,
  PublicClinicianProfile,
} from "@/admin/clinician-profile.contract";
import type { TeamMember } from "@/data/team";

export type PublicClinicianContent = PublicClinicianProfile | TeamMember;

export function toClinicianView(
  profile: PublicClinicianContent | AdminClinicianProfile,
): TeamMember {
  if ("fullName" in profile) return profile;
  const photo = "resolved_photo_url" in profile ? profile.resolved_photo_url : profile.photo_url;
  const fullName = profile.full_name;
  const onlineOnly = profile.service_mode === "online_only";

  return {
    name: profile.name,
    fullName,
    role: profile.designation,
    title: profile.professional_title,
    credentials: profile.credentials,
    bio: profile.bio ?? "",
    seoBio: profile.seo_bio ?? profile.bio ?? "",
    specialties: profile.specialties ?? [],
    tags: profile.tags ?? [],
    initials: fullName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join(""),
    slug: profile.slug,
    photo,
    serviceMode: profile.service_mode ?? "clinic",
    city: profile.city ?? "Multan",
    phoneDisplay: profile.phone_display ?? "",
    whatsapp: profile.whatsapp_number ?? "",
    yearsExperience: profile.years_experience,
    profile: {
      metaTitle:
        profile.meta_title ??
        (onlineOnly
          ? `${fullName} — Online Physiotherapy${profile.city ? ` in ${profile.city}` : ""} | PainFix`
          : `${fullName} | PainFix Physiotherapy Clinic`),
      metaDescription:
        profile.meta_description ??
        profile.seo_bio ??
        profile.bio ??
        "Meet the PainFix clinical team.",
      intro: profile.intro?.length ? profile.intro : profile.bio ? [profile.bio] : [],
      qualifications: profile.qualifications ?? [],
      expertise: profile.expertise ?? [],
      conditionsTreated: profile.conditions_treated ?? [],
      approach: profile.approach ?? [],
      experience: profile.experience ?? [],
      training: profile.training ?? [],
      research: profile.research ?? [],
    },
  };
}
