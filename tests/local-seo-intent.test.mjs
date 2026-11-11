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
  assert.ok(article.includes('seoTitle: "Kamar Dard Ki Exercise: 6 Moves + Reps | PainFix"'));
  assert.match(article, /updated: "2026-11-11"/);
  assert.match(article, /Kamar dard ki exercise/i);
  assert.match(article, /starting positions, reps and safety cues/i);
  assert.match(article, /1–2 comfortable movements/);
  assert.match(article, /leg symptoms ka aur neeche spread hona/);
  assert.match(article, /Kya mujhe tamam 6 exercises ek hi waqt karni chahiye/);

  const safetyStart = source.indexOf('slug: "safe-kamar-dard-exercises"');
  assert.notEqual(safetyStart, -1);
  const safetyEnd = source.indexOf("\n  },", safetyStart);
  const safetyArticle = source.slice(safetyStart, safetyEnd);
  assert.ok(safetyArticle.includes('seoTitle: "Safe Lower-Back Exercises: Kamar Dard Guide"'));
  const articleRoute = await read("src/routes/blog.$slug.tsx");
  assert.match(articleRoute, /slug: "safe-kamar-dard-exercises"/);
});

test("root-level best physiotherapist landing URL consolidates to the homepage", async () => {
  const config = JSON.parse(await read("vercel.json"));
  assert.ok(
    config.redirects.some(
      (rule) =>
        rule.source === "/best-physiotherapist-in-multan" &&
        rule.destination === "/" &&
        rule.permanent === true,
    ),
  );
  const sitemap = await read("src/routes/sitemap[.]xml.ts");
  const localPages = await read("src/data/localPages.ts");
  assert.match(localPages, /slug: "physiotherapist-in-multan"/);
  assert.match(sitemap, /new Set\(\["\/best-physiotherapist-in-multan"\]\)/);
  assert.match(sitemap, /redirectedLandingPaths\.has\(entry\.path\)/);
  assert.doesNotMatch(sitemap, /"\/physiotherapist-in-multan"/);
});

test("sitemap remains available when optional dynamic listings fail", async () => {
  const sitemap = await read("src/routes/sitemap[.]xml.ts");
  assert.match(sitemap, /clinicianSlugs = \[\]/);
  assert.match(sitemap, /internshipEntries = \[\]/);
  assert.doesNotMatch(sitemap, /status: 503/);
});

test("Multan physiotherapy service page links to booking and home-visit journeys", async () => {
  const component = await read("src/components/site/LocalLandingPage.tsx");
  const sitemap = await read("src/routes/sitemap[.]xml.ts");
  assert.ok(component.includes('page.slug === "physiotherapy-in-multan"'));
  assert.ok(component.includes('to="/physiotherapist-in-multan"'));
  assert.ok(component.includes('to="/home-visit"'));
  assert.ok(sitemap.includes("...localPages.map"));
});

test("homepage, service-information and booking pages retain distinct page intent", async () => {
  const homepage = await read("src/routes/index.tsx");
  const localPages = await read("src/data/localPages.ts");
  assert.ok(
    homepage.includes('const TITLE = "Physiotherapist in Multan | PainFix Physiotherapy Clinic"'),
  );
  assert.ok(localPages.includes('title: "Physiotherapy Services in Multan"'));
  assert.ok(localPages.includes('metaTitle: "Physiotherapy Services in Multan | PainFix Clinic"'));
  assert.ok(localPages.includes('metaTitle: "Book a Physiotherapist in Multan | PainFix Clinic"'));
  assert.ok(localPages.includes('heading: "Physiotherapy services in Multan"'));
  assert.ok(
    localPages.includes('heading: "What happens at your first physiotherapy appointment?"'),
  );
});

test("clinic-location page avoids unsupported facility claims and stays distinct from service information", async () => {
  const localPages = await read("src/data/localPages.ts");
  const clinicStart = localPages.indexOf('slug: "physiotherapy-clinic-in-multan"');
  assert.notEqual(clinicStart, -1);
  const clinicEnd = localPages.indexOf("\\n  },", clinicStart);
  const clinicPage = localPages.slice(clinicStart, clinicEnd);

  assert.ok(clinicPage.includes('title: "Physiotherapy Clinic in Multan"'));
  assert.ok(clinicPage.includes("Usman Raja Market"));
  assert.ok(clinicPage.includes("Sunday by appointment"));
  assert.doesNotMatch(clinicPage, /modern, fully equipped|everything your recovery needs|modern equipment/i);
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

test("services and conditions hubs contextually link to the Multan physiotherapy information page", async () => {
  const services = await read("src/routes/services.index.tsx");
  const conditions = await read("src/routes/conditions.index.tsx");

  assert.match(services, /to="\/physiotherapy-in-multan"/);
  assert.match(services, /Physiotherapy in Multan/);
  assert.match(conditions, /to="\/physiotherapy-in-multan"/);
  assert.match(conditions, /physiotherapy in Multan/);
});
