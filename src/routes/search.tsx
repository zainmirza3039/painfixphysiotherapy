import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search, MessageCircle, X, Clock, TrendingUp, ArrowRight } from "lucide-react";
import { PageLayout } from "@/components/site/PageLayout";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { WHATSAPP_CONSULT_URL } from "@/components/site/constants";
import { CATEGORY_ICON, highlightMatch } from "@/components/site/SiteSearch";
import {
  buildSearchIndex,
  searchItems,
  CATEGORY_ORDER,
  type SearchItem,
  type SearchCategory,
} from "@/lib/searchIndex";
import {
  POPULAR_SEARCHES,
  getRecentSearches,
  addRecentSearch,
  clearRecentSearches,
} from "@/lib/searchHistory";
import { pageMeta, canonical } from "@/lib/seo";

const PATH = "/search";
const TITLE = "Search | PainFix Physiotherapy Multan";
const DESCRIPTION =
  "Search PainFix Physiotherapy — find services, conditions, doctors, blog articles, fitness programmes, health calculators and more.";

interface SearchParams {
  q: string;
  cat: string;
  sort: string;
}

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    q: typeof search.q === "string" ? search.q : "",
    cat: typeof search.cat === "string" ? search.cat : "all",
    sort: typeof search.sort === "string" ? search.sort : "relevance",
  }),
  head: () => ({
    meta: [
      ...pageMeta({ title: TITLE, description: DESCRIPTION, path: PATH }),
      { name: "robots", content: "noindex,follow" },
    ],
    links: canonical(PATH),
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q, cat, sort } = Route.useSearch();
  const navigate = useNavigate({ from: PATH });

  const [items, setItems] = useState<SearchItem[] | null>(null);
  const [input, setInput] = useState(q);
  const [recent, setRecent] = useState<string[]>([]);

  // Keep the local input in sync when the URL query changes (e.g. from a chip).
  useEffect(() => setInput(q), [q]);

  // Load the index once on mount.
  useEffect(() => {
    let cancelled = false;
    buildSearchIndex().then((idx) => {
      if (!cancelled) setItems(idx);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => setRecent(getRecentSearches()), []);

  // Record the searched term.
  useEffect(() => {
    if (q.trim()) setRecent(addRecentSearch(q.trim()));
  }, [q]);

  const allResults = useMemo(() => {
    if (!items || !q.trim()) return [];
    return searchItems(items, q, 200);
  }, [items, q]);

  // Category counts across the full (unfiltered) result set.
  const counts = useMemo(() => {
    const m = new Map<SearchCategory, number>();
    for (const r of allResults) m.set(r.category, (m.get(r.category) ?? 0) + 1);
    return m;
  }, [allResults]);

  const activeCategories = useMemo(
    () => CATEGORY_ORDER.filter((c) => (counts.get(c) ?? 0) > 0),
    [counts],
  );

  const filtered = useMemo(() => {
    let list = cat === "all" ? allResults : allResults.filter((r) => r.category === cat);
    if (sort === "az") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [allResults, cat, sort]);

  function submit(term: string) {
    navigate({ search: (prev: SearchParams) => ({ ...prev, q: term.trim(), cat: "all" }) });
  }

  const hasQuery = q.trim() !== "";
  const noResults = hasQuery && items !== null && allResults.length === 0;

  return (
    <PageLayout>
      <PageHero
        eyebrow="Search"
        title="Search PainFix"
        subtitle="Find services, conditions, doctors, articles, fitness programmes, health tools and more — all in one place."
        crumbs={[
          { label: "Home", path: "/" },
          { label: "Search", path: PATH },
        ]}
        icon={<Search className="h-8 w-8" />}
      />

      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Search box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(input);
            }}
            role="search"
            className="relative"
          >
            <label htmlFor="site-search" className="sr-only">
              Search the website
            </label>
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="site-search"
              type="search"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Try “back pain”, “sciatica”, “manual therapy”, “BMI”…"
              autoComplete="off"
              className="w-full rounded-2xl border border-border bg-card py-4 pl-12 pr-28 text-base text-foreground shadow-soft outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
            {input && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setInput("")}
                className="absolute right-24 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
            >
              Search
            </button>
          </form>

          {/* Empty state: recent + popular */}
          {!hasQuery && (
            <div className="mt-8 space-y-6">
              {recent.length > 0 && (
                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Clock className="h-4 w-4 text-primary" aria-hidden="true" /> Recent searches
                    </h2>
                    <button
                      type="button"
                      onClick={() => setRecent(clearRecentSearches())}
                      className="text-xs font-medium text-muted-foreground hover:text-primary"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {recent.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => submit(r)}
                        className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <TrendingUp className="h-4 w-4 text-primary" aria-hidden="true" /> Popular
                  searches
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => submit(p)}
                      className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {hasQuery && !noResults && (
            <div className="mt-8">
              {/* Filters + sort */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
                  <FilterChip
                    label={`All (${allResults.length})`}
                    active={cat === "all"}
                    onClick={() =>
                      navigate({ search: (p: SearchParams) => ({ ...p, cat: "all" }) })
                    }
                  />
                  {activeCategories.map((c) => (
                    <FilterChip
                      key={c}
                      label={`${c} (${counts.get(c)})`}
                      active={cat === c}
                      onClick={() => navigate({ search: (p: SearchParams) => ({ ...p, cat: c }) })}
                    />
                  ))}
                </div>
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  Sort
                  <select
                    value={sort}
                    onChange={(e) =>
                      navigate({ search: (p: SearchParams) => ({ ...p, sort: e.target.value }) })
                    }
                    className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="az">A–Z</option>
                  </select>
                </label>
              </div>

              <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">
                {filtered.length} result{filtered.length === 1 ? "" : "s"} for{" "}
                <span className="font-semibold text-foreground">“{q}”</span>
              </p>

              <ul className="mt-4 grid gap-3">
                {filtered.map((item) => {
                  const Icon = CATEGORY_ICON[item.category];
                  return (
                    <li key={item.id}>
                      <ResultLink item={item} query={q} icon={<Icon className="h-5 w-5" />} />
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* No results */}
          {noResults && <NoResults query={q} onPick={submit} />}
        </div>
      </section>
    </PageLayout>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
      }`}
    >
      {label}
    </button>
  );
}

function ResultLink({
  item,
  query,
  icon,
}: {
  item: SearchItem;
  query: string;
  icon: React.ReactNode;
}) {
  const inner = (
    <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft transition-colors hover:border-primary/50">
      {item.thumbnail ? (
        <img
          src={item.thumbnail}
          alt=""
          loading="lazy"
          className="h-14 w-14 shrink-0 rounded-xl object-cover"
        />
      ) : (
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <span className="inline-block rounded-full bg-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {item.category}
        </span>
        <p className="mt-1 font-heading text-base font-bold text-foreground">
          {highlightMatch(item.title, query)}
        </p>
        {item.subtitle && (
          <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
            {highlightMatch(item.subtitle, query)}
          </p>
        )}
      </div>
      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
    </div>
  );

  // Hash links must use a plain anchor so the browser scrolls to the section.
  if (item.href.includes("#")) {
    return (
      <a href={item.href} className="block">
        {inner}
      </a>
    );
  }
  return (
    <Link to={item.href} className="block">
      {inner}
    </Link>
  );
}

function NoResults({ query, onPick }: { query: string; onPick: (t: string) => void }) {
  return (
    <Reveal anim="up">
      <div className="mt-8 rounded-3xl border border-border bg-card p-8 text-center shadow-soft">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-surface text-muted-foreground">
          <Search className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 className="mt-4 font-heading text-xl font-bold text-foreground">
          No results for “{query}”
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Try a different keyword, or explore some popular options below.
        </p>

        <div className="mt-6 grid gap-4 text-left sm:grid-cols-3">
          <SuggestBlock
            title="Related Services"
            links={[
              { label: "Manual Therapy", to: "/services/manual-therapy" },
              { label: "Exercise Therapy", to: "/services/exercise-therapy" },
              { label: "All Services", to: "/services" },
            ]}
          />
          <SuggestBlock
            title="Popular Conditions"
            links={[
              { label: "Back Pain", to: "/conditions/back-pain" },
              { label: "Sciatica", to: "/conditions/sciatica" },
              { label: "Neck Pain", to: "/conditions/neck-pain" },
            ]}
          />
          <SuggestBlock
            title="Popular Blogs"
            links={[
              { label: "Blog Home", to: "/blog" },
              {
                label: "Best Physiotherapist in Multan",
                to: "/blog/best-physiotherapist-in-multan",
              },
              { label: "Health Tools", to: "/health-calculators" },
            ]}
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {POPULAR_SEARCHES.slice(0, 5).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPick(p)}
              className="rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {p}
            </button>
          ))}
        </div>

        <a
          href={WHATSAPP_CONSULT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-secondary px-6 py-3.5 text-sm font-semibold text-secondary-foreground shadow-card transition-transform hover:scale-[1.03]"
        >
          <MessageCircle className="h-4 w-4" /> Ask us on WhatsApp
        </a>
      </div>
    </Reveal>
  );
}

function SuggestBlock({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <h3 className="text-sm font-bold text-foreground">{title}</h3>
      <ul className="mt-2 space-y-1.5">
        {links.map((l) => (
          <li key={l.to}>
            <Link
              to={l.to}
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
