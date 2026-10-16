export const HOME_VISIT_FIELD_LIMITS = {
  full_name: 200,
  phone: 40,
  address: 1000,
  maps_location: 2048,
  medical_condition: 200,
  preferred_time: 20,
  notes: 5000,
} as const;

export type HomeVisitFormValues = {
  full_name: string;
  phone: string;
  address: string;
  maps_location: string;
  patient_age: string;
  medical_condition: string;
  preferred_date: string;
  preferred_time: string;
  notes: string;
};

export type HomeVisitValidationError = "required" | "age" | "length";

export type HomeVisitRequestPayload = {
  full_name: string;
  phone: string;
  address: string;
  maps_location: string | null;
  patient_age: number | null;
  medical_condition: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  notes: string | null;
  report_url: string | null;
};

export type HomeVisitSubmissionResult =
  | { status: "invalid"; reason: HomeVisitValidationError }
  | { status: "duplicate" }
  | { status: "success" }
  | { status: "error"; error: unknown };

export type HomeVisitGateResult<T> =
  | { status: "duplicate" }
  | { status: "success"; value: T }
  | { status: "error"; error: unknown };

export interface HomeVisitSubmissionGate {
  readonly isPending: boolean;
  run<T>(operation: () => Promise<T>): Promise<HomeVisitGateResult<T>>;
}

export interface HomeVisitSubmissionAdapter {
  uploadReport(file: File): Promise<string>;
  insertRequest(payload: HomeVisitRequestPayload): Promise<void>;
}

export function validateHomeVisitForm(
  values: HomeVisitFormValues,
): HomeVisitValidationError | null {
  if (!values.full_name.trim() || !values.phone.trim() || !values.address.trim()) {
    return "required";
  }

  const age = values.patient_age.trim();
  if (age) {
    const parsedAge = Number(age);
    if (!/^\d+$/.test(age) || !Number.isInteger(parsedAge) || parsedAge < 0 || parsedAge > 120) {
      return "age";
    }
  }

  if (
    values.full_name.trim().length > HOME_VISIT_FIELD_LIMITS.full_name ||
    values.phone.trim().length > HOME_VISIT_FIELD_LIMITS.phone ||
    values.address.trim().length > HOME_VISIT_FIELD_LIMITS.address ||
    values.maps_location.trim().length > HOME_VISIT_FIELD_LIMITS.maps_location ||
    values.medical_condition.trim().length > HOME_VISIT_FIELD_LIMITS.medical_condition ||
    values.preferred_time.trim().length > HOME_VISIT_FIELD_LIMITS.preferred_time ||
    values.notes.trim().length > HOME_VISIT_FIELD_LIMITS.notes
  ) {
    return "length";
  }

  return null;
}

export function toHomeVisitRequestPayload(
  values: HomeVisitFormValues,
  reportUrl: string | null,
): HomeVisitRequestPayload {
  return {
    full_name: values.full_name.trim(),
    phone: values.phone.trim(),
    address: values.address.trim(),
    maps_location: values.maps_location.trim() || null,
    patient_age: values.patient_age.trim() ? Number(values.patient_age.trim()) : null,
    medical_condition: values.medical_condition.trim() || null,
    preferred_date: values.preferred_date || null,
    preferred_time: values.preferred_time.trim() || null,
    notes: values.notes.trim() || null,
    report_url: reportUrl,
  };
}

export function createHomeVisitSubmissionGate(): HomeVisitSubmissionGate {
  let pending = false;

  return {
    get isPending() {
      return pending;
    },
    async run<T>(operation: () => Promise<T>): Promise<HomeVisitGateResult<T>> {
      if (pending) return { status: "duplicate" };
      pending = true;
      try {
        return { status: "success", value: await operation() };
      } catch (error) {
        return { status: "error", error };
      } finally {
        pending = false;
      }
    },
  };
}

export async function submitHomeVisitRequest(
  values: HomeVisitFormValues,
  file: File | null,
  adapter: HomeVisitSubmissionAdapter,
  gate: HomeVisitSubmissionGate,
): Promise<HomeVisitSubmissionResult> {
  const validationError = validateHomeVisitForm(values);
  if (validationError) return { status: "invalid", reason: validationError };

  const result = await gate.run(async () => {
    const reportUrl = file ? await adapter.uploadReport(file) : null;
    await adapter.insertRequest(toHomeVisitRequestPayload(values, reportUrl));
  });

  if (result.status === "success") return { status: "success" };
  return result;
}
