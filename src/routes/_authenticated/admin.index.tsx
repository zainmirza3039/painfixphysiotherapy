import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users, CalendarClock, Home, MessageSquare, ArrowRight, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/admin/AdminAuthProvider";
import { StatCard } from "@/components/admin/StatCard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { fmtDateTime, isToday } from "@/admin/utils";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { isStaff, isProfessional, canEditContent, loading } = useAdminAuth();

  const { data, isLoading } = useQuery({
    enabled: isStaff,
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const [patients, appts, visits, messages] = await Promise.all([
        supabase.from("patients").select("id", { count: "exact", head: true }),
        supabase.from("appointments").select("id, patient_name, appointment_at, status, service"),
        supabase
          .from("home_visit_requests")
          .select("id, full_name, preferred_date, status, created_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("contact_submissions")
          .select("id, name, message, status, created_at")
          .order("created_at", { ascending: false }),
      ]);
      return {
        patientCount: patients.count ?? 0,
        appointments: appts.data ?? [],
        visits: visits.data ?? [],
        messages: messages.data ?? [],
      };
    },
  });

  const todayAppts = (data?.appointments ?? []).filter((a) => isToday(a.appointment_at));
  const newVisits = (data?.visits ?? []).filter((v) => (v.status ?? "new") === "new");
  const unreadMessages = (data?.messages ?? []).filter((m) => (m.status ?? "new") === "new");

  // Professionals / content editors without clinical access land on their own workspace.
  if (!loading && !isStaff) {
    if (isProfessional) return <Navigate to="/admin/profile" replace />;
    if (canEditContent) return <Navigate to="/admin/blog" replace />;
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Dashboard"
        description="Overview of patients, appointments and enquiries."
      />

      <section aria-labelledby="dashboard-snapshot-heading">
        <div className="mb-3">
          <h2
            id="dashboard-snapshot-heading"
            className="font-heading text-lg font-semibold tracking-tight text-foreground"
          >
            At a glance
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Current counts from clinic records.
          </p>
        </div>
        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total Patients"
              value={data?.patientCount ?? 0}
              icon={<Users aria-hidden="true" className="h-4.5 w-4.5" />}
              accent="primary"
            />
            <StatCard
              label="Appointments Today"
              value={todayAppts.length}
              icon={<CalendarClock aria-hidden="true" className="h-4.5 w-4.5" />}
              accent="secondary"
              hint={`${data?.appointments.length ?? 0} total`}
            />
            <StatCard
              label="New Home Visits"
              value={newVisits.length}
              icon={<Home aria-hidden="true" className="h-4.5 w-4.5" />}
              accent="amber"
              hint={`${data?.visits.length ?? 0} total`}
            />
            <StatCard
              label="Unread Messages"
              value={unreadMessages.length}
              icon={<MessageSquare aria-hidden="true" className="h-4.5 w-4.5" />}
              accent="rose"
              hint={`${data?.messages.length ?? 0} total`}
            />
          </div>
        )}
      </section>

      <section aria-labelledby="dashboard-activity-heading" className="space-y-4">
        <div>
          <h2
            id="dashboard-activity-heading"
            className="font-heading text-lg font-semibold tracking-tight text-foreground"
          >
            Recent activity
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Latest home visit requests and incoming messages.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Latest Home Visit Requests" to="/admin/home-visits">
            {(data?.visits ?? []).slice(0, 5).map((v) => (
              <li
                key={v.id}
                className="flex min-w-0 flex-col gap-1 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3"
              >
                <span className="truncate font-medium text-foreground">{v.full_name}</span>
                <span className="text-xs text-muted-foreground sm:shrink-0">
                  {fmtDateTime(v.created_at)}
                </span>
              </li>
            ))}
            {!data?.visits.length && <Empty />}
          </Panel>

          <Panel title="Recent Messages" to="/admin/messages">
            {(data?.messages ?? []).slice(0, 5).map((m) => (
              <li
                key={m.id}
                className="flex min-w-0 flex-col gap-1 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3"
              >
                <span className="truncate font-medium text-foreground">{m.name}</span>
                <span className="text-xs text-muted-foreground sm:shrink-0">
                  {fmtDateTime(m.created_at)}
                </span>
              </li>
            ))}
            {!data?.messages.length && <Empty />}
          </Panel>
        </div>
      </section>
    </div>
  );
}

function Panel({ title, to, children }: { title: string; to: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-1 flex items-center justify-between gap-3 border-b border-border pb-3">
        <h3 className="font-heading text-base font-semibold leading-snug text-foreground">
          {title}
        </h3>
        <Link
          to={to}
          className="inline-flex shrink-0 items-center gap-1 rounded-sm text-xs font-semibold text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card sm:text-sm"
        >
          View all <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
        </Link>
      </div>
      <ul className="divide-y divide-border/80">{children}</ul>
    </div>
  );
}

function Empty() {
  return (
    <li className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
      <Activity className="h-4 w-4" /> Nothing here yet.
    </li>
  );
}
