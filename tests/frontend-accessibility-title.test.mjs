import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = (path) => readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8");

test("home-visit floating CTA uses its visible translated label and retains readable hover text", () => {
  const fab = source("components/site/HomeVisitFab.tsx");
  assert.ok(fab.includes("aria-label={t.actions.bookHomeVisit}"));
  assert.ok(fab.includes("<span>{t.actions.bookHomeVisit}</span>"));
  assert.ok(fab.includes("hover:text-[#091b2d]"));
});

test("home-visit card and clinic home link derive their names from visible content", () => {
  const card = source("components/site/HomePhysio.tsx");
  assert.ok(!card.includes("aria-label={t.actions.requestVisit}"));
  const navbar = source("components/site/Navbar.tsx");
  assert.ok(!navbar.includes('aria-label="PainFix Physiotherapy Clinic home"'));
  assert.match(navbar, /src="\/painfix-logo-96\.webp"\s+alt=""/);
});

test("Google review accessible name includes its configurable visible label", () => {
  const review = source("components/site/GoogleReviewButton.tsx");
  assert.ok(review.includes("aria-label={`${label} (opens in a new tab)`}"));
});

test("stroke condition retains its visible title and distinct recovery metadata", () => {
  const conditions = source("data/conditions.ts");
  assert.match(
    conditions,
    /title: "Stroke Rehabilitation",[\s\S]*?metaTitle: "Stroke Rehabilitation: Symptoms & Recovery in Multan \| PainFix"/,
  );
});

test("footer retains main's newer inverse contrast treatment without obsolete overrides", () => {
  const footer = source("components/site/Footer.tsx");
  assert.ok(footer.includes("text-inverse-accent"));
  assert.ok(footer.includes("bg-white px-4 py-2 text-sm font-semibold text-brand-navy"));
  assert.ok(!footer.includes("footer-aa-green"));
  assert.ok(!source("styles.css").includes("footer-aa-green"));
});
