import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Ban, Download, FileCheck2 } from "lucide-react";
import { personalPatientDb } from "@/admin/personal-patients.db";
import {
  downloadTreatmentCertificatePdf,
  type TreatmentCertificateSnapshot,
} from "@/lib/treatment-certificate-pdf";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Patient = { id: string; full_name: string };
type Session = {
  id: string;
  session_date: string;
  status: string;
  session_label: string | null;
};
type Entry = { entry_type: string; amount: number; payment_method: string | null; reference: string | null; occurred_at: string };
type DocumentRecord = {
  id: string;
  document_number: string;
  status: string;
  issued_at: string;
  snapshot: TreatmentCertificateSnapshot;
};

const money = (amount: number) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);

const createVerificationToken = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(32)), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");

const localDay = (value: string) => {
  const date = new Date(value);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function PatientTreatmentCertificate({
  clinicianId,
  patient,
  sessions,
  ledger,
}: {
  clinicianId: string;
  patient: Patient;
  sessions: Session[];
  ledger: Entry[];
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [diagnosis, setDiagnosis] = useState("");
  const [findings, setFindings] = useState("");
  const [summary, setSummary] = useState("");
  const [advice, setAdvice] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [consent, setConsent] = useState(false);

  const completed = useMemo(
    () => sessions.filter((session) => session.status === "completed"),
    [sessions],
  );

  const documents = useQuery({
    queryKey: ["admin", "personal-patient-treatment-documents", clinicianId, patient.id],
    enabled: Boolean(clinicianId),
    queryFn: async () => {
      const { data, error } = await personalPatientDb
        .from("personal_patient_treatment_documents")
        .select("id,document_number,status,issued_at,snapshot")
        .eq("patient_id", patient.id)
        .order("issued_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as DocumentRecord[];
    },
  });

  const charges = ledger
    .filter((entry) => entry.entry_type === "charge")
    .reduce((total, entry) => total + Number(entry.amount), 0);
  const payments = ledger
    .filter((entry) => entry.entry_type === "payment")
    .reduce((total, entry) => total + Math.abs(Number(entry.amount)), 0);
  const refunds = ledger
    .filter((entry) => entry.entry_type === "refund")
    .reduce((total, entry) => total + Math.max(0, Number(entry.amount)), 0);
  const paid = Math.max(0, payments - refunds);
  const latestPayment = ledger.find((entry) => entry.entry_type === "payment");
  const balance = ledger.reduce((total, entry) => total + Number(entry.amount), 0);

  const issue = useMutation({
    mutationFn: async () => {
      if (!clinicianId) throw new Error("Please sign in again.");
      if (!completed.length) {
        throw new Error("No completed sessions are recorded.");
      }
      if (!diagnosis.trim() || !findings.trim() || !summary.trim() || !advice.trim()) {
        throw new Error("Complete the diagnosis, clinical findings, treatment and advice fields.");
      }
      if (!consent) {
        throw new Error(
          "Confirm that the patient has consented to sharing this certificate with the receiving organization.",
        );
      }
      if (!start || !end || start > end) {
        throw new Error("Select a valid treatment period.");
      }

      const selected = completed.filter((session) => {
        const day = localDay(session.session_date);
        return day >= start && day <= end;
      });

      if (!selected.length) {
        throw new Error("No completed sessions fall within this treatment period.");
      }

      const verificationToken = createVerificationToken();
      const issuedAt = new Date().toISOString();
      const documentNumber =
        "PFX-PT-" + new Date().getFullYear() + "-" + crypto.randomUUID().slice(0, 8).toUpperCase();
      const treatmentSummary =
        summary.trim() ||
        Array.from(
          new Set(selected.map((session) => session.session_label?.trim()).filter(Boolean)),
        ).join("; ") ||
        "Physiotherapy sessions as recorded in the clinic ledger.";

      const snapshot: TreatmentCertificateSnapshot = {
        patientName: patient.full_name,
        diagnosis: diagnosis.trim(),
        clinicalFindings: findings.trim(),
        treatmentAdvice: advice.trim(),
        paymentMethod: latestPayment?.payment_method?.replaceAll("_", " ") || "Not specified",
        transactionReference: latestPayment?.reference || "Not recorded",
        treatmentStart: start,
        treatmentEnd: end,
        completedSessions: selected.length,
        treatmentSummary,
        totalCharges: charges,
        amountPaid: paid,
        balance,
        issuedAt,
        documentNumber,
        verificationToken,
        patientConsentConfirmedAt: issuedAt,
        patientConsentStatement:
          "Patient consent confirmed for sharing this treatment and payment certificate with the receiving organization.",
      };

      const publicSnapshot = {
        patient: patient.full_name.trim().slice(0, 1) + "••••",
        treatment_start: start,
        treatment_end: end,
        completed_sessions: selected.length,
        amount_paid: paid,
      };

      const { error } = await personalPatientDb
        .from("personal_patient_treatment_documents")
        .insert({
          clinician_id: clinicianId,
          patient_id: patient.id,
          document_number: documentNumber,
          verification_token_hash: await sha256(verificationToken),
          snapshot,
          public_snapshot: publicSnapshot,
        });

      if (error) throw error;
      await downloadTreatmentCertificatePdf(snapshot);
      return documentNumber;
    },
    onSuccess: async (documentNumber) => {
      await queryClient.invalidateQueries({
        queryKey: ["admin", "personal-patient-treatment-documents", clinicianId, patient.id],
      });
      toast.success("Certificate issued: " + documentNumber);
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not issue certificate.");
    },
  });

  const revoke = useMutation({
    mutationFn: async (documentId: string) => {
      const reason = window.prompt("Reason for revoking this certificate:");
      if (!reason?.trim()) {
        throw new Error("A revocation reason is required.");
      }

      const { error } = await personalPatientDb
        .from("personal_patient_treatment_documents")
        .update({
          status: "revoked",
          revoked_at: new Date().toISOString(),
          revoked_reason: reason.trim(),
        })
        .eq("id", documentId)
        .eq("clinician_id", clinicianId)
        .select("id")
        .single();

      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin", "personal-patient-treatment-documents", clinicianId, patient.id],
      });
      toast.success("Certificate revoked.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not revoke certificate.");
    },
  });

  const prepareIssue = () => {
    const dates = completed.map((session) => localDay(session.session_date)).sort();
    setStart(dates[0] ?? "");
    setEnd(dates.at(-1) ?? "");
    setSummary(
      Array.from(
        new Set(completed.map((session) => session.session_label?.trim()).filter(Boolean)),
      ).join("; "),
    );
    setDiagnosis("");
    setFindings("");
    setAdvice("");
    setConsent(false);
    setOpen(true);
  };

  const sessionsInPeriod = completed.filter((session) => {
    const day = localDay(session.session_date);
    return day >= start && day <= end;
  }).length;

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold">Treatment &amp; payment certificates</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Issue a PDF certificate with QR-based online verification.
          </p>
        </div>
        <Button onClick={prepareIssue} disabled={!completed.length}>
          <FileCheck2 className="mr-2 h-4 w-4" />
          Issue certificate
        </Button>
      </div>

      {!completed.length && (
        <p className="mt-3 text-sm text-muted-foreground">
          Complete and record treatment sessions before issuing a certificate.
        </p>
      )}

      {documents.isLoading ? (
        <p className="mt-4 text-sm text-muted-foreground">Loading issued documents…</p>
      ) : documents.isError ? (
        <p className="mt-4 text-sm text-destructive">Could not load issued certificates.</p>
      ) : documents.data?.length ? (
        <div className="mt-4 divide-y divide-border">
          {documents.data.map((document) => (
            <div
              key={document.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3"
            >
              <div>
                <p className="font-medium">{document.document_number}</p>
                <p className="text-xs text-muted-foreground">
                  Issued {new Date(document.issued_at).toLocaleDateString("en-PK")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={document.status === "valid" ? "default" : "destructive"}>
                  {document.status}
                </Badge>
                {document.status === "valid" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => revoke.mutate(document.id)}
                    disabled={revoke.isPending}
                  >
                    <Ban className="mr-1 h-4 w-4" />
                    Revoke
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    void downloadTreatmentCertificatePdf(document.snapshot).catch((error: Error) =>
                      toast.error(error.message),
                    )
                  }
                >
                  <Download className="mr-1 h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          No treatment certificates issued for this patient.
        </p>
      )}

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!issue.isPending) setOpen(nextOpen);
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Physiotherapy Treatment &amp; Payment Certificate</DialogTitle>
            <DialogDescription>
              Only completed sessions within the selected period are included. Issued documents are
              immutable snapshots.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Patient</Label>
              <Input value={patient.full_name} readOnly />
            </div>
            <div className="space-y-1">
              <Label>Diagnosis / presenting condition</Label>
              <Input
                value={diagnosis}
                onChange={(event) => setDiagnosis(event.target.value)}
                maxLength={240}
                placeholder="Enter documented diagnosis"
              />
            </div>
            <div className="space-y-1">
              <Label>Clinical findings</Label>
              <Textarea rows={2} value={findings} onChange={(event) => setFindings(event.target.value)} maxLength={360} placeholder="Enter documented assessment findings" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Treatment start</Label>
                <Input
                  type="date"
                  value={start}
                  onChange={(event) => setStart(event.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Treatment end</Label>
                <Input type="date" value={end} onChange={(event) => setEnd(event.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Treatment / services provided</Label>
              <Textarea
                rows={3}
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                maxLength={1200}
                placeholder="Documented treatment details only; do not include private notes."
              />
            </div>

            <div className="space-y-1">
              <Label>Clinical advice / home programme</Label>
              <Textarea rows={2} value={advice} onChange={(event) => setAdvice(event.target.value)} maxLength={360} placeholder="Enter advice actually provided to the patient" />
            </div>
            <div className="rounded-lg border p-3 text-sm">
              <p className="mb-2 text-xs text-muted-foreground">
                Financial figures reflect the patient ledger at the time of issue.
              </p>
              <div className="flex justify-between">
                <span>Completed sessions in period</span>
                <strong>{sessionsInPeriod}</strong>
              </div>
              <div className="mt-2 flex justify-between">
                <span>Total charges</span>
                <strong>{money(charges)}</strong>
              </div>
              <div className="mt-2 flex justify-between">
                <span>Amount received</span>
                <strong>{money(paid)}</strong>
              </div>
              <div className="mt-2 flex justify-between">
                <span>Outstanding balance / (credit)</span>
                <strong>{money(balance)}</strong>
              </div>
              <div className="mt-2 flex justify-between"><span>Payment method</span><strong className="capitalize">{latestPayment?.payment_method?.replaceAll("_", " ") || "Not specified"}</strong></div>
              <div className="mt-2 flex justify-between gap-3"><span>Transaction reference</span><strong className="break-all text-right">{latestPayment?.reference || "Not recorded"}</strong></div>
            </div>

            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                className="mt-1"
              />
              <span>
                I confirm the patient has consented to sharing this treatment and payment
                certificate with the receiving organization. Public QR verification reveals only
                limited, masked details.
              </span>
            </label>
            <p className="text-xs text-muted-foreground">
              Public verification shows only a masked patient label, treatment dates, completed
              session count and amount received. Diagnosis and treatment details remain in the PDF.
              Reimbursement is not guaranteed.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => issue.mutate()}
              disabled={issue.isPending || !diagnosis.trim() || !findings.trim() || !summary.trim() || !advice.trim() || !start || !end || !consent}
            >
              {issue.isPending ? "Issuing…" : "Issue & download PDF"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
