import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import QRCode from "qrcode";

export interface MedicalDocumentPdfInput {
  documentNumber: string;
  documentType: string;
  patientName: string;
  issuedAt: string;
  verificationUrl: string;
  sections: Array<{ heading?: string; rows: Array<{ label: string; value: string }> }>;
  signatoryName: string;
  signatoryDesignation: string;
}

const NAVY = rgb(3 / 255, 46 / 255, 97 / 255);
const GREEN = rgb(0 / 255, 168 / 255, 89 / 255);
const MUTED = rgb(0.32, 0.36, 0.4);
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 48;

function dateLabel(value: string): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) throw new Error("Invalid document issue date");
  return date.toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  });
}

function wrap(text: string, font: PDFFont, size: number, width: number): string[] {
  const result: string[] = [];
  let line = "";
  for (const word of String(text).replace(/[\r\n\t]/g, " ").split(/\s+/)) {
    const candidate = line ? line + " " + word : word;
    if (line && font.widthOfTextAtSize(candidate, size) > width) {
      result.push(line);
      line = word;
    } else line = candidate;
  }
  if (line) result.push(line);
  return result;
}

export async function createMedicalDocumentPdf(input: MedicalDocumentPdfInput): Promise<Uint8Array> {
  if (!/^PF-[RETS]-\d{5,}$/.test(input.documentNumber)) throw new Error("Invalid medical document number");
  if (!/^[a-f0-9]{64}$/.test(input.verificationUrl.split("reference=")[1] ?? "")) {
    throw new Error("Invalid medical document verification URL");
  }
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const qrBytes = await QRCode.toBuffer(input.verificationUrl, {
    type: "png", errorCorrectionLevel: "M", margin: 2, width: 320,
  });
  const qr = await pdf.embedPng(qrBytes);
  let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - 48;

  const drawHeader = () => {
    page.drawRectangle({ x: 0, y: PAGE_HEIGHT - 12, width: PAGE_WIDTH, height: 12, color: GREEN });
    page.drawText("PAINFIX", { x: MARGIN, y: PAGE_HEIGHT - 53, size: 17, font: bold, color: NAVY });
    page.drawText("PHYSIOTHERAPY CLINIC", { x: MARGIN + 91, y: PAGE_HEIGHT - 51, size: 8, font: regular, color: MUTED });
    page.drawLine({ start: { x: MARGIN, y: PAGE_HEIGHT - 65 }, end: { x: PAGE_WIDTH - MARGIN, y: PAGE_HEIGHT - 65 }, thickness: 1, color: GREEN });
  };
  drawHeader();
  y = PAGE_HEIGHT - 105;

  const title = input.documentType.replaceAll("_", " ").toUpperCase();
  page.drawText(title, { x: MARGIN, y, size: 15, font: bold, color: NAVY });
  y -= 27;
  page.drawText("Document reference", { x: MARGIN, y, size: 8, font: regular, color: MUTED });
  page.drawText(input.documentNumber, { x: MARGIN, y: y - 15, size: 11, font: bold, color: NAVY });
  page.drawText("Issue date", { x: PAGE_WIDTH - 180, y, size: 8, font: regular, color: MUTED });
  page.drawText(dateLabel(input.issuedAt), { x: PAGE_WIDTH - 180, y: y - 15, size: 10, font: bold, color: NAVY });
  y -= 48;

  page.drawRectangle({ x: MARGIN, y: y - 35, width: PAGE_WIDTH - 2 * MARGIN, height: 42, color: rgb(0.96, 0.97, 0.98) });
  page.drawText("PATIENT", { x: MARGIN + 12, y: y - 8, size: 7, font: bold, color: MUTED });
  page.drawText(input.patientName, { x: MARGIN + 12, y: y - 25, size: 12, font: bold, color: NAVY });
  y -= 65;

  for (const section of input.sections) {
    if (section.heading) {
      if (y < 125) {
        page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        drawHeader();
        y = PAGE_HEIGHT - 95;
      }
      page.drawText(section.heading.toUpperCase(), { x: MARGIN, y, size: 9, font: bold, color: NAVY });
      y -= 16;
    }
    for (const row of section.rows) {
      const valueLines = wrap(row.value || "—", regular, 9, PAGE_WIDTH - 2 * MARGIN - 130);
      const height = Math.max(17, valueLines.length * 12 + 6);
      if (y - height < 130) {
        page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        drawHeader();
        y = PAGE_HEIGHT - 95;
      }
      page.drawText(row.label, { x: MARGIN, y: y - 10, size: 8, font: bold, color: MUTED });
      valueLines.forEach((line, index) => {
        page.drawText(line, { x: MARGIN + 130, y: y - 10 - index * 12, size: 9, font: regular, color: NAVY });
      });
      y -= height;
      page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_WIDTH - MARGIN, y }, thickness: 0.35, color: rgb(0.86, 0.88, 0.9) });
      y -= 5;
    }
    y -= 8;
  }

  if (y < 160) {
    page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    drawHeader();
    y = PAGE_HEIGHT - 100;
  }
  const footerY = 112;
  page.drawLine({ start: { x: MARGIN, y: footerY + 42 }, end: { x: PAGE_WIDTH - MARGIN, y: footerY + 42 }, thickness: 0.8, color: GREEN });
  page.drawText(input.signatoryName, { x: MARGIN, y: footerY + 25, size: 9, font: bold, color: NAVY });
  page.drawText(input.signatoryDesignation, { x: MARGIN, y: footerY + 12, size: 8, font: regular, color: MUTED });
  page.drawText("Authorized Signatory", { x: MARGIN, y: footerY - 2, size: 7, font: regular, color: MUTED });

  // Digital issuer seal plus a separate reserved area for the physical stamp.
  page.drawCircle({ x: 365, y: footerY + 16, size: 31, borderColor: GREEN, borderWidth: 1.2 });
  page.drawText("PAINFIX", { x: 344, y: footerY + 19, size: 7, font: bold, color: NAVY });
  page.drawText("ISSUED", { x: 348, y: footerY + 8, size: 6, font: bold, color: GREEN });
  page.drawRectangle({ x: 420, y: footerY - 12, width: 125, height: 56, borderColor: MUTED, borderWidth: 0.6 });
  page.drawText("PHYSICAL STAMP", { x: 445, y: footerY + 12, size: 7, font: regular, color: MUTED });

  page.drawImage(qr, { x: PAGE_WIDTH - MARGIN - 54, y: 28, width: 54, height: 54 });
  page.drawText("Scan to verify document status", { x: MARGIN, y: 58, size: 7, font: regular, color: MUTED });
  page.drawText(input.documentNumber, { x: MARGIN, y: 45, size: 7, font: bold, color: NAVY });
  page.drawText("PainFix Physiotherapy Clinic | Move Better. Recover Faster. Live Pain-Free.", {
    x: MARGIN, y: 26, size: 6.5, font: regular, color: MUTED,
  });

  pdf.setTitle(input.documentNumber + " | PainFix medical document");
  pdf.setAuthor("PainFix Physiotherapy Clinic");
  pdf.setSubject("Medical document verification");
  return pdf.save();
}
