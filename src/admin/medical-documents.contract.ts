export const MEDICAL_DOCUMENT_TYPES = [
  "receipt",
  "estimate",
  "treatment_report",
  "expense_statement",
] as const;

export type MedicalDocumentType = (typeof MEDICAL_DOCUMENT_TYPES)[number];

const PREFIX: Record<MedicalDocumentType, string> = {
  receipt: "PF-R-",
  estimate: "PF-E-",
  treatment_report: "PF-T-",
  expense_statement: "PF-S-",
};

export function formatMedicalDocumentNumber(type: MedicalDocumentType, sequence: number): string {
  if (!Number.isSafeInteger(sequence) || sequence < 1) {
    throw new Error("Document sequence must be a positive safe integer");
  }
  return PREFIX[type] + String(sequence).padStart(5, "0");
}

export interface MedicalLedgerSource {
  id: string;
  entry_type: string;
  amount: number | string;
  payment_method?: string | null;
  reference?: string | null;
  occurred_at?: string;
  description?: string | null;
}

function toMinorUnits(value: number | string): number {
  const raw = String(value).trim();
  if (!/^-?\d+(?:\.\d{1,2})?$/.test(raw)) {
    throw new Error("Ledger amount must be a valid PKR amount with at most two decimals");
  }
  const negative = raw.startsWith("-");
  const unsigned = negative ? raw.slice(1) : raw;
  const [whole, fraction = ""] = unsigned.split(".");
  const minor = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));
  const signed = negative ? -minor : minor;
  if (signed > BigInt(Number.MAX_SAFE_INTEGER) || signed < BigInt(Number.MIN_SAFE_INTEGER)) {
    throw new Error("Ledger amount exceeds the supported range");
  }
  return Number(signed);
}

export function calculateReceiptTotal(entries: MedicalLedgerSource[]): number {
  if (!entries.length) throw new Error("A receipt requires at least one recorded payment");
  const seen = new Set<string>();
  let total = 0;
  for (const entry of entries) {
    if (entry.entry_type !== "payment") {
      throw new Error("Only recorded payment entries can appear on a payment receipt");
    }
    if (seen.has(entry.id)) throw new Error("Duplicate payment entry selected");
    seen.add(entry.id);
    const amount = toMinorUnits(entry.amount);
    if (amount >= 0) throw new Error("Payment ledger entries must be negative");
    total += Math.abs(amount);
    if (!Number.isSafeInteger(total)) throw new Error("Receipt total exceeds the supported range");
  }
  return total / 100;
}

export function summarizeExpenseLedger(entries: MedicalLedgerSource[]) {
  const seen = new Set<string>();
  let payments = 0;
  let refunds = 0;
  let adjustments = 0;
  for (const entry of entries) {
    if (!["payment", "refund", "adjustment"].includes(entry.entry_type)) {
      throw new Error("Expense statements accept payment, refund and adjustment entries only");
    }
    if (seen.has(entry.id)) throw new Error("Duplicate ledger entry selected");
    seen.add(entry.id);
    const amount = toMinorUnits(entry.amount);
    if (entry.entry_type === "payment") {
      if (amount >= 0) throw new Error("Payment entries must be negative");
      payments += Math.abs(amount);
    } else if (entry.entry_type === "refund") {
      if (amount <= 0) throw new Error("Refund entries must be positive");
      refunds += amount;
    } else {
      adjustments += amount;
    }
  }
  return {
    payments: payments / 100,
    refunds: refunds / 100,
    adjustments: adjustments / 100,
    netReceived: (payments - refunds + adjustments) / 100,
  };
}

export function assertCompletedSessionSources(
  sessions: Array<{ id: string; status: string }>,
): string[] {
  if (!sessions.length) throw new Error("A treatment report requires completed sessions");
  const ids = new Set<string>();
  for (const session of sessions) {
    if (session.status !== "completed") {
      throw new Error("Only completed sessions can be verified in a treatment report");
    }
    if (ids.has(session.id)) throw new Error("Duplicate treatment session selected");
    ids.add(session.id);
  }
  return [...ids];
}
