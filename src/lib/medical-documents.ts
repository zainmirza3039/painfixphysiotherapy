export type MedicalDocumentType =
  | "receipt"
  | "estimate"
  | "treatment_report"
  | "expense_statement";

export interface PatientSnapshot {
  id: string;
  full_name: string;
}

export interface PaymentLedgerRow {
  id: string;
  entry_type: string;
  amount: number;
  occurred_at: string;
  description: string | null;
  payment_method: string | null;
  reference: string | null;
}

export interface CompletedSessionRow {
  id: string;
  session_date: string;
  status: string;
  session_label: string | null;
}

export interface EstimateInput {
  assessmentDate: string;
  diagnosis: string;
  clinicalJustification: string;
  recommendedIntervention: string;
  proposedSessions: number;
  proposedDuration: string;
  perSessionFee: number;
  currency?: string;
  validUntil: string;
}

const isNonEmpty = (value: string) => value.trim().length > 0;
const isPositiveMoney = (value: number) => Number.isFinite(value) && value > 0;

export function buildPaymentReceiptSnapshot(args: {
  patient: PatientSnapshot;
  payments: PaymentLedgerRow[];
  treatmentPeriod: { from: string; to: string };
  diagnosisOrIndication: string;
  servicesDelivered: string[];
  sessionsCompleted: number;
  issuedOn: string;
}) {
  const { patient, payments } = args;
  if (!patient.id || !isNonEmpty(patient.full_name)) throw new Error("A valid patient is required.");
  if (payments.length === 0) throw new Error("A receipt requires at least one recorded payment.");
  if (payments.some((row) => row.entry_type !== "payment" || !Number.isFinite(row.amount) || row.amount >= 0)) {
    throw new Error("Receipts can include only negative payment ledger entries. Charges are not payments.");
  }
  if (!isNonEmpty(args.diagnosisOrIndication) || args.servicesDelivered.length === 0 ||
      args.servicesDelivered.some((service) => !isNonEmpty(service))) {
    throw new Error("Document the clinical indication and services actually delivered.");
  }
  if (!Number.isInteger(args.sessionsCompleted) || args.sessionsCompleted < 0) {
    throw new Error("Completed session count must be a non-negative integer.");
  }
  if (!args.treatmentPeriod.from || !args.treatmentPeriod.to || args.treatmentPeriod.from > args.treatmentPeriod.to) {
    throw new Error("A valid treatment period is required.");
  }
  const totalReceived = payments.reduce((sum, row) => sum + Math.abs(row.amount), 0);
  if (!isPositiveMoney(totalReceived)) throw new Error("Recorded payment total must be greater than zero.");

  return {
    documentType: "receipt" as const,
    patient: { id: patient.id, fullName: patient.full_name },
    issuedOn: args.issuedOn,
    treatmentPeriod: args.treatmentPeriod,
    diagnosisOrIndication: args.diagnosisOrIndication.trim(),
    servicesDelivered: args.servicesDelivered.map((service) => service.trim()),
    sessionsCompleted: args.sessionsCompleted,
    payments: payments.map((row) => ({
      ledgerEntryId: row.id,
      amountReceived: Math.abs(row.amount),
      occurredAt: row.occurred_at,
      description: row.description,
      paymentMethod: row.payment_method,
      reference: row.reference,
    })),
    totalReceived,
    statement: "This receipt confirms only payments actually received by PainFix for services delivered by PainFix.",
  };
}

export function buildTreatmentEstimateSnapshot(patient: PatientSnapshot, input: EstimateInput) {
  if (!patient.id || !isNonEmpty(patient.full_name)) throw new Error("A valid patient is required.");
  if (!input.assessmentDate || !input.validUntil || input.validUntil < input.assessmentDate) {
    throw new Error("Estimate validity dates are invalid.");
  }
  if (!isNonEmpty(input.diagnosis) || !isNonEmpty(input.clinicalJustification) ||
      !isNonEmpty(input.recommendedIntervention) || !isNonEmpty(input.proposedDuration)) {
    throw new Error("Clinical indication, justification, intervention and duration are required.");
  }
  if (!Number.isInteger(input.proposedSessions) || input.proposedSessions < 1 ||
      !isPositiveMoney(input.perSessionFee)) {
    throw new Error("Proposed sessions and per-session fee must be positive.");
  }
  return {
    documentType: "estimate" as const,
    patient: { id: patient.id, fullName: patient.full_name },
    ...input,
    currency: input.currency ?? "PKR",
    estimatedTotal: input.proposedSessions * input.perSessionFee,
    paymentStatus: "NOT PAID" as const,
    notice: "PROVISIONAL COST ESTIMATE – NOT A PAYMENT RECEIPT. This estimate does not confirm payment or treatment delivery.",
  };
}

export function buildTreatmentReportSnapshot(args: {
  patient: PatientSnapshot;
  treatmentPeriod: { from: string; to: string };
  diagnosis: string;
  baselineFindings: string;
  documentedProgress: string;
  remainingSessions: number;
  currentRehabilitationPlan: string;
  completedSessions: CompletedSessionRow[];
}) {
  if (!args.patient.id || !isNonEmpty(args.patient.full_name)) throw new Error("A valid patient is required.");
  if (args.completedSessions.some((session) => session.status !== "completed")) {
    throw new Error("Treatment reports may include completed sessions only.");
  }
  if (!args.diagnosis.trim() || !args.baselineFindings.trim() ||
      !args.documentedProgress.trim() || !args.currentRehabilitationPlan.trim()) {
    throw new Error("Report findings and rehabilitation plan must be documented.");
  }
  if (!Number.isInteger(args.remainingSessions) || args.remainingSessions < 0) {
    throw new Error("Remaining sessions must be a non-negative integer.");
  }
  return {
    documentType: "treatment_report" as const,
    patient: { id: args.patient.id, fullName: args.patient.full_name },
    treatmentPeriod: args.treatmentPeriod,
    diagnosis: args.diagnosis.trim(),
    baselineFindings: args.baselineFindings.trim(),
    documentedProgress: args.documentedProgress.trim(),
    completedSessions: args.completedSessions.map(({ id, session_date, session_label }) => ({
      sessionId: id,
      sessionDate: session_date,
      label: session_label,
    })),
    remainingSessions: args.remainingSessions,
    currentRehabilitationPlan: args.currentRehabilitationPlan.trim(),
    evidenceRule: "Progress statements are limited to the findings documented in this report; no unrecorded measurements or percentages are inferred.",
  };
}

export function buildConsolidatedExpenseSnapshot(args: {
  patient: PatientSnapshot;
  payments: PaymentLedgerRow[];
  refunds: PaymentLedgerRow[];
  futureEstimate: { estimateNumber: string; amount: number; validUntil: string } | null;
}) {
  if (!args.patient.id || !isNonEmpty(args.patient.full_name)) throw new Error("A valid patient is required.");
  if (args.payments.some((row) => row.entry_type !== "payment" || row.amount >= 0) ||
      args.refunds.some((row) => row.entry_type !== "refund" || row.amount <= 0)) {
    throw new Error("Historical payments and refunds must match their ledger entry types and signs.");
  }
  if (args.futureEstimate && (!isPositiveMoney(args.futureEstimate.amount) || !args.futureEstimate.estimateNumber)) {
    throw new Error("A valid future estimate reference and amount are required.");
  }
  return {
    documentType: "expense_statement" as const,
    patient: { id: args.patient.id, fullName: args.patient.full_name },
    historicalPainFixPayments: args.payments.map((row) => ({
      ledgerEntryId: row.id, amount: Math.abs(row.amount), date: row.occurred_at,
      method: row.payment_method, reference: row.reference,
    })),
    historicalPainFixRefunds: args.refunds.map((row) => ({
      ledgerEntryId: row.id, amount: row.amount, date: row.occurred_at,
      method: row.payment_method, reference: row.reference,
    })),
    totalPaidToPainFix: args.payments.reduce((sum, row) => sum + Math.abs(row.amount), 0),
    totalRefundedByPainFix: args.refunds.reduce((sum, row) => sum + row.amount, 0),
    futureProjectedEstimate: args.futureEstimate,
    accountingNotice: "Paid amounts represent recorded PainFix payments only. Future estimates are projections and are not included in amounts paid.",
  };
}
