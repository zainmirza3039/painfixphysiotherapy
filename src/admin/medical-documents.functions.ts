import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { calculateReceiptTotal, summarizeExpenseLedger } from "@/admin/medical-documents.contract";

type AdminContext = { supabase: SupabaseClient<Database>; userId: string };

type DatabaseError = { message: string };
interface DatabaseRows<Row> {
  data: Row[] | null;
  error: DatabaseError | null;
}
interface DatabaseSingle<Row> {
  data: Row | null;
  error: DatabaseError | null;
}

interface MedicalDocumentQuery<Row> extends PromiseLike<DatabaseRows<Row>> {
  then: PromiseLike<DatabaseRows<Row>>["then"];
  select(columns: string): MedicalDocumentQuery<Row>;
  eq(column: string, value: unknown): MedicalDocumentQuery<Row>;
  is(column: string, value: null | boolean): MedicalDocumentQuery<Row>;
  in(column: string, values: readonly unknown[]): MedicalDocumentQuery<Row>;
  gte(column: string, value: unknown): MedicalDocumentQuery<Row>;
  lte(column: string, value: unknown): MedicalDocumentQuery<Row>;
  lt(column: string, value: unknown): MedicalDocumentQuery<Row>;
  order(column: string, options: { ascending: boolean }): MedicalDocumentQuery<Row>;
  limit(count: number): MedicalDocumentQuery<Row>;
  maybeSingle(): Promise<DatabaseSingle<Row>>;
}

interface MedicalDocumentDatabase {
  from<Row>(table: string): MedicalDocumentQuery<Row>;
  rpc<Result>(
    functionName: string,
    parameters: Record<string, unknown>,
  ): PromiseLike<DatabaseSingle<Result>>;
  storage: {
    from(bucket: string): {
      upload(
        path: string,
        body: Uint8Array,
        options: { contentType: string; upsert: boolean },
      ): Promise<{ error: DatabaseError | null }>;
      remove(paths: string[]): Promise<{ error: DatabaseError | null }>;
      createSignedUrl(
        path: string,
        expiresIn: number,
      ): Promise<{ data: { signedUrl: string } | null; error: DatabaseError | null }>;
    };
  };
}

type PatientSummaryRow = MedicalDocumentPatient;
type PatientIdentityRow = { id: string; clinician_id: string; full_name: string };
type MedicalDocumentListRow = MedicalDocumentListItem;
type VerificationDocumentRow = {
  patient_name_snapshot: string;
  document_number: string;
  document_type: string;
  status: "issued" | "cancelled" | "superseded";
  issued_at: string | null;
};
type MedicalDocumentLedgerRow = {
  id: string;
  entry_type: string;
  amount: number | string;
  occurred_at: string;
  description: string | null;
  payment_method: string | null;
  reference: string | null;
};
type MedicalDocumentSessionRow = {
  id: string;
  session_date: string;
  status: string;
  session_label: string | null;
};
type IssuedEstimateRow = { id: string; document_number: string; snapshot: unknown };
type IssuanceRecord = { document_id: string; document_number: string };
type MedicalDocumentPdfRow = { pdf_storage_path: string | null; status: string };
type MedicalDocumentSnapshot = Record<string, unknown>;

function medicalDocumentDatabase(client: unknown): MedicalDocumentDatabase {
  // These additive tables are not yet present in the generated Database type.
  // Keep the escape hatch narrow and type every queried row and operation here.
  return client as MedicalDocumentDatabase;
}

function snapshotRecord(value: unknown): MedicalDocumentSnapshot {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as MedicalDocumentSnapshot)
    : {};
}

async function assertAdmin(context: AdminContext) {
  const [{ data: isAdmin, error: adminError }, { data: isSuper, error: superError }] =
    await Promise.all([
      context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" }),
      context.supabase.rpc("has_role", { _user_id: context.userId, _role: "super_admin" }),
    ]);
  if (adminError || superError) throw new Error("Unable to verify administrator permissions");
  if (!isAdmin && !isSuper) throw new Error("Forbidden: administrator access required");
}

export interface MedicalDocumentPatient {
  id: string;
  full_name: string;
  status: string;
  created_at: string;
}

export interface MedicalDocumentListItem {
  id: string;
  document_number: string;
  document_type: "receipt" | "estimate" | "treatment_report" | "expense_statement";
  status: "pending" | "issued" | "cancelled" | "superseded";
  patient_name_snapshot: string;
  issued_at: string | null;
  created_at: string;
}

export const listMedicalDocumentPatients = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MedicalDocumentPatient[]> => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = medicalDocumentDatabase(supabaseAdmin);
    const { data, error } = await db
      .from<PatientSummaryRow>("personal_patients")
      .select("id, full_name, status, created_at")
      .eq("clinician_id", context.userId)
      .is("archived_at", null)
      .order("full_name", { ascending: true })
      .limit(500);
    if (error) throw new Error("Unable to load your clinical patient records");
    return (data ?? []) as MedicalDocumentPatient[];
  });

export const listMedicalDocuments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MedicalDocumentListItem[]> => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = medicalDocumentDatabase(supabaseAdmin);
    const { data, error } = await db
      .from<MedicalDocumentListRow>("medical_documents")
      .select(
        "id, document_number, document_type, status, patient_name_snapshot, issued_at, created_at",
      )
      .eq("clinician_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error("Unable to load medical documents");
    return (data ?? []) as MedicalDocumentListItem[];
  });

const verificationInput = z
  .object({
    reference: z
      .string()
      .trim()
      .regex(/^[a-f0-9]{64}$/i, "Invalid verification reference"),
  })
  .strict();

export type MedicalDocumentVerification =
  | { status: "not_found" }
  | {
      status: "issued" | "cancelled" | "superseded";
      patient_name: string;
      document_number: string;
      document_type: string;
      issued_at: string | null;
    };

/** Public projection only. Never return the stored snapshot, token hash, or patient ID. */
export const verifyMedicalDocument = createServerFn({ method: "GET" })
  .inputValidator((input) => verificationInput.parse(input))
  .handler(async ({ data }): Promise<MedicalDocumentVerification> => {
    const tokenBytes = new TextEncoder().encode(data.reference.toLowerCase());
    const digest = await crypto.subtle.digest("SHA-256", tokenBytes);
    const tokenHash = Array.from(new Uint8Array(digest), (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = medicalDocumentDatabase(supabaseAdmin);
    const { data: row, error } = await db
      .from<VerificationDocumentRow>("medical_documents")
      .select("patient_name_snapshot, document_number, document_type, status, issued_at")
      .eq("verification_token_hash", tokenHash)
      .in("status", ["issued", "cancelled", "superseded"])
      .maybeSingle();

    if (error) throw new Error("Verification is temporarily unavailable");
    if (!row) return { status: "not_found" };
    return {
      status: row.status,
      patient_name: row.patient_name_snapshot,
      document_number: row.document_number,
      document_type: row.document_type,
      issued_at: row.issued_at,
    };
  });

const issueInput = z
  .object({
    patientId: z.string().uuid(),
    documentType: z.enum(["receipt", "estimate", "treatment_report", "expense_statement"]),
    paymentEntryIds: z.array(z.string().uuid()).max(100).optional(),
    statementEntryIds: z.array(z.string().uuid()).max(200).optional(),
    sessionIds: z.array(z.string().uuid()).max(100).optional(),
    diagnosis: z.string().trim().max(500).optional(),
    clinicalIndication: z.string().trim().max(1000).optional(),
    servicesDelivered: z.array(z.string().trim().min(1).max(200)).max(20).optional(),
    treatmentStart: z.string().date().optional(),
    treatmentEnd: z.string().date().optional(),
    assessmentDate: z.string().date().optional(),
    clinicalJustification: z.string().trim().max(1500).optional(),
    recommendedIntervention: z.string().trim().max(1500).optional(),
    proposedSessions: z.number().int().min(1).max(200).optional(),
    proposedDuration: z.string().trim().max(120).optional(),
    perSessionFee: z.number().positive().max(1000000).optional(),
    validUntil: z.string().date().optional(),
    baselineFindings: z.string().trim().max(3000).optional(),
    documentedProgress: z.string().trim().max(3000).optional(),
    remainingSessions: z.number().int().min(0).max(200).optional(),
    currentRehabilitationPlan: z.string().trim().max(3000).optional(),
    futureEstimateDocumentId: z.string().uuid().optional(),
  })
  .strict();

function requiredText(value: string | undefined, label: string): string {
  if (!value?.trim()) throw new Error(`${label} is required`);
  return value.trim();
}

function isoDate(value: string | undefined, label: string): string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`${label} is required`);
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new Error(`${label} must be a valid calendar date`);
  }
  return value;
}

function tokenHex(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 2,
  }).format(value);
}

export const createMedicalDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => issueInput.parse(input))
  .handler(
    async ({
      data,
      context,
    }): Promise<{ documentNumber: string; status: string; pdfUrl: string | null }> => {
      await assertAdmin(context);
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { createMedicalDocumentPdf } = await import("@/lib/medical-document-pdf.server");
      const db = medicalDocumentDatabase(supabaseAdmin);

      const { data: patient, error: patientError } = await db
        .from<PatientIdentityRow>("personal_patients")
        .select("id, clinician_id, full_name")
        .eq("id", data.patientId)
        .eq("clinician_id", context.userId)
        .is("archived_at", null)
        .maybeSingle();
      if (patientError || !patient) throw new Error("Patient record not found or not accessible");

      const issuedAt = new Date().toISOString();
      const token = tokenHex();
      const tokenHash = await sha256Hex(token);
      const verificationUrl = `https://painfixphysiotherapy.com/verify-medical-document?reference=${token}`;
      const sourceIds: string[] = [];
      const sections: Array<{ heading?: string; rows: Array<{ label: string; value: string }> }> =
        [];
      let snapshot: Record<string, unknown>;
      let documentTypeLabel = "";

      if (data.documentType === "receipt") {
        const ids = data.paymentEntryIds ?? [];
        if (!ids.length || new Set(ids).size !== ids.length)
          throw new Error("Select unique recorded payment entries");
        const start = isoDate(data.treatmentStart, "Treatment start date");
        const end = isoDate(data.treatmentEnd, "Treatment end date");
        if (end < start) throw new Error("Treatment end date cannot precede start date");
        const endExclusive = new Date(`${end}T00:00:00.000Z`);
        endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);
        const diagnosis = requiredText(data.diagnosis, "Diagnosis / clinical indication");
        const services = data.servicesDelivered ?? [];
        if (!services.length || services.some((item) => !item.trim()))
          throw new Error("List the PainFix services actually delivered");

        const [{ data: ledger, error: ledgerError }, { data: sessions, error: sessionError }] =
          await Promise.all([
            db
              .from<MedicalDocumentLedgerRow>("personal_patient_ledger")
              .select("id, entry_type, amount, occurred_at, description, payment_method, reference")
              .eq("clinician_id", context.userId)
              .eq("patient_id", data.patientId)
              .in("id", ids),
            db
              .from<MedicalDocumentSessionRow>("personal_patient_sessions")
              .select("id, session_date, status")
              .eq("clinician_id", context.userId)
              .eq("patient_id", data.patientId)
              .eq("status", "completed")
              .gte("session_date", `${start}T00:00:00.000Z`)
              .lt("session_date", endExclusive.toISOString()),
          ]);
        if (ledgerError || !ledger || ledger.length !== ids.length)
          throw new Error("Unable to validate selected payment records");
        if (ledger.some((row) => row.entry_type !== "payment" || Number(row.amount) >= 0)) {
          throw new Error("A receipt can include only actual negative payment ledger entries");
        }
        if (sessionError || !sessions?.length)
          throw new Error("No completed PainFix sessions are recorded in this treatment period");
        const total = calculateReceiptTotal(ledger);
        if (!Number.isFinite(total) || total <= 0)
          throw new Error("Recorded payment total is invalid");
        sourceIds.push(...ids);
        snapshot = {
          patient: { id: patient.id, fullName: patient.full_name },
          issuedAt,
          treatmentPeriod: { from: start, to: end },
          diagnosisOrIndication: diagnosis,
          servicesDelivered: services,
          sessionsCompleted: sessions.length,
          payments: ledger.map((row) => ({
            ledgerEntryId: row.id,
            amountReceived: Math.abs(Number(row.amount)),
            occurredAt: row.occurred_at,
            description: row.description,
            paymentMethod: row.payment_method,
            reference: row.reference,
          })),
          totalReceived: total,
          statement:
            "This receipt confirms only payments actually received by PainFix for services delivered by PainFix.",
        };
        documentTypeLabel = "Payment Receipt";
        sections.push(
          {
            heading: "Treatment details",
            rows: [
              { label: "Treatment period", value: `${start} to ${end}` },
              { label: "Clinical indication", value: diagnosis },
              { label: "Services delivered", value: services.join("; ") },
              { label: "Completed sessions", value: String(sessions.length) },
            ],
          },
          {
            heading: "Payments received",
            rows: [
              ...ledger.map((row, index: number) => ({
                label: `Payment ${index + 1} · ${row.payment_method ?? "Not recorded"}`,
                value: `${formatMoney(Math.abs(Number(row.amount)))} · ${new Date(row.occurred_at).toLocaleDateString("en-GB")}${row.reference ? ` · Ref: ${row.reference}` : ""}${row.description ? ` · ${row.description}` : ""}`,
              })),
              { label: "Total received", value: formatMoney(total) },
            ],
          },
          { rows: [{ label: "Receipt statement", value: String(snapshot.statement) }] },
        );
      } else if (data.documentType === "estimate") {
        const assessmentDate = isoDate(data.assessmentDate, "Assessment date");
        const validUntil = isoDate(data.validUntil, "Estimate validity date");
        if (validUntil < assessmentDate)
          throw new Error("Estimate validity cannot precede assessment date");
        const diagnosis = requiredText(data.diagnosis, "Diagnosis");
        const justification = requiredText(data.clinicalJustification, "Clinical justification");
        const intervention = requiredText(data.recommendedIntervention, "Recommended intervention");
        const duration = requiredText(data.proposedDuration, "Proposed duration");
        const sessions = data.proposedSessions;
        const fee = data.perSessionFee;
        if (!sessions || !fee || !Number.isFinite(fee) || Math.round(fee * 100) !== fee * 100)
          throw new Error(
            "Proposed sessions and a valid per-session fee (maximum two decimals) are required",
          );
        const total = sessions * fee;
        if (!Number.isSafeInteger(Math.round(total * 100)))
          throw new Error("Estimate total exceeds supported range");
        snapshot = {
          patient: { id: patient.id, fullName: patient.full_name },
          issuedAt,
          assessmentDate,
          diagnosis,
          clinicalJustification: justification,
          recommendedIntervention: intervention,
          proposedSessions: sessions,
          proposedDuration: duration,
          perSessionFee: fee,
          currency: "PKR",
          estimatedTotal: total,
          validUntil,
          paymentStatus: "NOT PAID",
          notice:
            "PROVISIONAL COST ESTIMATE – NOT A PAYMENT RECEIPT. This estimate does not confirm payment or treatment delivery.",
        };
        documentTypeLabel = "Treatment Cost Estimate";
        sections.push(
          {
            heading: "Clinical recommendation",
            rows: [
              { label: "Assessment date", value: assessmentDate },
              { label: "Diagnosis", value: diagnosis },
              { label: "Clinical justification", value: justification },
              { label: "Recommended intervention", value: intervention },
              { label: "Proposed duration", value: duration },
              { label: "Proposed sessions", value: String(sessions) },
            ],
          },
          {
            heading: "Provisional costs",
            rows: [
              { label: "Per-session fee", value: formatMoney(fee) },
              { label: "Estimated total", value: formatMoney(total) },
              { label: "Valid until", value: validUntil },
              { label: "Payment status", value: "NOT PAID" },
              { label: "Notice", value: String(snapshot.notice) },
            ],
          },
        );
      } else if (data.documentType === "treatment_report") {
        const ids = data.sessionIds ?? [];
        if (!ids.length || new Set(ids).size !== ids.length)
          throw new Error("Select unique completed treatment sessions");
        const diagnosis = requiredText(data.diagnosis, "Diagnosis");
        const baseline = requiredText(data.baselineFindings, "Baseline findings");
        const progress = requiredText(data.documentedProgress, "Documented progress");
        const plan = requiredText(data.currentRehabilitationPlan, "Current rehabilitation plan");
        const remaining = data.remainingSessions;
        if (remaining === undefined) throw new Error("Remaining sessions must be specified");
        const { data: sessions, error } = await db
          .from<MedicalDocumentSessionRow>("personal_patient_sessions")
          .select("id, session_date, status, session_label")
          .eq("clinician_id", context.userId)
          .eq("patient_id", data.patientId)
          .in("id", ids)
          .eq("status", "completed")
          .order("session_date", { ascending: true });
        if (error || !sessions || sessions.length !== ids.length)
          throw new Error("Every selected session must be completed and belong to this patient");
        sourceIds.push(...ids);
        const dates = sessions.map((row) => row.session_date).sort();
        snapshot = {
          patient: { id: patient.id, fullName: patient.full_name },
          issuedAt,
          treatmentPeriod: { from: dates[0], to: dates[dates.length - 1] },
          diagnosis,
          baselineFindings: baseline,
          documentedProgress: progress,
          completedSessions: sessions.map((row) => ({
            sessionId: row.id,
            sessionDate: row.session_date,
            label: row.session_label,
          })),
          remainingSessions: remaining,
          currentRehabilitationPlan: plan,
          evidenceRule:
            "Progress statements are limited to documented findings. No unrecorded measurements or percentages are inferred.",
        };
        documentTypeLabel = "Treatment Verification Report";
        sections.push(
          {
            heading: "Clinical summary",
            rows: [
              { label: "Diagnosis", value: diagnosis },
              { label: "Treatment period", value: `${dates[0]} to ${dates[dates.length - 1]}` },
              { label: "Baseline findings", value: baseline },
              { label: "Documented progress", value: progress },
            ],
          },
          {
            heading: "Treatment delivered",
            rows: [
              {
                label: "Completed sessions",
                value: sessions.map((row) => row.session_date).join(", "),
              },
              { label: "Remaining sessions", value: String(remaining) },
              { label: "Current rehabilitation plan", value: plan },
            ],
          },
          { rows: [{ label: "Clinical evidence note", value: String(snapshot.evidenceRule) }] },
        );
      } else {
        const ids = data.statementEntryIds ?? [];
        if (!ids.length || new Set(ids).size !== ids.length)
          throw new Error("Select unique financial ledger entries for the statement");
        const { data: ledger, error } = await db
          .from<MedicalDocumentLedgerRow>("personal_patient_ledger")
          .select("id, entry_type, amount, occurred_at, payment_method, reference, description")
          .eq("clinician_id", context.userId)
          .eq("patient_id", data.patientId)
          .in("id", ids);
        if (error || !ledger || ledger.length !== ids.length)
          throw new Error("Unable to validate selected financial records");
        if (ledger.some((row) => !["payment", "refund", "adjustment"].includes(row.entry_type))) {
          throw new Error("Statements may include payment, refund and adjustment entries only");
        }
        const payments = ledger.filter((row) => row.entry_type === "payment");
        const refunds = ledger.filter((row) => row.entry_type === "refund");
        const adjustments = ledger.filter((row) => row.entry_type === "adjustment");
        if (
          payments.some((row) => Number(row.amount) >= 0) ||
          refunds.some((row) => Number(row.amount) <= 0)
        ) {
          throw new Error("Financial ledger signs are inconsistent with payment/refund types");
        }
        sourceIds.push(...ids);
        let futureEstimate: {
          documentId: string;
          estimateNumber: string;
          amount: number;
          validUntil: string;
        } | null = null;
        if (data.futureEstimateDocumentId) {
          const { data: estimate, error: estimateError } = await db
            .from<IssuedEstimateRow>("medical_documents")
            .select("id, document_number, document_type, status, snapshot")
            .eq("id", data.futureEstimateDocumentId)
            .eq("patient_id", data.patientId)
            .eq("clinician_id", context.userId)
            .eq("document_type", "estimate")
            .eq("status", "issued")
            .maybeSingle();
          if (estimateError || !estimate)
            throw new Error("Future estimate must be an issued estimate for this patient");
          futureEstimate = {
            documentId: estimate.id,
            estimateNumber: estimate.document_number,
            amount: Number(snapshotRecord(estimate.snapshot).estimatedTotal ?? 0),
            validUntil: String(snapshotRecord(estimate.snapshot).validUntil ?? ""),
          };
        }
        const accounting = summarizeExpenseLedger(ledger);
        const totalPaid = accounting.payments;
        const totalRefunded = accounting.refunds;
        const totalAdjustments = accounting.adjustments;
        snapshot = {
          patient: { id: patient.id, fullName: patient.full_name },
          issuedAt,
          historicalPainFixPayments: payments.map((row) => ({
            ledgerEntryId: row.id,
            amount: Math.abs(Number(row.amount)),
            date: row.occurred_at,
            method: row.payment_method,
            reference: row.reference,
          })),
          historicalPainFixRefunds: refunds.map((row) => ({
            ledgerEntryId: row.id,
            amount: Number(row.amount),
            date: row.occurred_at,
            method: row.payment_method,
            reference: row.reference,
          })),
          historicalAdjustments: adjustments.map((row) => ({
            ledgerEntryId: row.id,
            amount: Number(row.amount),
            date: row.occurred_at,
            description: row.description,
          })),
          totalPaidToPainFix: totalPaid,
          totalRefundedByPainFix: totalRefunded,
          totalAdjustments,
          netRecorded: accounting.netReceived,
          futureProjectedEstimate: futureEstimate,
          accountingNotice:
            "Paid amounts represent recorded PainFix payments only. Future estimates are projections and are not included in amounts paid.",
        };
        documentTypeLabel = "Consolidated Medical Expense Statement";
        sections.push(
          {
            heading: "Historical PainFix payments",
            rows: [
              ...payments.map((row, index: number) => ({
                label: `Payment ${index + 1} · ${row.payment_method ?? "Not recorded"}`,
                value: `${formatMoney(Math.abs(Number(row.amount)))} · ${new Date(row.occurred_at).toLocaleDateString("en-GB")}`,
              })),
              { label: "Total paid to PainFix", value: formatMoney(totalPaid) },
            ],
          },
          {
            heading: "Refunds and adjustments",
            rows: [
              ...refunds.map((row, index: number) => ({
                label: `Refund ${index + 1}`,
                value: `${formatMoney(Number(row.amount))} · ${new Date(row.occurred_at).toLocaleDateString("en-GB")}${row.reference ? ` · Ref: ${row.reference}` : ""}`,
              })),
              ...adjustments.map((row, index: number) => ({
                label: `Adjustment ${index + 1}`,
                value: `${formatMoney(Number(row.amount))} · ${new Date(row.occurred_at).toLocaleDateString("en-GB")}`,
              })),
              { label: "Total refunded", value: formatMoney(totalRefunded) },
              { label: "Net adjustments", value: formatMoney(totalAdjustments) },
              { label: "Net recorded", value: formatMoney(accounting.netReceived) },
            ],
          },
          ...(futureEstimate
            ? [
                {
                  heading: "Future projection (not paid)",
                  rows: [
                    { label: "Estimate reference", value: futureEstimate.estimateNumber },
                    { label: "Projected amount", value: formatMoney(futureEstimate.amount) },
                    { label: "Valid until", value: futureEstimate.validUntil },
                  ],
                },
              ]
            : []),
          { rows: [{ label: "Accounting note", value: String(snapshot.accountingNotice) }] },
        );
      }

      const { data: created, error: createError } = await db.rpc<IssuanceRecord[]>(
        "begin_medical_document_issuance",
        {
          p_clinician_id: context.userId,
          p_patient_id: data.patientId,
          p_document_type: data.documentType,
          p_patient_name_snapshot: patient.full_name,
          p_snapshot: snapshot,
          p_token_hash: tokenHash,
          p_actor_id: context.userId,
          p_supersedes_document_id: null,
          p_source_ids: sourceIds.length ? sourceIds : null,
        },
      );
      if (createError || !created?.[0])
        throw new Error("Unable to create a pending medical document");

      const record = created[0];
      let pdfBytes: Uint8Array;
      try {
        pdfBytes = await createMedicalDocumentPdf({
          documentNumber: record.document_number,
          documentType: documentTypeLabel,
          patientName: patient.full_name,
          issuedAt,
          verificationUrl,
          sections,
          signatoryName: "Dr. Zain Ul Abideen, DPT",
          signatoryDesignation: "Clinical Physiotherapist · PainFix Physiotherapy Clinic",
        });
      } catch (error) {
        await db.rpc("cancel_medical_document_issuance", {
          p_document_id: record.document_id,
          p_reason: "PDF rendering failed; pending issuance was cancelled.",
          p_actor_id: context.userId,
        });
        throw error;
      }

      const storagePath = `${data.patientId}/${record.document_id}.pdf`;
      const { error: uploadError } = await db.storage
        .from("medical-documents")
        .upload(storagePath, pdfBytes, {
          contentType: "application/pdf",
          upsert: false,
        });
      if (uploadError) {
        await db.rpc("cancel_medical_document_issuance", {
          p_document_id: record.document_id,
          p_reason: "PDF storage upload failed; pending issuance was cancelled.",
          p_actor_id: context.userId,
        });
        throw new Error("The PDF could not be stored securely; the pending document was cancelled");
      }

      const fullStoragePath = `medical-documents/${storagePath}`;
      const { error: completeError } = await db.rpc("complete_medical_document_issuance", {
        p_document_id: record.document_id,
        p_pdf_storage_path: fullStoragePath,
        p_actor_id: context.userId,
      });
      if (completeError) {
        await db.storage.from("medical-documents").remove([storagePath]);
        await db.rpc("cancel_medical_document_issuance", {
          p_document_id: record.document_id,
          p_reason: "Document finalization failed after PDF upload.",
          p_actor_id: context.userId,
        });
        throw new Error(
          "The document could not be finalized; its PDF was removed and the pending record cancelled",
        );
      }

      const { data: signed, error: signedError } = await db.storage
        .from("medical-documents")
        .createSignedUrl(storagePath, 60);
      return {
        documentNumber: record.document_number,
        status: "issued",
        pdfUrl: signedError ? null : (signed?.signedUrl ?? null),
      };
    },
  );

export interface MedicalDocumentSourceData {
  ledger: Array<{
    id: string;
    entry_type: string;
    amount: number;
    occurred_at: string;
    payment_method: string | null;
    description: string | null;
    reference: string | null;
  }>;
  sessions: Array<{
    id: string;
    session_date: string;
    status: string;
    session_label: string | null;
  }>;
  estimates: Array<{
    id: string;
    document_number: string;
    estimated_total: number;
    valid_until: string | null;
  }>;
}

export const listMedicalDocumentSources = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ patientId: z.string().uuid() }).strict().parse(input))
  .handler(async ({ data, context }): Promise<MedicalDocumentSourceData> => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = medicalDocumentDatabase(supabaseAdmin);
    const [ledgerResult, sessionResult, estimateResult] = await Promise.all([
      db
        .from<MedicalDocumentLedgerRow>("personal_patient_ledger")
        .select("id, entry_type, amount, occurred_at, payment_method, description, reference")
        .eq("clinician_id", context.userId)
        .eq("patient_id", data.patientId)
        .order("occurred_at", { ascending: false })
        .limit(250),
      db
        .from<MedicalDocumentSessionRow>("personal_patient_sessions")
        .select("id, session_date, status, session_label")
        .eq("clinician_id", context.userId)
        .eq("patient_id", data.patientId)
        .order("session_date", { ascending: false })
        .limit(250),
      db
        .from<IssuedEstimateRow>("medical_documents")
        .select("id, document_number, snapshot")
        .eq("clinician_id", context.userId)
        .eq("patient_id", data.patientId)
        .eq("document_type", "estimate")
        .eq("status", "issued")
        .order("issued_at", { ascending: false })
        .limit(100),
    ]);
    if (ledgerResult.error || sessionResult.error || estimateResult.error) {
      throw new Error("Unable to load the selected patient's source records");
    }
    return {
      ledger: (ledgerResult.data ?? []).map((row) => ({
        ...row,
        amount: Number(row.amount),
      })),
      sessions: sessionResult.data ?? [],
      estimates: (estimateResult.data ?? []).map((row) => ({
        id: row.id,
        document_number: row.document_number,
        estimated_total: Number(snapshotRecord(row.snapshot).estimatedTotal ?? 0),
        valid_until:
          typeof snapshotRecord(row.snapshot).validUntil === "string"
            ? (snapshotRecord(row.snapshot).validUntil as string)
            : null,
      })),
    };
  });

export const getMedicalDocumentPdfUrl = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ documentId: z.string().uuid() }).strict().parse(input))
  .handler(async ({ data, context }): Promise<{ pdfUrl: string }> => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = medicalDocumentDatabase(supabaseAdmin);
    const { data: document, error } = await db
      .from<MedicalDocumentPdfRow>("medical_documents")
      .select("pdf_storage_path, status")
      .eq("id", data.documentId)
      .eq("clinician_id", context.userId)
      .maybeSingle();
    if (error || !document || document.status !== "issued" || !document.pdf_storage_path) {
      throw new Error("Issued PDF not found for this account");
    }
    const prefix = "medical-documents/";
    if (!document.pdf_storage_path.startsWith(prefix))
      throw new Error("Invalid private document path");
    const objectPath = document.pdf_storage_path.slice(prefix.length);
    const { data: signed, error: signedError } = await db.storage
      .from("medical-documents")
      .createSignedUrl(objectPath, 300);
    if (signedError || !signed?.signedUrl) throw new Error("Unable to create a temporary PDF link");
    return { pdfUrl: signed.signedUrl };
  });
