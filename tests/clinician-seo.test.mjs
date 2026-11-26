import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repo = new URL("../", import.meta.url);

test("Dr Zain profile metadata identifies the clinician and Multan clinic without promotional claims", async () => {
  const source = await readFile(new URL("src/lib/doctor-seo.ts", repo), "utf8");
  assert.match(source, /isZainProfile = doc\.slug === "dr-zain-ul-abideen-pt-multan"/);
  assert.match(source, /Dr\. Zain Ul Abideen, DPT \| PainFix Multan/);
  assert.match(
    source,
    /Meet Dr\. Zain Ul Abideen, DPT, Founder & Head Physiotherapist at PainFix in Multan/,
  );
  assert.doesNotMatch(source, /trusted physiotherapist|leading physiotherapist/);
});

test("Dr Jalal profile metadata targets the verified DPT in Multan search opportunity without promotional claims", async () => {
  const source = await readFile(new URL("src/lib/doctor-seo.ts", repo), "utf8");
  assert.match(source, /isJalalProfile = doc\.slug === "dr-jalal-ud-din-pt-multan"/);
  assert.match(source, /Dr\. Jalal Ud Din, DPT \| PainFix Multan/);
  assert.match(
    source,
    /Meet Dr\. Jalal Ud Din, DPT, Co-Founder of PainFix in Multan/,
  );
  assert.match(source, /jobTitle: isZainProfile\s*\?\s*"Founder & Head Physiotherapist"\s*:\s*isJalalProfile\s*\?\s*"Co-Founder"\s*:\s*doc\.role/s);
  assert.match(source, /isZainProfile \|\| isJalalProfile/);
  assert.doesNotMatch(source, /trusted physiotherapist|leading physiotherapist/);
});

test("public physiotherapist structured data uses Person rather than Physician", async () => {
  const source = await readFile(new URL("src/lib/doctor-seo.ts", repo), "utf8");
  assert.match(source, /"@type": "Person"/);
  assert.doesNotMatch(source, /"@type": onlineOnly \? "Person" : "Physician"/);
  assert.doesNotMatch(source, /medicalSpecialty: "Physiotherapy"/);
});
