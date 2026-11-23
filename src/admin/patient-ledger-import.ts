export type ImportedPatientRow = {
  name: string;
  phone: string;
  email: string;
  packageTitle: string;
  packageSessions: number | null;
  packageFee: number | null;
  sessionDate: string | null;
  sessionStatus: "scheduled" | "completed" | "cancelled" | "rescheduled" | null;
  sessionLabel: string;
  payment: number | null;
  sourceRow: number;
  warnings: string[];
};

function parseCsvLine(line: string, delimiter: string): string[] {
  const values: string[] = [];
  let value = "";
  let quoted = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        value += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === delimiter && !quoted) {
      values.push(value.trim());
      value = "";
    } else {
      value += char;
    }
  }

  values.push(value.trim());
  return values;
}

const normalise = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

const aliases: Record<string, string[]> = {
  name: ["name", "patient", "patientname", "fullname", "client"],
  phone: ["phone", "mobile", "contact", "phonenumber", "mobileno"],
  email: ["email", "emailaddress"],
  packageTitle: ["package", "packagename", "plantitle", "treatmentpackage"],
  packageSessions: ["packagesessions", "totalsessions", "sessionsincluded", "sessionpackage"],
  packageFee: ["packagefee", "packageprice", "totalfee", "planfee"],
  sessionDate: ["sessiondate", "date", "appointmentdate", "visitdate"],
  sessionStatus: ["sessionstatus", "status", "visitstatus"],
  sessionLabel: ["sessionlabel", "treatment", "notes", "description"],
  payment: ["payment", "paid", "amountpaid", "paymentamount", "received"],
};

function parseDate(value: string): string | null {
  if (!value) return null;

  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) return date.toISOString();

  const match = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]) - 1;
  let year = Number(match[3]);

  if (year < 100) year += 2000;

  const parsed = new Date(year, month, day);
  return parsed.getFullYear() === year && parsed.getMonth() === month && parsed.getDate() === day
    ? parsed.toISOString()
    : null;
}

export function parsePatientCsv(text: string): ImportedPatientRow[] {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim());

  if (lines.length < 2) {
    throw new Error("CSV must contain a header row and at least one data row.");
  }

  const first = lines[0];
  const delimiter = [",", ";", "\t"].sort(
    (a, b) => parseCsvLine(first, b).length - parseCsvLine(first, a).length,
  )[0];
  const headers = parseCsvLine(first, delimiter).map(normalise);

  const indexes = Object.fromEntries(
    Object.entries(aliases).map(([key, names]) => [
      key,
      headers.findIndex((header) => names.includes(header)),
    ]),
  ) as Record<keyof typeof aliases, number>;

  if (indexes.name < 0) {
    throw new Error("Could not identify a patient-name column. Use a header such as Patient Name.");
  }

  const get = (cells: string[], key: keyof typeof aliases) =>
    indexes[key] < 0 ? "" : (cells[indexes[key]] ?? "");

  return lines
    .slice(1)
    .map((line, index) => {
      const cells = parseCsvLine(line, delimiter);
      const name = get(cells, "name");
      const warnings: string[] = [];
      const dateRaw = get(cells, "sessionDate");
      const sessionDate = parseDate(dateRaw);

      if (dateRaw && !sessionDate) {
        warnings.push("Unrecognised session date");
      }

      const statusRaw = normalise(get(cells, "sessionStatus"));
      const sessionStatus: ImportedPatientRow["sessionStatus"] = statusRaw
        ? statusRaw.includes("complete") || statusRaw === "done"
          ? "completed"
          : statusRaw.includes("cancel")
            ? "cancelled"
            : statusRaw.includes("resched")
              ? "rescheduled"
              : statusRaw.includes("sched") || statusRaw.includes("pending")
                ? "scheduled"
                : null
        : null;

      if (dateRaw && !sessionStatus) {
        warnings.push("Session status unclear; will not mark completed");
      }

      const number = (key: keyof typeof aliases) => {
        const raw = get(cells, key).replace(/[₹₨,\s]/g, "");
        if (!raw) return null;

        const parsed = Number(raw);
        return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
      };

      if (!name.trim()) {
        warnings.push("Missing patient name");
      }

      return {
        name: name.trim(),
        phone: get(cells, "phone"),
        email: get(cells, "email"),
        packageTitle: get(cells, "packageTitle"),
        packageSessions: number("packageSessions"),
        packageFee: number("packageFee"),
        sessionDate,
        sessionStatus,
        sessionLabel: get(cells, "sessionLabel"),
        payment: number("payment"),
        sourceRow: index + 2,
        warnings,
      };
    })
    .filter((row) => row.name);
}
