export type HomeVisitFormValues = {
  full_name: string;
  phone: string;
  address: string;
  medical_condition: string;
  preferred_date: string;
  preferred_time: string;
  notes: string;
};

export type HomeVisitValidationError = "required" | "phone" | "date";

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

  const phoneDigits = values.phone.replace(/\D/g, "");
  if (phoneDigits.length < 7 || phoneDigits.length > 15) return "phone";
  if (values.preferred_date < today) return "date";

  return null;
}

export function toHomeVisitRequestPayload(values: HomeVisitFormValues) {
  return {
    full_name: values.full_name.trim(),
    phone: values.phone.trim(),
    address: values.address.trim(),
    medical_condition: values.medical_condition.trim(),
    preferred_date: values.preferred_date,
    preferred_time: values.preferred_time,
    notes: values.notes.trim() || null,
  };
}

export function createSingleSubmissionGuard() {
  let inProgress = false;

  return {
    enter() {
      if (inProgress) return false;
      inProgress = true;
      return true;
    },
    release() {
      inProgress = false;
    },
  };
}

export async function persistHomeVisitRequest(
  insert: (
    payload: ReturnType<typeof toHomeVisitRequestPayload>,
  ) => PromiseLike<{ error: unknown | null }>,
  values: HomeVisitFormValues,
): Promise<void> {
  const { error } = await insert(toHomeVisitRequestPayload(values));
  if (error) throw error;
}
