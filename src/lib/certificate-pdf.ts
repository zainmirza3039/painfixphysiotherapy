import { PDFDocument, rgb, type PDFFont } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import QRCode from "qrcode";

/** Immutable issued snapshot only; the server is responsible for issuance eligibility. */
export interface PrintableCertificate {
  recipient_name: string;
  program_or_role: string;
  start_date: string | null;
  end_date: string | null;
  issued_at: string;
  certificate_number: string;
  verification_token: string;
  type: "internship" | "experience";
  signatory_name: string;
  signatory_designation: string;
  status: string;
}
export const CERTIFICATE_ORIGIN = "https://painfixphysiotherapy.com";
export function certificateVerificationUrl(token: string): string {
  if (!/^[a-f0-9]{64}$/.test(token)) throw new Error("Invalid verification token");
  return `${CERTIFICATE_ORIGIN}/verify-certificate?reference=${encodeURIComponent(token)}`;
}
function date(value: string | null): string {
  if (!value) throw new Error("Invalid certificate date");
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) throw new Error("Invalid certificate date");
  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
function wrap(text: string, font: PDFFont, size: number, width: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.replace(/[\r\n\t]/g, " ").split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > width && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}
export async function createCertificatePdf(
  certificate: PrintableCertificate,
  assets: { font: Uint8Array; logo?: Uint8Array },
): Promise<Uint8Array> {
  if (!["issued", "revoked"].includes(certificate.status))
    throw new Error("Only issued certificate snapshots can be rendered");
  const url = certificateVerificationUrl(certificate.verification_token);
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(assets.font, { subset: true });
  const page = pdf.addPage([841.89, 595.28]); // A4 landscape, points
  const navy = rgb(3 / 255, 46 / 255, 97 / 255);
  const green = rgb(0, 168 / 255, 89 / 255);
  const muted = rgb(0.3, 0.35, 0.4);
  const width = page.getWidth();
  page.drawRectangle({
    x: 25,
    y: 25,
    width: width - 50,
    height: page.getHeight() - 50,
    borderColor: navy,
    borderWidth: 1.5,
  });
  page.drawRectangle({
    x: 25,
    y: page.getHeight() - 34,
    width: width - 50,
    height: 9,
    color: green,
  });
  const center = (text: string, y: number, size: number, color = navy, max = 690) => {
    let adjusted = size;
    while (font.widthOfTextAtSize(text, adjusted) > max && adjusted > 9) adjusted -= 0.5;
    page.drawText(text, {
      x: (width - font.widthOfTextAtSize(text, adjusted)) / 2,
      y,
      size: adjusted,
      font,
      color,
    });
  };
  if (assets.logo) {
    const logo = await pdf.embedPng(assets.logo);
    const dimensions = logo.scaleToFit(50, 50);
    page.drawImage(logo, { x: 55, y: 486, width: dimensions.width, height: dimensions.height });
  }
  center("PainFix Physiotherapy Clinic", 515, 21);
  center(
    certificate.type === "internship"
      ? "CERTIFICATE OF INTERNSHIP COMPLETION"
      : "PROFESSIONAL EXPERIENCE CERTIFICATE",
    461,
    22,
  );
  center("This is to recognize", 416, 12, muted);
  center(certificate.recipient_name, 374, 30);
  const recognition =
    certificate.type === "internship"
      ? "has completed the approved internship requirements for"
      : "has a verified record of engagement with PainFix in the role of";
  center(recognition, 340, 12, muted);
  center(certificate.program_or_role, 307, 21);
  center(`${date(certificate.start_date)} – ${date(certificate.end_date)}`, 276, 12, muted);
  center(
    "This certificate confirms the recorded engagement only. It is not a degree, licence or registration.",
    245,
    9,
    muted,
  );
  page.drawLine({
    start: { x: 55, y: 218 },
    end: { x: 786, y: 218 },
    thickness: 0.6,
    color: green,
  });
  const label = (text: string, y: number) =>
    page.drawText(text, { x: 60, y, size: 10, font, color: navy });
  label(`Certificate: ${certificate.certificate_number}`, 193);
  label(`Issued: ${date(certificate.issued_at)}`, 174);
  const signatory = wrap(
    `${certificate.signatory_name} — ${certificate.signatory_designation}`,
    font,
    11,
    490,
  );
  signatory.slice(0, 3).forEach((line, index) => label(line, 146 - index * 15));
  label("Authorized issuer (printed name; no reproduced signature)", 92);
  page.drawText("Verify authenticity and current status online:", {
    x: 60,
    y: 73,
    size: 9,
    font,
    color: muted,
  });
  const urlLines = wrap(url, font, 7.5, 600);
  urlLines.forEach((line, i) =>
    page.drawText(line, { x: 60, y: 58 - i * 9, size: 7.5, font, color: navy }),
  );
  const qr = await QRCode.toDataURL(url, { errorCorrectionLevel: "M", margin: 4, width: 420 });
  const qrImage = await pdf.embedPng(qr);
  page.drawImage(qrImage, { x: 666, y: 95, width: 116, height: 116 });
  page.drawText("Scan to verify", { x: 687, y: 83, size: 9, font, color: navy });
  if (certificate.status === "revoked") center("REVOKED — NOT VALID", 555, 16, rgb(0.75, 0.1, 0.1));
  pdf.setTitle(`${certificate.certificate_number} | PainFix certificate`);
  pdf.setAuthor("PainFix Physiotherapy Clinic");
  pdf.setSubject("Verify the current certificate status using the included QR code.");
  return pdf.save();
}
async function certificateBytes(certificate: PrintableCertificate): Promise<Uint8Array> {
  const [fontResponse, logoResponse] = await Promise.all([
    fetch("/fonts/painfix-certificate-sans.ttf"),
    fetch("/painfix-logo.png"),
  ]);
  if (!fontResponse.ok) throw new Error("Certificate font could not be loaded. Please retry.");
  return createCertificatePdf(certificate, {
    font: new Uint8Array(await fontResponse.arrayBuffer()),
    ...(logoResponse.ok ? { logo: new Uint8Array(await logoResponse.arrayBuffer()) } : {}),
  });
}
export async function downloadCertificatePdf(certificate: PrintableCertificate): Promise<void> {
  const bytes = await certificateBytes(certificate);
  const objectUrl = URL.createObjectURL(
    new Blob([new Uint8Array(bytes)], { type: "application/pdf" }),
  );
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = `${certificate.certificate_number}.pdf`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}
export async function previewCertificatePdf(certificate: PrintableCertificate): Promise<void> {
  // Reserve the tab synchronously so browser popup protection does not block the preview.
  const preview = window.open("about:blank", "_blank");
  if (!preview) throw new Error("Allow a new tab to preview and print the certificate.");
  preview.opener = null;
  try {
    const bytes = await certificateBytes(certificate);
    const objectUrl = URL.createObjectURL(
      new Blob([new Uint8Array(bytes)], { type: "application/pdf" }),
    );
    preview.location.href = objectUrl;
    setTimeout(() => URL.revokeObjectURL(objectUrl), 300_000);
  } catch (error) {
    preview.close();
    throw error;
  }
}
