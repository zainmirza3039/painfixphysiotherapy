import assert from "node:assert/strict";
import test from "node:test";
import {
  createSingleSubmissionGuard,
  getLocalDateInputValue,
  persistHomeVisitRequest,
  toHomeVisitRequestPayload,
  validateHomeVisitForm,
} from "../src/lib/home-visit-form.ts";

const validValues = {
  full_name: "  Sana Ahmed  ",
  phone: "+92 314-3039582",
  address: "  Shalimar Colony, Multan  ",
  medical_condition: "  Post-operative rehabilitation  ",
  preferred_date: "2026-10-20",
  preferred_time: "11:30",
  notes: "  Please call before arriving.  ",
};

test("requires each core request field while keeping notes optional", () => {
  assert.equal(
    validateHomeVisitForm({ ...validValues, full_name: "  " }, "2026-10-16"),
    "required",
  );
  assert.equal(validateHomeVisitForm({ ...validValues, phone: "" }, "2026-10-16"), "required");
  assert.equal(validateHomeVisitForm({ ...validValues, address: "" }, "2026-10-16"), "required");
  assert.equal(
    validateHomeVisitForm({ ...validValues, medical_condition: "" }, "2026-10-16"),
    "required",
  );
  assert.equal(
    validateHomeVisitForm({ ...validValues, preferred_date: "" }, "2026-10-16"),
    "required",
  );
  assert.equal(
    validateHomeVisitForm({ ...validValues, preferred_time: "" }, "2026-10-16"),
    "required",
  );
  assert.equal(validateHomeVisitForm({ ...validValues, notes: "" }, "2026-10-16"), null);
});

test("accepts a formatted contact number with a valid digit count", () => {
  assert.equal(validateHomeVisitForm(validValues, "2026-10-16"), null);
});

test("rejects contact numbers outside the supported digit-count range", () => {
  assert.equal(validateHomeVisitForm({ ...validValues, phone: "+92 12" }, "2026-10-16"), "phone");
  assert.equal(
    validateHomeVisitForm({ ...validValues, phone: `+${"1".repeat(16)}` }, "2026-10-16"),
    "phone",
  );
});

test("rejects a preferred visit date in the past", () => {
  assert.equal(
    validateHomeVisitForm({ ...validValues, preferred_date: "2026-10-15" }, "2026-10-16"),
    "date",
  );
});

test("maps only the requested fields to the database payload and trims text", () => {
  assert.deepEqual(toHomeVisitRequestPayload(validValues), {
    full_name: "Sana Ahmed",
    phone: "+92 314-3039582",
    address: "Shalimar Colony, Multan",
    medical_condition: "Post-operative rehabilitation",
    preferred_date: "2026-10-20",
    preferred_time: "11:30",
    notes: "Please call before arriving.",
  });
  assert.equal(toHomeVisitRequestPayload({ ...validValues, notes: "  " }).notes, null);
});

test("reports success only when the existing request insert returns no error", async () => {
  let insertedPayload;
  await persistHomeVisitRequest(async (payload) => {
    insertedPayload = payload;
    return { error: null };
  }, validValues);
  assert.equal(insertedPayload.full_name, "Sana Ahmed");
  assert.equal(insertedPayload.preferred_time, "11:30");
});

test("propagates insert failures so the form can show its error feedback", async () => {
  await assert.rejects(
    persistHomeVisitRequest(async () => ({ error: new Error("network unavailable") }), validValues),
    /network unavailable/,
  );
});

test("blocks concurrent duplicate submits and reopens after the request completes", () => {
  const guard = createSingleSubmissionGuard();
  assert.equal(guard.enter(), true);
  assert.equal(guard.enter(), false);
  guard.release();
  assert.equal(guard.enter(), true);
  guard.release();
});

test("formats the local calendar date for the date input", () => {
  assert.equal(getLocalDateInputValue(new Date(2026, 9, 16, 12)), "2026-10-16");
});
