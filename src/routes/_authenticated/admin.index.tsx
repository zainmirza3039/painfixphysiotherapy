import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Home,
  MessageSquare,
  UserRound,
  Users,
  UserRoundPlus,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/admin/AdminAuthProvider";
import { StatCard } from "@/components/admin/StatCard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { fmtDateTime, isToday } from "@/admin/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/")({ component: DashboardPage });

function DashboardPage() {
  const { isStaff, isProfessional, hasRole, canEditContent, loading } = useAdminAuth();
  const { data, isLoading, isError, refetch } = useQuery({
    enabled: isStaff,
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const [patients, appts, visits, messages] = await Promise.all([
        supabase.from("patients").select("id", { count: "exact", head: true }),
        supabase
          .from("appointments")
          .select("id, patient_name, appointment_at, status, service, assigned_therapist")
          .order("appointment_at", { ascending: true, nullsFirst: false }),
        supabase
          .from("home_visit_requests")
          .select("id, full_name, preferred_date, status, created_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("contact_submissions")
          .select("id, name, message, status, created_at")
          .order("created_at", { ascending: false }),
      ]);
      for (const result of [patients, appts, visits, messages])
        if (result.error) throw result.error;
      return {
        patientCount: patients.count ?? 0,
        appointments: appts.data ?? [],
        visits: visits.data ?? [],
        messages: messages.data ?? [],
      };
    },
    refetchOnWindowFocus: true,
  });

  if (!loading && !isStaff) {
    if (isProfessional) return <Navigate to="/admin/profile" replace />;
    if (canEditContent) return <Navigate to="/admin/blog" replace />;
  }

  const todayAppointments = (data?.appointments ?? []).filter((item) =>
    isToday(item.appointment_at),
  );
  const upcomingAppointments = todayAppointments.slice(0, 7);
  const newVisits = (data?.visits ?? []).filter((item) => (item.status ?? "new") === "new");
  const newMessages = (data?.messages ?? []).filter((item) => (item.status ?? "new") === "new");
  const dateLabel = new Intl.DateTimeFormat("en-PK", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
  const timeLabel = (value: string | null) =>
    value
      ? new Intl.DateTimeFormat("en-PK", { hour: "numeric", minute: "2-digit" }).format(
          new Date(value),
        )
      : "Time not set";

  return (
    <div className="admin-dashboard">
      <AdminPageHeader
        title="Good day. Here is your clinic."
        description="A clear view of today's workload and the items that need your attention."
        actions={
          <div className="admin-date-chip">
            <span className="admin-date-chip__dot" />
            {dateLabel}
          </div>
        }
      />

      {isError && (
        <div className="admin-error-banner" role="alert">
          <span>Dashboard data could not be refreshed.</span>
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            Try again
          </Button>
        </div>
      )}

      <section className="admin-dashboard__metrics" aria-label="Clinic overview metrics">
        <div className="admin-section-heading">
          <div>
            <p className="admin-section-heading__eyebrow">CLINIC SNAPSHOT</p>
            <h2>Today at a glance</h2>
          </div>
          <span className="admin-live-label">
            <span /> Live records
          </span>
        </div>
        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Clinic patients"
              value={data?.patientCount ?? 0}
              icon={<Users className="h-[18px] w-[18px]" />}
              hint="Registered clinic records"
              accent="primary"
            />
            <StatCard
              label="Appointments today"
              value={todayAppointments.length}
              icon={<CalendarClock className="h-[18px] w-[18px]" />}
              hint="Scheduled for today"
              accent="secondary"
            />
            <StatCard
              label="New home visits"
              value={newVisits.length}
              icon={<Home className="h-[18px] w-[18px]" />}
              hint="Requests awaiting review"
              accent="amber"
            />
            <StatCard
              label="New enquiries"
              value={newMessages.length}
              icon={<MessageSquare className="h-[18px] w-[18px]" />}
              hint="Messages awaiting review"
              accent="rose"
            />
          </div>
        )}
      </section>

      <section className="admin-dashboard__main-grid">
        <div className="admin-dashboard__primary-column">
          <section className="admin-panel admin-schedule">
            <div className="admin-panel__header">
              <div>
                <p className="admin-panel__eyebrow">DAILY WORKFLOW</p>
                <h2>Today's appointments</h2>
                <p>Appointments recorded for {dateLabel}.</p>
              </div>
              <Link to="/admin/appointments" className="admin-text-link">
                Full schedule <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {isLoading ? (
              <div className="space-y-3 p-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : upcomingAppointments.length ? (
              <div className="admin-appointment-list">
                {upcomingAppointments.map((appointment) => (
                  <div className="admin-appointment-row" key={appointment.id}>
                    <div className="admin-appointment-row__time">
                      <Clock3 className="h-3.5 w-3.5" />
                      {timeLabel(appointment.appointment_at)}
                    </div>
                    <div className="admin-appointment-row__person">
                      <span className="admin-appointment-row__avatar">
                        <UserRound className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <strong>{appointment.patient_name || "Unnamed patient"}</strong>
                        <small>{appointment.service || "Physiotherapy appointment"}</small>
                      </span>
                    </div>
                    <span
                      className={
                        "admin-status-pill " +
                        (appointment.status === "confirmed"
                          ? "is-confirmed"
                          : appointment.status === "completed"
                            ? "is-completed"
                            : appointment.status === "cancelled" || appointment.status === "no-show"
                              ? "is-cancelled"
                              : "is-pending")
                      }
                    >
                      {appointment.status || "pending"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="admin-empty-state">
                <CalendarClock className="h-6 w-6" />
                <strong>No appointments scheduled today</strong>
                <span>New bookings will appear here when they are added.</span>
                <Link to="/admin/appointments">
                  Open appointments <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
            <div className="admin-panel__footer">
              <span>
                <CheckCircle2 className="h-4 w-4" /> {todayAppointments.length} appointment
                {todayAppointments.length === 1 ? "" : "s"} today
              </span>
              <Link to="/admin/appointments">Manage schedule</Link>
            </div>
          </section>

          <section className="admin-panel admin-quick-actions">
            <div className="admin-panel__header">
              <div>
                <p className="admin-panel__eyebrow">SHORTCUTS</p>
                <h2>Common tasks</h2>
              </div>
            </div>
            <div className="admin-action-grid">
              <QuickAction
                to="/admin/personal-patients"
                icon={<UserRoundPlus />}
                title="Personal patient ledger"
                detail="Your private caseload"
              />
              <QuickAction
                to="/admin/patients"
                icon={<Users />}
                title="Clinic patients"
                detail="Clinic-wide records"
              />
              <QuickAction
                to="/admin/appointments"
                icon={<CalendarClock />}
                title="Appointments"
                detail="Manage the schedule"
              />
              <QuickAction
                to="/admin/home-visits"
                icon={<Home />}
                title="Home visits"
                detail="Review visit requests"
              />
              <QuickAction
                to="/admin/messages"
                icon={<MessageSquare />}
                title="Enquiries"
                detail="Review messages"
              />
            </div>
          </section>
        </div>

        <aside className="admin-dashboard__side-column">
          <section className="admin-panel admin-inbox-panel">
            <div className="admin-panel__header">
              <div>
                <p className="admin-panel__eyebrow">NEEDS ATTENTION</p>
                <h2>Incoming requests</h2>
              </div>
              <span className="admin-inbox-total">{newVisits.length + newMessages.length}</span>
            </div>
            <div className="admin-inbox-group">
              <Link to="/admin/home-visits" className="admin-inbox-link">
                <span className="admin-inbox-link__icon is-home">
                  <Home className="h-4 w-4" />
                </span>
                <span>
                  <strong>Home visit requests</strong>
                  <small>New patient visit enquiries</small>
                </span>
                <b>{newVisits.length}</b>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/admin/messages" className="admin-inbox-link">
                <span className="admin-inbox-link__icon is-message">
                  <MessageSquare className="h-4 w-4" />
                </span>
                <span>
                  <strong>Website enquiries</strong>
                  <small>Contact form submissions</small>
                </span>
                <b>{newMessages.length}</b>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="admin-panel__footer">
              <span>
                <Activity className="h-4 w-4" /> Inbox overview
              </span>
              <Link to="/admin/home-visits">Review requests</Link>
            </div>
          </section>

          <section className="admin-panel admin-workspace-note">
            <div className="admin-workspace-note__mark">
              <UserRound className="h-5 w-5" />
            </div>
            <p className="admin-panel__eyebrow">SEPARATE WORKSPACE</p>
            <h2>Personal patient ledger</h2>
            <p>
              Your private patient accounts, treatment sessions and payment records remain separate
              from clinic-wide patient records.
            </p>
            <Link to="/admin/personal-patients">
              Open your ledger <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        </aside>
      </section>
    </div>
  );
}

function QuickAction({
  to,
  icon,
  title,
  detail,
}: {
  to:
    | "/admin/personal-patients"
    | "/admin/patients"
    | "/admin/appointments"
    | "/admin/home-visits"
    | "/admin/messages";
  icon: React.ReactNode;
  title: string;
  detail: string;
}) {
  return (
    <Link to={to} className="admin-action-link">
      <span className="admin-action-link__icon">{icon}</span>
      <span className="min-w-0">
        <strong>{title}</strong>
        <small>{detail}</small>
      </span>
      <ArrowRight className="admin-action-link__arrow h-4 w-4" />
    </Link>
  );
}
