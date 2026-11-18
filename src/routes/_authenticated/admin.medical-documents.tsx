import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Search, Users, ReceiptText, ClipboardCheck, FileClock, Wallet } from "lucide-react";
import { AdminOnly } from "@/components/admin/AdminOnly";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminQueryError } from "@/components/admin/AdminQueryError";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  listMedicalDocumentPatients,
  listMedicalDocuments,
  listMedicalDocumentSources,
  createMedicalDocument,
  getMedicalDocumentPdfUrl,
} from "@/admin/medical-documents.functions";

export const Route = createFileRoute("/_authenticated/admin/medical-documents")({
  component: () => (
    <AdminOnly>
      <MedicalDocumentationPage />
    </AdminOnly>
  ),
});

const documentTypes = [
  { title: "Payment Receipt", code: "PF-R", detail: "Issued only against recorded PainFix payments.", icon: ReceiptText },
  { title: "Treatment Cost Estimate", code: "PF-E", detail: "Future treatment projection; never a payment receipt.", icon: Wallet },
  { title: "Treatment Verification Report", code: "PF-T", detail: "Based on completed sessions and documented clinical findings.", icon: ClipboardCheck },
  { title: "Medical Expense Statement", code: "PF-S", detail: "Separates historical payments from future estimates.", icon: FileClock },
];

function MedicalDocumentationPage() {
  const [patientSearch, setPatientSearch] = useState("");
  const [documentSearch, setDocumentSearch] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [documentType, setDocumentType] = useState<"receipt" | "estimate" | "treatment_report" | "expense_statement">("receipt");
  const [selectedLedgerIds, setSelectedLedgerIds] = useState<string[]>([]);
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);
  const [issuedPdf, setIssuedPdf] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const patients = useQuery({
    queryKey: ["admin", "medical-documents", "patients"],
    queryFn: () => listMedicalDocumentPatients(),
  });
  const documents = useQuery({
    queryKey: ["admin", "medical-documents", "list"],
    queryFn: () => listMedicalDocuments(),
  });

  const sources = useQuery({ queryKey: ["admin", "medical-documents", "sources", selectedPatientId], queryFn: () => listMedicalDocumentSources({ data: { patientId: selectedPatientId } }), enabled: Boolean(selectedPatientId) });
  const createMutation = useMutation({ mutationFn: (payload: Record<string, unknown>) => createMedicalDocument({ data: payload as never }), onSuccess: (result) => { setIssuedPdf(result.pdfUrl); setSelectedLedgerIds([]); setSelectedSessionIds([]); void queryClient.invalidateQueries({ queryKey: ["admin", "medical-documents", "list"] }); } });

  const filteredPatients = useMemo(() => {
    const term = patientSearch.trim().toLowerCase();
    return (patients.data ?? []).filter((patient) =>
      !term || patient.full_name.toLowerCase().includes(term),
    );
  }, [patients.data, patientSearch]);

  const filteredDocuments = useMemo(() => {
    const term = documentSearch.trim().toLowerCase();
    return (documents.data ?? []).filter((doc) =>
      !term || [doc.document_number, doc.patient_name_snapshot, doc.document_type]
        .some((value) => value.toLowerCase().includes(term)),
    );
  }, [documents.data, documentSearch]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Medical Documentation"
        description="Create and manage verifiable clinical and financial documents from your dedicated clinical records."
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Document types">
        {documentTypes.map(({ title, code, detail, icon: Icon }) => (
          <article key={code} className="border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="grid h-9 w-9 place-items-center border border-border text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <span className="font-mono text-xs text-muted-foreground">{code}</span>
            </div>
            <h2 className="mt-4 text-sm font-semibold text-foreground">{title}</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
          </article>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="min-w-0 border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Clinical patient records</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Personal clinical records assigned to your account.</p>
            </div>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={patientSearch}
                onChange={(event) => setPatientSearch(event.target.value)}
                placeholder="Search patient name"
                className="pl-9"
              />
            </div>
          </div>
          {patients.isLoading ? (
            <div className="space-y-2 p-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : patients.isError ? (
            <div className="p-4"><AdminQueryError onRetry={() => void patients.refetch()} /></div>
          ) : filteredPatients.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              {patients.data?.length ? "No patient matches this search." : "No active personal patient records are available for this account."}
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {filteredPatients.map((patient) => (
                <li key={patient.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{patient.full_name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Added {new Date(patient.created_at).toLocaleDateString("en-GB")}</p>
                  </div>
                  <Badge variant="outline" className="shrink-0 capitalize">{patient.status.replaceAll("_", " ")}</Badge>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="min-w-0 border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Issued document register</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Latest 100 documents for your account.</p>
            </div>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={documentSearch}
                onChange={(event) => setDocumentSearch(event.target.value)}
                placeholder="Search number, patient or type"
                className="pl-9"
              />
            </div>
          </div>
          {documents.isLoading ? (
            <div className="space-y-2 p-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : documents.isError ? (
            <div className="p-4"><AdminQueryError onRetry={() => void documents.refetch()} /></div>
          ) : filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
              <FileText className="h-7 w-7 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">No medical documents issued yet</p>
              <p className="max-w-sm text-xs leading-5 text-muted-foreground">Documents will appear here after an eligible source record has been validated and the PDF has been stored successfully.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/30 text-xs text-muted-foreground">
                  <tr><th className="px-4 py-2 font-medium">Reference</th><th className="px-4 py-2 font-medium">Patient</th><th className="px-4 py-2 font-medium">Status</th><th className="px-4 py-2 font-medium">PDF</th></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredDocuments.map((doc) => (
                    <tr key={doc.id}>
                      <td className="whitespace-nowrap px-4 py-3">
                        <p className="font-mono text-xs font-semibold text-foreground">{doc.document_number}</p>
                        <p className="mt-1 text-[11px] capitalize text-muted-foreground">{doc.document_type.replaceAll("_", " ")}</p>
                      </td>
                      <td className="max-w-[180px] truncate px-4 py-3 text-xs text-foreground">{doc.patient_name_snapshot}</td>
                      <td className="px-4 py-3"><Badge variant={doc.status === "issued" ? "default" : "outline"} className="capitalize">{doc.status}</Badge></td>
                      <td className="px-4 py-3">{doc.status === "issued" ? <button type="button" onClick={() => void openIssuedPdf(doc.id)} className="text-xs font-medium text-primary underline">Open PDF</button> : <span className="text-xs text-muted-foreground">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
      <section className="border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">Create a medical document</h2>
          <p className="mt-1 text-xs text-muted-foreground">Server-validated, uniquely numbered PDFs. Files remain private; issuance is recorded only after secure storage succeeds.</p>
        </div>
        <form onSubmit={submitDocument} className="space-y-4 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-xs font-medium">Patient
              <select required value={selectedPatientId} onChange={(e) => { setSelectedPatientId(e.target.value); setSelectedLedgerIds([]); setSelectedSessionIds([]); }} className="h-10 w-full border border-input bg-background px-3 text-sm">
                <option value="">Select patient</option>{(patients.data ?? []).map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
              </select>
            </label>
            <label className="space-y-1 text-xs font-medium">Document
              <select value={documentType} onChange={(e) => { setDocumentType(e.target.value as typeof documentType); setSelectedLedgerIds([]); setSelectedSessionIds([]); setIssuedPdf(null); }} className="h-10 w-full border border-input bg-background px-3 text-sm">
                <option value="receipt">Payment Receipt</option><option value="estimate">Treatment Cost Estimate</option><option value="treatment_report">Treatment Verification Report</option><option value="expense_statement">Medical Expense Statement</option>
              </select>
            </label>
          </div>
          {selectedPatientId && sources.isLoading && <p className="text-xs text-muted-foreground">Loading source records…</p>}
          {sources.isError && <p role="alert" className="text-xs text-destructive">Unable to load source records for this patient.</p>}
          {documentType === "receipt" && <>
            <div className="space-y-2"><p className="text-xs font-semibold">Select recorded payments</p>
              {(sources.data?.ledger ?? []).filter((x) => x.entry_type === "payment" && x.amount < 0).map((x) => <label key={x.id} className="flex items-center gap-3 border border-border p-2 text-xs"><input type="checkbox" checked={selectedLedgerIds.includes(x.id)} onChange={() => toggle(selectedLedgerIds, x.id, setSelectedLedgerIds)} /><span className="flex-1">{new Date(x.occurred_at).toLocaleDateString("en-GB")} · {x.payment_method ?? "Method not recorded"}</span><strong>{Math.abs(x.amount).toLocaleString("en-PK")} PKR</strong></label>)}
              {selectedPatientId && !sources.isLoading && !(sources.data?.ledger ?? []).some((x) => x.entry_type === "payment" && x.amount < 0) && <p className="text-xs text-muted-foreground">No eligible payments. Charges and package fees are not proof of payment.</p>}
            </div>
            <div className="grid gap-3 sm:grid-cols-2"><label className="space-y-1 text-xs font-medium">Treatment from <Input name="treatmentStart" type="date" required /></label><label className="space-y-1 text-xs font-medium">Treatment to <Input name="treatmentEnd" type="date" required /></label></div>
            <label className="block space-y-1 text-xs font-medium">Diagnosis / clinical indication <Input name="diagnosis" required /></label>
            <label className="block space-y-1 text-xs font-medium">Services delivered, one per line <Textarea name="servicesDelivered" rows={3} required /></label>
            <p className="text-xs text-muted-foreground">Server verifies completed PainFix sessions within this treatment period.</p>
          </>}
          {documentType === "estimate" && <>
            <div className="grid gap-3 sm:grid-cols-2"><label className="space-y-1 text-xs font-medium">Assessment date <Input name="assessmentDate" type="date" required /></label><label className="space-y-1 text-xs font-medium">Valid until <Input name="validUntil" type="date" required /></label></div>
            <label className="block space-y-1 text-xs font-medium">Diagnosis <Input name="diagnosis" required /></label>
            <label className="block space-y-1 text-xs font-medium">Clinical justification <Textarea name="clinicalJustification" required /></label>
            <label className="block space-y-1 text-xs font-medium">Recommended intervention <Textarea name="recommendedIntervention" required /></label>
            <div className="grid gap-3 sm:grid-cols-3"><label className="space-y-1 text-xs font-medium">Sessions <Input name="proposedSessions" type="number" min="1" required /></label><label className="space-y-1 text-xs font-medium">Duration <Input name="proposedDuration" required /></label><label className="space-y-1 text-xs font-medium">Fee/session PKR <Input name="perSessionFee" type="number" min="1" step="0.01" required /></label></div>
            <p className="text-xs font-semibold text-amber-700">This document is marked NOT PAID and does not create a payment entry.</p>
          </>}
          {documentType === "treatment_report" && <>
            <div className="space-y-2"><p className="text-xs font-semibold">Select completed sessions</p>
              {(sources.data?.sessions ?? []).filter((x) => x.status === "completed").map((x) => <label key={x.id} className="flex items-center gap-3 border border-border p-2 text-xs"><input type="checkbox" checked={selectedSessionIds.includes(x.id)} onChange={() => toggle(selectedSessionIds, x.id, setSelectedSessionIds)} />{new Date(x.session_date).toLocaleDateString("en-GB")} · {x.session_label ?? "Completed session"}</label>)}
            </div>
            <label className="block space-y-1 text-xs font-medium">Diagnosis <Input name="diagnosis" required /></label>
            <label className="block space-y-1 text-xs font-medium">Baseline findings <Textarea name="baselineFindings" required /></label>
            <label className="block space-y-1 text-xs font-medium">Documented progress <Textarea name="documentedProgress" required /></label>
            <div className="grid gap-3 sm:grid-cols-2"><label className="space-y-1 text-xs font-medium">Remaining sessions <Input name="remainingSessions" type="number" min="0" required /></label><label className="space-y-1 text-xs font-medium">Current rehabilitation plan <Textarea name="currentRehabilitationPlan" required /></label></div>
          </>}
          {documentType === "expense_statement" && <>
            <div className="space-y-2"><p className="text-xs font-semibold">Select historical payment, refund and adjustment entries</p>
              {(sources.data?.ledger ?? []).filter((x) => ["payment", "refund", "adjustment"].includes(x.entry_type)).map((x) => <label key={x.id} className="flex items-center gap-3 border border-border p-2 text-xs"><input type="checkbox" checked={selectedLedgerIds.includes(x.id)} onChange={() => toggle(selectedLedgerIds, x.id, setSelectedLedgerIds)} /><span className="flex-1">{new Date(x.occurred_at).toLocaleDateString("en-GB")} · {x.entry_type}</span><strong>{Number(x.amount).toLocaleString("en-PK")} PKR</strong></label>)}
            </div>
            <label className="block max-w-xl space-y-1 text-xs font-medium">Optional issued future estimate
              <select name="futureEstimateDocumentId" defaultValue="" className="h-10 w-full border border-input bg-background px-3 text-sm"><option value="">No future estimate</option>{(sources.data?.estimates ?? []).map((x) => <option key={x.id} value={x.id}>{x.document_number} · {x.estimated_total.toLocaleString("en-PK")} PKR</option>)}</select>
            </label>
            <p className="text-xs text-muted-foreground">Future estimates remain separate from historical amounts paid.</p>
          </>}
          {createMutation.isError && <p role="alert" className="text-sm text-destructive">{createMutation.error.message}</p>}
          {pdfError && <p role="alert" className="text-sm text-destructive">{pdfError}</p>}
          {createMutation.isSuccess && <div className="border border-secondary/40 bg-secondary/5 p-3 text-sm"><p className="font-semibold">Document {createMutation.data.documentNumber} issued.</p>{issuedPdf ? <a href={issuedPdf} target="_blank" rel="noreferrer" className="text-primary underline">Open private PDF (link expires in 60 seconds)</a> : <p className="mt-1 text-xs text-muted-foreground">Use the document list to open its PDF.</p>}</div>}
          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4"><button type="submit" disabled={!selectedPatientId || createMutation.isPending || sources.isLoading || sources.isError} className="h-10 bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-50">{createMutation.isPending ? "Validating and issuing…" : "Generate and issue PDF"}</button><span className="text-xs text-muted-foreground">Issued records are immutable. Corrections require a replacement or cancellation.</span></div>
        </form>
      </section>
      <p className="text-xs leading-5 text-muted-foreground">
        This workspace reads from the dedicated personal-patient records. The legacy Patients page remains unchanged. Public verification exposes only the approved identity and document-status fields; private clinical and financial details remain restricted.
      </p>
    </div>
  );
}
