import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  CalendarClock,
  Home,
  MessageSquare,
  ArrowUpRight,
  Activity,
  Plus,
  ClipboardList,
  CalendarPlus,
  UserRoundPlus,
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

  if (!loading && !isStaff) {
    if (isProfessional) return <Navigate to="/admin/profile" replace />;
    if (canEditContent) return <Navigate to="/admin/blog" replace />;
  }

  const todayLabel = new Intl.DateTimeFormat("en-PK", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Clinic overview"
        description="Operational snapshot of patients, appointments and incoming requests."
        actions={
          <span className="inline-flex items-center gap-2 border border-border bg-card px-3 py-2 text-[11px] font-medium text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-secondary" />
            {todayLabel}
          </span>
        }
      />

      <section aria-label="Clinic performance indicators" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-foreground">
            At a glance
          </h2>
          <span className="text-[11px] text-muted-foreground">Live clinic records</span>
        </div>
        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[112px] rounded-md" />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Registered patients"
              value={data?.patientCount ?? 0}
              icon={<Users aria-hidden="true" className="h-[18px] w-[18px]" />}
              accent="primary"
            />
            <StatCard
              label="Appointments today"
              value={todayAppts.length}
              icon={<CalendarClock aria-hidden="true" className="h-[18px] w-[18px]" />}
              accent="secondary"
              hint={`${data?.appointments.length ?? 0} total records`}
            />
            <StatCard
              label="New home visits"
              value={newVisits.length}
              icon={<Home aria-hidden="true" className="h-[18px] w-[18px]" />}
              accent="amber"
              hint={`${data?.visits.length ?? 0} total requests`}
            />
            <StatCard
              label="Unread enquiries"
              value={unreadMessages.length}
              icon={<MessageSquare aria-hidden="true" className="h-[18px] w-[18px]" />}
              accent="rose"
              hint={`${data?.messages.length ?? 0} total messages`}
            />
          </div>
        )}
      </section>

      <section aria-labelledby="quick-actions-heading" className="border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
          <h2 id="quick-actions-heading" className="text-[12px] font-semibold uppercase tracking-[0.12em] text-foreground">
            Quick actions
          </h2>
          <span className="text-[11px] text-muted-foreground">Common clinic tasks</span>
        </div>
        <div className="grid divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
          <QuickAction to="/admin/patients" icon={<UserRoundPlus />} label="Patient records" detail="Find or add a patient" />
          <QuickAction to="/admin/appointments" icon={<CalendarPlus />} label="Appointments" detail="Review the schedule" />
          <QuickAction to="/admin/home-visits" icon={<Home />} label="Home visits" detail="Process visit requests" />
          <QuickAction to="/admin/messages" icon={<ClipboardList />} label="Enquiries" detail="Review incoming messages" />
        </div>
      </section>

      <section aria-labelledby="activity-heading" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="activity-heading" className="text-[12px] font-semibold uppercase tracking-[0.12em] text-foreground">
              Incoming activity
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Recent requests requiring review.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 text-[11px] text-muted-foreground">
            <Activity className="h-3.5 w-3.5 text-secondary" />
            Clinic inbox
          </span>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <ActivityPanel
            title="Home visit requests"
            to="/admin/home-visits"
            count={newVisits.length}
            empty="No home visit requests have been received."
            isEmpty={(data?.visits.length ?? 0) === 0}
          >
            {(data?.visits ?? []).slice(0, 6).map((visit) => (
              <li key={visit.id} className="flex min-w-0 items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-foreground">{visit.full_name}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Preferred date: {visit.preferred_date || "Not specified"}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="inline-flex items-center border border-amber-300/70 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                    {(visit.status ?? "new") === "new" ? "New" : visit.status}
                  </span>
                  <p className="mt-1 text-[10px] text-muted-foreground">{fmtDateTime(visit.created_at)}</p>
                </div>
              </li>
            ))}
          </ActivityPanel>

          <ActivityPanel
            title="Recent enquiries"
            to="/admin/messages"
            count={unreadMessages.length}
            empty="No enquiries have been received."
            isEmpty={(data?.messages.length ?? 0) === 0}
          >
            {(data?.messages ?? []).slice(0, 6).map((message) => (
              <li key={message.id} className="flex min-w-0 items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-foreground">{message.name}</p>
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                    {message.message || "No message preview"}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="inline-flex items-center border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                    {(message.status ?? "new") === "new" ? "New" : message.status}
                  </span>
                  <p className="mt-1 text-[10px] text-muted-foreground">{fmtDateTime(message.created_at)}</p>
                </div>
              </li>
            ))}
          </ActivityPanel>
        </div>
      </section>
    </div>
  );
}

function QuickAction({
  to,
  icon,
  label,
  detail,
}: {
  to: "/admin/patients" | "/admin/appointments" | "/admin/home-visits" | "/admin/messages";
  icon: React.ReactNode;
  label: string;
  detail: string;
}) {
  return (
    <Link
      to={to}
      className="group flex min-w-0 items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/70 focus-visible:bg-muted/70"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center border border-border bg-surface text-primary transition-colors group-hover:border-secondary/40 group-hover:text-secondary">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12px] font-semibold text-foreground">{label}</span>
        <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">{detail}</span>
      </span>
      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </Link>
  );
}

function ActivityPanel({
  title,
  to,
  count,
  empty,
  isEmpty,
  children,
}: {
  title: string;
  to: "/admin/home-visits" | "/admin/messages";
  count: number;
  empty: string;
  isEmpty: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0 border border-border bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="truncate text-[13px] font-semibold text-foreground">{title}</h3>
          {count > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center bg-rose-50 px-1.5 text-[10px] font-bold tabular-nums text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
              {count}
            </span>
          )}
        </div>
        <Link to={to} className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-primary hover:text-secondary">
          Open inbox <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
      <ul className="divide-y divide-border px-4">
        {children}
        {isEmpty && <li className="py-8 text-center text-xs text-muted-foreground">{empty}</li>}
      </ul>
    </section>
  );
}
