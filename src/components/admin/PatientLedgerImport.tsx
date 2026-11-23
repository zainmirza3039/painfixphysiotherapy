import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, FileUp } from "lucide-react";
import { personalPatientDb } from "@/admin/personal-patients.db";
import {
  parsePatientCsv,
  type ImportedPatientRow,
} from "@/admin/patient-ledger-import";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ExistingPatient = {
  id: string;
  full_name: string;
  phone: string | null;
};

type Props = {
  clinicianId: string;
  patients: ExistingPatient[];
  onImported: () => void;
};

function requireInsertedId(data: unknown, recordType: string): string {
  if (
    !data ||
    typeof data !== "object" ||
    !("id" in data) ||
    typeof data.id !== "string"
  ) {
    throw new Error(
      "The saved " +
        recordType +
        " could not be confirmed. Stop and review the import before retrying.",
    );
  }

  return data.id;
}

export function PatientLedgerImport({
  clinicianId,
  patients,
  onImported,
}: Props) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<ImportedPatientRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [busyFile, setBusyFile] = useState(false);

  const summary = useMemo(() => {
    const unique = new Map<string, ImportedPatientRow>();

    rows.forEach((row) => {
      unique.set(
        (row.phone || row.name).toLowerCase().replace(/\s/g, ""),
        row,
      );
    });

    const matches = rows.filter((row) =>
      patients.some(
        (patient) =>
          (row.phone &&
            patient.phone &&
            row.phone.replace(/\D/g, "") ===
              patient.phone.replace(/\D/g, "")) ||
          patient.full_name.trim().toLowerCase() ===
            row.name.trim().toLowerCase(),
      ),
    ).length;

    return {
      patients: unique.size,
      matches,
      sessions: rows.filter((row) => row.sessionDate).length,
      warnings: rows.reduce((count, row) => count + row.warnings.length, 0),
    };
  }, [rows, patients]);

  const importMutation = useMutation({
    mutationFn: async () => {
      const patientMap = new Map<string, string>();

      for (const row of rows) {
        const key = (row.phone || row.name).toLowerCase().replace(/\s/g, "");
        if (patientMap.has(key)) continue;

        const existing = patients.find(
          (patient) =>
            (row.phone &&
              patient.phone &&
              row.phone.replace(/\D/g, "") ===
                patient.phone.replace(/\D/g, "")) ||
            patient.full_name.trim().toLowerCase() ===
              row.name.trim().toLowerCase(),
        );

        if (existing) {
          patientMap.set(key, existing.id);
          continue;
        }

        const { data, error } = await personalPatientDb
          .from("personal_patients")
          .insert({
            clinician_id: clinicianId,
            full_name: row.name,
            phone: row.phone || null,
            email: row.email || null,
          })
          .select("id")
          .single();

        if (error) throw error;
        patientMap.set(key, requireInsertedId(data, "patient"));
      }

      const plans = new Map<string, string>();
      const sessionKeys = new Set<string>();

      for (const row of rows) {
        const key = (row.phone || row.name).toLowerCase().replace(/\s/g, "");
        const patientId = patientMap.get(key);
        if (!patientId) continue;

        const planKey =
          patientId +
          "|" +
          row.packageTitle +
          "|" +
          row.packageSessions +
          "|" +
          row.packageFee;
        let planId: string | null = null;

        if (
          row.packageTitle &&
          row.packageSessions &&
          row.packageFee != null
        ) {
          const existingPlanId = plans.get(planKey);

          if (existingPlanId) {
            planId = existingPlanId;
          } else {
            const { data: plan, error } = await personalPatientDb
              .from("personal_patient_plans")
              .insert({
                clinician_id: clinicianId,
                patient_id: patientId,
                plan_type: "package",
                title: row.packageTitle,
                package_sessions: row.packageSessions,
                package_fee: row.packageFee,
              })
              .select("id")
              .single();

            if (error) throw error;
            planId = requireInsertedId(plan, "billing plan");
            plans.set(planKey, planId);
          }
        }

        if (row.sessionDate) {
          const sessionKey = patientId + "|" + row.sessionDate;

          if (!sessionKeys.has(sessionKey)) {
            const { data: session, error } = await personalPatientDb
              .from("personal_patient_sessions")
              .insert({
                clinician_id: clinicianId,
                patient_id: patientId,
                plan_id: planId,
                session_date: row.sessionDate,
                status: "scheduled",
                session_label: row.sessionLabel || "Imported session",
                charge_amount: 0,
              })
              .select("id")
              .single();

            if (error) throw error;

            const sessionId = requireInsertedId(session, "session");
            sessionKeys.add(sessionKey);

            if (row.sessionStatus && row.sessionStatus !== "scheduled") {
              const { error: updateError } = await personalPatientDb
                .from("personal_patient_sessions")
                .update({
                  status: row.sessionStatus,
                  completed_at:
                    row.sessionStatus === "completed"
                      ? new Date().toISOString()
                      : null,
                })
                .eq("id", sessionId)
                .eq("patient_id", patientId)
                .eq("clinician_id", clinicianId);

              if (updateError) throw updateError;
            }
          }
        }

        if (row.payment && row.payment > 0) {
          const { error } = await personalPatientDb
            .from("personal_patient_ledger")
            .insert({
              clinician_id: clinicianId,
              patient_id: patientId,
              entry_type: "payment",
              amount: -row.payment,
              description: "Payment imported from file",
              reference:
                "file-import:" + fileName + ":row-" + row.sourceRow,
            });

          if (error) throw error;
        }
      }

      return patientMap.size;
    },
    onSuccess: (count) => {
      toast.success("Imported data for " + count + " patients.");
      onImported();
      setRows([]);
      setFileName("");
      setOpen(false);
    },
    onError: (error) =>
      toast.error(
        error instanceof Error
          ? error.message
          : "Import failed. Check the ledger and retry carefully.",
      ),
  });

  const handleFile = async (file?: File) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error(
        "For now, export your Excel or Google Sheet as CSV, then upload that file.",
      );
      return;
    }

    setBusyFile(true);

    try {
      const parsed = parsePatientCsv(await file.text());
      setRows(parsed);
      setFileName(file.name);
      setOpen(true);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not read this CSV file.",
      );
    } finally {
      setBusyFile(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        disabled={busyFile}
        onClick={() =>
          document
            .getElementById("patient-ledger-import-file")
            ?.click()
        }
      >
        <FileUp className="mr-2 h-4 w-4" />
        {busyFile ? "Reading…" : "Import file"}
      </Button>

      <input
        id="patient-ledger-import-file"
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(event) => {
          void handleFile(event.target.files?.[0]);
          event.currentTarget.value = "";
        }}
      />

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!importMutation.isPending) setOpen(next);
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Review file import</DialogTitle>
            <DialogDescription>
              {fileName} · No records are saved until you confirm.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Patients</p>
              <p className="text-xl font-semibold">{summary.patients}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">
                Existing matches
              </p>
              <p className="text-xl font-semibold">{summary.matches}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Session dates</p>
              <p className="text-xl font-semibold">{summary.sessions}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Warnings</p>
              <p className="text-xl font-semibold">{summary.warnings}</p>
            </div>
          </div>

          <div className="max-h-72 overflow-auto rounded-lg border">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-muted">
                <tr>
                  <th className="p-2">Patient</th>
                  <th className="p-2">Phone</th>
                  <th className="p-2">Package</th>
                  <th className="p-2">Session date</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Warnings</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 150).map((row) => (
                  <tr key={row.sourceRow} className="border-t">
                    <td className="p-2">{row.name}</td>
                    <td className="p-2">{row.phone || "—"}</td>
                    <td className="p-2">
                      {row.packageTitle || "—"}
                      {row.packageSessions
                        ? " (" + row.packageSessions + ")"
                        : ""}
                    </td>
                    <td className="p-2">
                      {row.sessionDate
                        ? new Date(row.sessionDate).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="p-2">
                      {row.sessionStatus ||
                        (row.sessionDate ? "Unclear" : "—")}
                    </td>
                    <td className="p-2">
                      {row.warnings.length ? (
                        <span className="text-amber-600">
                          {row.warnings.join(", ")}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rows.length > 150 && (
            <p className="text-xs text-muted-foreground">
              Showing first 150 of {rows.length} rows. All valid rows will be
              processed.
            </p>
          )}

          {summary.warnings > 0 && (
            <p className="flex items-center gap-2 text-sm text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              Review warnings. Unknown session statuses remain unfinalised.
            </p>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={importMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => importMutation.mutate()}
              disabled={importMutation.isPending || !rows.length}
            >
              {importMutation.isPending
                ? "Importing…"
                : "Confirm and import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
