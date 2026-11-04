import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repo = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, repo), "utf8");

test("sitemap only advertises blog category archives with at least three articles", async () => {
  const sitemap = await read("src/routes/sitemap[.]xml.ts");
  assert.match(sitemap, /categoryPostCounts/);
  assert.match(sitemap, /categoryPostCounts\.get\(c\.slug\) \?\? 0\) >= 3/);
  assert.match(sitemap, /category: p\.category/);
  assert.match(sitemap, /blogCategories[\s\S]*?\.filter\(\(c\)/);
});

test("thin blog category archives are noindex,follow while useful archives remain indexable", async () => {
  const route = await read("src/routes/blog.category.$category.tsx");
  assert.match(route, /loaderData\.posts\.length < 3/);
  assert.match(route, /noindex,follow/);
  assert.match(route, /canonical\(path\)/);
});
