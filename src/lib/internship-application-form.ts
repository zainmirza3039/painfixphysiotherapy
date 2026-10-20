import { submissionSchema } from "./internships.contract.ts";

/** Do not forward UI state or internal workflow fields to the public server function. */
export function applicationFormToPayload(programSlug: string, values: Record<string, string>) {
  return submissionSchema.parse({
    program_slug: programSlug,
    full_name: values.full_name ?? "",
    email: values.email ?? "",
    phone: values.phone ?? "",
    city: values.city ?? "",
    educational_institution: values.educational_institution ?? "",
    degree_program: values.degree_program ?? "",
    academic_status: values.academic_status ?? "",
    clinical_exposure: values.clinical_exposure?.trim() || null,
    availability: values.availability ?? "",
    motivation: values.motivation ?? "",
    consent_privacy: values.consent_privacy === "true",
  });
}
