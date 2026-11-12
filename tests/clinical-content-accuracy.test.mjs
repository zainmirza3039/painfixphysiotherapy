import assert from "node:assert/strict";
import test from "node:test";
import { blogPosts } from "../src/data/blog.ts";

const post = (slug) => {
  const found = blogPosts.find((item) => item.slug === slug);
  assert.ok(found, `Expected article slug to remain available: ${slug}`);
  return found;
};

const articleText = (slug) => {
  const item = post(slug);
  return [
    item.quickAnswer,
    item.excerpt,
    ...item.sections.flatMap((section) => [
      section.heading ?? "",
      ...section.paragraphs,
      ...(section.list ?? []),
    ]),
    ...item.faqs.flatMap((faq) => [faq.q, faq.a]),
    ...item.keyTakeaways,
  ].join(" ");
};

test("P3.1 clinical articles retain their existing SEO slugs and update dates", () => {
  const slugs = [
    "back-pain-treatment-in-multan",
    "how-physiotherapy-helps-sciatica",
    "disc-herniation-treatment",
    "can-physiotherapy-avoid-surgery",
    "bells-palsy-physiotherapy",
    "is-hijama-safe-benefits-and-precautions",
    "acl-rehabilitation",
    "rotator-cuff-rehabilitation",
    "frozen-shoulder-recovery-timeline",
    "pediatric-physiotherapy-guide",
    "home-physiotherapy-benefits",
    "office-ergonomics",
    "postnatal-physiotherapy",
    "electrotherapy-in-physiotherapy",
  ];

  for (const slug of slugs) {
    assert.equal(post(slug).updated, "2026-11-12", `Unexpected update date for ${slug}`);
  }
});

test("disc-herniation copy preserves conservative recovery without promising disc repositioning", () => {
  const text = articleText("disc-herniation-treatment").toLowerCase();
  assert.match(text, /improve without surgery/);
  assert.match(text, /does not mechanically reposition a disc/);
  assert.match(text, /cauda equina/);
  assert.doesNotMatch(text, /most slipped discs heal without surgery/);
});

test("Bell's palsy copy prioritises urgent assessment, timely medical care and eye protection", () => {
  const text = articleText("bells-palsy-physiotherapy").toLowerCase();
  assert.match(text, /exclude stroke/);
  assert.match(text, /within 72 hours/);
  assert.match(text, /eye protection/);
  assert.match(text, /facial rehabilitation may be considered as an adjunct/);
});

test("Hijama copy describes wet-cupping risks without calling it generally safe", () => {
  const text = articleText("is-hijama-safe-benefits-and-precautions").toLowerCase();
  assert.match(text, /blood-loss anaemia/);
  assert.match(text, /infection/);
  assert.match(text, /skin incisions and blood removal/);
  assert.doesNotMatch(text, /hijama is generally safe/);
});

test("electrotherapy claims are modality- and condition-specific", () => {
  const text = articleText("electrotherapy-in-physiotherapy").toLowerCase();
  assert.match(text, /nice advises against tens, ultrasound and interferential therapy for low back pain or sciatica/);
  assert.match(text, /never replace/);
  assert.doesNotMatch(text, /electrotherapy.*support healing/);
});

test("ACL and rotator-cuff guidance avoids fixed recovery promises", () => {
  const acl = articleText("acl-rehabilitation").toLowerCase();
  const cuff = articleText("rotator-cuff-rehabilitation").toLowerCase();
  assert.match(acl, /time alone cannot establish readiness/);
  assert.match(acl, /psychological readiness/);
  assert.match(cuff, /partial-thickness tears/);
  assert.match(cuff, /full-thickness tears/);
  assert.doesNotMatch(cuff, /8–12 weeks/);
});

test("frozen shoulder, paediatric and postnatal guidance is individualised", () => {
  const frozen = articleText("frozen-shoulder-recovery-timeline").toLowerCase();
  const paediatric = articleText("pediatric-physiotherapy-guide").toLowerCase();
  const postnatal = articleText("postnatal-physiotherapy").toLowerCase();
  assert.match(frozen, /duration varies/);
  assert.match(frozen, /irritability/);
  assert.match(paediatric, /milestone checklists are not diagnostic/);
  assert.match(postnatal, /individualised and symptom-based/);
  assert.match(postnatal, /does not need to close completely/);
});

test("home physiotherapy and ergonomics copy avoids universal prescriptions", () => {
  const home = articleText("home-physiotherapy-benefits").toLowerCase();
  const office = articleText("office-ergonomics").toLowerCase();
  assert.match(home, /not automatically equivalent to clinic care/);
  assert.match(home, /equipment needs depend/);
  assert.match(office, /no universal break interval/);
  assert.doesNotMatch(office, /elbows at about 90 degrees/);
});

test("manual therapy is described as an adjunct to active low-back rehabilitation", () => {
  const text = articleText("back-pain-treatment-in-multan").toLowerCase();
  assert.match(text, /manual therapy may be an adjunct/);
  assert.match(text, /active rehabilitation/);
  assert.doesNotMatch(text, /manual therapy.*first-line treatment/);
});

test("surgery-avoidance copy does not generalise outcomes across diagnoses", () => {
  const text = articleText("can-physiotherapy-avoid-surgery").toLowerCase();
  assert.match(text, /evidence and alternatives differ/);
  assert.match(text, /no universal trial duration/);
  assert.doesNotMatch(text, /outcomes comparable to surgery in most patients/);
});
