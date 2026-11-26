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
  sessionFee: number | null;
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

function parseCsvRecords(source: string, delimiter: string): string[][] {
  const records: string[][] = [];
  let record: string[] = [];
  let value = "";
  let quoted = false;

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    if (char === '"') {
      if (quoted && source[i + 1] === '"') {
        value += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === delimiter && !quoted) {
      record.push(value.trim());
      value = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      record.push(value.trim());
      if (record.some((cell) => cell.length > 0)) records.push(record);
      record = [];
      value = "";
      if (char === "\r" && source[i + 1] === "\n") i += 1;
    } else {
      value += char;
    }
  }

  if (quoted) throw new Error("CSV contains an unclosed quoted field.");
  if (value.length || record.length) {
    record.push(value.trim());
    if (record.some((cell) => cell.length > 0)) records.push(record);
  }
  return records;
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
  sessionFee: ["sessionfee", "persessionfee", "visitfee", "treatmentfee", "sessioncharge", "fee"],
};

function parseDate(value: string): string | null {
  if (!value) return null;

  // Slash-formatted dates use day/month/year in the clinic's locale.
  // Parse them before Date() to avoid browser-dependent US month/day parsing.
  const match = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (match) {
    const day = Number(match[1]);
    const month = Number(match[2]) - 1;
    let year = Number(match[3]);
    if (year < 100) year += 2000;

    const parsed = new Date(year, month, day);
    return parsed.getFullYear() === year && parsed.getMonth() === month && parsed.getDate() === day
      ? new Date(Date.UTC(year, month, day, 12)).toISOString()
      : null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function parsePatientCsv(text: string): ImportedPatientRow[] {
  const source = text.replace(/^\uFEFF/, "");
  const firstLine = source.split(/\r?\n/, 1)[0] ?? "";
  const delimiter = [",", ";", "\t"].sort(
    (a, b) => parseCsvLine(firstLine, b).length - parseCsvLine(firstLine, a).length,
  )[0];
  const records = parseCsvRecords(source, delimiter);

  if (records.length < 2) {
    throw new Error("CSV must contain a header row and at least one data row.");
  }

  const headers = records[0].map(normalise);

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

  return records
    .slice(1)
    .map((cells, index) => {
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
        if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1_000_000_000) {
          warnings.push(`Invalid or out-of-range value in ${key}`);
          return null;
        }
        if (Math.round(parsed * 100) !== parsed * 100) {
          warnings.push(`More than two decimal places in ${key}`);
          return null;
        }
        return parsed;
      };

      if (!name.trim()) {
        warnings.push("Missing patient name");
      }
      const packageFields = [get(cells, "packageTitle"), get(cells, "packageSessions"), get(cells, "packageFee")];
      if (packageFields.some(Boolean) && !packageFields.every(Boolean)) {
        warnings.push("Package title, session count and fee must all be supplied together");
      }
      if (get(cells, "packageFee") && get(cells, "sessionFee")) {
        warnings.push("Do not combine a package fee and a per-session fee in the same row");
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
        sessionFee: number("sessionFee"),
        sourceRow: index + 2,
        warnings,
      };
    })
    .filter((row) => row.name);
}

function readU16(view: DataView, offset: number) {
  return view.getUint16(offset, true);
}
function readU32(view: DataView, offset: number) {
  return view.getUint32(offset, true);
}

async function readXlsxEntries(file: File): Promise<Map<string, Uint8Array>> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let end = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65_557); i -= 1) {
    if (readU32(view, i) === 0x06054b50) {
      end = i;
      break;
    }
  }
  if (end < 0) throw new Error("This Excel file is not a valid XLSX workbook.");
  const entryCount = readU16(view, end + 10);
  let cursor = readU32(view, end + 16);
  const entries = new Map<string, Uint8Array>();
  const decoder = new TextDecoder();

  for (let i = 0; i < entryCount; i += 1) {
    if (readU32(view, cursor) !== 0x02014b50) {
      throw new Error("The Excel workbook contains an invalid ZIP directory.");
    }
    const method = readU16(view, cursor + 10);
    const compressedSize = readU32(view, cursor + 20);
    const nameLength = readU16(view, cursor + 28);
    const extraLength = readU16(view, cursor + 30);
    const commentLength = readU16(view, cursor + 32);
    const localOffset = readU32(view, cursor + 42);
    const name = decoder.decode(bytes.subarray(cursor + 46, cursor + 46 + nameLength));
    const localNameLength = readU16(view, localOffset + 26);
    const localExtraLength = readU16(view, localOffset + 28);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const compressed = bytes.slice(dataStart, dataStart + compressedSize);
    let content: Uint8Array;

    if (method === 0) {
      content = compressed;
    } else if (method === 8) {
      const stream = new Blob([compressed.buffer as ArrayBuffer])
        .stream()
        .pipeThrough(new DecompressionStream("deflate-raw"));
      content = new Uint8Array(await new Response(stream).arrayBuffer());
    } else {
      throw new Error("This Excel workbook uses an unsupported compression method.");
    }
    entries.set(name, content);
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

function xmlDocument(source: string): Document {
  const doc = new DOMParser().parseFromString(source, "application/xml");
  if (doc.querySelector("parsererror")) throw new Error("The Excel workbook contains invalid XML.");
  return doc;
}

function columnIndex(reference: string): number {
  const letters = reference.match(/^[A-Z]+/i)?.[0]?.toUpperCase() ?? "";
  let value = 0;
  for (const letter of letters) value = value * 26 + letter.charCodeAt(0) - 64;
  return Math.max(0, value - 1);
}

async function parseXlsx(file: File): Promise<ImportedPatientRow[]> {
  const entries = await readXlsxEntries(file);
  const decoder = new TextDecoder();
  const sheetBytes = entries.get("xl/worksheets/sheet1.xml");
  if (!sheetBytes) throw new Error("The Excel workbook has no first worksheet.");
  const sharedBytes = entries.get("xl/sharedStrings.xml");
  const shared = sharedBytes
    ? Array.from(xmlDocument(decoder.decode(sharedBytes)).querySelectorAll("si")).map((item) =>
        Array.from(item.querySelectorAll("t"))
          .map((node) => node.textContent ?? "")
          .join(""),
      )
    : [];
  const sheet = xmlDocument(decoder.decode(sheetBytes));
  const matrix: string[][] = [];

  for (const row of Array.from(sheet.querySelectorAll("sheetData row"))) {
    const values: string[] = [];
    for (const cell of Array.from(row.querySelectorAll(":scope > c"))) {
      const index = columnIndex(cell.getAttribute("r") ?? "");
      const type = cell.getAttribute("t");
      const raw = cell.querySelector("v")?.textContent ?? "";
      const value =
        type === "s"
          ? (shared[Number(raw)] ?? "")
          : type === "inlineStr"
            ? Array.from(cell.querySelectorAll("is t"))
                .map((node) => node.textContent ?? "")
                .join("")
            : raw;
      values[index] = value;
    }
    matrix.push(values);
  }
  if (matrix.length < 2) throw new Error("The Excel worksheet must contain headers and data rows.");

  const headers = matrix[0].map(normalise);
  const dateColumns = headers.reduce<number[]>((indexes, header, index) => {
    if (aliases.sessionDate.includes(header)) indexes.push(index);
    return indexes;
  }, []);
  for (const row of matrix.slice(1)) {
    for (const index of dateColumns) {
      const raw = row[index] ?? "";
      const serial = Number(raw);
      if (raw && Number.isFinite(serial) && serial > 1 && serial < 100_000) {
        row[index] = new Date(Date.UTC(1899, 11, 30) + serial * 86_400_000)
          .toISOString()
          .slice(0, 10);
      }
    }
  }

  const csv = matrix
    .map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(","))
    .join("\n");
  return parsePatientCsv(csv);
}

export async function parsePatientFile(file: File): Promise<ImportedPatientRow[]> {
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("File is larger than 10 MB. Split it into smaller files before importing.");
  }
  const name = file.name.toLowerCase();
  if (name.endsWith(".csv") || file.type === "text/csv") {
    return parsePatientCsv(await file.text());
  }
  if (
    name.endsWith(".xlsx") ||
    file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    return parseXlsx(file);
  }
  throw new Error(
    "Choose a CSV or modern Excel (.xlsx) file. For Google Sheets, download as CSV or Excel first.",
  );
}
