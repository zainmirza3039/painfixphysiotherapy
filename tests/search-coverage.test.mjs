import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repo = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, repo), "utf8");

test("search index includes internship programme coverage and public programme loading", async () => {
  const source = await read("src/lib/searchIndex.ts");
  assert.match(source, /listInternshipPrograms/);
  assert.match(source, /id: `internship-\$\{program\.slug\}`/);
  assert.match(source, /category: "Programmes"/);
  assert.match(source, /href: `\/internships\/\$\{program\.slug\}`/);
  assert.match(source, /clinical placement physiotherapy training programme/);
  assert.match(source, /id: "resource-internships"/);
  assert.match(source, /href: "\/internships"/);
});

test("search index includes certificate verification methods and route", async () => {
  const source = await read("src/lib/searchIndex.ts");
  assert.match(source, /id: "resource-certificate-verification"/);
  assert.match(source, /title: "Certificate Verification"/);
  assert.match(source, /href: "\/verify-certificate"/);
  assert.match(source, /validation method methods/);
  assert.match(source, /reference number authenticity/);
});

test("search synonyms bridge internship and verification wording", async () => {
  const source = await read("src/lib/searchSynonyms.ts");
  assert.match(source, /\["internship", "intern", "clinical placement"/);
  assert.match(source, /\["verify", "verification", "validate", "validation"/);
});
