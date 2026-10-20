import assert from "node:assert/strict";
import test from "node:test";
import { withPublicClinicianFallback } from "../src/lib/clinician-public-fallback.ts";
import { toClinicianView } from "../src/lib/clinician-view.ts";

for (const failure of [
  Object.assign(new Error("Could not find table public.clinician_profiles"), { code: "PGRST205" }),
  Object.assign(new Error('relation "clinician_profiles" does not exist'), { code: "42P01" }),
  new Error("Missing public Supabase configuration"),
  new Error("Unable to load clinician profiles"),
  new TypeError("fetch failed"),
]) {
  test(`public read falls back on ${failure.message}`, async (t) => {
    const warn = t.mock.method(console, "warn", () => {});
    const staticContent = [{ slug: "existing-static-record" }];
    const result = await withPublicClinicianFallback(
      async () => {
        throw failure;
      },
      () => staticContent,
    );
    assert.equal(result, staticContent);
    assert.equal(warn.mock.callCount(), 1);
    assert.doesNotMatch(warn.mock.calls[0].arguments.join(" "), /PGRST205|42P01|fetch failed/);
  });
}

for (const result of [[], null, [{ slug: "managed-profile", bio: null }]]) {
  test(`successful public result ${JSON.stringify(result)} never invokes static fallback`, async () => {
    const fallback = () => assert.fail("Successful API reads must stay authoritative");
    assert.equal(await withPublicClinicianFallback(async () => result, fallback), result);
  });
}

test("fallback failures are not swallowed or retried", async (t) => {
  t.mock.method(console, "warn", () => {});
  const failure = new Error("Static fallback failed");
  await assert.rejects(
    withPublicClinicianFallback(
      async () => {
        throw new Error("Synthetic API unavailable");
      },
      () => {
        throw failure;
      },
    ),
    (error) => error === failure,
  );
});

test("static presentation content passes through unchanged with no generated profile claims", () => {
  const existing = {
    fullName: "Existing static fixture",
    slug: "existing-static-record",
    photo: null,
  };
  assert.equal(toClinicianView(existing), existing);
  assert.equal("yearsExperience" in toClinicianView(existing), false);
  assert.equal("id" in toClinicianView(existing), false);
});
