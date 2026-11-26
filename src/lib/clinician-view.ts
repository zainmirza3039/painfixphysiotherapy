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
  const isZainProfile = profile.slug === "dr-zain-ul-abideen-pt-multan";
  const normalizeZainName = (value: string | null | undefined) =>
    isZainProfile && value
      ? value.replace(/Dr\. Zain Ul Abideen,\s*DPT/g, "Dr. Zain Ul Abideen PT")
      : value;
  const fullName = isZainProfile ? "Dr. Zain Ul Abideen PT" : profile.full_name;
  const onlineOnly = profile.service_mode === "online_only";

  return {
    name: profile.name,
    fullName,
    role: profile.designation,
    title: profile.professional_title,
    credentials: profile.credentials,
    bio: normalizeZainName(profile.bio) ?? "",
    seoBio: normalizeZainName(profile.seo_bio ?? profile.bio) ?? "",
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
        (isZainProfile ? "Dr. Zain Ul Abideen PT | PainFix Multan" : profile.meta_title) ??
        (onlineOnly
          ? `${fullName} — Online Physiotherapy${profile.city ? ` in ${profile.city}` : ""} | PainFix`
          : `${fullName} | PainFix Physiotherapy Clinic`),
      metaDescription:
        (isZainProfile
          ? "Meet Dr. Zain Ul Abideen PT, Founder & Head Physiotherapist at PainFix in Multan. Explore his clinical focus, treatment approach and appointment details."
          : normalizeZainName(profile.meta_description ?? profile.seo_bio ?? profile.bio)) ??
        "Meet the PainFix clinical team.",
      intro: profile.intro?.length
        ? profile.intro.map((paragraph) => normalizeZainName(paragraph) ?? paragraph)
        : profile.bio
          ? [normalizeZainName(profile.bio) ?? profile.bio]
          : [],
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
