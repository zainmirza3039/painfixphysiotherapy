import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, FileUp } from "lucide-react";
import { personalPatientDb } from "@/admin/personal-patients.db";
import { parsePatientCsv, type ImportedPatientRow } from "@/admin/patient-ledger-import";
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


export function PatientLedgerImport({ clinicianId, patients, onImported }: Props) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<ImportedPatientRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [busyFile, setBusyFile] = useState(false);

  const summary = useMemo(() => {
    const unique = new Map<string, ImportedPatientRow>();

    rows.forEach((row) => {
      unique.set((row.phone || row.name).toLowerCase().replace(/\s/g, ""), row);
    });

    const matches = rows.filter((row) =>
      patients.some(
        (patient) =>
          (row.phone &&
            patient.phone &&
            row.phone.replace(/\D/g, "") === patient.phone.replace(/\D/g, "")) ||
          patient.full_name.trim().toLowerCase() === row.name.trim().toLowerCase(),
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
      if (!rows.length) throw new Error("There are no valid rows to import.");
      const rpcClient = personalPatientDb as unknown as {
        rpc: (
          fn: string,
          args: Record<string, unknown>,
        ) => Promise<{ data: unknown; error: { message: string } | null }>;
      };
      const batchId = crypto.randomUUID();
      const { data, error } = await rpcClient.rpc("import_personal_patient_batch", {
        p_rows: rows,
        p_batch_id: batchId,
      });
      if (error) throw new Error(error.message);
      if (typeof data !== "number") {
        throw new Error("The import result could not be confirmed. Check the patient ledger before retrying.");
      }
      return data;
    },
    onSuccess: (count) => {
      toast.success("Imported data for " + count + " patients.");
      onImported();
      setRows([]);
      setFileName("");
      setOpen(false);
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Import failed. No partial batch was committed."),
  });

  const handleFile = async (file?: File) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("For now, export your Excel or Google Sheet as CSV, then upload that file.");
      return;
    }

    setBusyFile(true);

    try {
      const parsed = parsePatientCsv(await file.text());
      setRows(parsed);
      setFileName(file.name);
      setOpen(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not read this CSV file.");
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
        onClick={() => document.getElementById("patient-ledger-import-file")?.click()}
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
              <p className="text-xs text-muted-foreground">Existing matches</p>
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
                      {row.packageSessions ? " (" + row.packageSessions + ")" : ""}
                    </td>
                    <td className="p-2">
                      {row.sessionDate ? new Date(row.sessionDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="p-2">
                      {row.sessionStatus || (row.sessionDate ? "Unclear" : "—")}
                    </td>
                    <td className="p-2">
                      {row.warnings.length ? (
                        <span className="text-amber-600">{row.warnings.join(", ")}</span>
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
              Showing first 150 of {rows.length} rows. All valid rows will be processed.
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
              {importMutation.isPending ? "Importing…" : "Confirm and import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
