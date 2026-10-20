import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { PDFDocument } from "pdf-lib";
import QRCode from "qrcode";
import jsQR from "jsqr";
import { PNG } from "pngjs";
import { certificateVerificationUrl, createCertificatePdf } from "../src/lib/certificate-pdf.ts";

const token = "ab".repeat(32);
// Deliberately synthetic, never inserted into a database or published.
const snapshot = {
  recipient_name: "QA Test Recipient — Not a Credential",
  program_or_role: "Synthetic PDF Test",
  start_date: "2026-01-01",
  end_date: "2026-02-01",
  issued_at: "2026-02-02T00:00:00Z",
  certificate_number: "TEST-NOT-A-CREDENTIAL",
  verification_token: token,
  type: "internship",
  signatory_name: "QA Test Issuer",
  signatory_designation: "Test Only",
  status: "issued",
};
test("certificate verification URL is canonical and rejects arbitrary token content", () => {
  assert.equal(
    certificateVerificationUrl(token),
    `https://painfixphysiotherapy.com/verify-certificate?reference=${token}`,
  );
  for (const bad of [
    "1",
    "../../private",
    "javascript:alert(1)",
    "https://evil.example",
    "AB".repeat(32),
  ]) {
    assert.throws(() => certificateVerificationUrl(bad), /Invalid verification token/);
  }
});
test("generated QR decodes independently to the exact canonical verification URL", async () => {
  const expected = certificateVerificationUrl(token);
  const pngBytes = await QRCode.toBuffer(expected, {
    errorCorrectionLevel: "M",
    margin: 4,
    width: 420,
  });
  const png = PNG.sync.read(pngBytes);
  const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
  assert.equal(decoded?.data, expected);
});
test("branded certificate renders as a single A4 landscape PDF with embedded Unicode font", async () => {
  const font = new Uint8Array(
    await readFile(new URL("../public/fonts/painfix-certificate-sans.ttf", import.meta.url)),
  );
  const logo = new Uint8Array(
    await readFile(new URL("../public/painfix-logo.png", import.meta.url)),
  );
  for (const status of ["issued", "revoked"]) {
    const bytes = await createCertificatePdf({ ...snapshot, status }, { font, logo });
    assert.ok(bytes.length > 10000);
    const document = await PDFDocument.load(bytes);
    assert.equal(document.getPages().length, 1);
    const page = document.getPages()[0];
    assert.equal(page.getWidth(), 841.89);
    assert.equal(page.getHeight(), 595.28);
    assert.match(document.getTitle(), /TEST-NOT-A-CREDENTIAL/);
    assert.equal(document.getAuthor(), "PainFix Physiotherapy Clinic");
  }
});
test("PDF generation refuses drafts and invalid issue dates", async () => {
  const font = new Uint8Array(
    await readFile(new URL("../public/fonts/painfix-certificate-sans.ttf", import.meta.url)),
  );
  await assert.rejects(
    () => createCertificatePdf({ ...snapshot, status: "draft" }, { font }),
    /Only issued/,
  );
  await assert.rejects(
    () => createCertificatePdf({ ...snapshot, issued_at: "invalid" }, { font }),
    /Invalid certificate date/,
  );
});
