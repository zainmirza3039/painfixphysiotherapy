import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { SERVICE_FEES } from "../src/data/serviceFees.ts";

const repo = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, repo), "utf8");

test("shared fee source contains only the three owner-confirmed amounts", () => {
  assert.deepEqual(
    Object.values(SERVICE_FEES).map(({ name, amount, displayPrice, currency }) => ({
      name,
      amount,
      displayPrice,
      currency,
    })),
    [
      { name: "In-clinic fee", amount: 2000, displayPrice: "PKR 2,000", currency: "PKR" },
      { name: "Home visit fee", amount: 2500, displayPrice: "PKR 2,500", currency: "PKR" },
      {
        name: "Video consultation",
        amount: 1000,
        displayPrice: "PKR 1,000",
        currency: "PKR",
      },
    ],
  );
  assert.equal(SERVICE_FEES.homeVisit.description, "Includes one treatment session and travel.");
});

test("homepage, home-visit page, schema, and public guide use the shared fee data", async () => {
  const [homepage, homeVisit, schema, translations, llms] = await Promise.all([
    read("src/components/site/ConsultationFees.tsx"),
    read("src/routes/home-visit.tsx"),
    read("src/routes/__root.tsx"),
    read("src/i18n/translations.ts"),
    read("public/llms.txt"),
  ]);
  assert.match(homepage, /SERVICE_FEES\.clinic/);
  assert.match(homepage, /SERVICE_FEES\.homeVisit/);
  assert.match(homepage, /SERVICE_FEES\.video/);
  assert.match(homeVisit, /SERVICE_FEES\.homeVisit\.displayPrice/);
  assert.match(schema, /Object\.values\(SERVICE_FEES\)\.map/);
  assert.doesNotMatch(schema, /priceRange:/);
  assert.match(llms, /In-clinic fee: PKR 2,000/);
  assert.match(llms, /Home visit fee: PKR 2,500; includes one treatment session and travel/);
  assert.match(llms, /Video consultation: PKR 1,000/);
  assert.match(translations, /inclusions: "Includes one treatment session and travel\."/);
  assert.match(translations, /inclusions: "اس فیس میں ایک علاج کا سیشن اور سفر شامل ہے۔"/);
  assert.doesNotMatch(
    translations,
    /travel charges may apply|follow-up session fee|monthly rehabilitation packages/i,
  );
});

test("public local content does not assert unsourced review ratings or outcomes", async () => {
  const [localPages, feedbackPage, testimonials, reviews] = await Promise.all([
    read("src/data/localPages.ts"),
    read("src/routes/success-stories.tsx"),
    read("src/components/site/Testimonials.tsx"),
    read("src/components/site/GoogleReviews.tsx"),
  ]);
  assert.doesNotMatch(
    localPages,
    /4\.9★|31 reviews|44 reviews|real, verified patients|verified Google reviews|genuine reviews|strong, consistent outcomes/i,
  );
  assert.doesNotMatch(
    feedbackPage,
    /representative|recovery journeys|genuine reviews|anonymised patient stories/i,
  );
  assert.doesNotMatch(testimonials, /Ahmed R\.|Sana M\.|five out of five|Google Review/);
  assert.match(testimonials, /GoogleReviews/);
  assert.match(reviews, /GOOGLE_BUSINESS_PROFILE_URL/);
  assert.match(reviews, /Reviews and\s+ratings are kept on Google/);
});

test("static Dr Jalal fallback uses the clinic's confirmed display and WhatsApp number", async () => {
  const team = await read("src/data/team.ts");
  const jalal = team.match(
    /slug: "dr-jalal-ud-din-pt-multan",[\s\S]{0,180}?phoneDisplay: "([^"]+)",[\s\S]{0,60}?whatsapp: "([^"]+)"/,
  );
  assert.ok(jalal, "Dr Jalal static fallback contact fields should remain present");
  assert.deepEqual(jalal.slice(1), ["0314-3039582", "923143039582"]);
  assert.doesNotMatch(team, /0317-0356265|923170356265/);
});

test("site footer renders the shared clinic-hours source instead of hardcoded timing copy", async () => {
  const footer = await read("src/components/site/Footer.tsx");
  const constants = await read("src/components/site/constants.ts");
  assert.match(footer, /OPENING_HOURS\.map/);
  assert.match(constants, /days: "Monday – Saturday", time: "11:00 AM – 4:00 PM"/);
  assert.match(constants, /days: "Sunday", time: "By Appointment"/);
  assert.doesNotMatch(footer, /11:00 AM.{0,20}9:00 PM/i);
});

test("AI discovery facts identify the clinic and distinguish clinic-based from online-only clinicians", async () => {
  const [root, localSeo, doctorSeo, llms] = await Promise.all([
    read("src/routes/__root.tsx"),
    read("src/lib/local-seo.ts"),
    read("src/lib/doctor-seo.ts"),
    read("public/llms.txt"),
  ]);
  for (const slug of [
    "dr-zain-ul-abideen-pt-multan",
    "dr-jalal-ud-din-pt-multan",
    "dr-fatima-iqbal-dpt-multan",
  ]) {
    assert.match(root, new RegExp(slug + "#person"));
    assert.match(localSeo, new RegExp(slug + "#person"));
    assert.match(llms, new RegExp(slug));
  }
  assert.match(doctorSeo, /\$\{url\}#person/);
  assert.match(doctorSeo, /worksFor/);
  assert.match(llms, /Primary local-intent page/);
  assert.match(llms, /Google Business Profile/);
  assert.match(llms, /online service; it should not be interpreted as a PainFix physical clinic/);
  assert.match(llms, /Monday–Saturday, 11:00 AM–4:00 PM Pakistan Standard Time/);
});
