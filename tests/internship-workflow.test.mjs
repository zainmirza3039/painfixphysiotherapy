import test from "node:test";
import assert from "node:assert/strict";
import {
  applicationDecisionChoices,
  replacementPredecessor,
} from "../src/lib/internship-workflow.ts";
import { submissionSchema, participantInputSchema } from "../src/lib/internships.contract.ts";

test("application review cannot skip review or manually complete a participant", () => {
  assert.deepEqual(applicationDecisionChoices("submitted"), [
    "submitted",
    "under_review",
    "rejected",
    "withdrawn",
  ]);
  assert.ok(!applicationDecisionChoices("accepted").includes("completed"));
  for (const status of ["rejected", "withdrawn", "completed"])
    assert.deepEqual(applicationDecisionChoices(status), [status]);
});
test("replacement selection requires the same type and source and latest un-replaced revoked record", () => {
  const first = {
    id: "old",
    type: "internship",
    source_id: "source",
    status: "revoked",
    replacement_for: null,
  };
  const replacement = { ...first, id: "replacement", replacement_for: "old" };
  const other = { ...first, id: "unrelated", source_id: "different" };
  assert.equal(replacementPredecessor([first, other], "internship", "source"), first);
  assert.equal(
    replacementPredecessor([first, replacement, other], "internship", "source"),
    replacement,
  );
  assert.equal(replacementPredecessor([first], "experience", "source"), undefined);
  assert.equal(
    replacementPredecessor([{ ...first, status: "issued" }], "internship", "source"),
    undefined,
  );
});
test("public submission cannot supply internal program ids or workflow fields", () => {
  const input = {
    program_slug: "test-only",
    full_name: "Test Applicant",
    email: "qa@example.test",
    phone: "+923001234567",
    city: "Test City",
    educational_institution: "Test Institution",
    degree_program: "DPT",
    academic_status: "Final year",
    clinical_exposure: null,
    availability: "Weekdays",
    motivation: "Test only",
    consent_privacy: true,
  };
  assert.equal(submissionSchema.safeParse(input).success, true);
  for (const extra of [
    { status: "accepted" },
    { program_id: "00000000-0000-0000-0000-000000000001" },
    { internal_notes: "self approved" },
    { completion_approved: true },
  ])
    assert.equal(submissionSchema.safeParse({ ...input, ...extra }).success, false);
});
test("participant schema rejects impossible calendar dates", () => {
  const input = {
    application_id: "00000000-0000-0000-0000-000000000001",
    program_id: "00000000-0000-0000-0000-000000000002",
    full_name: "Test Only",
    start_date: "2026-02-30",
    end_date: "2026-03-01",
    attendance_percent: 100,
    supervisor: "Test Supervisor",
    completion_status: "active",
    assessment_signed_off: false,
    completion_approved: false,
    completion_decision_at: null,
    reviewer_id: null,
    notes: null,
  };
  assert.equal(participantInputSchema.safeParse(input).success, false);
  assert.equal(
    participantInputSchema.safeParse({ ...input, start_date: "2026-02-28" }).success,
    true,
  );
});
