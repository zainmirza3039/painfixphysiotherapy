import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repo = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, repo), "utf8");

test("physiotherapist choice article targets informational intent, not the local booking query", async () => {
  const source = await read("src/data/blog.ts");
  const start = source.indexOf('slug: "best-physiotherapist-in-multan"');
  assert.notEqual(start, -1);
  const end = source.indexOf("\n  },", start);
  const article = source.slice(start, end);

  assert.ok(article.includes('title: "How to Choose the Right Physiotherapist in Multan"'));
  assert.ok(article.includes('seoTitle: "How to Choose a Physiotherapist in Multan | PainFix"'));
  assert.match(article, /updated: "2026-11-11"/);
  assert.match(article, /choose a physiotherapist in Multan/i);
  assert.match(article, /professional credentials/i);
  assert.match(article, /active rehabilitation/i);
  assert.match(article, /reviewed against meaningful outcomes/i);
  assert.match(article, /warning signs/i);
  assert.match(article, /home physiotherapy visits across Multan/i);
  assert.doesNotMatch(article, /selected home-visit options|selected home visits/i);
  assert.doesNotMatch(article, /seoTitle: "Best Physiotherapist in Multan/);
});

test("Kamar Dard exercise guide targets the exercise query with practical safety guidance", async () => {
  const source = await read("src/data/blog.ts");
  const start = source.indexOf('slug: "best-exercises-for-lower-back-pain"');
  assert.notEqual(start, -1);
  const end = source.indexOf("\n  },", start);
  const article = source.slice(start, end);

  assert.ok(article.includes('title: "Kamar Dard Ki 6 Exercises: Reps, Form & Safety"'));
  assert.ok(
    article.includes('seoTitle: "Kamar Dard Ki 6 Exercises: Reps & Sahi Tareeqa | PainFix"'),
  );
  assert.match(article, /updated: "2026-11-13"/);
  assert.match(article, /Kamar dard ki exercise/i);
  assert.match(article, /step-by-step positions, repetitions and safety tips/i);
  assert.match(article, /1–2 comfortable movements/);
  assert.match(article, /leg symptoms ka aur neeche spread hona/);
  assert.match(article, /Kya mujhe tamam 6 exercises ek hi waqt karni chahiye/);

  const safetyStart = source.indexOf('slug: "safe-kamar-dard-exercises"');
  assert.notEqual(safetyStart, -1);
  const safetyEnd = source.indexOf("\n  },", safetyStart);
  const safetyArticle = source.slice(safetyStart, safetyEnd);
  assert.ok(
    safetyArticle.includes('seoTitle: "Kamar Dard Exercise Safety: Stop Signals | PainFix"'),
  );
  assert.doesNotMatch(safetyArticle, /tags: \[[\s\S]*?kamar dard ki exercise/);
  const articleRoute = await read("src/routes/blog.$slug.tsx");
  assert.match(articleRoute, /slug: "safe-kamar-dard-exercises"/);
});

test("broad Multan landing URLs consolidate to homepage and home-visit", async () => {
  const config = JSON.parse(await read("vercel.json"));
  for (const source of [
    "/best-physiotherapist-in-multan",
    "/physiotherapist-in-multan",
    "/physiotherapy-in-multan",
    "/physiotherapy-clinic-in-multan",
  ]) {
    assert.ok(
      config.redirects.some(
        (rule) => rule.source === source && rule.destination === "/" && rule.permanent === true,
      ),
    );
  }
  assert.ok(
    config.redirects.some(
      (rule) =>
        rule.source === "/services/home-physiotherapy" &&
        rule.destination === "/home-visit" &&
        rule.permanent === true,
    ),
  );
  const sitemap = await read("src/routes/sitemap[.]xml.ts");
  assert.match(sitemap, /redirectedLandingPaths\.has\(entry\.path\)/);
  for (const path of [
    "/best-physiotherapist-in-multan",
    "/physiotherapist-in-multan",
    "/physiotherapy-in-multan",
    "/physiotherapy-clinic-in-multan",
    "/services/home-physiotherapy",
  ]) {
    assert.ok(sitemap.includes(path));
  }
});

test("sitemap remains available when optional dynamic listings fail", async () => {
  const sitemap = await read("src/routes/sitemap[.]xml.ts");
  assert.match(sitemap, /clinicianSlugs = \[\]/);
  assert.match(sitemap, /internshipEntries = \[\]/);
  assert.doesNotMatch(sitemap, /status: 503/);
});

test("service and condition hubs route broad local discovery links to the homepage", async () => {
  const services = await read("src/routes/services.index.tsx");
  const conditions = await read("src/routes/conditions.index.tsx");
  assert.ok(services.includes('to="/"'));
  assert.ok(conditions.includes('to="/"'));
  assert.ok(!services.includes('to="/physiotherapy-in-multan"'));
  assert.ok(!conditions.includes('to="/physiotherapy-in-multan"'));
});

test("homepage owns broad local discovery while booking remains separate", async () => {
  const homepage = await read("src/routes/index.tsx");
  const config = JSON.parse(await read("vercel.json"));
  assert.ok(
    homepage.includes('const TITLE = "Physiotherapist in Multan | PainFix Physiotherapy Clinic"'),
  );
  assert.ok(
    config.redirects.some(
      (rule) => rule.source === "/physiotherapist-in-multan" && rule.destination === "/",
    ),
  );
  const booking = await read("src/routes/book-appointment.tsx");
  assert.ok(booking.length > 0);
});

test("slipped-disc search intent maps to the existing slipped-disc condition route", async () => {
  const conditions = await read("src/data/conditions.ts");
  const ownershipPlan = await read("docs/seo/keyword-to-url-ownership-plan-2026-11.md");

  assert.match(conditions, /slug: "slipped-disc"/);
  assert.ok(
    ownershipPlan.includes(
      String.fromCharCode(96) + "/conditions/slipped-disc" + String.fromCharCode(96),
    ),
  );
  assert.doesNotMatch(ownershipPlan, /do not create a separate slipped-disc URL/i);
});

test("clinic-location page avoids unsupported facility claims and stays distinct from service information", async () => {
  const localPages = await read("src/data/localPages.ts");
  const clinicStart = localPages.indexOf('slug: "physiotherapy-clinic-in-multan"');
  assert.notEqual(clinicStart, -1);
  const clinicEnd = localPages.indexOf("\n  },", clinicStart);
  const clinicPage = localPages.slice(clinicStart, clinicEnd);

  assert.ok(clinicPage.includes('title: "Physiotherapy Clinic in Multan"'));
  assert.ok(clinicPage.includes("Usman Raja Market"));
  assert.ok(clinicPage.includes("Sunday by appointment"));
  assert.doesNotMatch(
    clinicPage,
    /modern, fully equipped|everything your recovery needs|modern equipment/i,
  );
});

test("local Multan landing pages describe home visits as available citywide", async () => {
  const localPages = await read("src/data/localPages.ts");
  const homeVisit = await read("src/routes/home-visit.tsx");

  assert.match(localPages, /Home physiotherapy visits available across Multan/);
  assert.match(localPages, /requested from any area of Multan/);
  assert.doesNotMatch(
    localPages,
    /Selected home visits|Selected home physiotherapy visits|selected home visits/i,
  );
  assert.match(homeVisit, /PainFix provides home physiotherapy visits across Multan/);
  assert.match(homeVisit, /تمام علاقوں میں گھر پر فزیوتھراپی وزٹس/);
});

test("lower-back exercise article includes accessible, attributed exercise images", async () => {
  const gallery = await read("src/components/site/LowerBackExerciseGallery.tsx");
  const articleRoute = await read("src/routes/blog.$slug.tsx");
  assert.match(articleRoute, /LowerBackExerciseGallery/);
  assert.match(gallery, /loading="lazy"/);
  assert.match(gallery, /alt: "CDC animation showing a pelvic tilt/);
  assert.match(gallery, /CC BY-SA 4\.0/);
  assert.match(gallery, /Bird-dog/);
});


test("blog authorship is distinct from explicitly documented medical review", async () => {
  const route = await read("src/routes/blog.$slug.tsx");
  const authorCard = await read("src/components/site/AuthorCard.tsx");
  const dbBlog = await read("src/lib/dbBlog.ts");

  assert.match(route, /const reviewerKey = post\.medicalReviewerKey/);
  assert.match(route, /reviewerKey !== post\.authorKey/);
  assert.match(route, /authorName=\{post\.authorName\}/);
  assert.match(authorCard, /Written by/);
  assert.match(authorCard, /Medically reviewed by/);
  assert.match(authorCard, /Last updated:/);
  assert.doesNotMatch(authorCard, /Last reviewed and updated/);
  assert.match(dbBlog, /authorKey: ""/);
  assert.match(dbBlog, /medicalReviewerKey: row\.medical_reviewer_key/);
});

test("Dr Zain profile links to existing service and condition routes without changing profile claims", async () => {
  const profile = await read("src/components/site/DoctorProfile.tsx");
  assert.match(profile, /Physiotherapy Services & Conditions/);
  for (const slug of ["manual-therapy", "exercise-therapy", "sports-rehabilitation", "home-physiotherapy"]) {
    assert.ok(profile.includes(`["${slug}"`));
  }
  for (const slug of ["back-pain", "neck-pain", "sciatica", "slipped-disc", "frozen-shoulder"]) {
    assert.ok(profile.includes(`["${slug}"`));
  }
  assert.match(profile, /Clinic Information/);
});
