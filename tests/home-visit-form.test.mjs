import assert from "node:assert/strict";
import test from "node:test";
import {
  createHomeVisitSubmissionGate,
  HOME_VISIT_FIELD_LIMITS,
  submitHomeVisitRequest,
  toHomeVisitRequestPayload,
  validateHomeVisitForm,
} from "../src/lib/home-visit-form.ts";

const validValues = {
  full_name: " Zain Patient ",
  phone: " +923001234567 ",
  address: " 12 Main Road ",
  maps_location: " https://maps.example/location ",
  patient_age: "42",
  medical_condition: " Knee pain ",
  preferred_date: "2026-10-20",
  preferred_time: " 09:30 ",
  notes: " Please call first ",
};

const noFileAdapter = (overrides = {}) => ({
  uploadReport: async () => "uploaded-report.pdf",
  insertRequest: async () => {},
  ...overrides,
});

test("requires a nonblank name, phone, and address", () => {
  assert.equal(validateHomeVisitForm(validValues), null);
  for (const key of ["full_name", "phone", "address"]) {
    assert.equal(validateHomeVisitForm({ ...validValues, [key]: "   " }), "required");
  }
});

test("accepts optional age 0 and 120; rejects non-integers and values outside the allowed range", () => {
  for (const patient_age of ["0", "120", ""]) {
    assert.equal(validateHomeVisitForm({ ...validValues, patient_age }), null);
  }
  for (const patient_age of ["-1", "121", "1.5", "abc"]) {
    assert.equal(validateHomeVisitForm({ ...validValues, patient_age }), "age");
  }
});

test("enforces the same text limits as the database insert policy", () => {
  const fieldValues = {
    full_name: "a".repeat(HOME_VISIT_FIELD_LIMITS.full_name + 1),
    phone: "1",
    address: "a",
    maps_location: "",
    patient_age: "",
    medical_condition: "",
    preferred_date: "",
    preferred_time: "",
    notes: "",
  };
  assert.equal(validateHomeVisitForm(fieldValues), "length");

  for (const [key, max] of Object.entries(HOME_VISIT_FIELD_LIMITS)) {
    const values = { ...validValues, [key]: "x".repeat(max + 1) };
    assert.equal(validateHomeVisitForm(values), "length", `${key} should be capped at ${max}`);
  }
});

test("normalizes payload strings and converts empty optional fields to null", () => {
  const payload = toHomeVisitRequestPayload(
    {
      ...validValues,
      maps_location: "  ",
      patient_age: "0",
      medical_condition: "  ",
      preferred_date: "",
      preferred_time: " ",
      notes: "  ",
    },
    "safe-generated-path.pdf",
  );
  assert.deepEqual(payload, {
    full_name: "Zain Patient",
    phone: "+923001234567",
    address: "12 Main Road",
    maps_location: null,
    patient_age: 0,
    medical_condition: null,
    preferred_date: null,
    preferred_time: null,
    notes: null,
    report_url: "safe-generated-path.pdf",
  });
});

test("submits a valid request once and stores the uploaded report path", async () => {
  const calls = [];
  const adapter = noFileAdapter({
    uploadReport: async (file) => {
      calls.push(["upload", file.name]);
      return "generated-uuid.pdf";
    },
    insertRequest: async (payload) => calls.push(["insert", payload]),
  });
  const result = await submitHomeVisitRequest(
    validValues,
    { name: "report.pdf" },
    adapter,
    createHomeVisitSubmissionGate(),
  );

  assert.deepEqual(result, { status: "success" });
  assert.equal(calls.length, 2);
  assert.deepEqual(calls[0], ["upload", "report.pdf"]);
  assert.equal(calls[1][0], "insert");
  assert.equal(calls[1][1].report_url, "generated-uuid.pdf");
});

test("surfaces insertion and upload failures without reporting success", async () => {
  const insertError = new Error("database unavailable");
  const insertResult = await submitHomeVisitRequest(
    validValues,
    null,
    noFileAdapter({
      insertRequest: async () => {
        throw insertError;
      },
    }),
    createHomeVisitSubmissionGate(),
  );
  assert.deepEqual(insertResult, { status: "error", error: insertError });

  const uploadError = new Error("storage unavailable");
  let inserted = false;
  const uploadResult = await submitHomeVisitRequest(
    validValues,
    { name: "report.pdf" },
    noFileAdapter({
      uploadReport: async () => {
        throw uploadError;
      },
      insertRequest: async () => {
        inserted = true;
      },
    }),
    createHomeVisitSubmissionGate(),
  );
  assert.deepEqual(uploadResult, { status: "error", error: uploadError });
  assert.equal(inserted, false);
});

test("rejects invalid values before upload or database insertion", async () => {
  let calls = 0;
  const result = await submitHomeVisitRequest(
    { ...validValues, address: " " },
    { name: "report.pdf" },
    noFileAdapter({
      uploadReport: async () => {
        calls += 1;
        return "report.pdf";
      },
      insertRequest: async () => {
        calls += 1;
      },
    }),
    createHomeVisitSubmissionGate(),
  );
  assert.deepEqual(result, { status: "invalid", reason: "required" });
  assert.equal(calls, 0);
});

test("suppresses overlapping submissions synchronously and releases the gate afterward", async () => {
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

  const firstSubmission = submitHomeVisitRequest(validValues, null, adapter, gate);
  assert.equal(gate.isPending, true);
  const duplicate = await submitHomeVisitRequest(validValues, null, adapter, gate);
  assert.deepEqual(duplicate, { status: "duplicate" });
  assert.equal(insertCount, 1);

  releaseInsert();
  assert.deepEqual(await firstSubmission, { status: "success" });
  assert.equal(gate.isPending, false);

  assert.deepEqual(
    await submitHomeVisitRequest(validValues, null, noFileAdapter(), gate),
    { status: "success" },
    "a completed submission must allow a later retry",
  );
});

test("releases the gate after a failed request so the user can retry", async () => {
  const gate = createHomeVisitSubmissionGate();
  const error = new Error("temporary database error");
  const failed = await submitHomeVisitRequest(
    validValues,
    null,
    noFileAdapter({
      insertRequest: async () => {
        throw error;
      },
    }),
    gate,
  );
  assert.deepEqual(failed, { status: "error", error });
  assert.equal(gate.isPending, false);
  assert.deepEqual(await submitHomeVisitRequest(validValues, null, noFileAdapter(), gate), {
    status: "success",
  });
});
