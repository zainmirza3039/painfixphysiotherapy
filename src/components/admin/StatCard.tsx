import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  hint?: string;
  accent?: "primary" | "secondary" | "amber" | "rose";
}

const accents: Record<NonNullable<StatCardProps["accent"]>, string> = {
  primary: "admin-stat-card--navy",
  secondary: "admin-stat-card--green",
  amber: "admin-stat-card--amber",
  rose: "admin-stat-card--rose",
};

export function StatCard({ label, value, icon, hint, accent = "primary" }: StatCardProps) {
  return (
    <article className={cn("admin-stat-card", accents[accent])}>
      <div className="admin-stat-card__top">
        <span className="admin-stat-card__label">{label}</span>
        <span className="admin-stat-card__icon">{icon}</span>
      </div>
      <p className="admin-stat-card__value tabular-nums">{value}</p>
      {hint && <p className="admin-stat-card__hint">{hint}</p>}
    </article>
  );
}
