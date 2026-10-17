import assert from "node:assert/strict";
import test from "node:test";
import {
  createHomeVisitSubmissionGate,
  getLocalDateInputValue,
  HOME_VISIT_FIELD_LIMITS,
  submitHomeVisitRequest,
  toHomeVisitRequestPayload,
  validateHomeVisitForm,
} from "../src/lib/home-visit-form.ts";

const today = "2026-10-16";
const validValues = {
  full_name: " Zain Patient ",
  phone: " +923001234567 ",
  address: " 12 Main Road ",
  medical_condition: " Knee pain ",
  preferred_date: "2026-10-20",
  preferred_time: "09:30",
  notes: " Please call first ",
};

const noFileAdapter = (overrides = {}) => ({
  insertRequest: async () => {},
  ...overrides,
});

test("requires every current request field and keeps notes optional", () => {
  assert.equal(validateHomeVisitForm(validValues, today), null);
  for (const key of [
    "full_name",
    "phone",
    "address",
    "medical_condition",
    "preferred_date",
    "preferred_time",
  ]) {
    assert.equal(
      validateHomeVisitForm({ ...validValues, [key]: "   " }, today),
      "required",
      `${key} is required`,
    );
  }
  assert.equal(validateHomeVisitForm({ ...validValues, notes: "" }, today), null);
});

test("accepts formatted contact numbers with 7–15 digits and rejects numbers outside that range", () => {
  assert.equal(validateHomeVisitForm(validValues, today), null);
  assert.equal(validateHomeVisitForm({ ...validValues, phone: "+92 12" }, today), "phone");
  assert.equal(
    validateHomeVisitForm({ ...validValues, phone: `+${"1".repeat(16)}` }, today),
    "phone",
  );
});

test("accepts today and future dates and rejects a date in the past", () => {
  assert.equal(validateHomeVisitForm({ ...validValues, preferred_date: today }, today), null);
  assert.equal(
    validateHomeVisitForm({ ...validValues, preferred_date: "2026-10-15" }, today),
    "date",
  );
});

test("enforces the same form text limits as the database insert policy", () => {
  for (const [key, max] of Object.entries(HOME_VISIT_FIELD_LIMITS)) {
    const values = { ...validValues, [key]: "x".repeat(max + 1) };
    assert.equal(
      validateHomeVisitForm(values, today),
      "length",
      `${key} should be capped at ${max}`,
    );
  }
  for (const [key, max] of Object.entries(HOME_VISIT_FIELD_LIMITS)) {
    const values = { ...validValues, [key]: "x".repeat(max) };
    if (key === "phone") values.phone = `${"1".repeat(15)}${"-".repeat(25)}`;
    assert.equal(
      validateHomeVisitForm(values, today),
      null,
      `${key} should allow the maximum length`,
    );
  }
});

test("normalizes the payload and excludes unapproved columns and extra caller properties", () => {
  const payload = toHomeVisitRequestPayload({
    ...validValues,
    notes: "  ",
    id: "attacker-supplied-id",
    status: "approved",
    created_at: "attacker-supplied-time",
    report_url: "attacker-supplied-path",
  });

  assert.deepEqual(payload, {
    full_name: "Zain Patient",
    phone: "+923001234567",
    address: "12 Main Road",
    medical_condition: "Knee pain",
    preferred_date: "2026-10-20",
    preferred_time: "09:30",
    notes: null,
  });
  assert.equal("status" in payload, false);
  assert.equal("id" in payload, false);
  assert.equal("created_at" in payload, false);
  assert.equal("report_url" in payload, false);
});

test("submits a valid request once with only the normalized form payload", async () => {
  const calls = [];
  const result = await submitHomeVisitRequest(
    validValues,
    today,
    noFileAdapter({ insertRequest: async (payload) => calls.push(payload) }),
    createHomeVisitSubmissionGate(),
  );

  assert.deepEqual(result, { status: "success" });
  assert.deepEqual(calls, [toHomeVisitRequestPayload(validValues)]);
});

test("reports insert failures without claiming success", async () => {
  const error = new Error("database unavailable");
  const result = await submitHomeVisitRequest(
    validValues,
    today,
    noFileAdapter({
      insertRequest: async () => {
        throw error;
      },
    }),
    createHomeVisitSubmissionGate(),
  );
  assert.deepEqual(result, { status: "error", error });
});

test("rejects invalid values before calling the database adapter", async () => {
  let calls = 0;
  const result = await submitHomeVisitRequest(
    { ...validValues, address: " " },
    today,
    noFileAdapter({
      insertRequest: async () => {
        calls += 1;
      },
    }),
    createHomeVisitSubmissionGate(),
  );

  assert.deepEqual(result, { status: "invalid", reason: "required" });
  assert.equal(calls, 0);
});

test("synchronously suppresses overlapping requests and releases the gate after completion", async () => {
  const gate = createHomeVisitSubmissionGate();
  let releaseInsert;
  const insertBlocked = new Promise((resolve) => {
    releaseInsert = resolve;
  });
  let insertCount = 0;
  const adapter = noFileAdapter({
    insertRequest: async () => {
      insertCount += 1;
      await insertBlocked;
    },
  });

  const firstSubmission = submitHomeVisitRequest(validValues, today, adapter, gate);
  assert.equal(gate.isPending, true);
  assert.deepEqual(await submitHomeVisitRequest(validValues, today, adapter, gate), {
    status: "duplicate",
  });
  assert.equal(insertCount, 1);

  releaseInsert();
  assert.deepEqual(await firstSubmission, { status: "success" });
  assert.equal(gate.isPending, false);
  assert.deepEqual(await submitHomeVisitRequest(validValues, today, noFileAdapter(), gate), {
    status: "success",
  });
});

test("releases the gate after an insert failure so the user can retry", async () => {
  const gate = createHomeVisitSubmissionGate();
  const error = new Error("temporary database error");
  const failed = await submitHomeVisitRequest(
    validValues,
    today,
    noFileAdapter({
      insertRequest: async () => {
        throw error;
      },
    }),
    gate,
  );

  assert.deepEqual(failed, { status: "error", error });
  assert.equal(gate.isPending, false);
  assert.deepEqual(await submitHomeVisitRequest(validValues, today, noFileAdapter(), gate), {
    status: "success",
  });
});

test("formats a local calendar date for the date input", () => {
  assert.equal(getLocalDateInputValue(new Date(2026, 9, 16, 12)), "2026-10-16");
});
