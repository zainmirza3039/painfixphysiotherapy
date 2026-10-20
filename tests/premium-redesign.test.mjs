import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repo = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, repo), "utf8");

test("hero makes both city pathways visible and preserves booking destinations", async () => {
  const source = await read("src/components/site/Hero.tsx");
  assert.match(source, /Choose your city/);
  assert.match(source, /Multan/);
  assert.match(source, /Rahim Yar Khan/);
  assert.match(source, /city=multan&service=clinic/);
  assert.match(source, /city=multan&service=home_visit/);
  assert.match(source, /city=rahim-yar-khan&service=online/);
  assert.match(source, /Ariba Babar DPT/);
});

test("footer makes the two service models explicit without inventing an RYK branch", async () => {
  const source = await read("src/components/site/Footer.tsx");
  assert.match(source, /Locations/);
  assert.match(source, /Multan clinic/);
  assert.match(source, /Rahim Yar Khan/);
  assert.match(source, /Online physiotherapy only/);
  assert.doesNotMatch(source, /Rahim Yar Khan (clinic|office|branch)/i);
});

test("clinical internship page routes current intake questions to WhatsApp", async () => {
  const source = await read("src/components/internships/ProgramDetail.tsx");
  assert.match(source, /current batch dates and availability/);
  assert.match(source, /Ask about current dates/);
  assert.match(source, /WHATSAPP_URL/);
  assert.doesNotMatch(source, /guaranteed employment|accreditation guaranteed/i);
});

test("global visual system uses the refined font pairing and theme tokens", async () => {
  const [styles, root] = await Promise.all([read("src/styles.css"), read("src/routes/__root.tsx")]);
  assert.match(styles, /--font-sans:\s+"Manrope"/);
  assert.match(styles, /--font-heading:\s+"Newsreader"/);
  assert.match(styles, /--background:\s+#fcfbf8/);
  assert.match(styles, /--primary:\s+#123b5a/);
  assert.match(styles, /\.dark\s*\{[\s\S]*--background:\s+#0d1b26/);
  assert.match(root, /fonts\.googleapis\.com\/css2\?family=Manrope/);
  assert.match(root, /theme-color.*#123B5A/);
});

test("public route manifest is valid JSON and includes core conversion routes", async () => {
  const source = await read("public/manus-routes.json");
  const manifest = JSON.parse(source);
  assert.ok(Array.isArray(manifest.routes));
  for (const path of [
    "/",
    "/book-appointment",
    "/internships",
    "/internships/:slug",
    "/services/:slug",
  ]) {
    assert.ok(
      manifest.routes.some((route) => route.path === path),
      `missing ${path}`,
    );
  }
  assert.ok(manifest.routes.every((route) => route.path.startsWith("/")));
});
