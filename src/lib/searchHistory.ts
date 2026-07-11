// Recent-search persistence (localStorage) + a curated popular-search list.
// Client-only; guards against SSR by checking for `window`.

const KEY = "painfix.recentSearches";
const MAX = 6;

/** Curated popular searches shown as quick chips before the user types. */
export const POPULAR_SEARCHES: string[] = [
  "Back pain",
  "Sciatica",
  "Neck pain",
  "Manual therapy",
  "Hijama",
  "Fitness",
  "BMI",
  "Home visit",
];

export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string").slice(0, MAX) : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(term: string): string[] {
  if (typeof window === "undefined") return [];
  const t = term.trim();
  if (!t) return getRecentSearches();
  const existing = getRecentSearches().filter((v) => v.toLowerCase() !== t.toLowerCase());
  const next = [t, ...existing].slice(0, MAX);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore quota / private-mode errors */
  }
  return next;
}

export function clearRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  return [];
}
