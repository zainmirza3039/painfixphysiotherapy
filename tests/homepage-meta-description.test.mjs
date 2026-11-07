import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repo = new URL("../", import.meta.url);

test("homepage meta description is concise and includes primary local intent", async () => {
  const homepage = await readFile(new URL("src/routes/index.tsx", repo), "utf8");
  const match = homepage.match(/const DESCRIPTION =\s*"([^"]+)";/);
  assert.ok(match, "homepage DESCRIPTION constant should exist");
  assert.ok(match[1].length <= 160, `description is ${match[1].length} characters`);
  assert.match(match[1], /Physiotherapy Clinic/);
  assert.match(match[1], /Multan/);
  assert.match(match[1], /back pain/);
  assert.match(match[1], /home visits/);
});
