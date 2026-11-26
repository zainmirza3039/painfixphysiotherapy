import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = (path) => readFileSync(new URL("../src/" + path, import.meta.url), "utf8");

test("Dr Zain profile metadata directly answers the clinician-name search intent", () => {
  const seo = source("lib/doctor-seo.ts");
  assert.ok(seo.includes('"Dr. Zain Ul Abideen, DPT | PainFix Multan"'));
  assert.ok(
    seo.includes(
      '"Meet Dr. Zain Ul Abideen, DPT, Founder & Head Physiotherapist at PainFix in Multan. Explore his clinical focus, treatment approach and appointment details."',
    ),
  );
  assert.ok(!seo.includes("? doc.profile.metaTitle ||"));
  assert.ok(!seo.includes("? doc.profile.metaDescription ||"));
});

test("Dr Zain profile retains its Person, credential and clinic relationships", () => {
  const seo = source("lib/doctor-seo.ts");
  assert.ok(seo.includes('"@type": "Person"'));
  assert.ok(seo.includes('"@type": "ProfilePage"'));
  assert.ok(seo.includes('"@type": "EducationalOccupationalCredential"'));
  assert.ok(seo.includes('"@type": "Occupation"'));
  assert.ok(seo.includes('"@type": "MedicalClinic"'));
  assert.match(
    seo,
    /jobTitle: isZainProfile\\s*\\?\\s*"Founder & Head Physiotherapist"\\s*:\\s*isJalalProfile\\s*\\?\\s*"Co-Founder"\\s*:\\s*doc\\.role/s,
  );
});

test("condition pages retain canonicals and FAQ data while declaring their medical subject", () => {
  const route = source("routes/conditions.$slug.tsx");
  assert.ok(route.includes("links: canonical(path)"));
  assert.ok(route.includes("faqLd(loaderData.faqs)"));
  assert.ok(route.includes('"@type": "MedicalWebPage"'));
  assert.ok(route.includes('"@type": "MedicalCondition"'));
  assert.ok(route.includes('publisher: { "@id": `${SITE_URL}/#clinic` }'));
  assert.ok(route.includes("name: loaderData.title"));
  assert.ok(route.includes("description: loaderData.summary"));
});
