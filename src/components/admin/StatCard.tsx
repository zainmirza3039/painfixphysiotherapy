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
  primary: { icon: "bg-primary/10 text-primary", border: "border-l-primary" },
  secondary: { icon: "bg-secondary/10 text-secondary", border: "border-l-secondary" },
  amber: {
    icon: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    border: "border-l-amber-500",
  },
  rose: {
    icon: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    border: "border-l-rose-500",
  },
};

export function StatCard({ label, value, icon, hint, accent = "primary" }: StatCardProps) {
  const accentStyle = accents[accent];

  return (
    <div
      className={cn(
        "min-w-0 rounded-xl border border-l-4 border-border bg-card p-4 shadow-sm sm:p-5",
        accentStyle.border,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="pt-1 text-xs font-semibold leading-5 text-muted-foreground sm:text-sm">
          {label}
        </p>
        <span
          className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg", accentStyle.icon)}
        >
          {icon}
        </span>
      </div>
      <p className="mt-4 font-heading text-3xl font-semibold leading-none tracking-tight text-foreground">
        {value}
      </p>
      {hint && <p className="mt-2 text-xs leading-5 text-muted-foreground">{hint}</p>}
    </div>
  );
}
