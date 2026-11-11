import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  hint?: string;
  accent?: "primary" | "secondary" | "amber" | "rose";
}

const accents: Record<NonNullable<StatCardProps["accent"]>, { icon: string; rule: string }> = {
  primary: { icon: "bg-[#e9eef5] text-[#173b63]", rule: "before:bg-[#173b63]" },
  secondary: { icon: "bg-[#e6f2eb] text-[#087747]", rule: "before:bg-[#087747]" },
  amber: { icon: "bg-[#f8f0df] text-[#95630d]", rule: "before:bg-[#c28b27]" },
  rose: { icon: "bg-[#f7e9e7] text-[#a23c32]", rule: "before:bg-[#b94a40]" },
};

export function StatCard({ label, value, icon, hint, accent = "primary" }: StatCardProps) {
  const style = accents[accent];

  return (
    <article
      className={cn(
        "relative flex min-h-[112px] min-w-0 items-start gap-3 overflow-hidden border border-border bg-card px-4 py-4",
        "before:absolute before:inset-x-0 before:top-0 before:h-[3px]",
        style.rule,
      )}
    >
      <span className={cn("mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-md", style.icon)}>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-2 font-sans text-[2rem] font-semibold leading-none tracking-[-0.04em] tabular-nums text-foreground">
          {value}
        </p>
        {hint && <p className="mt-2 truncate text-[11px] leading-4 text-muted-foreground">{hint}</p>}
      </div>
    </article>
  );
}
