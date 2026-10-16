export const MAX_MEDICAL_REPORT_SIZE = 10 * 1024 * 1024;

export const MEDICAL_REPORT_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
  "image/avif",
] as const;

export const MEDICAL_REPORT_ACCEPT = MEDICAL_REPORT_MIME_TYPES.join(",");

export type MedicalReportValidationError = "empty" | "size" | "type";

const extensionByMimeType: Record<(typeof MEDICAL_REPORT_MIME_TYPES)[number], string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/heic": "heic",
  "image/heif": "heif",
  "image/avif": "avif",
};

export function validateMedicalReport(file: {
  size: number;
  type: string;
}): MedicalReportValidationError | null {
  if (file.size <= 0) return "empty";
  if (file.size > MAX_MEDICAL_REPORT_SIZE) return "size";
  if (
    !MEDICAL_REPORT_MIME_TYPES.includes(file.type as (typeof MEDICAL_REPORT_MIME_TYPES)[number])
  ) {
    return "type";
  }
  return null;
}

export function getMedicalReportExtension(mimeType: string): string | null {
  return extensionByMimeType[mimeType as keyof typeof extensionByMimeType] ?? null;
}
