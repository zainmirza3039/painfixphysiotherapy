// Lightweight, dependency-free universal site search index + matcher.
// The index is built lazily (only when the search dialog or /search page first
// needs it) from the static content data files, so it adds nothing to the
// initial bundle and has zero SSR / Core Web Vitals cost.

import { serviceImages } from "@/data/serviceImages";
import { conditionImages } from "@/data/conditionImages";
import { expandQuery, stemVariants, normalize } from "./searchSynonyms";

export type SearchCategory =
  | "Services"
  | "Conditions"
  | "Doctors"
  | "Blog Articles"
  | "FAQs"
  | "Fitness"
  | "Diet"
  | "Programmes"
  | "Membership"
  | "Success Stories"
  | "Calculators"
  | "Resources"
  | "Categories"
  | "Pages";

export interface SearchItem {
  id: string;
  title: string;
  subtitle?: string;
  category: SearchCategory;
  /** Destination path. May contain a "#hash" for on-page sections. */
  href: string;
  /** Optional thumbnail (imported asset URL). Falls back to a category icon. */
  thumbnail?: string;
  /** Extra searchable text (not displayed). */
  keywords: string;
}

/** Category display order in the results list. */
export const CATEGORY_ORDER: SearchCategory[] = [
  "Services",
  "Conditions",
  "Doctors",
  "Blog Articles",
  "FAQs",
  "Fitness",
  "Programmes",
  "Diet",
  "Membership",
  "Success Stories",
  "Calculators",
  "Resources",
  "Categories",
  "Pages",
];

let cache: SearchItem[] | null = null;

/** Build (and memoize) the full search index from the content data files. */
export async function buildSearchIndex(): Promise<SearchItem[]> {
  if (cache) return cache;

  const [
    { services },
    { conditions },
    { blogPosts, blogCategories },
    { team },
    { localPages },
    { fitnessPages, FITNESS_GROUPS },
    { MEMBERSHIP_PLANS },
    { DIET_NUTRITION_ENABLED },
  ] = await Promise.all([
    import("@/data/services"),
    import("@/data/conditions"),
    import("@/data/blog"),
    import("@/data/team"),
    import("@/data/localPages"),
    import("@/data/fitness"),
    import("@/data/membership"),
    import("@/data/wellness"),
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
      thumbnail: serviceImages[s.slug],
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
      thumbnail: conditionImages[c.slug],
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

  // Doctors — link to each clinician's dedicated profile page.
  for (const m of team) {
    items.push({
      id: `doctor-${m.slug}`,
      title: m.name,
      subtitle: m.title,
      category: "Doctors",
      href: `/${m.slug}`,
      thumbnail: m.photo,
      keywords: [...m.specialties, ...m.tags, m.credentials, m.seoBio].join(" "),
    });
  }

  // Blog articles + their FAQs
  for (const p of blogPosts) {
    items.push({
      id: `blog-${p.slug}`,
      title: p.title,
      subtitle: p.excerpt,
      category: "Blog Articles",
      href: `/blog/${p.slug}`,
      keywords: [...p.tags, p.quickAnswer, p.category].join(" "),
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

  // Blog categories
  for (const c of blogCategories) {
    items.push({
      id: `blog-category-${c.slug}`,
      title: c.name,
      subtitle: c.description,
      category: "Categories",
      href: `/blog/category/${c.slug}`,
      keywords: `${c.name} articles category topic`,
    });
  }

  // Fitness & rehabilitation programmes
  const fitnessGroupMap = Object.fromEntries(FITNESS_GROUPS.map((g) => [g.category, g.title]));
  for (const f of fitnessPages) {
    const isProgramme = f.category === "programmes";
    items.push({
      id: `fitness-${f.slug}`,
      title: f.title,
      subtitle: f.heroSubtitle,
      category: isProgramme ? "Programmes" : "Fitness",
      href: `/fitness/${f.slug}`,
      keywords: [f.quickSummary, f.metaDescription, fitnessGroupMap[f.category] ?? "", "fitness exercise workout rehabilitation"].join(" "),
    });
  }

  // Diet & Nutrition — only indexed when the section is publicly enabled.
  if (DIET_NUTRITION_ENABLED) {
    const { dietMainPage, dietSubPages } = await import("@/data/wellness");
    for (const d of [dietMainPage, ...dietSubPages]) {
      const isMain = d.slug === dietMainPage.slug;
      items.push({
        id: `diet-${d.slug}`,
        title: d.title,
        subtitle: d.heroSubtitle,
        category: "Diet",
        href: isMain ? "/diet-nutrition" : `/diet-nutrition/${d.slug}`,
        keywords: [d.quickSummary, d.metaDescription, "diet nutrition meal plan"].join(" "),
      });
    }
  }

  // Membership packages
  items.push({
    id: "page-membership",
    title: "Membership & Packages",
    subtitle: "Physiotherapy and fitness membership plans",
    category: "Membership",
    href: "/membership",
    keywords: "membership packages plans pricing subscription monthly fitness",
  });
  for (const plan of MEMBERSHIP_PLANS) {
    items.push({
      id: `membership-${plan.slug}`,
      title: `${plan.name} Membership`,
      subtitle: plan.tagline,
      category: "Membership",
      href: "/membership",
      keywords: [plan.price, plan.period, ...plan.features].join(" "),
    });
  }

  // Health calculators
  const calculators: { title: string; desc: string; kw: string; href: string }[] = [
    { title: "BMI Calculator", desc: "Body Mass Index & WHO category", kw: "bmi body mass index weight height obesity healthy weight", href: "/health-calculators" },
    { title: "Calorie Calculator", desc: "Estimate daily calorie needs (TDEE)", kw: "calorie calories tdee bmr energy maintenance deficit", href: "/health-calculators" },
    { title: "Daily Water Intake Calculator", desc: "Recommended daily hydration", kw: "water hydration fluid intake litres", href: "/health-calculators" },
    { title: "Protein Intake Calculator", desc: "Daily protein target", kw: "protein macros muscle intake grams", href: "/health-calculators" },
    { title: "Ideal Weight Calculator", desc: "Healthy weight range for your height", kw: "ideal weight healthy range target weight", href: "/health-calculators" },
  ];
  for (const c of calculators) {
    items.push({
      id: `calc-${c.title.toLowerCase().replace(/\s+/g, "-")}`,
      title: c.title,
      subtitle: c.desc,
      category: "Calculators",
      href: c.href,
      keywords: `${c.kw} calculator health tool`,
    });
  }

  // Local / resource pillar pages
  for (const l of localPages) {
    items.push({
      id: `local-${l.slug}`,
      title: l.title,
      subtitle: l.eyebrow,
      category: "Resources",
      href: `/${l.slug}`,
      keywords: [l.metaDescription, l.quickAnswer].join(" "),
    });
  }

  // Key resources / pages
  items.push(
    {
      id: "resource-home-visit",
      title: "Home Physiotherapy (Home Visit)",
      subtitle: "Book professional physiotherapy at home in Multan",
      category: "Resources",
      href: "/home-visit",
      keywords: "home visit domiciliary bedside care elderly stroke rehab at home physiotherapy",
    },
    {
      id: "resource-fitness-rehab",
      title: "Personalised Fitness & Rehabilitation",
      subtitle: "Physiotherapist-led exercise and rehab programmes",
      category: "Fitness",
      href: "/fitness-rehabilitation",
      keywords: "fitness rehabilitation strength mobility injury prevention exercise",
    },
    {
      id: "resource-fitness-assessment",
      title: "Fitness Assessment",
      subtitle: "Movement and fitness screening",
      category: "Fitness",
      href: "/fitness-assessment",
      keywords: "fitness assessment screening movement test",
    },
    {
      id: "resource-fitness-resources",
      title: "Educational Fitness Resources",
      subtitle: "Guides, tips and exercise education",
      category: "Resources",
      href: "/fitness-resources",
      keywords: "educational resources guides tips exercise library knowledge",
    },
    {
      id: "resource-success-stories",
      title: "Patient Success Stories",
      subtitle: "Real recovery journeys",
      category: "Success Stories",
      href: "/success-stories",
      keywords: "success stories testimonials reviews recovery journeys results outcomes",
    },
    {
      id: "resource-health-calculators",
      title: "Health Tools & Calculators",
      subtitle: "BMI, calorie, water, protein & ideal-weight tools",
      category: "Calculators",
      href: "/health-calculators",
      keywords: "health tools calculators bmi calorie water protein ideal weight",
    },
    {
      id: "resource-gallery",
      title: "Clinic Gallery",
      subtitle: "Photos of our Multan physiotherapy clinic",
      category: "Resources",
      href: "/#gallery",
      keywords: "gallery photos clinic images treatment rooms equipment multan",
    },
  );

  // Core navigation pages
  items.push(
    { id: "page-home", title: "Home", subtitle: "PainFix Physiotherapy Multan", category: "Pages", href: "/", keywords: "home main homepage painfix physiotherapy" },
    { id: "page-services", title: "All Services", subtitle: "Browse physiotherapy services", category: "Pages", href: "/services", keywords: "services treatments physiotherapy" },
    { id: "page-conditions", title: "All Conditions", subtitle: "Conditions we treat", category: "Pages", href: "/conditions", keywords: "conditions problems pain treat" },
    { id: "page-blog", title: "Blog & Patient Resources", subtitle: "Evidence-based articles", category: "Pages", href: "/blog", keywords: "blog articles guides education resources" },
    { id: "page-fitness", title: "Fitness Programmes", subtitle: "All fitness & rehab programmes", category: "Pages", href: "/fitness", keywords: "fitness programmes exercise workout" },
    { id: "page-contact", title: "Contact & Directions", subtitle: "Address, phone, WhatsApp & map", category: "Pages", href: "/#contact", keywords: "contact address phone whatsapp map directions location multan" },
    { id: "page-book", title: "Book an Appointment", subtitle: "Schedule your assessment", category: "Pages", href: "/#book", keywords: "book appointment schedule booking consultation" },
    { id: "page-about", title: "About PainFix", subtitle: "Our clinic and approach", category: "Pages", href: "/#about", keywords: "about clinic story mission team approach" },
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

/** Typo tolerance: any word in `words` within Levenshtein `tol` of `term`. */
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

/** Score a single item against a single normalized query string. */
function scoreItem(item: SearchItem, terms: string[]): number {
  const title = item.title.toLowerCase();
  const sub = (item.subtitle ?? "").toLowerCase();
  const hay = `${title} ${sub} ${item.keywords.toLowerCase()}`;
  const titleWords = title.split(/[^a-z0-9]+/).filter(Boolean);

  let total = 0;

  for (const rawTerm of terms) {
    // Each term may match via any of its singular/plural variants.
    const variants = stemVariants(rawTerm);
    let best = 0;

    for (const t of variants) {
      const tol = t.length >= 6 ? 2 : t.length >= 4 ? 1 : 0;
      let s = 0;
      if (title.startsWith(t)) s = 120;
      else if (title.includes(t)) s = 90;
      else if (sub.includes(t)) s = 55;
      else if (hay.includes(t)) s = 40;
      else if (tol > 0 && hasTypoMatch(t, titleWords, tol)) s = 30;
      else if (isSubsequence(t, title)) s = 22;
      else if (isSubsequence(t, hay)) s = 14;
      if (s > best) best = s;
    }

    if (best === 0) return 0; // every term must match somewhere
    total += best;
  }

  return total;
}

/**
 * Rank items for a query. The query is expanded with synonyms into several
 * equivalent phrasings; each item keeps its best score across all of them.
 * Higher score = better match.
 */
export function searchItems(items: SearchItem[], query: string, limit = 24): SearchItem[] {
  const q = normalize(query);
  if (!q) return [];

  const variants = expandQuery(q).map((v) => v.split(/\s+/).filter(Boolean));
  const results: Scored[] = [];

  for (const item of items) {
    let best = 0;
    for (const terms of variants) {
      const s = scoreItem(item, terms);
      if (s > best) best = s;
    }
    if (best > 0) results.push({ item, score: best });
  }

  results.sort((a, b) => b.score - a.score || a.item.title.length - b.item.title.length);
  return results.slice(0, limit).map((r) => r.item);
}
