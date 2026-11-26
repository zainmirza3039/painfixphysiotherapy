import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repo = new URL("../", import.meta.url);

test("retired physiotherapist local page redirects to the homepage that owns local discovery", async () => {
  const [route, homepage] = await Promise.all([
    readFile(new URL("src/routes/physiotherapist-in-multan.tsx", repo), "utf8"),
    readFile(new URL("src/routes/index.tsx", repo), "utf8"),
  ]);

  assert.match(route, /redirect\(\{ to: "\/" \}\)/);
  assert.match(homepage, /Best Physiotherapist in Multan \| PainFix Clinic/);
  assert.match(homepage, /rel: "canonical"/);
});
