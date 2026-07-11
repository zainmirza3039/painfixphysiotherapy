// Lightweight, dependency-free site search index + matcher.
// The index is built lazily (only when the search dialog first opens) from the
// static content data files, so it adds nothing to the initial bundle and has
// zero SSR / Core Web Vitals cost.

export type SearchCategory =
  | "Services"
  | "Conditions"
  | "Blog Articles"
  | "FAQs"
  | "Doctors"
  | "Resources";

export interface SearchItem {
  id: string;
  title: string;
  subtitle?: string;
  category: SearchCategory;
  /** Destination path. May contain a "#hash" for on-page sections. */
  href: string;
  /** Extra searchable text (not displayed). */
  keywords: string;
}

/** Category display order in the results list. */
export const CATEGORY_ORDER: SearchCategory[] = [
  "Services",
  "Conditions",
  "Blog Articles",
  "FAQs",
  "Doctors",
  "Resources",
];

let cache: SearchItem[] | null = null;

/** Build (and memoize) the full search index from the content data files. */
export async function buildSearchIndex(): Promise<SearchItem[]> {
  if (cache) return cache;

  const [{ services }, { conditions }, { blogPosts }, { team }, { localPages }] = await Promise.all([
    import("@/data/services"),
    import("@/data/conditions"),
    import("@/data/blog"),
    import("@/data/team"),
    import("@/data/localPages"),
  ]);

  const items: SearchItem[] = [];

  // Services + their FAQs
  for (const s of services) {
    items.push({
      id: `service-${s.slug}`,
      title: s.title,
      subtitle: s.tagline,
      category: "Services",
      href: `/services/${s.slug}`,
      keywords: [...s.conditionsTreated, ...s.benefits, s.metaDescription].join(" "),
    });
    for (const [i, f] of s.faqs.entries()) {
      items.push({
        id: `service-${s.slug}-faq-${i}`,
        title: f.q,
        subtitle: `${s.title} · FAQ`,
        category: "FAQs",
        href: `/services/${s.slug}`,
        keywords: f.a,
      });
    }
  }

  // Conditions + their FAQs
  for (const c of conditions) {
    items.push({
      id: `condition-${c.slug}`,
      title: c.title,
      subtitle: c.metaDescription,
      category: "Conditions",
      href: `/conditions/${c.slug}`,
      keywords: [...c.symptoms, ...c.causes, ...c.riskFactors].join(" "),
    });
    for (const [i, f] of c.faqs.entries()) {
      items.push({
        id: `condition-${c.slug}-faq-${i}`,
        title: f.q,
        subtitle: `${c.title} · FAQ`,
        category: "FAQs",
        href: `/conditions/${c.slug}`,
        keywords: f.a,
      });
    }
  }

  // Blog articles + their FAQs
  for (const p of blogPosts) {
    items.push({
      id: `blog-${p.slug}`,
      title: p.title,
      subtitle: p.excerpt,
      category: "Blog Articles",
      href: `/blog/${p.slug}`,
      keywords: [...p.tags, p.quickAnswer].join(" "),
    });
    for (const [i, f] of p.faqs.entries()) {
      items.push({
        id: `blog-${p.slug}-faq-${i}`,
        title: f.q,
        subtitle: `${p.title} · FAQ`,
        category: "FAQs",
        href: `/blog/${p.slug}`,
        keywords: f.a,
      });
    }
  }

  // Doctor profiles
  for (const m of team) {
    items.push({
      id: `doctor-${m.initials}`,
      title: m.name,
      subtitle: m.role,
      category: "Doctors",
      href: "/#doctors",
      keywords: [...m.specialties, m.credentials, m.bio].join(" "),
    });
  }

  // Patient resources / key pages
  for (const l of localPages) {
    items.push({
      id: `local-${l.slug}`,
      title: l.title,
      subtitle: l.eyebrow,
      category: "Resources",
      href: `/${l.slug}`,
      keywords: l.title,
    });
  }
  items.push(
    {
      id: "resource-home-visit",
      title: "Home Physiotherapy (Home Visit)",
      subtitle: "Book professional physiotherapy at home in Multan",
      category: "Resources",
      href: "/home-visit",
      keywords: "home visit domiciliary bedside care elderly stroke rehab at home",
    },
    {
      id: "resource-blog",
      title: "Blog & Patient Resources",
      subtitle: "Evidence-based physiotherapy articles and guides",
      category: "Resources",
      href: "/blog",
      keywords: "articles guides education resources knowledge hub",
    },
    {
      id: "resource-contact",
      title: "Contact & Directions",
      subtitle: "Address, phone, WhatsApp and Google Maps",
      category: "Resources",
      href: "/#contact",
      keywords: "contact address phone whatsapp map directions location multan",
    },
    {
      id: "resource-book",
      title: "Book an Appointment",
      subtitle: "Schedule your assessment",
      category: "Resources",
      href: "/#book",
      keywords: "book appointment schedule booking calendly",
    },
  );

  cache = items;
  return items;
}

/** Bounded Levenshtein distance — returns early once it exceeds `max`. */
function levenshtein(a: string, b: string, max: number): number {
  const al = a.length;
  const bl = b.length;
  if (Math.abs(al - bl) > max) return max + 1;
  let prev = Array.from({ length: bl + 1 }, (_, i) => i);
  for (let i = 1; i <= al; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      cur[j] = v;
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
    prev = cur;
  }
  return prev[bl];
}

/** True if `term` is an in-order subsequence of `text` (partial fuzzy match). */
function isSubsequence(term: string, text: string): boolean {
  let i = 0;
  for (let j = 0; j < text.length && i < term.length; j++) {
    if (text[j] === term[i]) i++;
  }
  return i === term.length;
}

/** Typo tolerance: any word in `text` within Levenshtein `tol` of `term`. */
function hasTypoMatch(term: string, words: string[], tol: number): boolean {
  for (const w of words) {
    if (Math.abs(w.length - term.length) > tol) continue;
    if (levenshtein(term, w, tol) <= tol) return true;
  }
  return false;
}

interface Scored {
  item: SearchItem;
  score: number;
}

/**
 * Rank items for a query. Every whitespace-separated term must match somewhere
 * (title, subtitle or keywords) via exact substring, prefix, subsequence, or a
 * small edit distance for typo tolerance. Higher score = better match.
 */
export function searchItems(items: SearchItem[], query: string, limit = 24): SearchItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);

  const results: Scored[] = [];

  for (const item of items) {
    const title = item.title.toLowerCase();
    const sub = (item.subtitle ?? "").toLowerCase();
    const hay = `${title} ${sub} ${item.keywords.toLowerCase()}`;
    const titleWords = title.split(/[^a-z0-9]+/).filter(Boolean);

    let total = 0;
    let matchedAll = true;

    for (const t of terms) {
      let best = 0;
      const tol = t.length >= 6 ? 2 : t.length >= 4 ? 1 : 0;

      if (title.startsWith(t)) best = 120;
      else if (title.includes(t)) best = 90;
      else if (sub.includes(t)) best = 55;
      else if (hay.includes(t)) best = 40;
      else if (tol > 0 && hasTypoMatch(t, titleWords, tol)) best = 30;
      else if (isSubsequence(t, title)) best = 22;
      else if (isSubsequence(t, hay)) best = 14;

      if (best === 0) {
        matchedAll = false;
        break;
      }
      total += best;
    }

    if (matchedAll) results.push({ item, score: total });
  }

  results.sort((a, b) => b.score - a.score || a.item.title.length - b.item.title.length);
  return results.slice(0, limit).map((r) => r.item);
}
