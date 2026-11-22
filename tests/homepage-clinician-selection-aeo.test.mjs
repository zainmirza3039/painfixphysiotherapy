import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repo = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, repo), "utf8");

test("homepage answers how to choose a physiotherapist with verifiable decision criteria", async () => {
  const faqs = await read("src/components/site/home-faqs.ts");
  assert.match(faqs, /How should I choose a physiotherapist in Multan\?/);
  assert.match(faqs, /published qualification/);
  assert.match(faqs, /relevant clinical experience/);
  assert.match(faqs, /history and movement assessment/);
  assert.match(faqs, /treatment goals and options will be explained/);
  assert.match(faqs, /DPT clinicians' profiles and areas of practice/);
  assert.doesNotMatch(faqs, /best physiotherapist in Multan|guaranteed results|number one/i);
});

test("homepage exposes the same FAQ content to visible UI and structured data", async () => {
  const homepage = await read("src/routes/index.tsx");
  const faqComponent = await read("src/components/site/FAQ.tsx");
  assert.match(homepage, /faqLd\(homeFaqs\.map\(\(f\) => \(\{ q: f\.q, a: f\.a \}\)\)\)/);
  assert.match(homepage, /<FAQ \/>/);
  assert.match(faqComponent, /homeFaqs/);
});
