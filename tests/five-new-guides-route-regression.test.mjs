import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL("../" + path, import.meta.url), "utf8");
const slugs = [
  "first-physiotherapy-appointment-multan",
  "chronic-pain-physiotherapy-without-surgery-multan",
  "physiotherapy-services-explained-multan",
  "choosing-painfix-physiotherapy-clinic-multan",
  "movement-based-physiotherapy-approach-multan",
];

test("all five new SEO guides exist in static blog data", async () => {
  const blog = await read("src/data/blog.ts");
  for (const slug of slugs) assert.ok(blog.includes('slug: "' + slug + '"'), "missing " + slug);
});

test("the dynamic article route resolves slugs and sitemap maps every static blog post", async () => {
  const route = await read("src/routes/blog.$slug.tsx");
  const sitemap = await read("src/routes/sitemap[.]xml.ts");
  assert.match(route, /getBlogPostBySlug/);
  assert.match(sitemap, /blogPosts\.map\(\(p\) => \(\{/);
  assert.match(sitemap, /path: `\/blog\/\$\{p\.slug\}`/);
  for (const slug of slugs) assert.ok((await read("src/data/blog.ts")).includes(slug));
});
