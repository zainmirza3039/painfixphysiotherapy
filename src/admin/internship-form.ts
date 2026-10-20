import {
  experienceInputSchema,
  participantInputSchema,
  programInputSchema,
  type ExperienceRecord,
  type Participant,
  type Program,
} from "@/lib/internships.contract";

export type ProgramForm = {
  id?: string;
  title: string;
  slug: string;
  description: string;
  discipline: string;
  duration: string;
  delivery_mode: Program["delivery_mode"];
  eligibility: string;
  objectives: string;
  requirements: string;
  location: string;
  schedule: string;
  seats: string;
  fees: string;
  application_open_at: string;
  application_close_at: string;
  applications_open: boolean;
  status: Program["status"];
  required_documents: string;
  selection_criteria: string;
  supervisor: string;
  completion_criteria: string;
  minimum_attendance: string;
  faqs: Array<{ q: string; a: string }>;
};

const list = (value: string | string[]): string[] =>
  (Array.isArray(value) ? value : value.split("\n")).map((item) => item.trim()).filter(Boolean);

const nullableText = (value: string): string | null => {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

export const localDateTimeToIso = (value: string): string | null => {
  if (!value.trim()) return null;
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) return null;
  return parsed.toISOString();
};

export const isoToLocalDateTime = (value: string | null | undefined): string => {
  if (!value) return "";
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}T${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
};

export const emptyProgramForm = (): ProgramForm => ({
  title: "",
  slug: "",
  description: "",
  discipline: "",
  duration: "",
  delivery_mode: "on_site",
  eligibility: "",
  objectives: "",
  requirements: "",
  location: "",
  schedule: "",
  seats: "",
  fees: "",
  application_open_at: "",
  application_close_at: "",
  applications_open: false,
  status: "draft",
  required_documents: "",
  selection_criteria: "",
  supervisor: "",
  completion_criteria: "",
  minimum_attendance: "",
  faqs: [],
});

export const programToForm = (program?: Program | null): ProgramForm => {
  const blank = emptyProgramForm();
  if (!program) return blank;
  return {
    ...blank,
    ...program,
    objectives: program.objectives.join("\n"),
    requirements: program.requirements.join("\n"),
    required_documents: program.required_documents.join("\n"),
    location: program.location ?? "",
    schedule: program.schedule ?? "",
    fees: program.fees ?? "",
    supervisor: program.supervisor ?? "",
    seats: program.seats == null ? "" : String(program.seats),
    minimum_attendance: String(program.minimum_attendance),
    application_open_at: isoToLocalDateTime(program.application_open_at),
    application_close_at: isoToLocalDateTime(program.application_close_at),
    faqs: program.faqs.map((faq) => ({ q: faq.q, a: faq.a })),
  };
};

export const programFormToPayload = (form: ProgramForm) => {
  const candidate = {
    ...(form.id ? { id: form.id } : {}),
    title: form.title.trim(),
    slug: form.slug.trim(),
    description: form.description.trim(),
    discipline: form.discipline.trim(),
    duration: form.duration.trim(),
    delivery_mode: form.delivery_mode,
    eligibility: form.eligibility.trim(),
    objectives: list(form.objectives),
    requirements: list(form.requirements),
    location: nullableText(form.location),
    schedule: nullableText(form.schedule),
    seats: form.seats.trim() ? Number(form.seats) : null,
    fees: nullableText(form.fees),
    application_open_at: localDateTimeToIso(form.application_open_at),
    application_close_at: localDateTimeToIso(form.application_close_at),
    applications_open: form.applications_open,
    status: form.status,
    required_documents: list(form.required_documents),
    selection_criteria: form.selection_criteria.trim(),
    supervisor: nullableText(form.supervisor),
    completion_criteria: form.completion_criteria.trim(),
    minimum_attendance: form.minimum_attendance.trim() ? Number(form.minimum_attendance) : 0,
    faqs: form.faqs
      .map((faq) => ({ q: faq.q.trim(), a: faq.a.trim() }))
      .filter((faq) => faq.q && faq.a),
  };
  return programInputSchema.parse(candidate);
};

export type ParticipantForm = Omit<
  Participant,
  "id" | "created_at" | "updated_at" | "completion_decision_at" | "reviewer_id"
> & {
  id?: string;
  completion_decision_at: string | null;
  reviewer_id: string | null;
};
export const participantToForm = (value?: Participant | null): ParticipantForm => ({
  id: value?.id,
  application_id: value?.application_id ?? "",
  program_id: value?.program_id ?? "",
  full_name: value?.full_name ?? "",
  start_date: value?.start_date ?? null,
  end_date: value?.end_date ?? null,
  attendance_percent: value?.attendance_percent ?? null,
  supervisor: value?.supervisor ?? null,
  completion_status: value?.completion_status ?? "active",
  assessment_signed_off: value?.assessment_signed_off ?? false,
  completion_approved: value?.completion_approved ?? false,
  completion_decision_at: value?.completion_decision_at ?? null,
  reviewer_id: value?.reviewer_id ?? null,
  notes: value?.notes ?? null,
});
export const participantFormToPayload = (form: ParticipantForm) =>
  participantInputSchema.parse({ ...form, id: form.id || undefined });

export type ExperienceForm = Omit<
  ExperienceRecord,
  "id" | "created_at" | "updated_at" | "approver_id" | "approval_at"
> & { id?: string; approver_id: string | null; approval_at: string | null };
export const experienceToForm = (value?: ExperienceRecord | null): ExperienceForm => ({
  id: value?.id,
  full_name: value?.full_name ?? "",
  role: value?.role ?? "",
  engagement_type: value?.engagement_type ?? "internship",
  start_date: value?.start_date ?? null,
  end_date: value?.end_date ?? null,
  responsibilities: value?.responsibilities ?? "",
  evidence_summary: value?.evidence_summary ?? "",
  verified: value?.verified ?? false,
  approved: value?.approved ?? false,
  approver_id: value?.approver_id ?? null,
  approval_at: value?.approval_at ?? null,
});
export const experienceFormToPayload = (form: ExperienceForm) =>
  experienceInputSchema.parse({ ...form, id: form.id || undefined });
