import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL("../" + path, import.meta.url), "utf8");

test("root clinic entity and local SEO clinic entity publish the same Multan hours", async () => {
  const root = await read("src/routes/__root.tsx");
  const local = await read("src/lib/local-seo.ts");
  for (const [name, source] of [["root", root], ["local SEO", local]]) {
    assert.match(source, /dayOfWeek: \["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"\]/, name);
    assert.match(source, /opens: "11:00"/, name);
    assert.match(source, /closes: "16:00"/, name);
    assert.match(source, /MedicalClinic/, name);
  }
});
