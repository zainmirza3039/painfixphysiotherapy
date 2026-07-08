import { ChevronRight, Home } from "lucide-react";
import type { Crumb } from "@/lib/seo";

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-1.5">
              {i === 0 && <Home className="h-3.5 w-3.5" aria-hidden="true" />}
              {isLast ? (
                <span className="font-medium text-foreground" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <>
                  <a href={item.path} className="transition-colors hover:text-primary">
                    {item.label}
                  </a>
                  <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
