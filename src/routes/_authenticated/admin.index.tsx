import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  CalendarClock,
  Home,
  MessageSquare,
  ArrowRight,
  Activity,
} from "lucide-react";
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

  // Professionals / content editors without clinical access land on their own workspace.
  if (!loading && !isStaff) {
    if (isProfessional) return <Navigate to="/admin/profile" replace />;
    if (canEditContent) return <Navigate to="/admin/blog" replace />;
  }

  const { data, isLoading } = useQuery({
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

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="Overview of patients, appointments and enquiries."
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Patients" value={data?.patientCount ?? 0} icon={<Users className="h-5 w-5" />} accent="primary" />
          <StatCard label="Appointments Today" value={todayAppts.length} icon={<CalendarClock className="h-5 w-5" />} accent="secondary" hint={`${data?.appointments.length ?? 0} total`} />
          <StatCard label="New Home Visits" value={newVisits.length} icon={<Home className="h-5 w-5" />} accent="amber" hint={`${data?.visits.length ?? 0} total`} />
          <StatCard label="Unread Messages" value={unreadMessages.length} icon={<MessageSquare className="h-5 w-5" />} accent="rose" hint={`${data?.messages.length ?? 0} total`} />
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel title="Latest Home Visit Requests" to="/admin/home-visits">
          {(data?.visits ?? []).slice(0, 5).map((v) => (
            <li key={v.id} className="flex items-center justify-between py-2.5 text-sm">
              <span className="font-medium text-foreground">{v.full_name}</span>
              <span className="text-muted-foreground">{fmtDateTime(v.created_at)}</span>
            </li>
          ))}
          {!data?.visits.length && <Empty />}
        </Panel>

        <Panel title="Recent Messages" to="/admin/messages">
          {(data?.messages ?? []).slice(0, 5).map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span className="truncate font-medium text-foreground">{m.name}</span>
              <span className="shrink-0 text-muted-foreground">{fmtDateTime(m.created_at)}</span>
            </li>
          ))}
          {!data?.messages.length && <Empty />}
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, to, children }: { title: string; to: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-heading text-base font-bold text-foreground">{title}</h2>
        <Link to={to} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <ul className="divide-y divide-border">{children}</ul>
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
