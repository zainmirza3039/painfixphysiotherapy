import type { Faq } from "./services";

export interface LocalSection {
  heading: string;
  paragraphs: string[];
  list?: string[];
}

export interface LocalPage {
  slug: string;
  eyebrow: string;
  /** H1 */
  title: string;
  metaTitle: string;
  metaDescription: string;
  heroSubtitle: string;
  /** 40–80 word direct answer for AEO / AI Overviews. */
  quickAnswer: string;
  keyTakeaways: string[];
  sections: LocalSection[];
  serviceSlugs: string[];
  conditionSlugs: string[];
  blogSlugs: string[];
  faqs: Faq[];
}

/**
 * Multan city-intent landing pages were consolidated on the homepage to avoid
 * competing URLs for the same local search intent. Keep this typed collection
 * empty so retired pages cannot re-enter the sitemap or site-search index.
 */
export const localPages: LocalPage[] = [];

export const localPageMap = Object.fromEntries(localPages.map((page) => [page.slug, page]));

export function getLocalPage(slug: string): LocalPage | undefined {
  return localPageMap[slug];
}
