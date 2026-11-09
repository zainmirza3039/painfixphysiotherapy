import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  CalendarPlus,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  Plus,
  ShieldCheck,
  Copy,
  Share2,
  ChevronLeft,
  ChevronRight,
  Download,
  Printer,
  CalendarDays,
  MessageCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { personalPatientDb } from "@/admin/personal-patients.db";
import { useAdminAuth } from "@/admin/AdminAuthProvider";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminQueryError } from "@/components/admin/AdminQueryError";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/admin/personal-patients/$patientId")({
  component: PersonalPatientDetailPage,
});

type Patient = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  private_notes: string | null;
  status: string;
};
type Plan = {
  id: string;
  plan_type: string;
  title: string;
  package_sessions: number | null;
  package_fee: number | null;
  per_session_fee: number | null;
  is_active: boolean;
};
type Session = {
  id: string;
  plan_id: string | null;
  session_date: string;
  status: string;
  session_label: string | null;
  charge_amount: number;
  private_note: string | null;
};
type Entry = {
  id: string;
  entry_type: string;
  amount: number;
  description: string;
  payment_method: string | null;
  occurred_at: string;
};
type AuditEvent = {
  id: string;
  entity_type: string;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
};
const money = (n: number) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(n);
const date = (v: string) =>
  new Intl.DateTimeFormat("en-PK", { dateStyle: "medium", timeStyle: "short" }).format(new Date(v));

function PersonalPatientDetailPage() {
  const { patientId } = Route.useParams();
  const { user } = useAdminAuth();
  const qc = useQueryClient();
  const [language, setLanguage] = useState<"en" | "ur">("en");
  const [planOpen, setPlanOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [portalOpen, setPortalOpen] = useState(false);
  const [portalPin, setPortalPin] = useState("");
  const [portalUrl, setPortalUrl] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [planType, setPlanType] = useState<"package" | "per_session" | "custom">("package");
  const [planTitle, setPlanTitle] = useState("Physiotherapy package");
  const [packageSessions, setPackageSessions] = useState("10");
  const [packageFee, setPackageFee] = useState("");
  const [perSessionFee, setPerSessionFee] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionLabel, setSessionLabel] = useState("");
  const [sessionCharge, setSessionCharge] = useState("0");
  const [sessionNote, setSessionNote] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentDescription, setPaymentDescription] = useState("Patient payment");

  const t =
    language === "ur"
      ? {
          back: "ذاتی مریضوں کی فہرست",
          plan: "بلنگ پلان",
          addSession: "سیشن شامل کریں",
          payment: "ادائیگی درج کریں",
          completed: "مکمل سیشنز",
          upcoming: "آنے والے سیشنز",
          charges: "کل چارجز",
          received: "وصول شدہ رقم",
          billing: "مالی خلاصہ",
          plans: "بلنگ پلانز",
          sessions: "سیشنز کی تفصیل",
          statement: "مالی اسٹیٹمنٹ",
          privateNotes: "معالج کے نجی نوٹس — مریض کو نہیں دکھائے جائیں گے",
          due: "بقایا رقم",
          credit: "ایڈوانس کریڈٹ",
          settled: "حساب برابر",
          remaining: "باقی پیکیج سیشنز",
          noPlan: "کوئی فعال پلان نہیں",
          addPlan: "بلنگ پلان شامل کریں",
          schedule: "سیشن شیڈول کریں",
          save: "محفوظ کریں",
          cancel: "منسوخ",
          language: "English",
          completedStatus: "مکمل",
          scheduled: "شیڈول",
          cancelled: "منسوخ",
          rescheduled: "دوبارہ شیڈول",
          markComplete: "مکمل کریں",
          recordPayment: "ادائیگی درج کریں",
        }
      : {
          back: "Back to Personal Patients",
          plan: "Billing plan",
          addSession: "Add session",
          payment: "Record payment",
          completed: "Completed sessions",
          upcoming: "Upcoming sessions",
          charges: "Total charges",
          received: "Received",
          billing: "Billing overview",
          plans: "Billing plans",
          sessions: "Session history",
          statement: "Financial statement",
          privateNotes: "Private clinician notes — never shared with patient",
          due: "Outstanding dues",
          credit: "Advance credit",
          settled: "Settled",
          remaining: "Package sessions left",
          noPlan: "No active plan",
          addPlan: "Add billing plan",
          schedule: "Schedule session",
          save: "Save",
          cancel: "Cancel",
          language: "اردو",
          completedStatus: "Completed",
          scheduled: "Scheduled",
          cancelled: "Cancelled",
          rescheduled: "Rescheduled",
          markComplete: "Complete",
          recordPayment: "Record payment",
        };

  useEffect(() => {
    if (language !== "ur" || document.getElementById("painfix-nastaliq-font")) return;
    const link = document.createElement("link");
    link.id = "painfix-nastaliq-font";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, [language]);

  const query = useQuery({
    queryKey: ["admin", "personal-patient-detail", user?.id, patientId],
    enabled: Boolean(user?.id && patientId),
    queryFn: async () => {
      const db = personalPatientDb;
      const [p, plans, sessions, ledger, audit] = await Promise.all([
        db
          .from("personal_patients")
          .select("id,full_name,phone,email,private_notes,status")
          .eq("id", patientId)
          .single(),
        db
          .from("personal_patient_plans")
          .select("id,plan_type,title,package_sessions,package_fee,per_session_fee,is_active")
          .eq("patient_id", patientId)
          .order("created_at", { ascending: false }),
        db
          .from("personal_patient_sessions")
          .select("id,plan_id,session_date,status,session_label,charge_amount,private_note")
          .eq("patient_id", patientId)
          .order("session_date", { ascending: false }),
        db
          .from("personal_patient_ledger")
          .select("id,entry_type,amount,description,payment_method,occurred_at")
          .eq("patient_id", patientId)
          .order("occurred_at", { ascending: false }),
        db
          .from("personal_patient_audit_events")
          .select("id,entity_type,action,details,created_at")
          .eq("patient_id", patientId)
          .order("created_at", { ascending: false })
          .limit(50),
      ]);
      for (const result of [p, plans, sessions, ledger, audit])
        if (result.error) throw result.error;
      return {
        patient: p.data as Patient,
        plans: plans.data as Plan[],
        sessions: sessions.data as Session[],
        ledger: ledger.data as Entry[],
        audit: audit.data as AuditEvent[],
      };
    },
  });

  const data = query.data;
  const activePlan = data?.plans.find((p) => p.is_active);
  const completed = data?.sessions.filter((s) => s.status === "completed").length ?? 0;
  const scheduled = data?.sessions.filter((s) => s.status === "scheduled").length ?? 0;
  const totalCharges =
    data?.ledger
      .filter((e) => e.entry_type === "charge")
      .reduce((n, e) => n + Number(e.amount), 0) ?? 0;
  const received =
    data?.ledger
      .filter((e) => e.entry_type === "payment")
      .reduce((n, e) => n + Math.abs(Number(e.amount)), 0) ?? 0;
  const balance = data?.ledger.reduce((n, e) => n + Number(e.amount), 0) ?? 0;
  const refresh = () =>
    qc.invalidateQueries({ queryKey: ["admin", "personal-patient-detail", user?.id, patientId] });
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return [
      ...Array(firstWeekday).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
  }, [calendarMonth]);
  const monthSessions = (data?.sessions ?? []).filter((s) => {
    const d = new Date(s.session_date);
    return (
      d.getFullYear() === calendarMonth.getFullYear() && d.getMonth() === calendarMonth.getMonth()
    );
  });
  const exportCsv = () => {
    if (!data) return;
    const rows = [
      ["Record type", "Date", "Description", "Status / method", "Amount PKR"],
      ...data.ledger.map((e) => [
        "Financial",
        e.occurred_at,
        e.description,
        e.payment_method ?? e.entry_type,
        e.amount,
      ]),
      ...data.sessions.map((s) => [
        "Session",
        s.session_date,
        s.session_label ?? "Physiotherapy session",
        s.status,
        s.charge_amount,
      ]),
    ];
    const csv = rows
      .map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `painfix-${data.patient.full_name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-statement.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const sendWhatsAppReminder = () => {
    if (!data) return;
    const next = (data.sessions ?? [])
      .filter((s) => s.status === "scheduled" && new Date(s.session_date).getTime() >= Date.now())
      .sort((a, b) => a.session_date.localeCompare(b.session_date))[0];
    const message = [
      `Assalam-o-Alaikum ${data.patient.full_name},`,
      next
        ? `Your next PainFix physiotherapy session is scheduled for ${date(next.session_date)}.`
        : "",
      balance > 0
        ? `Your current outstanding balance is ${money(balance)}.`
        : balance < 0
          ? `Your account has an advance credit of ${money(-balance)}.`
          : "Your account is settled.",
      "Please contact PainFix if you need to reschedule.",
    ]
      .filter(Boolean)
      .join("\n");
    const phone = (data.patient.phone ?? "").replace(/[^0-9]/g, "");
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const createPlan = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Please sign in again.");
      if (!planTitle.trim()) throw new Error("Plan title is required.");
      const sessions = planType === "package" ? Number(packageSessions) : null;
      const fee = planType === "package" ? Number(packageFee) : null;
      const perFee =
        planType === "per_session"
          ? Number(perSessionFee)
          : planType === "custom" && perSessionFee
            ? Number(perSessionFee)
            : null;
      if (
        planType === "package" &&
        (!sessions || sessions < 1 || fee == null || !Number.isFinite(fee) || fee < 0)
      )
        throw new Error("Enter valid package sessions and fee.");
      if (planType === "per_session" && (!Number.isFinite(perFee) || (perFee ?? 0) < 0))
        throw new Error("Enter a valid per-session fee.");
      const { error } = await personalPatientDb.from("personal_patient_plans").insert({
        clinician_id: user.id,
        patient_id: patientId,
        plan_type: planType,
        title: planTitle.trim(),
        package_sessions: sessions,
        package_fee: fee,
        per_session_fee: perFee,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      await refresh();
      setPlanOpen(false);
      toast.success("Billing plan saved.");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save plan."),
  });

  const createSession = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Please sign in again.");
      if (!sessionDate) throw new Error("Select a session date and time.");
      const charge = Number(sessionCharge);
      if (!Number.isFinite(charge) || charge < 0) throw new Error("Enter a valid session fee.");
      const { error } = await personalPatientDb.from("personal_patient_sessions").insert({
        clinician_id: user.id,
        patient_id: patientId,
        plan_id: activePlan?.id ?? null,
        session_date: new Date(sessionDate).toISOString(),
        status: "scheduled",
        session_label: sessionLabel.trim() || null,
        charge_amount: charge,
        private_note: sessionNote.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      await refresh();
      setSessionOpen(false);
      setSessionDate("");
      setSessionLabel("");
      setSessionCharge(String(activePlan?.per_session_fee ?? 0));
      setSessionNote("");
      toast.success("Session scheduled. It is not counted as completed yet.");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not schedule session."),
  });

  const addPayment = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Please sign in again.");
      const amount = Number(paymentAmount);
      if (!Number.isFinite(amount) || amount <= 0)
        throw new Error("Enter a payment amount greater than zero.");
      const { error } = await personalPatientDb.from("personal_patient_ledger").insert({
        clinician_id: user.id,
        patient_id: patientId,
        entry_type: "payment",
        amount: -amount,
        description: paymentDescription.trim() || "Patient payment",
        payment_method: paymentMethod,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      await refresh();
      setPaymentOpen(false);
      setPaymentAmount("");
      setPaymentDescription("Patient payment");
      toast.success("Payment recorded.");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not record payment."),
  });

  const managePortal = useMutation({
    mutationFn: async (action: "create_or_rotate" | "revoke") => {
      if (action === "create_or_rotate" && !/^\d{6}$/.test(portalPin))
        throw new Error("Enter a six-digit PIN.");
      const { data, error } = await supabase.functions.invoke("manage-patient-portal", {
        body: { action, patientId, ...(action === "create_or_rotate" ? { pin: portalPin } : {}) },
      });
      if (error || data?.error)
        throw new Error(data?.error || error?.message || "Could not update patient portal access.");
      return data as { token?: string; revoked?: boolean };
    },
    onSuccess: (result) => {
      if (result.token) {
        setPortalUrl(`${window.location.origin}/patient-portal/${result.token}`);
        toast.success("Patient portal link created. Share the PIN separately.");
      } else if (result.revoked) {
        setPortalUrl("");
        toast.success("Patient portal access disabled.");
      }
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Portal access could not be updated."),
  });

  const updateSession = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "completed" | "cancelled" | "rescheduled";
    }) => {
      const { error } = await personalPatientDb
        .from("personal_patient_sessions")
        .update({
          status,
          completed_at: status === "completed" ? new Date().toISOString() : null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await refresh();
      toast.success("Session status updated.");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update session."),
  });

  const activePlanCompleted = activePlan
    ? (data?.sessions ?? []).filter((s) => s.plan_id === activePlan.id && s.status === "completed")
        .length
    : 0;
  const remaining =
    activePlan?.plan_type === "package" && activePlan.package_sessions != null
      ? Math.max(0, activePlan.package_sessions - activePlanCompleted)
      : null;

  if (query.isLoading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-44 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  if (query.isError || !data) return <AdminQueryError onRetry={() => void query.refetch()} />;

  return (
    <div className="personal-patients-portal space-y-5" dir={language === "ur" ? "rtl" : "ltr"}>
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLanguage(language === "en" ? "ur" : "en")}
        >
          {t.language}
        </Button>
      </div>
      <Link
        to="/admin/personal-patients"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.back}
      </Link>
      <AdminPageHeader
        title={data.patient.full_name}
        description={
          [data.patient.phone, data.patient.email].filter(Boolean).join(" · ") ||
          "Personal patient account"
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setPlanOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t.plan}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSessionCharge(String(activePlan?.per_session_fee ?? 0));
                setSessionOpen(true);
              }}
            >
              <CalendarPlus className="mr-2 h-4 w-4" />
              {t.addSession}
            </Button>
            <Button variant="outline" onClick={() => setPortalOpen(true)}>
              <ShieldCheck className="mr-2 h-4 w-4" />
              {language === "ur" ? "مریض پورٹل" : "Patient portal"}
            </Button>
            <Button onClick={() => setPaymentOpen(true)}>
              <CreditCard className="mr-2 h-4 w-4" />
              {t.payment}
            </Button>
          </div>
        }
      />
      <div className="flex flex-wrap justify-end gap-2">
        <Button size="sm" variant="outline" onClick={sendWhatsAppReminder}>
          <MessageCircle className="mr-2 h-4 w-4" />
          {language === "ur" ? "واٹس ایپ یاد دہانی" : "WhatsApp reminder"}
        </Button>
      </div>
      {data.patient.private_notes && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t.privateNotes}
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm">{data.patient.private_notes}</p>
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: t.completed, value: completed },
          { label: t.upcoming, value: scheduled },
          { label: t.charges, value: money(totalCharges) },
          { label: t.received, value: money(received) },
        ].map((x) => (
          <div key={x.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">{x.label}</p>
            <p className="mt-2 text-xl font-semibold">{x.value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">{t.billing}</h2>
            <Badge variant={balance > 0 ? "destructive" : "secondary"}>
              {balance > 0 ? t.due : balance < 0 ? t.credit : t.settled}
            </Badge>
          </div>
          <p className="mt-3 text-3xl font-semibold">{money(Math.abs(balance))}</p>
          <p className="text-xs text-muted-foreground">
            {balance > 0 ? t.due : balance < 0 ? t.credit : t.settled}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-3 text-sm">
            <div>
              <p className="text-muted-foreground">{t.plan}</p>
              <p className="mt-1 font-medium">{activePlan?.title ?? t.noPlan}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t.remaining}</p>
              <p className="mt-1 font-medium">{remaining == null ? "—" : remaining}</p>
            </div>
          </div>
        </section>
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="font-semibold">{t.plans}</h2>
          {data.plans.length ? (
            <div className="mt-3 space-y-3">
              {data.plans.map((p) => (
                <div
                  key={p.id}
                  className="flex items-start justify-between gap-3 border-t border-border pt-3 first:border-0 first:pt-0"
                >
                  <div>
                    <p className="font-medium">{p.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {p.plan_type === "package"
                        ? `${p.package_sessions} sessions · ${money(Number(p.package_fee ?? 0))}`
                        : p.plan_type === "per_session"
                          ? `${money(Number(p.per_session_fee ?? 0))} per session`
                          : "Custom billing"}
                    </p>
                  </div>
                  <Badge variant={p.is_active ? "default" : "secondary"}>
                    {p.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">No billing plan added yet.</p>
          )}
        </section>
      </div>
      <section className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold">
              {language === "ur" ? "سیشن کیلنڈر" : "Session calendar"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() =>
                setCalendarMonth(
                  new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1),
                )
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <p className="min-w-32 text-center text-sm font-medium">
              {new Intl.DateTimeFormat(language === "ur" ? "ur-PK" : "en-US", {
                month: "long",
                year: "numeric",
              }).format(calendarMonth)}
            </p>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() =>
                setCalendarMonth(
                  new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1),
                )
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-7 gap-1">
          {(language === "ur"
            ? ["اتوار", "پیر", "منگل", "بدھ", "جمعرات", "جمعہ", "ہفتہ"]
            : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
          ).map((day) => (
            <div
              key={day}
              className="py-2 text-center text-[11px] font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
          {calendarDays.map((day, index) => {
            const daySessions =
              day == null
                ? []
                : monthSessions.filter((s) => new Date(s.session_date).getDate() === day);
            return (
              <div
                key={day == null ? `blank-${index}` : day}
                className={`min-h-16 rounded-md border p-1.5 ${day == null ? "border-transparent" : "border-border bg-background"}`}
              >
                {day != null && (
                  <>
                    <span className="text-xs font-medium">{day}</span>
                    {daySessions.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {daySessions.map((s) => (
                          <span
                            key={s.id}
                            title={s.status}
                            className={`h-2 w-2 rounded-full ${s.status === "completed" ? "bg-emerald-500" : s.status === "cancelled" ? "bg-rose-500" : s.status === "rescheduled" ? "bg-amber-500" : "bg-blue-500"}`}
                          />
                        ))}
                      </div>
                    )}
                    {daySessions.length > 0 && (
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {daySessions.length}{" "}
                        {language === "ur"
                          ? "سیشن"
                          : daySessions.length === 1
                            ? "session"
                            : "sessions"}
                      </p>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <i className="h-2 w-2 rounded-full bg-emerald-500" />
            {language === "ur" ? "مکمل" : "Completed"}
          </span>
          <span className="flex items-center gap-1">
            <i className="h-2 w-2 rounded-full bg-blue-500" />
            {language === "ur" ? "شیڈول" : "Scheduled"}
          </span>
          <span className="flex items-center gap-1">
            <i className="h-2 w-2 rounded-full bg-rose-500" />
            {language === "ur" ? "منسوخ" : "Cancelled"}
          </span>
          <span className="flex items-center gap-1">
            <i className="h-2 w-2 rounded-full bg-amber-500" />
            {language === "ur" ? "دوبارہ شیڈول" : "Rescheduled"}
          </span>
        </div>
      </section>
      <section className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{t.sessions}</h2>
          <Badge variant="secondary">{data.sessions.length} total</Badge>
        </div>
        {data.sessions.length ? (
          <div className="mt-3 divide-y divide-border">
            {data.sessions.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-medium">{s.session_label || "Physiotherapy session"}</p>
                  <p className="text-sm text-muted-foreground">
                    {date(s.session_date)} · {money(Number(s.charge_amount))}
                  </p>
                  {s.private_note && (
                    <p className="mt-1 text-xs text-muted-foreground">{s.private_note}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      s.status === "completed"
                        ? "default"
                        : s.status === "cancelled"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {s.status}
                  </Badge>
                  {s.status === "scheduled" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={updateSession.isPending}
                        onClick={() => updateSession.mutate({ id: s.id, status: "completed" })}
                      >
                        <CheckCircle2 className="mr-1 h-4 w-4" />
                        {t.markComplete}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={updateSession.isPending}
                        onClick={() => updateSession.mutate({ id: s.id, status: "cancelled" })}
                      >
                        {t.cancel}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={updateSession.isPending}
                        onClick={() => updateSession.mutate({ id: s.id, status: "rescheduled" })}
                      >
                        {t.rescheduled}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">No sessions scheduled yet.</p>
        )}
      </section>
      <section className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">{t.statement}</h2>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={exportCsv}>
              <Download className="mr-1 h-4 w-4" />
              {language === "ur" ? "CSV ایکسپورٹ" : "Export CSV"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => window.print()}>
              <Printer className="mr-1 h-4 w-4" />
              {language === "ur" ? "PDF / پرنٹ" : "Print / PDF"}
            </Button>
          </div>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Charges, payments, refunds and credits are recorded as separate ledger entries.
        </p>
        {data.ledger.length ? (
          <div className="mt-3 divide-y divide-border">
            {data.ledger.map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium">{e.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {date(e.occurred_at)}
                  {e.payment_method
                    ? ` · ${e.payment_method.replace("_", " ")}`
                    : ""}
                  </p>
                </div>
                <p
                  className={`font-semibold tabular-nums ${e.amount < 0 ? "text-emerald-600" : "text-foreground"}`}
                >
                  {e.amount < 0 ? "− " : "+ "}
                  {money(Math.abs(Number(e.amount)))}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">No financial entries yet.</p>
        )}
      </section>
      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="font-semibold">
          {language === "ur" ? "تبدیلیوں کی ہسٹری" : "Change history"}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {language === "ur"
            ? "سیشنز، ادائیگیوں اور پلان میں تبدیلیوں کا ریکارڈ۔"
            : "Recorded changes to sessions, payments, plans and patient details."}
        </p>
        {data.audit.length ? (
          <div className="mt-3 divide-y divide-border">
            {data.audit.map((event) => (
              <div key={event.id} className="flex items-start justify-between gap-3 py-2">
                <div>
                  <p className="text-sm font-medium">{event.action.replaceAll("_", " ")}</p>
                  <p className="text-xs text-muted-foreground">{event.entity_type}</p>
                </div>
                <p className="shrink-0 text-xs text-muted-foreground">{date(event.created_at)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">No changes recorded yet.</p>
        )}
      </section>
      <Dialog open={portalOpen} onOpenChange={setPortalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {language === "ur" ? "مریض کے پورٹل تک رسائی" : "Patient portal access"}
            </DialogTitle>
            <DialogDescription>
              {language === "ur"
                ? "مستقل لنک بنائیں اور چھ ہندسوں کا پن الگ سے مریض کو دیں۔"
                : "Create a permanent link and share the six-digit PIN with the patient separately."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>{language === "ur" ? "چھ ہندسوں کا پن" : "Six-digit PIN"}</Label>
              <Input
                inputMode="numeric"
                maxLength={6}
                value={portalPin}
                onChange={(e) => setPortalPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="••••••"
              />
            </div>
            <Button
              className="w-full"
              disabled={managePortal.isPending || portalPin.length !== 6}
              onClick={() => managePortal.mutate("create_or_rotate")}
            >
              {managePortal.isPending
                ? "…"
                : language === "ur"
                  ? "لنک بنائیں / پن تبدیل کریں"
                  : "Create link / rotate PIN"}
            </Button>
            {portalUrl && (
              <div className="space-y-2 rounded-lg border border-border p-3">
                <Label>{language === "ur" ? "مریض کا لنک" : "Patient link"}</Label>
                <Input readOnly value={portalUrl} />
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      void navigator.clipboard
                        .writeText(portalUrl)
                        .then(() => toast.success("Link copied."));
                    }}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    {language === "ur" ? "لنک کاپی کریں" : "Copy link"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const msg = encodeURIComponent(
                        `Assalam-o-Alaikum. Your PainFix patient record is available here: ${portalUrl}. Please enter the six-digit PIN shared separately.`,
                      );
                      window.open(`https://wa.me/?text=${msg}`, "_blank", "noopener,noreferrer");
                    }}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    WhatsApp
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    void navigator.clipboard
                      .writeText(portalPin)
                      .then(() => toast.success("PIN copied. Share it separately from the link."));
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {language === "ur" ? "پن الگ سے کاپی کریں" : "Copy PIN separately"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  {language === "ur"
                    ? "سیکیورٹی کے لیے پن واٹس ایپ لنک کے ساتھ نہ بھیجیں؛ اسے الگ ذریعے سے شیئر کریں۔"
                    : "For security, do not send the PIN in the same WhatsApp message as the link."}
                </p>
              </div>
            )}
            <Button
              variant="destructive"
              className="w-full"
              disabled={managePortal.isPending || !portalUrl}
              onClick={() => managePortal.mutate("revoke")}
            >
              {language === "ur" ? "پورٹل رسائی بند کریں" : "Disable patient portal access"}
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPortalOpen(false)}>
              {t.cancel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={planOpen} onOpenChange={setPlanOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.addPlan}</DialogTitle>
            <DialogDescription>
              Package fees are charged once when the plan is saved. Included sessions are not
              charged again.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              createPlan.mutate();
            }}
          >
            <div className="space-y-1">
              <Label>{language === "ur" ? "بلنگ کی قسم" : "Billing type"}</Label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={planType}
                onChange={(e) => setPlanType(e.target.value as typeof planType)}
              >
                <option value="package">Package fee</option>
                <option value="per_session">Per-session fee</option>
                <option value="custom">Custom fee</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label>{language === "ur" ? "پلان کا عنوان" : "Plan title"}</Label>
              <Input value={planTitle} onChange={(e) => setPlanTitle(e.target.value)} required />
            </div>
            {planType === "package" && (
              <>
                <div className="space-y-1">
                  <Label>{language === "ur" ? "شامل سیشنز" : "Included sessions"}</Label>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    value={packageSessions}
                    onChange={(e) => setPackageSessions(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label>
                    {language === "ur" ? "پیکیج کی کل فیس (روپے)" : "Total package fee (PKR)"}
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={packageFee}
                    onChange={(e) => setPackageFee(e.target.value)}
                    required
                  />
                </div>
              </>
            )}
            {planType !== "package" && (
              <div className="space-y-1">
                <Label>
                  {planType === "per_session"
                    ? "Fee per completed session (PKR)"
                    : "Default session fee (optional)"}
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={perSessionFee}
                  onChange={(e) => setPerSessionFee(e.target.value)}
                  required={planType === "per_session"}
                />
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPlanOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createPlan.isPending}>
                {createPlan.isPending ? "Saving…" : "Save plan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={sessionOpen} onOpenChange={setSessionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.schedule}</DialogTitle>
            <DialogDescription>
              A scheduled session is not counted as completed until you mark it complete.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              createSession.mutate();
            }}
          >
            <div className="space-y-1">
              <Label>{language === "ur" ? "تاریخ اور وقت" : "Date and time"}</Label>
              <Input
                type="datetime-local"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>
                {language === "ur" ? "سیشن کا عنوان (اختیاری)" : "Session label (optional)"}
              </Label>
              <Input
                value={sessionLabel}
                onChange={(e) => setSessionLabel(e.target.value)}
                placeholder="e.g. Follow-up session"
              />
            </div>
            <div className="space-y-1">
              <Label>
                {language === "ur" ? "اضافی / سیشن فیس (روپے)" : "Extra / session fee (PKR)"}
              </Label>
              <Input
                type="number"
                min="0"
                step="1"
                value={sessionCharge}
                onChange={(e) => setSessionCharge(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Set 0 for a session included in a prepaid package. This fee is charged only when
                marked completed.
              </p>
            </div>
            <div className="space-y-1">
              <Label>{language === "ur" ? "معالج کا نجی نوٹ" : "Private clinician note"}</Label>
              <Textarea
                rows={2}
                value={sessionNote}
                onChange={(e) => setSessionNote(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSessionOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createSession.isPending}>
                {createSession.isPending ? "Saving…" : "Schedule session"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.recordPayment}</DialogTitle>
            <DialogDescription>
              Payments reduce the due balance. Any excess remains as advance credit for future
              charges.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              addPayment.mutate();
            }}
          >
            <div className="space-y-1">
              <Label>{language === "ur" ? "وصول شدہ رقم (روپے)" : "Amount received (PKR)"}</Label>
              <Input
                type="number"
                min="1"
                step="1"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>{language === "ur" ? "ادائیگی کا طریقہ" : "Payment method"}</Label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank transfer</option>
                <option value="jazzcash">JazzCash</option>
                <option value="easypaisa">Easypaisa</option>
                <option value="card">Card</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label>{language === "ur" ? "تفصیل" : "Description"}</Label>
              <Input
                value={paymentDescription}
                onChange={(e) => setPaymentDescription(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPaymentOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addPayment.isPending}>
                {addPayment.isPending ? "Saving…" : "Record payment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
