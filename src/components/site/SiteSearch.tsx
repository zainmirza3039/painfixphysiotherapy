import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Search,
  Hand,
  Activity,
  BookOpen,
  HelpCircle,
  UserRound,
  Compass,
  Loader2,
  Dumbbell,
  Salad,
  Calculator,
  BadgeCheck,
  Trophy,
  Tag,
  FileText,
  ClipboardList,
  Clock,
  TrendingUp,
  CornerDownLeft,
  X,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  buildSearchIndex,
  searchItems,
  type SearchItem,
  type SearchCategory,
} from "@/lib/searchIndex";
import {
  POPULAR_SEARCHES,
  getRecentSearches,
  addRecentSearch,
  clearRecentSearches,
} from "@/lib/searchHistory";

export const CATEGORY_ICON: Record<SearchCategory, typeof Search> = {
  Services: Hand,
  Conditions: Activity,
  Doctors: UserRound,
  "Blog Articles": BookOpen,
  FAQs: HelpCircle,
  Fitness: Dumbbell,
  Diet: Salad,
  Programmes: ClipboardList,
  Membership: BadgeCheck,
  "Success Stories": Trophy,
  Calculators: Calculator,
  Resources: Compass,
  Categories: Tag,
  Pages: FileText,
};

/** Split text around the matched query so matches can be visually highlighted. */
export function highlightMatch(text: string, query: string) {
  const q = query.trim();
  if (!q) return text;
  const terms = q.split(/\s+/).filter((t) => t.length >= 2);
  if (terms.length === 0) return text;
  const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`(${escaped.join("|")})`, "ig");
  const parts = text.split(re);
  return parts.map((part, i) =>
    escaped.some((e) => new RegExp(`^${e}$`, "i").test(part)) ? (
      <mark key={i} className="rounded bg-primary/20 px-0.5 text-foreground">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

/**
 * Site-wide universal search. Renders an accessible trigger button plus a
 * command-palette dialog (⌘K / Ctrl-K). The index is built lazily on first
 * open, so the search code and content data stay off the critical path.
 */
export function SiteSearch({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<SearchItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const navigate = useNavigate();
  const debounced = useRef(query);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Global keyboard shortcut: ⌘K / Ctrl-K.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Load recent searches whenever the dialog opens.
  useEffect(() => {
    if (open) setRecent(getRecentSearches());
  }, [open]);

  // Lazy-load the index the first time the dialog opens.
  useEffect(() => {
    if (!open || items) return;
    let cancelled = false;
    setLoading(true);
    buildSearchIndex()
      .then((idx) => {
        if (!cancelled) setItems(idx);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, items]);

  // Debounce the query (150ms) so we only rank on settled input.
  useEffect(() => {
    debounced.current = query;
    const id = window.setTimeout(() => setDebouncedQuery(debounced.current), 150);
    return () => window.clearTimeout(id);
  }, [query]);

  const results = useMemo(() => {
    if (!items) return [];
    return searchItems(items, debouncedQuery, 40);
  }, [items, debouncedQuery]);

  const grouped = useMemo(() => {
    const map = new Map<SearchCategory, SearchItem[]>();
    const order: SearchCategory[] = [];
    for (const r of results) {
      if (!map.has(r.category)) {
        map.set(r.category, []);
        order.push(r.category);
      }
      const list = map.get(r.category)!;
      if (list.length < 5) list.push(r);
    }
    return order.map((c) => ({ category: c, items: map.get(c)! }));
  }, [results]);

  function go(href: string, term?: string) {
    if (term) setRecent(addRecentSearch(term));
    else if (query.trim()) setRecent(addRecentSearch(query.trim()));
    setOpen(false);
    setQuery("");
    if (href.includes("#")) {
      window.location.assign(href);
    } else {
      navigate({ to: href });
    }
  }

  function seeAllResults(term: string) {
    const q = term.trim();
    if (!q) return;
    setRecent(addRecentSearch(q));
    setOpen(false);
    setQuery("");
    navigate({ to: "/search", search: { q } });
  }

  const hasQuery = query.trim() !== "";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search the website"
        title="Search (Ctrl+K)"
        className={`grid h-10 w-10 place-items-center rounded-xl border border-border bg-background text-foreground transition-colors hover:bg-accent hover:text-primary ${className}`}
      >
        <Search className="h-5 w-5" aria-hidden="true" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0 sm:max-w-xl">
          <DialogTitle className="sr-only">Search the website</DialogTitle>
          <DialogDescription className="sr-only">
            Search services, conditions, doctors, blog articles, FAQs, fitness, calculators and more.
          </DialogDescription>
          <Command
            shouldFilter={false}
            className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-input]]:h-12"
          >
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder="Search services, conditions, doctors, articles…"
              onKeyDown={(e) => {
                if (e.key === "Enter" && hasQuery) {
                  e.preventDefault();
                  seeAllResults(query);
                }
              }}
            />
            <CommandList className="max-h-[60vh]">
              {loading ? (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading search…
                </div>
              ) : !hasQuery ? (
                <div className="px-2 py-3">
                  {recent.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between px-2">
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" aria-hidden="true" /> Recent searches
                        </span>
                        <button
                          type="button"
                          onClick={() => setRecent(clearRecentSearches())}
                          className="text-xs font-medium text-muted-foreground hover:text-primary"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 px-2">
                        {recent.map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setQuery(r)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                          >
                            <Search className="h-3 w-3" aria-hidden="true" /> {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="flex items-center gap-1.5 px-2 text-xs font-semibold text-muted-foreground">
                      <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" /> Popular searches
                    </span>
                    <div className="mt-2 flex flex-wrap gap-2 px-2">
                      {POPULAR_SEARCHES.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setQuery(p)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                        >
                          <TrendingUp className="h-3 w-3" aria-hidden="true" /> {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <CommandItem
                    value="__see_all__"
                    onSelect={() => seeAllResults(query)}
                    className="cursor-pointer justify-between gap-3 border-b border-border"
                  >
                    <span className="flex items-center gap-2 font-medium text-primary">
                      <Search className="h-4 w-4" aria-hidden="true" /> See all results for “{query.trim()}”
                    </span>
                    <CornerDownLeft className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                  </CommandItem>
                  <CommandEmpty>No results for “{query}”.</CommandEmpty>
                  {grouped.map((group) => {
                    const Icon = CATEGORY_ICON[group.category];
                    return (
                      <CommandGroup
                        key={group.category}
                        heading={`${group.category} · ${group.items.length}`}
                      >
                        {group.items.map((item) => (
                          <CommandItem
                            key={item.id}
                            value={item.id}
                            onSelect={() => go(item.href)}
                            className="cursor-pointer items-start gap-3"
                          >
                            {item.thumbnail ? (
                              <img
                                src={item.thumbnail}
                                alt=""
                                loading="lazy"
                                className="mt-0.5 h-9 w-9 shrink-0 rounded-lg object-cover"
                              />
                            ) : (
                              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                                <Icon className="h-4 w-4" aria-hidden="true" />
                              </span>
                            )}
                            <span className="flex min-w-0 flex-col">
                              <span className="truncate font-medium text-foreground">
                                {highlightMatch(item.title, debouncedQuery)}
                              </span>
                              {item.subtitle && (
                                <span className="truncate text-xs text-muted-foreground">
                                  {highlightMatch(item.subtitle, debouncedQuery)}
                                </span>
                              )}
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    );
                  })}
                </>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
