import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, FileUp } from "lucide-react";
import { personalPatientDb } from "@/admin/personal-patients.db";
import {
  parsePatientCsv,
  parsePatientFile,
  type ImportedPatientRow,
} from "@/admin/patient-ledger-import";
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
  const [sheetUrl, setSheetUrl] = useState("");

  const summary = useMemo(() => {
    const parent = rows.map((_, index) => index);
    const find = (index: number): number => {
      if (parent[index] !== index) parent[index] = find(parent[index]);
      return parent[index];
    };
    const union = (left: number, right: number) => {
      const a = find(left);
      const b = find(right);
      if (a !== b) parent[b] = a;
    };
    const firstByPhone = new Map<string, number>();
    const firstByName = new Map<string, number>();

    rows.forEach((row, index) => {
      const phone = row.phone.replace(/\\D/g, "");
      const name = row.name.trim().toLowerCase().replace(/\\s+/g, " ");
      if (phone) {
        const existing = firstByPhone.get(phone);
        if (existing != null) union(index, existing);
        else firstByPhone.set(phone, index);
      }
      if (name) {
        const existing = firstByName.get(name);
        if (existing != null) union(index, existing);
        else firstByName.set(name, index);
      }
    });

    const uniqueRoots = new Set(rows.map((_, index) => find(index)));
    const matchedPatientIds = new Set<string>();
    for (const row of rows) {
      const phone = row.phone.replace(/\\D/g, "");
      const name = row.name.trim().toLowerCase();
      const match = patients.find(
        (patient) =>
          (phone && patient.phone && phone === patient.phone.replace(/\\D/g, "")) ||
          patient.full_name.trim().toLowerCase() === name,
      );
      if (match) matchedPatientIds.add(match.id);
    }

    return {
      patients: uniqueRoots.size,
      matches: matchedPatientIds.size,
      duplicateRows: Math.max(0, rows.length - uniqueRoots.size),
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
      const digest = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(JSON.stringify(rows)),
      );
      const fingerprint = Array.from(new Uint8Array(digest))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("")
        .slice(0, 32);
      const batchId = `${fingerprint.slice(0, 8)}-${fingerprint.slice(8, 12)}-4${fingerprint.slice(13, 16)}-a${fingerprint.slice(17, 20)}-${fingerprint.slice(20, 32)}`;
      const { data, error } = await rpcClient.rpc("import_personal_patient_batch", {
        p_rows: rows,
        p_batch_id: batchId,
      });
      if (error) throw new Error(error.message);
      if (typeof data !== "number") {
        throw new Error(
          "The import result could not be confirmed. Check the patient ledger before retrying.",
        );
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
      toast.error(
        error instanceof Error ? error.message : "Import failed. No partial batch was committed.",
      ),
  });

  const handleFile = async (file?: File) => {
    if (!file) return;

    if (!/\.(csv|xlsx)$/i.test(file.name)) {
      toast.error(
        "Choose a CSV or modern Excel (.xlsx) file. Download Google Sheets as CSV or Excel first.",
      );
      return;
    }

    setBusyFile(true);

    try {
      const parsed = await parsePatientFile(file);
      if (!parsed.length) {
        throw new Error(
          "No rows with a patient name were found. Check the file headers and patient-name column.",
        );
      }
      if (parsed.length > 1000) {
        throw new Error(
          "This file contains more than 1,000 usable rows. Split it into smaller batches.",
        );
      }
      setRows(parsed);
      setFileName(file.name);
      setOpen(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not read this CSV file.");
    } finally {
      setBusyFile(false);
    }
  };

  const handleGoogleSheet = async () => {
    const raw = sheetUrl.trim();
    if (!raw) return;
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(raw);
    } catch {
      toast.error("Paste a valid Google Sheets sharing link.");
      return;
    }
    if (
      parsedUrl.hostname !== "docs.google.com" ||
      !parsedUrl.pathname.includes("/spreadsheets/d/")
    ) {
      toast.error("Use a Google Sheets link from docs.google.com.");
      return;
    }
    const match = parsedUrl.pathname.match(/\/spreadsheets\/d\/([^/]+)/);
    if (!match?.[1]) {
      toast.error("Could not identify the spreadsheet in this link.");
      return;
    }
    const gid = parsedUrl.searchParams.get("gid") ?? parsedUrl.hash.match(/gid=(\d+)/)?.[1] ?? "0";
    setBusyFile(true);
    try {
      const exportUrl = new URL(
        `https://docs.google.com/spreadsheets/d/${encodeURIComponent(match[1])}/export`,
      );
      exportUrl.searchParams.set("format", "csv");
      exportUrl.searchParams.set("gid", gid);
      const response = await fetch(exportUrl.toString(), { credentials: "omit" });
      if (!response.ok) throw new Error("Google Sheets did not allow this sheet to be exported.");
      const parsed = parsePatientCsv(await response.text());
      setRows(parsed);
      setFileName("Google Sheets import");
      setOpen(true);
    } catch {
      toast.error(
        "Could not read this sheet directly. Set sharing to Anyone with the link, or download it as CSV/XLSX and upload the file.",
      );
    } finally {
      setBusyFile(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={busyFile}
          onClick={() => document.getElementById("patient-ledger-import-file")?.click()}
        >
          <FileUp className="mr-2 h-4 w-4" />
          {busyFile ? "Reading…" : "Import CSV / XLSX"}
        </Button>
        <Input
          aria-label="Google Sheets link"
          className="w-64"
          placeholder="Paste Google Sheets link"
          value={sheetUrl}
          onChange={(event) => setSheetUrl(event.target.value)}
        />
        <Button
          variant="outline"
          size="sm"
          disabled={busyFile || !sheetUrl.trim()}
          onClick={() => void handleGoogleSheet()}
        >
          Load sheet
        </Button>
      </div>

      <input
        id="patient-ledger-import-file"
        type="file"
        accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
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

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
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
              <p className="text-xs text-muted-foreground">Repeated rows</p>
              <p className="text-xl font-semibold">{summary.duplicateRows}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Warnings</p>
              <p className="text-xl font-semibold">{summary.warnings}</p>
            </div>
          </div>

          <div className="max-h-72 overflow-auto rounded-lg border">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="sticky top-0 bg-muted">
                <tr>
                  <th className="p-2">Patient</th>
                  <th className="p-2">Phone</th>
                  <th className="p-2">Package</th>
                  <th className="p-2">Sessions</th>
                  <th className="p-2">Package fee</th>
                  <th className="p-2">Session date</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Session fee</th>
                  <th className="p-2">Payment</th>
                  <th className="p-2">Warnings</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 150).map((row) => {
                  const update = (patch: Partial<ImportedPatientRow>) =>
                    setRows((current) =>
                      current.map((item) =>
                        item.sourceRow === row.sourceRow ? { ...item, ...patch } : item,
                      ),
                    );
                  return (
                    <tr key={row.sourceRow} className="border-t">
                      <td className="p-2">
                        <Input
                          className="h-8 min-w-36"
                          value={row.name}
                          onChange={(event) => update({ name: event.target.value })}
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          className="h-8 min-w-32"
                          value={row.phone}
                          onChange={(event) => update({ phone: event.target.value })}
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          className="h-8 min-w-36"
                          value={row.packageTitle}
                          onChange={(event) => update({ packageTitle: event.target.value })}
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          className="h-8 w-20"
                          type="number"
                          min="1"
                          value={row.packageSessions ?? ""}
                          onChange={(event) =>
                            update({
                              packageSessions: event.target.value
                                ? Number(event.target.value)
                                : null,
                            })
                          }
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          className="h-8 w-28"
                          type="number"
                          min="0"
                          value={row.packageFee ?? ""}
                          onChange={(event) =>
                            update({
                              packageFee: event.target.value ? Number(event.target.value) : null,
                            })
                          }
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          className="h-8 w-36"
                          type="date"
                          value={row.sessionDate?.slice(0, 10) ?? ""}
                          onChange={(event) =>
                            update({
                              sessionDate: event.target.value
                                ? new Date(`${event.target.value}T12:00:00.000Z`).toISOString()
                                : null,
                            })
                          }
                        />
                      </td>
                      <td className="p-2">
                        <select
                          className="h-8 rounded-md border bg-background px-2"
                          value={row.sessionStatus ?? ""}
                          onChange={(event) =>
                            update({
                              sessionStatus: (event.target.value ||
                                null) as ImportedPatientRow["sessionStatus"],
                            })
                          }
                        >
                          <option value="">Unspecified</option>
                          <option value="scheduled">Scheduled</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="rescheduled">Rescheduled</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <Input
                          className="h-8 w-28"
                          type="number"
                          min="0"
                          value={row.sessionFee ?? ""}
                          onChange={(event) =>
                            update({
                              sessionFee: event.target.value ? Number(event.target.value) : null,
                            })
                          }
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          className="h-8 w-28"
                          type="number"
                          min="0"
                          value={row.payment ?? ""}
                          onChange={(event) =>
                            update({
                              payment: event.target.value ? Number(event.target.value) : null,
                            })
                          }
                        />
                      </td>
                      <td className="p-2">
                        {row.warnings.length ? (
                          <span className="text-amber-600">{row.warnings.join(", ")}</span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })}
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
