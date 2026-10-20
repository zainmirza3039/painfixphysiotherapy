import type {
  AdminClinicianProfile,
  ClinicianProfileInput,
} from "@/admin/clinician-profile.contract";

export interface ClinicianFormState {
  id?: string;
  service_mode: "clinic" | "online_only";
  city: string;
  slug: string;
  name: string;
  full_name: string;
  designation: string;
  professional_title: string;
  credentials: string;
  bio: string;
  seo_bio: string;
  specialtiesText: string;
  tagsText: string;
  years_experience: string;
  qualificationsText: string;
  experienceText: string;
  trainingText: string;
  researchText: string;
  phone_display: string;
  whatsapp_number: string;
  meta_title: string;
  meta_description: string;
  introText: string;
  expertiseText: string;
  conditions_treatedText: string;
  approachText: string;
  is_active: boolean;
  is_published: boolean;
  display_order: string;
}

export function emptyClinicianForm(): ClinicianFormState {
  return {
    service_mode: "clinic",
    city: "Multan",
    slug: "",
    name: "",
    full_name: "",
    designation: "",
    professional_title: "",
    credentials: "",
    bio: "",
    seo_bio: "",
    specialtiesText: "",
    tagsText: "",
    years_experience: "",
    qualificationsText: "",
    experienceText: "",
    trainingText: "",
    researchText: "",
    phone_display: "",
    whatsapp_number: "",
    meta_title: "",
    meta_description: "",
    introText: "",
    expertiseText: "",
    conditions_treatedText: "",
    approachText: "",
    is_active: true,
    is_published: false,
    display_order: "0",
  };
}

const joinLines = (values: string[] | null | undefined) => (values ?? []).join("\n");

export function clinicianProfileToForm(profile: AdminClinicianProfile): ClinicianFormState {
  return {
    id: profile.id,
    service_mode: profile.service_mode === "online_only" ? "online_only" : "clinic",
    city: profile.city?.trim() || "Multan",
    slug: profile.slug,
    name: profile.name,
    full_name: profile.full_name,
    designation: profile.designation,
    professional_title: profile.professional_title,
    credentials: profile.credentials,
    bio: profile.bio ?? "",
    seo_bio: profile.seo_bio ?? "",
    specialtiesText: joinLines(profile.specialties),
    tagsText: joinLines(profile.tags),
    years_experience: profile.years_experience === null ? "" : String(profile.years_experience),
    qualificationsText: joinLines(profile.qualifications),
    experienceText: joinLines(profile.experience),
    trainingText: joinLines(profile.training),
    researchText: joinLines(profile.research),
    phone_display: profile.phone_display ?? "",
    whatsapp_number: profile.whatsapp_number ?? "",
    meta_title: profile.meta_title ?? "",
    meta_description: profile.meta_description ?? "",
    introText: joinLines(profile.intro),
    expertiseText: joinLines(profile.expertise),
    conditions_treatedText: joinLines(profile.conditions_treated),
    approachText: joinLines(profile.approach),
    is_active: profile.is_active,
    is_published: profile.is_published,
    display_order: String(profile.display_order),
  };
}

const splitLines = (value: string) =>
  value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

const nullable = (value: string) => value.trim() || null;

export function clinicianFormToInput(
  form: ClinicianFormState,
  photoPath: string | null,
): ClinicianProfileInput {
  return {
    ...(form.id ? { id: form.id } : {}),
    service_mode: form.service_mode === "online_only" ? "online_only" : "clinic",
    city: form.city.trim(),
    slug: form.slug.trim(),
    name: form.name.trim(),
    full_name: form.full_name.trim(),
    designation: form.designation.trim(),
    professional_title: form.professional_title.trim(),
    credentials: form.credentials.trim(),
    bio: nullable(form.bio),
    seo_bio: nullable(form.seo_bio),
    specialties: splitLines(form.specialtiesText),
    tags: splitLines(form.tagsText),
    years_experience: form.years_experience.trim() ? Number(form.years_experience) : null,
    qualifications: splitLines(form.qualificationsText),
    experience: splitLines(form.experienceText),
    training: splitLines(form.trainingText),
    research: splitLines(form.researchText),
    photo_path: photoPath,
    phone_display: nullable(form.phone_display),
    whatsapp_number: form.whatsapp_number.replace(/\D/g, "") || null,
    meta_title: nullable(form.meta_title),
    meta_description: nullable(form.meta_description),
    intro: splitLines(form.introText),
    expertise: splitLines(form.expertiseText),
    conditions_treated: splitLines(form.conditions_treatedText),
    approach: splitLines(form.approachText),
    is_active: form.is_active,
    is_published: form.is_published,
    display_order: Number(form.display_order),
  };
}

export function slugFromClinicianName(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100)
    .replace(/-+$/g, "");
}
