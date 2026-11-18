import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  CalendarClock,
  Home,
  MessageSquare,
  ArrowUpRight,
  Activity,
  ClipboardList,
  CalendarPlus,
  UserRoundPlus,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/admin/AdminAuthProvider";
import { StatCard } from "@/components/admin/StatCard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminQueryError } from "@/components/admin/AdminQueryError";
import { fmtDateTime } from "@/admin/utils";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: DashboardPage,
});

function getClinicDayRange() {
  const day = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const start = new Date(`${day}T00:00:00+05:00`);
  return {
    start: start.toISOString(),
    end: new Date(start.getTime() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

function DashboardPage() {
  const { isStaff, isProfessional, canEditContent, loading } = useAdminAuth();

  const { data, isLoading, isError, refetch } = useQuery({
    enabled: isStaff,
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const { start, end } = getClinicDayRange();
      const [patients, appointments, newVisits, visits, unreadMessages, messages] =
        await Promise.all([
          supabase.from("patients").select("id", { count: "exact", head: true }),
          supabase
            .from("appointments")
            .select("id", { count: "exact", head: true })
            .gte("appointment_at", start)
            .lt("appointment_at", end),
          supabase
            .from("home_visit_requests")
            .select("id", { count: "exact", head: true })
            .or("status.is.null,status.eq.new"),
          supabase
            .from("home_visit_requests")
            .select("id, full_name, preferred_date, status, created_at")
            .order("created_at", { ascending: false })
            .limit(6),
          supabase
            .from("contact_submissions")
            .select("id", { count: "exact", head: true })
            .or("status.is.null,status.eq.new"),
          supabase
            .from("contact_submissions")
            .select("id, name, message, status, created_at")
            .order("created_at", { ascending: false })
            .limit(6),
        ]);

      const failed = [
        patients.error,
        appointments.error,
        newVisits.error,
        visits.error,
        unreadMessages.error,
        messages.error,
      ].find(Boolean);
      if (failed) throw failed;

      return {
        patientCount: patients.count ?? 0,
        appointmentsToday: appointments.count ?? 0,
        newVisitCount: newVisits.count ?? 0,
        visits: visits.data ?? [],
        unreadMessageCount: unreadMessages.count ?? 0,
        messages: messages.data ?? [],
      };
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  if (!loading && !isStaff) {
    if (isProfessional) return <Navigate to="/admin/profile" replace />;
    if (canEditContent) return <Navigate to="/admin/blog" replace />;
  }

  const todayLabel = new Intl.DateTimeFormat("en-PK", {
    timeZone: "Asia/Karachi",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-6 pb-2">
      <AdminPageHeader
        title="Clinic overview"
        description="Your clinic at a glance. Review today's workload and handle new requests."
        actions={
          <span className="inline-flex min-h-9 items-center gap-2 border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-secondary" />
            {todayLabel}
          </span>
        }
      />

      {isError ? (
        <AdminQueryError onRetry={() => void refetch()} />
      ) : (
        <>
          <section aria-label="Clinic performance indicators" className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-foreground">Today's overview</h2>
              <span className="text-xs text-muted-foreground">Multan clinic time</span>
            </div>
            {isLoading ? (
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-md" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
                <StatCard
                  label="Patients"
                  value={data?.patientCount ?? 0}
                  icon={<Users aria-hidden="true" className="h-[17px] w-[17px]" />}
                  accent="primary"
                />
                <StatCard
                  label="Appointments today"
                  value={data?.appointmentsToday ?? 0}
                  icon={<CalendarClock aria-hidden="true" className="h-[17px] w-[17px]" />}
                  accent="secondary"
                />
                <StatCard
                  label="New home visits"
                  value={data?.newVisitCount ?? 0}
                  icon={<Home aria-hidden="true" className="h-[17px] w-[17px]" />}
                  accent="amber"
                  href="/admin/home-visits"
                />
                <StatCard
                  label="Unread enquiries"
                  value={data?.unreadMessageCount ?? 0}
                  icon={<MessageSquare aria-hidden="true" className="h-[17px] w-[17px]" />}
                  accent="rose"
                  href="/admin/messages"
                />
              </div>
            )}
          </section>

          <section\n            aria-labelledby="quick-actions-heading"\n            className="border-y border-border bg-card"\n          >
            <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-3 sm:px-4">
              <h2 id="quick-actions-heading" className="text-sm font-semibold text-foreground">
                Clinic shortcuts
              </h2>
              <span className="text-xs text-muted-foreground">Frequently used</span>
            </div>
            <div className="grid divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
              <QuickAction
                to="/admin/patients"
                icon={<UserRoundPlus />}
                label="Patients"
                detail="Find or register a patient"
              />
              <QuickAction
                to="/admin/appointments"
                icon={<CalendarPlus />}
                label="Appointments"
                detail="Open clinic schedule"
              />
              <QuickAction
                to="/admin/home-visits"
                icon={<Home />}
                label="Home visits"
                detail="Review visit requests"
              />
              <QuickAction
                to="/admin/messages"
                icon={<ClipboardList />}
                label="Enquiries"
                detail="Open clinic inbox"
              />
            </div>
          </section>

          <section aria-labelledby="activity-heading" className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 id="activity-heading" className="text-sm font-semibold text-foreground">
                  Recent activity
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Latest requests received by the clinic.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <Activity className="h-3.5 w-3.5 text-secondary" />
                Updated when you open the dashboard
              </span>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <ActivityPanel
                title="Home visit requests"
                to="/admin/home-visits"
                count={data?.newVisitCount ?? 0}
                empty="No home visit requests have been received."
                isEmpty={(data?.visits.length ?? 0) === 0}
              >
                {(data?.visits ?? []).map((visit) => (
                  <li\n                    key={visit.id}\n                    className="flex min-w-0 items-center justify-between gap-3 py-3"\n                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {visit.full_name}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Preferred date: {visit.preferred_date || "Not specified"}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <StatusLabel status={visit.status ?? "new"} />
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {fmtDateTime(visit.created_at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ActivityPanel>

              <ActivityPanel
                title="Recent enquiries"
                to="/admin/messages"
                count={data?.unreadMessageCount ?? 0}
                empty="No enquiries have been received."
                isEmpty={(data?.messages.length ?? 0) === 0}
              >
                {(data?.messages ?? []).map((message) => (
                  <li\n                    key={message.id}\n                    className="flex min-w-0 items-center justify-between gap-3 py-3"\n                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{message.name}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {message.message || "No message preview"}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <StatusLabel status={message.status ?? "new"} />
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {fmtDateTime(message.created_at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ActivityPanel>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function StatusLabel({ status }: { status: string }) {
  const isNew = status === "new";
  return (
    <span
      className={
        isNew
          ? "inline-flex border border-amber-300/70 bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
          : "inline-flex border border-border bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground"
      }
    >
      {isNew ? "New" : status.replaceAll("_", " ")}
    </span>
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
      className="group flex min-h-[68px] min-w-0 items-center gap-3 px-3 py-3.5 transition-colors hover:bg-muted/70 focus-visible:bg-muted/70 sm:px-4"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center border border-border bg-surface text-primary transition-colors group-hover:border-secondary/40 group-hover:text-secondary">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-foreground">{label}</span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">{detail}</span>
      </span>
      <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
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
      <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-foreground">{title}</h3>
          {count > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center bg-rose-50 px-1.5 text-[10px] font-bold tabular-nums text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
              {count}
            </span>
          )}
        </div>
        <Link
          to={to}
          className="inline-flex min-h-8 shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:text-secondary"
        >
          View all <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <ul className="divide-y divide-border px-3 sm:px-4">
        {children}
        {isEmpty && <li className="py-8 text-center text-xs text-muted-foreground">{empty}</li>}
      </ul>
    </section>
  );
}
