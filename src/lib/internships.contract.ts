import { z } from "zod";

const isoDate = z.string().datetime({ offset: true }).nullable();
const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00Z`);
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  }, "Enter a valid calendar date")
  .nullable();
const text = (max: number) => z.string().trim().min(1).max(max);
const optionalText = (max: number) => z.string().trim().max(max).nullable();
const textList = (maxItems: number, maxLength: number) =>
  z.array(z.string().trim().min(1).max(maxLength)).max(maxItems);
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };
const jsonValue: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(jsonValue), z.record(jsonValue)]),
);

export const applicationStatusSchema = z.enum([
  "submitted",
  "under_review",
  "shortlisted",
  "accepted",
  "rejected",
  "withdrawn",
  "completed",
]);
export type ApplicationStatus = z.infer<typeof applicationStatusSchema>;

export const programStatusSchema = z.enum(["draft", "published", "closed", "archived"]);
export const programSchema = z
  .object({
    id: z.string().uuid(),
    title: text(180),
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .max(120),
    description: text(10000),
    discipline: text(180),
    duration: text(120),
    delivery_mode: z.enum(["on_site", "online", "hybrid"]),
    eligibility: text(4000),
    objectives: textList(30, 500),
    requirements: textList(30, 500),
    location: optionalText(240),
    schedule: optionalText(500),
    seats: z.number().int().positive().max(100000).nullable(),
    fees: optionalText(240),
    application_open_at: isoDate,
    application_close_at: isoDate,
    applications_open: z.boolean(),
    status: programStatusSchema,
    required_documents: textList(20, 240),
    selection_criteria: text(4000),
    supervisor: optionalText(240),
    completion_criteria: text(4000),
    minimum_attendance: z.number().min(0).max(100),
    faqs: z.array(z.object({ q: text(500), a: text(3000) }).strict()).max(30),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
  })
  .strict();
export type Program = z.infer<typeof programSchema>;

export const programInputSchema = programSchema
  .omit({ id: true, created_at: true, updated_at: true })
  .extend({ id: z.string().uuid().optional() })
  .strict()
  .superRefine((p, ctx) => {
    if (
      p.application_open_at &&
      p.application_close_at &&
      new Date(p.application_close_at) <= new Date(p.application_open_at)
    )
      ctx.addIssue({
        code: "custom",
        path: ["application_close_at"],
        message: "Application close must be after open",
      });
    if (p.status === "published" && !p.title.trim())
      ctx.addIssue({ code: "custom", path: ["title"], message: "Published programs need a title" });
  });

export const applicationSchema = z
  .object({
    id: z.string().uuid().optional(),
    reference: z.string().max(80).optional(),
    program_id: z.string().uuid().optional(),
    program_slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .max(120),
    full_name: text(180),
    email: z.string().email().max(254),
    phone: z
      .string()
      .trim()
      .min(7)
      .max(40)
      .regex(/^[+0-9() .-]+$/),
    city: text(120),
    educational_institution: text(240),
    degree_program: text(240),
    academic_status: text(120),
    clinical_exposure: optionalText(4000),
    availability: text(1000),
    motivation: text(4000),
    consent_privacy: z.literal(true),
    status: applicationStatusSchema.optional(),
    internal_notes: optionalText(5000),
    decision_at: isoDate.optional(),
    created_at: z.string().datetime({ offset: true }).optional(),
    updated_at: z.string().datetime({ offset: true }).optional(),
  })
  .strict();
export type Application = z.infer<typeof applicationSchema> & {
  id: string;
  reference: string;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
};

export const participantSchema = z
  .object({
    id: z.string().uuid(),
    application_id: z.string().uuid(),
    program_id: z.string().uuid(),
    full_name: text(180),
    start_date: dateOnly,
    end_date: dateOnly,
    attendance_percent: z.number().min(0).max(100).nullable(),
    supervisor: optionalText(240),
    completion_status: z.enum(["active", "completed", "not_completed", "withdrawn"]),
    assessment_signed_off: z.boolean(),
    completion_approved: z.boolean(),
    completion_decision_at: isoDate,
    reviewer_id: z.string().uuid().nullable(),
    notes: optionalText(5000),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
  })
  .strict();
export type Participant = z.infer<typeof participantSchema>;

export const participantInputSchema = participantSchema
  .omit({ id: true, created_at: true, updated_at: true })
  .extend({ id: z.string().uuid().optional() })
  .strict();

export const experienceSchema = z
  .object({
    id: z.string().uuid(),
    full_name: text(180),
    role: text(180),
    engagement_type: z.enum([
      "employment",
      "internship",
      "training",
      "volunteer",
      "contract",
      "other",
    ]),
    start_date: dateOnly,
    end_date: dateOnly,
    responsibilities: text(5000),
    evidence_summary: text(5000),
    verified: z.boolean(),
    approved: z.boolean(),
    approver_id: z.string().uuid().nullable(),
    approval_at: isoDate,
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
  })
  .strict();
export type ExperienceRecord = z.infer<typeof experienceSchema>;
export const experienceInputSchema = experienceSchema
  .omit({ id: true, created_at: true, updated_at: true })
  .extend({ id: z.string().uuid().optional() })
  .strict();

export const certificateSchema = z
  .object({
    id: z.string().uuid(),
    certificate_number: text(80),
    verification_token: text(160),
    type: z.enum(["internship", "experience"]),
    source_id: z.string().uuid(),
    participant_id: z.string().uuid().nullable().optional(),
    experience_record_id: z.string().uuid().nullable().optional(),
    recipient_name: text(180),
    program_or_role: text(240),
    start_date: dateOnly,
    end_date: dateOnly,
    issued_at: z.string().datetime({ offset: true }),
    signatory_name: text(180),
    signatory_designation: text(180),
    status: z.enum(["issued", "revoked"]),
    revoked_at: isoDate,
    revocation_reason: optionalText(2000),
    replacement_for: z.string().uuid().nullable(),
    snapshot: z.record(jsonValue),
    created_at: z.string().datetime({ offset: true }),
  })
  .strict();
export type Certificate = z.infer<typeof certificateSchema>;

export const certificateEventSchema = z
  .object({
    id: z.string().uuid(),
    certificate_id: z.string().uuid(),
    event_type: z.enum(["issued", "revoked", "replaced"]),
    actor_id: z.string().uuid(),
    reason: optionalText(2000),
    snapshot: z.record(jsonValue),
    created_at: z.string().datetime({ offset: true }),
  })
  .strict();
export type CertificateEvent = z.infer<typeof certificateEventSchema>;

export const submissionSchema = applicationSchema
  .omit({
    id: true,
    reference: true,
    program_id: true,
    status: true,
    internal_notes: true,
    decision_at: true,
    created_at: true,
    updated_at: true,
  })
  .strict();
export type ApplicationSubmission = z.infer<typeof submissionSchema>;

export const verificationCertificateSchema = z
  .object({
    reference: text(80),
    type: z.enum(["internship", "experience"]),
    recipient_name: text(180),
    program_or_role: text(240),
    issue_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    start_date: dateOnly,
    end_date: dateOnly,
    issuing_organization: z.literal("PainFix Physiotherapy Clinic"),
  })
  .strict();

export type VerificationResult = {
  status: "valid" | "revoked" | "not_found" | "unavailable";
  certificate?: z.infer<typeof verificationCertificateSchema>;
};

export function isApplicationOpen(
  program: Pick<
    Program,
    "status" | "applications_open" | "application_open_at" | "application_close_at"
  >,
  now = new Date(),
): boolean {
  if (program.status !== "published" || !program.applications_open) return false;
  const at = now.getTime();
  return (
    (!program.application_open_at || new Date(program.application_open_at).getTime() <= at) &&
    (!program.application_close_at || new Date(program.application_close_at).getTime() > at)
  );
}
export function verificationUrl(token: string): string {
  return `https://painfixphysiotherapy.com/verify-certificate?reference=${encodeURIComponent(token)}`;
}
export function certificateTitle(type: "internship" | "experience"): string {
  return type === "internship"
    ? "Certificate of Internship Completion"
    : "Professional Experience Certificate";
}
