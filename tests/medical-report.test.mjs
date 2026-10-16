import assert from "node:assert/strict";
import test from "node:test";
import {
  getMedicalReportExtension,
  MAX_MEDICAL_REPORT_SIZE,
  MEDICAL_REPORT_MIME_TYPES,
  validateMedicalReport,
} from "../src/lib/medical-report.ts";

test("accepts each explicitly supported report MIME type", () => {
  for (const type of MEDICAL_REPORT_MIME_TYPES) {
    assert.equal(validateMedicalReport({ size: 1, type }), null, `${type} should be accepted`);
  }
});

test("rejects unsupported, missing, and empty MIME types", () => {
  for (const type of ["", "application/zip", "image/svg+xml", "text/html"]) {
    assert.equal(validateMedicalReport({ size: 1, type }), "type", `${type} should be rejected`);
  }
});

test("enforces the 10 MB limit at the boundary", () => {
  assert.equal(
    validateMedicalReport({ size: MAX_MEDICAL_REPORT_SIZE, type: "application/pdf" }),
    null,
  );
  assert.equal(
    validateMedicalReport({ size: MAX_MEDICAL_REPORT_SIZE + 1, type: "application/pdf" }),
    "size",
  );
});

test("rejects empty files", () => {
  assert.equal(validateMedicalReport({ size: 0, type: "application/pdf" }), "empty");
});

test("maps allowed MIME types to trusted extensions instead of user-supplied names", () => {
  assert.equal(getMedicalReportExtension("application/pdf"), "pdf");
  assert.equal(getMedicalReportExtension("image/jpeg"), "jpg");
  assert.equal(getMedicalReportExtension("image/heif"), "heif");
  assert.equal(getMedicalReportExtension("application/x-msdownload"), null);
});
