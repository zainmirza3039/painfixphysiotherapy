import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users, CalendarClock, Home, Newspaper, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminOnly } from "@/components/admin/AdminOnly";
import { StatCard } from "@/components/admin/StatCard";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/admin/reports")({
  component: () => (
    <AdminOnly>
      <ReportsPage />
    </AdminOnly>
  ),
});

function countBy<T>(rows: T[], key: (r: T) => string): Record<string, number> {
  return rows.reduce<Record<string, number>>((acc, r) => {
    const k = key(r) || "unknown";
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
}

function ReportsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "reports"],
    queryFn: async () => {
      const [patients, appts, visits, posts] = await Promise.all([
        supabase.from("patients").select("status"),
        supabase.from("appointments").select("status, created_at"),
        supabase.from("home_visit_requests").select("status"),
        supabase.from("blog_posts").select("status, views"),
      ]);
      return {
        patients: patients.data ?? [],
        appts: appts.data ?? [],
        visits: visits.data ?? [],
        posts: posts.data ?? [],
      };
    },
  });

  if (isLoading || !data) {
    return (
      <div>
        <AdminPageHeader title="Reports" description="Clinic performance at a glance." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  const patientStatus = countBy(data.patients, (p) => p.status ?? "active");
  const apptStatus = countBy(data.appts, (a) => a.status ?? "pending");
  const visitStatus = countBy(data.visits, (v) => v.status ?? "new");
  const totalViews = data.posts.reduce((s, p) => s + (p.views ?? 0), 0);
  const publishedPosts = data.posts.filter((p) => p.status === "published").length;

  return (
    <div>
      <AdminPageHeader title="Reports" description="Clinic performance at a glance." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Patients"
          value={data.patients.length}
          icon={<Users className="h-5 w-5" />}
          accent="primary"
        />
        <StatCard
          label="Total Appointments"
          value={data.appts.length}
          icon={<CalendarClock className="h-5 w-5" />}
          accent="secondary"
        />
        <StatCard
          label="Home Visit Requests"
          value={data.visits.length}
          icon={<Home className="h-5 w-5" />}
          accent="amber"
        />
        <StatCard
          label="Blog Views"
          value={totalViews}
          icon={<Newspaper className="h-5 w-5" />}
          accent="rose"
          hint={`${publishedPosts} published`}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <BreakdownCard title="Patients by status" data={patientStatus} color="bg-primary" />
        <BreakdownCard title="Appointments by status" data={apptStatus} color="bg-secondary" />
        <BreakdownCard title="Home visits by status" data={visitStatus} color="bg-amber-500" />
      </div>
    </div>
  );
}

function BreakdownCard({
  title,
  data,
  color,
}: {
  title: string;
  data: Record<string, number>;
  color: string;
}) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...entries.map(([, v]) => v));
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
        <h2 className="font-heading text-base font-bold text-foreground">{title}</h2>
      </div>
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">No data yet.</p>
      ) : (
        <ul className="space-y-3">
          {entries.map(([label, value]) => (
            <li key={label}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="capitalize text-foreground">{label}</span>
                <span className="font-semibold text-muted-foreground">{value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${color}`}
                  style={{ width: `${(value / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
