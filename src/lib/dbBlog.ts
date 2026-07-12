import type { BlogPost, BlogSection } from "@/data/blog";
import { blogCategoryMap } from "@/data/blog";
import type { PublicDbPost } from "./blog.functions";
import { slugify } from "@/admin/utils";

/** Split free-text CMS content into renderable paragraphs / sections. */
function toSections(content: string | null, title: string): BlogSection[] {
  if (!content) return [{ paragraphs: [] }];
  const blocks = content
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);
  const source =
    blocks.length > 1
      ? blocks
      : content
          .split(/\n/)
          .map((b) => b.trim())
          .filter(Boolean);
  // Drop a leading paragraph that merely repeats the title.
  const paragraphs = source.filter((p) => p.toLowerCase() !== title.toLowerCase());
  return [{ paragraphs: paragraphs.length ? paragraphs : source }];
}

/** Resolve a CMS category string to a known category slug (or a slugified fallback). */
export function dbCategorySlug(category: string | null): string {
  if (!category) return "patient-education";
  const raw = category.trim();
  const slug = slugify(raw);
  if (blogCategoryMap[slug]) return slug;
  // Match by display name too (e.g. "Back Pain" → "back-pain").
  const byName = Object.values(blogCategoryMap).find(
    (c) => c.name.toLowerCase() === raw.toLowerCase(),
  );
  return byName?.slug ?? slug;
}

/**
 * Convert a published CMS post into the BlogPost shape used across the public UI
 * (cards, category pages, article page). CMS posts carry `source: "cms"` so
 * components can prefer the uploaded featured image and skip static-only chrome.
 */
export function dbPostToBlogPost(row: PublicDbPost): BlogPost {
  const categorySlug = dbCategorySlug(row.category);
  const date = row.publish_at ?? row.created_at;
  return {
    slug: row.slug,
    title: row.title,
    seoTitle: row.seo_title?.trim() || row.title,
    metaDescription: row.meta_description?.trim() || row.excerpt?.trim() || row.title,
    category: categorySlug,
    categoryName: blogCategoryMap[categorySlug]?.name ?? row.category ?? "Article",
    tags: row.tags ?? [],
    excerpt: row.excerpt?.trim() || row.meta_description?.trim() || "",
    quickAnswer: row.excerpt?.trim() || row.meta_description?.trim() || "",
    date,
    updated: row.updated_at ?? date,
    authorKey: "ZA",
    authorName: row.author?.trim() || undefined,
    heroImage: row.featured_image?.trim() || undefined,
    sections: toSections(row.content, row.title),
    faqs: [],
    keyTakeaways: [],
    relatedServices: [],
    relatedConditions: [],
    source: "cms",
  };
}

/**
 * Merge static posts with CMS posts, newest first.
 * If a slug exists in both, the CMS version wins (it is the editable source of truth).
 */
export function mergeBlogPosts(staticPosts: BlogPost[], dbPosts: BlogPost[]): BlogPost[] {
  const bySlug = new Map<string, BlogPost>();
  for (const p of staticPosts) bySlug.set(p.slug, p);
  for (const p of dbPosts) bySlug.set(p.slug, p);
  return [...bySlug.values()].sort((a, b) => +new Date(b.date) - +new Date(a.date));
}
