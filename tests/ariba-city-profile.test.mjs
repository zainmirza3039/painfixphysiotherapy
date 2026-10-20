import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const repo = new URL("../", import.meta.url);

async function source(path) {
  return readFile(new URL(path, repo), "utf8");
}

test("online-only doctor profile has a scannable consultation and evidence sections", async () => {
  const profile = await source("src/components/site/DoctorProfile.tsx");
  assert.match(profile, /Online Physiotherapy Consultation/);
  assert.match(
    profile,
    /Start an online physiotherapy consultation with \$\{doc\.name\} on WhatsApp/,
  );
  assert.match(
    profile,
    /\[onlineOnly \? "Supervised Training" : "Training & Volunteer Work", doc\.profile\.training\]/,
  );
  assert.match(profile, /\["Clinical Experience", doc\.profile\.experience\]/);
  assert.match(profile, /\["Research", doc\.profile\.research\]/);
  assert.match(profile, /No physical PainFix/);
});

test("online SEO keeps the root slug canonical and derives city metadata when needed", async () => {
  const seo = await source("src/lib/doctor-seo.ts");
  assert.match(seo, /const path = `\/\$\{doc\.slug\}`/);
  assert.match(seo, /canonical\(path\)/);
  assert.match(seo, /Online Physiotherapy in \$\{city\}/);
  assert.match(seo, /based in \$\{city\}/);
});

test("online profile source does not add email or clinic address fields", async () => {
  const profile = await source("src/components/site/DoctorProfile.tsx");
  const onlineStart = profile.indexOf("{onlineOnly ? (");
  const onlineEnd = profile.indexOf("      ) : (", onlineStart);
  const onlineBranch = profile.slice(onlineStart, onlineEnd);
  assert.doesNotMatch(onlineBranch, /email|CLINIC_ADDRESS|MAP_DIRECTIONS_URL/);
});

test("profile intro constrains its mobile grid and wraps long managed biography words", async () => {
  const profile = await source("src/components/site/DoctorProfile.tsx");
  assert.match(profile, /grid-cols-1 gap-10/);
  assert.match(profile, /className="break-words text-base leading-relaxed text-muted-foreground"/);
});
