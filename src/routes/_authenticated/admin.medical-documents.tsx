import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, Search, Users, ReceiptText, ClipboardCheck, FileClock, Wallet } from "lucide-react";
import { AdminOnly } from "@/components/admin/AdminOnly";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminQueryError } from "@/components/admin/AdminQueryError";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  listMedicalDocumentPatients,
  listMedicalDocuments,
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
  const patients = useQuery({
    queryKey: ["admin", "medical-documents", "patients"],
    queryFn: () => listMedicalDocumentPatients(),
  });
  const documents = useQuery({
    queryKey: ["admin", "medical-documents", "list"],
    queryFn: () => listMedicalDocuments(),
  });

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
                  <tr><th className="px-4 py-2 font-medium">Reference</th><th className="px-4 py-2 font-medium">Patient</th><th className="px-4 py-2 font-medium">Status</th></tr>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
      <p className="text-xs leading-5 text-muted-foreground">
        This workspace reads from the dedicated personal-patient records. The legacy Patients page remains unchanged. Public verification exposes only the approved identity and document-status fields; private clinical and financial details remain restricted.
      </p>
    </div>
  );
}
