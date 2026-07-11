import { useEffect, useMemo, useState } from "react";
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

const CATEGORY_ICON: Record<SearchCategory, typeof Search> = {
  Services: Hand,
  Conditions: Activity,
  "Blog Articles": BookOpen,
  FAQs: HelpCircle,
  Doctors: UserRound,
  Resources: Compass,
};

/**
 * Site-wide search. Renders an accessible trigger button plus a command-palette
 * dialog (⌘K / Ctrl-K). The index is built lazily on first open, so the search
 * code and content data stay off the critical path.
 */
export function SiteSearch({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<SearchItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  const results = useMemo(() => {
    if (!items) return [];
    return searchItems(items, query);
  }, [items, query]);

  const grouped = useMemo(() => {
    // Results are already globally ranked by relevance. Group them while
    // preserving that order, so the category holding the best match appears
    // first, and cap each category so no single group floods the list.
    const map = new Map<SearchCategory, SearchItem[]>();
    const order: SearchCategory[] = [];
    for (const r of results) {
      if (!map.has(r.category)) {
        map.set(r.category, []);
        order.push(r.category);
      }
      const list = map.get(r.category)!;
      if (list.length < 6) list.push(r);
    }
    return order.map((c) => ({ category: c, items: map.get(c)! }));
  }, [results]);

  function go(href: string) {
    setOpen(false);
    setQuery("");
    if (href.includes("#")) {
      // Let the browser resolve on-page hash sections (reliable scroll).
      window.location.assign(href);
    } else {
      navigate({ to: href });
    }
  }

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
            Search services, conditions, blog articles, FAQs, doctors and patient resources.
          </DialogDescription>
          <Command
            shouldFilter={false}
            className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-input]]:h-12"
          >
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder="Search services, conditions, articles, FAQs…"
            />
            <CommandList className="max-h-[60vh]">
              {loading ? (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading search…
                </div>
              ) : query.trim() === "" ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Start typing to search across the whole site.
                </p>
              ) : (
                <>
                  <CommandEmpty>No results for “{query}”.</CommandEmpty>
                  {grouped.map((group) => {
                    const Icon = CATEGORY_ICON[group.category];
                    return (
                      <CommandGroup key={group.category} heading={group.category}>
                        {group.items.map((item) => (
                          <CommandItem
                            key={item.id}
                            value={item.id}
                            onSelect={() => go(item.href)}
                            className="cursor-pointer items-start gap-3"
                          >
                            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                            <span className="flex min-w-0 flex-col">
                              <span className="truncate font-medium text-foreground">{item.title}</span>
                              {item.subtitle && (
                                <span className="truncate text-xs text-muted-foreground">
                                  {item.subtitle}
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
