import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  hint?: string;
  accent?: "primary" | "secondary" | "amber" | "rose";
}

const accents: Record<NonNullable<StatCardProps["accent"]>, { icon: string; border: string }> = {
  primary: { icon: "bg-primary/10 text-primary", border: "before:bg-primary" },
  secondary: { icon: "bg-secondary/10 text-secondary", border: "before:bg-secondary" },
  amber: {
    icon: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    border: "before:bg-amber-500",
  },
  rose: {
    icon: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    border: "before:bg-rose-500",
  },
};

export function StatCard({ label, value, icon, hint, accent = "primary" }: StatCardProps) {
  const accentStyle = accents[accent];

  return (
    <div
      className={cn(
        "relative flex min-h-[116px] min-w-0 items-center gap-4 overflow-hidden rounded-2xl border border-border bg-card px-4 py-4 shadow-sm transition-shadow hover:shadow-md sm:px-5",
        "before:absolute before:inset-y-4 before:left-0 before:w-1 before:rounded-r-full",
        accentStyle.border,
      )}
    >
      <span
        className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl", accentStyle.icon)}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold tracking-wide text-muted-foreground sm:text-sm">
          {label}
        </p>
        <p className="mt-1.5 font-heading text-3xl font-semibold leading-none tracking-tight text-foreground">
          {value}
        </p>
        {hint && (
          <p className="mt-1.5 truncate text-[11px] leading-4 text-muted-foreground">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}
