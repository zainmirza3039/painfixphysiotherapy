import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import QRCode from "qrcode";

export interface TreatmentCertificateSnapshot {
  patientName: string;
  diagnosis: string;
  treatmentStart: string;
  treatmentEnd: string;
  completedSessions: number;
  treatmentSummary: string;
  totalCharges: number;
  amountPaid: number;
  balance: number;
  issuedAt: string;
  documentNumber: string;
  verificationToken: string;
  patientConsentConfirmedAt: string;
  patientConsentStatement: string;
}

export function treatmentVerificationUrl(token: string) {
  if (!/^[a-f0-9]{64}$/.test(token)) {
    throw new Error("Invalid verification token.");
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "https://painfixphysiotherapy.com";

  return origin + "/verify-certificate?type=treatment&reference=" + encodeURIComponent(token);
}

export async function createTreatmentCertificatePdf(
  snapshot: TreatmentCertificateSnapshot,
  assets: { font: Uint8Array; logo?: Uint8Array },
) {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);

  const font = await pdf.embedFont(assets.font, { subset: true });
  const page = pdf.addPage([595.28, 841.89]);
  const navy = rgb(3 / 255, 46 / 255, 97 / 255);
  const green = rgb(0, 168 / 255, 89 / 255);
  const muted = rgb(0.34, 0.39, 0.45);
  const left = 48;
  const right = 547;

  const draw = (value: string, x: number, y: number, size = 10, color = navy) => {
    page.drawText(value.replace(/[\r\n\t]/g, " "), {
      x,
      y,
      size,
      font,
      color,
      maxWidth: right - x,
    });
  };

  const formatDate = (value: string) =>
    new Date(value + "T00:00:00Z").toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });

  const wrap = (value: string, maxWidth: number, size: number) => {
    const output: string[] = [];
    let line = "";

    for (const word of value
      .replace(/[\r\n\t]/g, " ")
      .trim()
      .split(/\s+/)) {
      const nextLine = line ? line + " " + word : word;
      if (font.widthOfTextAtSize(nextLine, size) > maxWidth && line) {
        output.push(line);
        line = word;
      } else {
        line = nextLine;
      }
    }

    if (line) output.push(line);
    return output;
  };

  page.drawRectangle({
    x: 25,
    y: 25,
    width: 545,
    height: 791,
    borderColor: navy,
    borderWidth: 1.2,
  });
  page.drawRectangle({
    x: 25,
    y: 807,
    width: 545,
    height: 9,
    color: green,
  });

  if (assets.logo) {
    const logo = await pdf.embedPng(assets.logo);
    const dimensions = logo.scaleToFit(56, 56);
    page.drawImage(logo, {
      x: left,
      y: 746,
      width: dimensions.width,
      height: dimensions.height,
    });
  }

  draw("PAINFIX PHYSIOTHERAPY CLINIC", 115, 780, 16);
  draw("Move Better. Recover Faster. Live Pain-Free.", 115, 761, 8, muted);
  page.drawLine({
    start: { x: left, y: 735 },
    end: { x: right, y: 735 },
    thickness: 1,
    color: green,
  });

  draw("PHYSIOTHERAPY TREATMENT & PAYMENT CERTIFICATE", left, 700, 14);
  draw("Issued from the PainFix patient treatment and financial ledger", left, 680, 8, muted);

  const field = (label: string, value: string, y: number) => {
    draw(label.toUpperCase(), left, y, 7, muted);
    const lines = wrap(value || "Not recorded", right - left, 10);
    lines.slice(0, 3).forEach((line, index) => {
      draw(line, left, y - 17 - index * 13, 10);
    });
    return y - 25 - (Math.min(lines.length, 3) - 1) * 13;
  };

  let y = 642;
  y = field("Patient", snapshot.patientName, y);
  y = field("Diagnosis / presenting condition", snapshot.diagnosis, y - 5);
  y = field(
    "Treatment period",
    formatDate(snapshot.treatmentStart) + " to " + formatDate(snapshot.treatmentEnd),
    y - 5,
  );
  y = field("Completed physiotherapy sessions", String(snapshot.completedSessions), y - 5);
  y = field("Treatment / services provided", snapshot.treatmentSummary, y - 5);

  const summaryTop = Math.max(y - 18, 250);
  page.drawRectangle({
    x: left,
    y: summaryTop - 6,
    width: right - left,
    height: 22,
    color: navy,
  });
  draw(
    "FINANCIAL SUMMARY — LEDGER TOTALS AT ISSUE DATE",
    left + 10,
    summaryTop + 1,
    7,
    rgb(1, 1, 1),
  );

  const financialRows: Array<[string, number]> = [
    ["Total treatment charges", snapshot.totalCharges],
    ["Amount actually received", snapshot.amountPaid],
    ["Outstanding balance / (credit)", snapshot.balance],
  ];

  financialRows.forEach(([label, amount], index) => {
    const rowY = summaryTop - 28 - index * 25;
    draw(label, left + 8, rowY, 9, muted);
    draw(
      "PKR " +
        Number(amount).toLocaleString("en-PK", {
          maximumFractionDigits: 2,
        }),
      365,
      rowY,
      9,
      navy,
    );
    page.drawLine({
      start: { x: left, y: rowY - 8 },
      end: { x: right, y: rowY - 8 },
      thickness: 0.35,
      color: rgb(0.82, 0.85, 0.88),
    });
  });

  page.drawLine({
    start: { x: left, y: 177 },
    end: { x: right, y: 177 },
    thickness: 0.8,
    color: green,
  });
  draw("Document number: " + snapshot.documentNumber, left, 160, 8);
  draw(
    "Issue date: " + new Date(snapshot.issuedAt).toLocaleDateString("en-GB"),
    left,
    145,
    8,
    muted,
  );
  draw("Issued by: Dr. Zain Ul Abideen, DPT | Clinical Physiotherapist", left, 130, 8, muted);
  draw(
    "This certificate records treatment and payments documented by PainFix. It does not guarantee",
    left,
    83,
    7,
    muted,
  );
  draw(
    "insurance coverage or reimbursement. The receiving organization makes its own determination.",
    left,
    72,
    7,
    muted,
  );

  const qr = await QRCode.toDataURL(treatmentVerificationUrl(snapshot.verificationToken), {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 360,
  });
  const image = await pdf.embedPng(qr);
  page.drawImage(image, { x: 445, y: 38, width: 75, height: 75 });
  draw("Scan to verify", 449, 28, 7);

  pdf.setTitle(snapshot.documentNumber + " | Physiotherapy Treatment & Payment Certificate");
  pdf.setAuthor("PainFix Physiotherapy Clinic");
  return pdf.save();
}

export async function downloadTreatmentCertificatePdf(snapshot: TreatmentCertificateSnapshot) {
  const [fontResponse, logoResponse] = await Promise.all([
    fetch("/fonts/painfix-certificate-sans.ttf"),
    fetch("/painfix-icon-180.png"),
  ]);

  if (!fontResponse.ok) {
    throw new Error("Certificate font could not be loaded.");
  }

  const bytes = await createTreatmentCertificatePdf(snapshot, {
    font: new Uint8Array(await fontResponse.arrayBuffer()),
    ...(logoResponse.ok ? { logo: new Uint8Array(await logoResponse.arrayBuffer()) } : {}),
  });

  const url = URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: "application/pdf" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = snapshot.documentNumber + ".pdf";
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}
