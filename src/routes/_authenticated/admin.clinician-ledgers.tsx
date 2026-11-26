import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Eye, ShieldCheck, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/admin/AdminAuthProvider";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminQueryError } from "@/components/admin/AdminQueryError";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/admin/clinician-ledgers")({
  component: ClinicianLedgersPage,
});

type Clinician = {
  clinician_id: string;
  full_name: string;
  professional_title: string | null;
  patient_count: number;
};
type Snapshot = {
  clinician: { clinician_id: string; full_name: string; professional_title: string | null };
  patients: Array<Record<string, unknown>>;
  plans: Array<Record<string, unknown>>;
  sessions: Array<Record<string, unknown>>;
  ledger: Array<Record<string, unknown>>;
  calendar_blocks: Array<Record<string, unknown>>;
  audit_events: Array<Record<string, unknown>>;
};
const pkr = (value: unknown) =>
  new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 })
    .format(Number(value ?? 0));

function ClinicianLedgersPage() {
  const { isSuperAdmin } = useAdminAuth();
  const [selected, setSelected] = useState<Clinician | null>(null);
  const clinicians = useQuery({
    queryKey: ["super-admin", "clinician-ledgers"],
    enabled: isSuperAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("super_admin_personal_ledger_clinicians");
      if (error) throw error;
      return (data ?? []) as Clinician[];
    },
  });
  const snapshot = useQuery({
    queryKey: ["super-admin", "clinician-ledger", selected?.clinician_id],
    enabled: isSuperAdmin && Boolean(selected?.clinician_id),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("super_admin_personal_ledger_snapshot", {
        _clinician_id: selected!.clinician_id,
      });
      if (error) throw error;
      return data as unknown as Snapshot;
    },
  });

  if (!isSuperAdmin) {
    return <div className="border border-border bg-card p-6 text-sm">Super Admin access required.</div>;
  }

  const data = snapshot.data;
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Clinician personal ledgers"
        description="Read-only oversight of each Clinical Physiotherapist’s private patient ledger. The clinic-wide patient system is separate."
        actions={<span className="inline-flex items-center gap-2 border border-border px-3 py-2 text-xs font-semibold"><Eye className="h-4 w-4" /> VIEW ONLY</span>}
      />
      {!selected ? (
        <section className="overflow-hidden border border-border bg-card">
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            <Users className="h-5 w-5 text-primary" />
            <div><h2 className="font-semibold">Clinical Physiotherapists</h2><p className="text-xs text-muted-foreground">Select a clinician to inspect their personal ledger.</p></div>
          </div>
          {clinicians.isLoading ? <div className="space-y-3 p-5"><Skeleton className="h-14" /><Skeleton className="h-14" /></div> : clinicians.isError ? <div className="p-5"><AdminQueryError onRetry={() => void clinicians.refetch()} /></div> : (clinicians.data ?? []).length === 0 ? <p className="p-6 text-sm text-muted-foreground">No Clinical Physiotherapist accounts found.</p> : (
            <div className="divide-y divide-border">
              {(clinicians.data ?? []).map((clinician) => (
                <button key={clinician.clinician_id} type="button" onClick={() => setSelected(clinician)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  <span className="min-w-0"><span className="block truncate font-semibold">{clinician.full_name}</span><span className="text-xs text-muted-foreground">{clinician.professional_title || "Clinical Physiotherapist"}</span></span>
                  <span className="flex shrink-0 items-center gap-3"><span className="text-sm tabular-nums">{clinician.patient_count} patients</span><Eye className="h-4 w-4 text-primary" /></span>
                </button>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="space-y-5">
          <Button variant="outline" size="sm" onClick={() => setSelected(null)}><ArrowLeft className="mr-2 h-4 w-4" />All clinicians</Button>
          <div className="border border-border bg-card p-5">
            <div className="flex items-start gap-3"><ShieldCheck className="mt-1 h-5 w-5 text-primary" /><div><h2 className="text-lg font-semibold">{selected.full_name}</h2><p className="text-sm text-muted-foreground">Read-only ledger review · {selected.professional_title || "Clinical Physiotherapist"}</p></div></div>
          </div>
          {snapshot.isLoading ? <Skeleton className="h-48" /> : snapshot.isError ? <div className="border border-border bg-card p-5"><AdminQueryError onRetry={() => void snapshot.refetch()} /></div> : data && (
            <>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[["Patients", data.patients.length], ["Sessions", data.sessions.length], ["Payments", data.ledger.filter((x) => x.entry_type === "payment").length], ["Calendar marks", data.calendar_blocks.length]].map(([label, value]) => <div key={String(label)} className="border border-border bg-card p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p></div>)}
              </div>
              <div className="overflow-hidden border border-border bg-card">
                <h3 className="border-b border-border px-5 py-4 font-semibold">Patient records</h3>
                {data.patients.length === 0 ? <p className="p-5 text-sm text-muted-foreground">No patients recorded.</p> : <div className="divide-y divide-border">{data.patients.map((patient) => {
                  const id = String(patient.id);
                  const patientSessions = data.sessions.filter((s) => s.patient_id === id && !s.deleted_at);
                  const patientLedger = data.ledger.filter((l) => l.patient_id === id);
                  const balance = patientLedger.reduce((sum, entry) => sum + Number(entry.amount ?? 0), 0);
                  return <article key={id} className="space-y-2 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3"><div><h4 className="font-semibold">{String(patient.full_name ?? "Unnamed patient")}</h4><p className="text-xs text-muted-foreground">{String(patient.phone ?? "No phone")} · {String(patient.status ?? "")}</p></div><span className="text-sm font-semibold tabular-nums">{pkr(balance)}</span></div>
                    <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-3"><span>{patientSessions.length} visible sessions</span><span>{patientLedger.length} financial entries</span><span>{data.plans.filter((p) => p.patient_id === id).length} billing plans</span></div>
                    {patient.private_notes ? <p className="border-l-2 border-primary/40 pl-3 text-sm text-muted-foreground">Private notes: {String(patient.private_notes)}</p> : null}
                    <details className="pt-1"><summary className="cursor-pointer text-sm font-medium text-primary">View session and financial history</summary>
                      <div className="mt-3 grid gap-4 lg:grid-cols-2">
                        <div><h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sessions</h5>{patientSessions.length ? patientSessions.map((s) => <div key={String(s.id)} className="border-t border-border py-2 text-sm"><div className="flex justify-between gap-2"><span>{String(s.session_label ?? "Physiotherapy session")}</span><span>{String(s.status)}</span></div><p className="text-xs text-muted-foreground">{new Date(String(s.session_date)).toLocaleString()} · {pkr(s.charge_amount)}</p>{s.private_note ? <p className="text-xs text-muted-foreground">{String(s.private_note)}</p> : null}</div>) : <p className="text-xs text-muted-foreground">No sessions.</p>}</div>
                        <div><h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Financial history</h5>{patientLedger.length ? patientLedger.map((entry) => <div key={String(entry.id)} className="flex justify-between gap-3 border-t border-border py-2 text-sm"><span>{String(entry.description ?? entry.entry_type)}</span><span className="tabular-nums">{pkr(entry.amount)}</span></div>) : <p className="text-xs text-muted-foreground">No entries.</p>}</div>
                      </div>
                    </details>
                  </article>;
                })}</div>}
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
