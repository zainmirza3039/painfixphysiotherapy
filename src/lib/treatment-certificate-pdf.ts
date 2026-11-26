import { PDFDocument, rgb, type PDFFont } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import QRCode from "qrcode";

export interface TreatmentCertificateSnapshot {
  patientName: string;
  diagnosis: string;
  clinicalFindings: string;
  treatmentSummary: string;
  treatmentAdvice: string;
  treatmentStart: string;
  treatmentEnd: string;
  completedSessions: number;
  totalCharges: number;
  amountPaid: number;
  balance: number;
  paymentMethod: string;
  transactionReference: string;
  issuedAt: string;
  documentNumber: string;
  verificationToken: string;
  patientConsentConfirmedAt: string;
  patientConsentStatement: string;
}

const NAVY = rgb(3 / 255, 46 / 255, 97 / 255);
const GREEN = rgb(0 / 255, 168 / 255, 89 / 255);
const MUTED = rgb(0.34, 0.39, 0.45);
const LIGHT = rgb(0.94, 0.96, 0.98);
const WHITE = rgb(1, 1, 1);
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const LEFT = 42;
const RIGHT = 553;
const CONTENT_WIDTH = RIGHT - LEFT;

export function treatmentVerificationUrl(token: string) {
  if (!/^[a-f0-9]{64}$/.test(token)) throw new Error("Invalid verification token.");
  const origin = typeof window !== "undefined" ? window.location.origin : "https://painfixphysiotherapy.com";
  return origin + "/verify-certificate?type=treatment&reference=" + encodeURIComponent(token);
}

function dateLabel(value: string) {
  return new Date(value + "T00:00:00Z").toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
  });
}
function money(value: number) {
  return "PKR " + Number(value).toLocaleString("en-PK", { maximumFractionDigits: 0 });
}
function wrapText(value: string, font: PDFFont, size: number, width: number) {
  const words = value.replace(/[\r\n\t]/g, " ").trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? line + " " + word : word;
    if (line && font.widthOfTextAtSize(candidate, size) > width) {
      lines.push(line);
      line = word;
    } else line = candidate;
  }
  if (line) lines.push(line);
  return lines.length ? lines : ["—"];
}

export async function createTreatmentCertificatePdf(
  snapshot: TreatmentCertificateSnapshot,
  assets: { font: Uint8Array; logo?: Uint8Array },
) {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(assets.font, { subset: true });
  const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

  // Full-width navy masthead, with the restrained PainFix green accent.
  page.drawRectangle({ x: 0, y: 690, width: PAGE_WIDTH, height: 152, color: NAVY });
  page.drawRectangle({ x: 0, y: 686, width: PAGE_WIDTH, height: 4, color: GREEN });
  if (assets.logo) {
    const logo = await pdf.embedPng(assets.logo);
    const dimensions = logo.scaleToFit(66, 66);
    page.drawImage(logo, { x: LEFT, y: 744, width: dimensions.width, height: dimensions.height });
  }
  page.drawText("PAINFIX", { x: 124, y: 789, size: 22, font, color: WHITE });
  page.drawText("PHYSIOTHERAPY CLINIC · MULTAN", { x: 124, y: 770, size: 8, font, color: rgb(0.84, 0.9, 0.96) });
  page.drawRectangle({ x: 445, y: 793, width: 108, height: 22, borderColor: rgb(0.84, 0.9, 0.96), borderWidth: 0.7 });
  page.drawText("OFFICIAL RECORD", { x: 454, y: 800, size: 7, font, color: WHITE });
  page.drawText("Move Better. Recover Faster. Live Pain-Free.", { x: 124, y: 752, size: 8, font, color: rgb(0.84, 0.9, 0.96) });
  page.drawText("PHYSIOTHERAPY TREATMENT & PAYMENT CERTIFICATE", {
    x: LEFT, y: 716, size: 14, font, color: WHITE,
  });
  page.drawText("CLINICAL TREATMENT RECORD  /  FINANCIAL STATEMENT", {
    x: LEFT, y: 700, size: 7, font, color: rgb(0.84, 0.9, 0.96),
  });

  let y = 665;
  const draw = (value: string, x: number, baseline: number, size = 9, color = NAVY) => {
    page.drawText(value, { x, y: baseline, size, font, color });
  };
  const section = (label: string) => {
    page.drawRectangle({ x: LEFT, y: y - 3, width: CONTENT_WIDTH, height: 18, color: LIGHT });
    draw(label.toUpperCase(), LEFT + 8, y + 2, 8, NAVY);
    y -= 25;
  };
  const field = (label: string, value: string, width = CONTENT_WIDTH) => {
    draw(label, LEFT, y, 7, MUTED);
    y -= 13;
    const lines = wrapText(value || "Not recorded", font, 9, width);
    for (const line of lines) {
      draw(line, LEFT, y, 9, NAVY);
      y -= 12;
    }
    y -= 5;
  };
  const pair = (leftLabel: string, leftValue: string, rightLabel: string, rightValue: string) => {
    draw(leftLabel, LEFT, y, 7, MUTED);
    draw(rightLabel, 310, y, 7, MUTED);
    y -= 13;
    draw(leftValue, LEFT, y, 9, NAVY);
    draw(rightValue, 310, y, 9, NAVY);
    y -= 20;
  };

  pair("DOCUMENT NUMBER", snapshot.documentNumber, "ISSUE DATE", dateLabel(snapshot.issuedAt));
  page.drawLine({ start: { x: LEFT, y: y + 5 }, end: { x: RIGHT, y: y + 5 }, thickness: 0.6, color: rgb(0.82, 0.85, 0.88) });
  y -= 8;

  section("01 · Patient Information");
  field("Patient name", snapshot.patientName);

  section("02 · Clinical Information");
  field("Diagnosis / presenting condition", snapshot.diagnosis);
  field("Clinical findings", snapshot.clinicalFindings);
  field("Treatment / services provided", snapshot.treatmentSummary);
  pair("TREATMENT PERIOD", dateLabel(snapshot.treatmentStart) + " – " + dateLabel(snapshot.treatmentEnd), "COMPLETED SESSIONS", String(snapshot.completedSessions));
  field("Clinical advice / home programme", snapshot.treatmentAdvice);

  section("03 · Financial Statement");
  page.drawRectangle({ x: LEFT, y: y - 43, width: CONTENT_WIDTH, height: 48, color: LIGHT });
  draw("TOTAL TREATMENT CHARGES", LEFT + 10, y - 13, 7, MUTED);
  draw(money(snapshot.totalCharges), LEFT + 10, y - 34, 16, NAVY);
  const paymentStatus = snapshot.balance <= 0 ? "PAID" : snapshot.amountPaid > 0 ? "PARTIALLY PAID" : "OUTSTANDING";
  page.drawRectangle({ x: RIGHT - 105, y: y - 28, width: 95, height: 18, color: GREEN });
  const statusWidth = font.widthOfTextAtSize(paymentStatus, 7);
  draw(paymentStatus, RIGHT - 105 + (95 - statusWidth) / 2, y - 22, 7, WHITE);
  y -= 56;
  const rows: Array<[string, number]> = [
    ["Amount paid", snapshot.amountPaid],
    ["Outstanding balance / (credit)", snapshot.balance],
  ];
  for (const [label, amount] of rows) {
    draw(label, LEFT + 8, y, 9, MUTED);
    const value = money(amount);
    draw(value, RIGHT - font.widthOfTextAtSize(value, 9) - 8, y, 9, NAVY);
    page.drawLine({ start: { x: LEFT, y: y - 6 }, end: { x: RIGHT, y: y - 6 }, thickness: 0.35, color: rgb(0.86, 0.88, 0.9) });
    y -= 20;
  }
  section("04 · Payment Details");
  pair("PAYMENT METHOD", snapshot.paymentMethod, "TRANSACTION REFERENCE", snapshot.transactionReference);

  // Keep signature and QR in a fixed, printable lower band.
  const lowerTop = 135;
  if (y < lowerTop) {
    throw new Error("The clinical details exceed the one-page certificate layout. Shorten the entered text and retry.");
  }
  page.drawLine({ start: { x: LEFT, y: 116 }, end: { x: 245, y: 116 }, thickness: 0.7, color: MUTED });
  draw("Authorized signature / clinic stamp", LEFT, 103, 7, MUTED);
  draw("Dr. Zain Ul Abideen, DPT", LEFT, 87, 9, NAVY);
  draw("Clinical Physiotherapist", LEFT, 74, 8, MUTED);

  const qrData = await QRCode.toDataURL(treatmentVerificationUrl(snapshot.verificationToken), {
    errorCorrectionLevel: "M", margin: 2, width: 360,
  });
  const qr = await pdf.embedPng(qrData);
  page.drawImage(qr, { x: 468, y: 70, width: 70, height: 70 });
  draw("Scan to verify", 474, 59, 7, MUTED);

  page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: 45, color: NAVY });
  page.drawText("Usman Raja Market, Near Khair Ul Maarif School, Shalimar Colony, Multan", {
    x: LEFT, y: 28, size: 7, font, color: WHITE,
  });
  page.drawText("0314-3039582  ·  painfixphysiotherapy.com", {
    x: LEFT, y: 15, size: 7, font, color: rgb(0.84, 0.9, 0.96),
  });
  page.drawText("This document records clinic entries; reimbursement is subject to the receiving organization's policy.", {
    x: LEFT, y: 52, size: 6.5, font, color: MUTED,
  });

  pdf.setTitle(snapshot.documentNumber + " | Physiotherapy Treatment & Payment Certificate");
  pdf.setAuthor("PainFix Physiotherapy Clinic");
  return pdf.save();
}

export async function downloadTreatmentCertificatePdf(snapshot: TreatmentCertificateSnapshot) {
  const [fontResponse, logoResponse] = await Promise.all([
    fetch("/fonts/painfix-certificate-sans.ttf"),
    fetch("/painfix-logo.png"),
  ]);
  if (!fontResponse.ok) throw new Error("Certificate font could not be loaded.");
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
