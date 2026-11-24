import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarCheck2, ClipboardCheck, Clock3, Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { personalPatientDb } from "@/admin/personal-patients.db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PatientOption = { id: string; full_name: string; status: string };
type PlanOption = {
  patient_id: string;
  plan_type: "package" | "per_session" | "custom";
  per_session_fee: number | null;
  is_active: boolean;
};
type AttendanceDraft = {
  patientId: string;
  name: string;
  attendedAt: string;
  fee: string;
};

function localDateTimeValue(date: Date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

const money = (value: number) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(value);

export function DailyAttendanceLedger({
  clinicianId,
  patients,
}: {
  clinicianId: string;
  patients: PatientOption[];
}) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [drafts, setDrafts] = useState<AttendanceDraft[]>([]);
  const [reviewOpen, setReviewOpen] = useState(false);

  const plansQuery = useQuery({
    queryKey: ["admin", "personal-patient-active-plans", clinicianId],
    enabled: Boolean(clinicianId),
    queryFn: async () => {
      const { data, error } = await personalPatientDb
        .from("personal_patient_plans")
        .select("patient_id,plan_type,per_session_fee,is_active")
        .eq("clinician_id", clinicianId)
        .eq("is_active", true);
      if (error) throw new Error(error.message);
      return (data ?? []) as PlanOption[];
    },
  });

  const activePatients = useMemo(() => {
    const term = search.trim().toLowerCase();
    return patients
      .filter((patient) => patient.status === "active")
      .filter((patient) => !term || patient.full_name.toLowerCase().includes(term));
  }, [patients, search]);

  const selectedIds = useMemo(() => new Set(drafts.map((draft) => draft.patientId)), [drafts]);
  const totalFees = drafts.reduce((sum, draft) => sum + Math.max(0, Number(draft.fee) || 0), 0);

  const attendanceMutation = useMutation({
    mutationFn: async () => {
      if (drafts.length === 0) throw new Error("Select at least one patient.");
      const rows = drafts.map((draft) => {
        const fee = Number(draft.fee);
        if (!Number.isFinite(fee) || fee < 0) {
          throw new Error(`Enter a valid session fee for ${draft.name}.`);
        }
        const attendedAt = new Date(draft.attendedAt);
        if (Number.isNaN(attendedAt.getTime())) {
          throw new Error(`Enter a valid attendance date and time for ${draft.name}.`);
        }
        return {
          patient_id: draft.patientId,
          session_date: attendedAt.toISOString(),
          charge_amount: fee,
          session_label: "Physiotherapy session",
        };
      });
      const rpc = supabase as unknown as {
        rpc: (
          functionName: string,
          args: Record<string, unknown>,
        ) => Promise<{ data: unknown; error: { message: string } | null }>;
      };
      const { data, error } = await rpc.rpc("record_personal_patient_attendance_batch", {
        p_rows: rows,
      });
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: async () => {
      setDrafts([]);
      setReviewOpen(false);
      await queryClient.invalidateQueries({
        queryKey: ["admin", "personal-patients", clinicianId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["admin", "personal-patient-active-plans", clinicianId],
      });
      toast.success("Attendance and session charges saved.");
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not save attendance."),
  });

  const togglePatient = (patient: PatientOption, checked: boolean) => {
    if (!checked) {
      setDrafts((current) => current.filter((draft) => draft.patientId !== patient.id));
      return;
    }
    const plan = plansQuery.data?.find((item) => item.patient_id === patient.id);
    const defaultFee = plan?.plan_type === "package" ? 0 : Number(plan?.per_session_fee ?? 0);
    setDrafts((current) => [
      ...current,
      {
        patientId: patient.id,
        name: patient.full_name,
        attendedAt: localDateTimeValue(new Date()),
        fee: String(defaultFee),
      },
    ]);
  };

  const updateDraft = (patientId: string, patch: Partial<AttendanceDraft>) => {
    setDrafts((current) =>
      current.map((draft) => (draft.patientId === patientId ? { ...draft, ...patch } : draft)),
    );
  };

  return (
    <section className="mb-6 overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck2 className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Daily attendance ledger</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Mark today’s attended patients. Date, time and fee remain editable until final
            confirmation.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="rounded-md bg-muted px-3 py-1.5 font-medium tabular-nums">
            {drafts.length} selected
          </span>
          <Button
            size="sm"
            disabled={drafts.length === 0 || attendanceMutation.isPending}
            onClick={() => setReviewOpen(true)}
          >
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Review attendance
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-9 pl-9"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Find a patient to mark attendance"
            aria-label="Search active patients for attendance"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {activePatients.length} active patient{activePatients.length === 1 ? "" : "s"}
        </p>
      </div>

      {plansQuery.isError ? (
        <p className="px-5 py-4 text-sm text-destructive">
          Could not load treatment plans. Retry before recording attendance.
          <Button variant="link" size="sm" onClick={() => void plansQuery.refetch()}>
            Retry
          </Button>
        </p>
      ) : (
        <div className="max-h-[26rem] overflow-y-auto">
          {activePatients.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">
              No active patients match this search.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {activePatients.map((patient) => {
                const selected = selectedIds.has(patient.id);
                return (
                  <li key={patient.id}>
                    <label className="flex min-h-14 cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40 sm:px-5">
                      <input
                        type="checkbox"
                        checked={selected}
                        disabled={plansQuery.isLoading || attendanceMutation.isPending}
                        onChange={(event) => togglePatient(patient, event.target.checked)}
                        className="h-4 w-4 shrink-0 accent-emerald-700"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {patient.full_name}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {patient.id.slice(0, 8).toUpperCase()}
                        </span>
                      </span>
                      {selected ? (
                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                          Added to review
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Not marked</span>
                      )}
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-muted/30 px-4 py-3 sm:px-5">
        <p className="text-xs text-muted-foreground">
          Nothing is saved and no charge is posted until you confirm the review.
        </p>
        <p className="text-sm font-semibold tabular-nums text-foreground">
          Draft charges: {money(totalFees)}
        </p>
      </div>

      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Review today’s attendance</DialogTitle>
            <DialogDescription>
              Check each attendance time and session fee. Confirm once to save all selected patients
              together.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {drafts.map((draft) => (
              <div
                key={draft.patientId}
                className="grid gap-3 rounded-md border border-border p-3 sm:grid-cols-[minmax(0,1fr)_minmax(12rem,0.9fr)_9rem] sm:items-end"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{draft.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {draft.patientId.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <label className="grid gap-1 text-xs font-medium text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock3 className="h-3.5 w-3.5" /> Attendance date and time
                  </span>
                  <input
                    type="datetime-local"
                    value={draft.attendedAt}
                    onChange={(event) =>
                      updateDraft(draft.patientId, { attendedAt: event.target.value })
                    }
                    className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground"
                  />
                </label>
                <label className="grid gap-1 text-xs font-medium text-muted-foreground">
                  Session fee (PKR)
                  <input
                    type="number"
                    min="0"
                    step="50"
                    inputMode="decimal"
                    value={draft.fee}
                    onChange={(event) => updateDraft(draft.patientId, { fee: event.target.value })}
                    className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground"
                  />
                </label>
              </div>
            ))}
          </div>
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <p className="self-center text-sm font-semibold tabular-nums text-foreground">
              Total: {money(totalFees)}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setReviewOpen(false)}>
                Back to list
              </Button>
              <Button
                disabled={drafts.length === 0 || attendanceMutation.isPending}
                onClick={() => attendanceMutation.mutate()}
              >
                {attendanceMutation.isPending ? "Saving…" : "Confirm and save"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
