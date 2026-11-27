import assert from "node:assert/strict";
import test from "node:test";
import { blogPosts } from "../src/data/blog.ts";

const newSlugs = [
  "first-physiotherapy-appointment-multan",
  "chronic-pain-physiotherapy-without-surgery-multan",
  "physiotherapy-services-explained-multan",
  "choosing-painfix-physiotherapy-clinic-multan",
  "movement-based-physiotherapy-approach-multan",
];

test("five PainFix Multan guides are present with complete SEO metadata", () => {
  for (const slug of newSlugs) {
    const post = blogPosts.find((item) => item.slug === slug);
    assert.ok(post, `Missing article: ${slug}`);
    assert.ok(post.title.length > 20);
    assert.ok(post.seoTitle.length > 15 && post.seoTitle.length <= 70);
    assert.ok(post.metaDescription.length > 80 && post.metaDescription.length <= 170);
    assert.ok(post.quickAnswer.length > 100);
    assert.ok(post.sections.length >= 6);
    assert.ok(post.faqs.length >= 3);
    assert.equal(post.date, "2026-11-28");
    assert.equal(post.updated, "2026-11-28");
    assert.equal(post.authorKey, "ZA");
  }
});

test("new PainFix articles use only valid service and condition references", async () => {
  const [{ services }, { conditions }] = await Promise.all([
    import("../src/data/services.ts"),
    import("../src/data/conditions.ts"),
  ]);
  const serviceSlugs = new Set(services.map((item) => item.slug));
  const conditionSlugs = new Set(conditions.map((item) => item.slug));
  for (const slug of newSlugs) {
    const post = blogPosts.find((item) => item.slug === slug);
    for (const service of post.relatedServices) {
      assert.ok(serviceSlugs.has(service), `Unknown service ${service} in ${slug}`);
    }
    for (const condition of post.relatedConditions) {
      assert.ok(conditionSlugs.has(condition), `Unknown condition ${condition} in ${slug}`);
    }
  }
});

test("clinical copy avoids unsupported structural-reset and guaranteed-surgery claims", () => {
  const posts = blogPosts.filter((item) => newSlugs.includes(item.slug));
  const text = posts.flatMap((post) => [
    post.quickAnswer,
    post.excerpt,
    ...post.sections.flatMap((section) => [section.heading ?? "", ...section.paragraphs]),
    ...post.faqs.flatMap((faq) => [faq.q, faq.a]),
  ]).join(" ").toLowerCase();
  assert.doesNotMatch(text, /hyderabad/);
  assert.match(text, /does not mean|does not claim|not a permanent|not be described|not intended/);
  assert.match(text, /surgery/);
  assert.match(text, /urgent medical|medical assessment|medical referral/);
});
