export const HOME_VISIT_FIELD_LIMITS = {
  full_name: 200,
  phone: 40,
  address: 1000,
  medical_condition: 200,
  preferred_time: 20,
  notes: 5000,
} as const;

export type HomeVisitFormValues = {
  full_name: string;
  phone: string;
  address: string;
  medical_condition: string;
  preferred_date: string;
  preferred_time: string;
  notes: string;
};

export type HomeVisitValidationError = "required" | "phone" | "date" | "length";

export type HomeVisitRequestPayload = {
  full_name: string;
  phone: string;
  address: string;
  medical_condition: string;
  preferred_date: string;
  preferred_time: string;
  notes: string | null;
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
  insertRequest(payload: HomeVisitRequestPayload): Promise<void>;
}

export function getLocalDateInputValue(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function validateHomeVisitForm(
  values: HomeVisitFormValues,
  today: string,
): HomeVisitValidationError | null {
  const requiredValues = [
    values.full_name,
    values.phone,
    values.address,
    values.medical_condition,
    values.preferred_date,
    values.preferred_time,
  ];
  if (requiredValues.some((value) => !value.trim())) return "required";

  if (
    values.full_name.trim().length > HOME_VISIT_FIELD_LIMITS.full_name ||
    values.phone.trim().length > HOME_VISIT_FIELD_LIMITS.phone ||
    values.address.trim().length > HOME_VISIT_FIELD_LIMITS.address ||
    values.medical_condition.trim().length > HOME_VISIT_FIELD_LIMITS.medical_condition ||
    values.preferred_time.trim().length > HOME_VISIT_FIELD_LIMITS.preferred_time ||
    values.notes.trim().length > HOME_VISIT_FIELD_LIMITS.notes
  ) {
    return "length";
  }

  const phoneDigits = values.phone.replace(/\D/g, "");
  if (phoneDigits.length < 7 || phoneDigits.length > 15) return "phone";
  if (values.preferred_date < today) return "date";

  return null;
}

export function toHomeVisitRequestPayload(values: HomeVisitFormValues): HomeVisitRequestPayload {
  return {
    full_name: values.full_name.trim(),
    phone: values.phone.trim(),
    address: values.address.trim(),
    medical_condition: values.medical_condition.trim(),
    preferred_date: values.preferred_date,
    preferred_time: values.preferred_time.trim(),
    notes: values.notes.trim() || null,
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
  today: string,
  adapter: HomeVisitSubmissionAdapter,
  gate: HomeVisitSubmissionGate,
): Promise<HomeVisitSubmissionResult> {
  const validationError = validateHomeVisitForm(values, today);
  if (validationError) return { status: "invalid", reason: validationError };

  const result = await gate.run(() => adapter.insertRequest(toHomeVisitRequestPayload(values)));

  if (result.status === "success") return { status: "success" };
  return result;
}
