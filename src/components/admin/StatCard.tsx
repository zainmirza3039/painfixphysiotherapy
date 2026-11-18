import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  hint?: string;
  accent?: "primary" | "secondary" | "amber" | "rose";
  href?: "/admin/home-visits" | "/admin/messages";
}

const accents: Record<NonNullable<StatCardProps["accent"]>, { icon: string; rule: string }> = {
  primary: { icon: "bg-[#e9eef5] text-[#173b63]", rule: "before:bg-[#173b63]" },
  secondary: { icon: "bg-[#e6f2eb] text-[#087747]", rule: "before:bg-[#087747]" },
  amber: { icon: "bg-[#f8f0df] text-[#95630d]", rule: "before:bg-[#c28b27]" },
  rose: { icon: "bg-[#f7e9e7] text-[#a23c32]", rule: "before:bg-[#b94a40]" },
};

export function StatCard({ label, value, icon, hint, accent = "primary", href }: StatCardProps) {
  const style = accents[accent];
  const content = (
    <>
      <span
        className={cn("mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md", style.icon)}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
          {label}
        </span>
        <span className="mt-2 block font-sans text-[1.8rem] font-semibold leading-none tracking-[-0.04em] tabular-nums text-foreground">
          {value}
        </span>
        {hint && (
          <span className="mt-2 block truncate text-[11px] leading-4 text-muted-foreground">
            {hint}
          </span>
        )}
      </span>
    </>
  );

  const className = cn(
    "relative flex min-h-[96px] min-w-0 items-start gap-3 overflow-hidden border border-border bg-card px-3 py-3.5 text-left",
    "before:absolute before:inset-x-0 before:top-0 before:h-[2px]",
    style.rule,
    href &&
      "transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  );

  if (href) {
    return (
      <Link to={href} className={className}>
        {content}
      </Link>
    );
  }

  return <article className={className}>{content}</article>;
}
