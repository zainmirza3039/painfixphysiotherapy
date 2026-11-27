import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  LockKeyhole,
  LogOut,
  Moon,
  ShieldCheck,
  Sun,
  Wallet,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/patient-portal/$token")({
  component: PatientPortalPage,
  head: () => ({
    meta: [
      { title: "Patient Portal | PainFix Physiotherapy Clinic" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { name: "referrer", content: "no-referrer" },
    ],
  }),
});

type PortalData = {
  patient: { full_name: string; status: string };
  plan: {
    title: string;
    plan_type: string;
    package_sessions: number | null;
    package_fee: number | null;
    per_session_fee: number | null;
  } | null;
  sessions: {
    session_date: string;
    status: string;
    session_label: string | null;
    charge_amount: number;
  }[];
  ledger: {
    entry_type: string;
    amount: number;
    description: string;
    payment_method: string | null;
    occurred_at: string;
  }[];
  summary: {
    completedSessions: number;
    upcomingSessions: number;
    totalCharges: number;
    totalReceived: number;
    outstandingDues: number;
    advanceCredit: number;
    packageSessionsRemaining: number | null;
    nextSession: { session_date: string; session_label: string | null } | null;
  };
};

function money(value: number, language: "en" | "ur") {
  return new Intl.NumberFormat(language === "ur" ? "ur-PK" : "en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
    numberingSystem: "latn",
  }).format(value);
}

function date(value: string, language: "en" | "ur") {
  return new Intl.DateTimeFormat(language === "ur" ? "ur-PK" : "en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
    numberingSystem: "latn",
  }).format(new Date(value));
}

function PatientPortalPage() {
  const { token } = Route.useParams();
  const [language, setLanguage] = useState<"en" | "ur">("en");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [pin, setPin] = useState("");
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  const t =
    language === "ur"
      ? {
          title: "مریض کا پورٹل",
          subtitle: "اپنے علاج کے سیشنز اور ادائیگیوں کی تازہ تفصیل محفوظ طریقے سے دیکھیں۔",
          pin: "چھ ہندسوں کا پن کوڈ",
          open: "تصدیق کریں / ٹھیک ہے",
          verifying: "تصدیق ہو رہی ہے…",
          darkMode: "ڈارک موڈ",
          lightMode: "لائٹ موڈ",
          completedSessions: "مکمل سیشنز",
          upcomingSessions: "آنے والے سیشنز",
          totalCharges: "کل چارجز",
          received: "وصول شدہ رقم",
          dues: "بقایا رقم",
          credit: "ایڈوانس کریڈٹ",
          plan: "موجودہ علاج کا پلان",
          remaining: "باقی پیکیج سیشنز",
          next: "اگلا سیشن",
          history: "سیشنز کی تفصیل",
          statement: "ادائیگیوں کی تفصیل",
          security: "یہ آپ کا نجی اور صرف پڑھنے کے لیے ریکارڈ ہے۔ طبی نوٹس یہاں ظاہر نہیں ہوتے۔",
          language: "English",
          enterPin: "اپنا پن کوڈ درج کریں",
          noPlan: "کوئی فعال پلان موجود نہیں",
          completed: "مکمل",
          scheduled: "طے شدہ",
          cancelled: "منسوخ",
          rescheduled: "دوبارہ طے شدہ",
          welcome: "خوش آمدید",
          patientAccess: "مریضوں کی محفوظ رسائی",
          overview: "آپ کے علاج کا خلاصہ",
          noSessions: "ابھی کوئی سیشن درج نہیں۔",
          noEntries: "ابھی کوئی مالی اندراج موجود نہیں۔",
          sessionDefault: "فزیوتھراپی سیشن",
          noNext: "فی الحال کوئی اگلا سیشن طے نہیں۔",
          lock: "پورٹل بند کریں",
          expires: "محفوظ سیشن کی میعاد",
          footer: "بہتر حرکت۔ تیز بحالی۔ درد سے آزاد زندگی۔",
          error: "ریکارڈ لوڈ نہیں ہو سکا۔ دوبارہ کوشش کریں۔",
          retry: "دوبارہ کوشش کریں",
        }
      : {
          title: "Patient Portal",
          subtitle: "Securely view your treatment sessions and payment statement.",
          pin: "Six-digit PIN",
          open: "Verify / OK",
          verifying: "Verifying…",
          darkMode: "Dark mode",
          lightMode: "Light mode",
          completedSessions: "Completed sessions",
          upcomingSessions: "Upcoming sessions",
          totalCharges: "Total charges",
          received: "Payments received",
          dues: "Outstanding dues",
          credit: "Advance credit",
          plan: "Current treatment plan",
          remaining: "Package sessions remaining",
          next: "Next session",
          history: "Session history",
          statement: "Payment statement",
          security:
            "This is your private, read-only record. Clinical notes are not displayed here.",
          language: "اردو",
          enterPin: "Enter your PIN",
          noPlan: "No active plan",
          completed: "Completed",
          scheduled: "Scheduled",
          cancelled: "Cancelled",
          rescheduled: "Rescheduled",
          welcome: "Welcome back",
          patientAccess: "SECURE PATIENT ACCESS",
          overview: "Your treatment overview",
          noSessions: "No sessions have been recorded yet.",
          noEntries: "No financial entries are available yet.",
          sessionDefault: "Physiotherapy session",
          noNext: "No upcoming session is scheduled.",
          lock: "Lock portal",
          expires: "Secure session expires",
          footer: "Move Better. Recover Faster. Live Pain-Free.",
          error: "Your record could not be loaded. Please try again.",
          retry: "Try again",
        };

  const isUrdu = language === "ur";
  const page =
    theme === "dark" ? "dark bg-slate-950 text-slate-100" : "bg-[#F2F5F9] text-slate-900";
  const surface = theme === "dark" ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white";
  const muted = theme === "dark" ? "text-slate-400" : "text-slate-500";
  const heading = theme === "dark" ? "text-white" : "text-[#032E61]";
  const divider =
    theme === "dark" ? "divide-slate-800 border-slate-800" : "divide-slate-100 border-slate-200";

  useEffect(() => {
    if (!isUrdu || document.getElementById("painfix-nastaliq-font")) return;
    const link = document.createElement("link");
    link.id = "painfix-nastaliq-font";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, [isUrdu]);

  useEffect(() => {
    const stored = sessionStorage.getItem(`painfix-portal-${token}`);
    if (stored) setSessionToken(stored);
  }, [token]);

  const verify = useMutation({
    mutationFn: async () => {
      if (!/^\d{6}$/.test(pin)) {
        throw new Error(isUrdu ? "چھ ہندسوں کا درست پن درج کریں۔" : "Enter a valid six-digit PIN.");
      }
      const { data, error } = await supabase.functions.invoke("patient-portal", {
        body: { action: "verify", token, pin },
      });
      if (error || !data?.sessionToken) throw new Error(data?.error || "Could not verify the PIN.");
      return data as { sessionToken: string; expiresAt: string };
    },
    onSuccess: (data) => {
      setSessionToken(data.sessionToken);
      setExpiresAt(data.expiresAt);
      sessionStorage.setItem(`painfix-portal-${token}`, data.sessionToken);
      setPin("");
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not open portal."),
  });

  const dataQuery = useQuery({
    queryKey: ["patient-portal", token, sessionToken],
    enabled: Boolean(sessionToken),
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("patient-portal", {
        body: { action: "data", sessionToken },
      });
      if (error || !data?.patient) {
        sessionStorage.removeItem(`painfix-portal-${token}`);
        setSessionToken(null);
        throw new Error(data?.error || "Your session has expired. Enter your PIN again.");
      }
      return data as PortalData;
    },
    retry: false,
  });

  const portal = dataQuery.data;
  const summary = portal?.summary;
  const formatStatus = (status: string) =>
    status === "completed"
      ? t.completed
      : status === "cancelled"
        ? t.cancelled
        : status === "rescheduled"
          ? t.rescheduled
          : t.scheduled;

  const statusTone = (status: string) =>
    status === "completed"
      ? theme === "dark"
        ? "bg-emerald-950 text-emerald-300"
        : "bg-emerald-50 text-emerald-800"
      : status === "cancelled"
        ? theme === "dark"
          ? "bg-rose-950 text-rose-300"
          : "bg-rose-50 text-rose-700"
        : status === "rescheduled"
          ? theme === "dark"
            ? "bg-amber-950 text-amber-300"
            : "bg-amber-50 text-amber-800"
          : theme === "dark"
            ? "bg-blue-950 text-blue-300"
            : "bg-blue-50 text-blue-800";

  const lockPortal = () => {
    sessionStorage.removeItem(`painfix-portal-${token}`);
    setSessionToken(null);
    setExpiresAt(null);
    setPin("");
  };

  return (
    <main
      dir={isUrdu ? "rtl" : "ltr"}
      lang={isUrdu ? "ur" : "en"}
      className={`min-h-screen px-3 py-5 transition-colors sm:px-6 sm:py-8 ${page}`}
      style={isUrdu ? { fontFamily: '"Noto Nastaliq Urdu", serif' } : undefined}
    >
      <div className="mx-auto w-full max-w-5xl">
        <header
          className={`mb-5 flex flex-wrap items-center justify-between gap-4 border-b pb-4 ${divider}`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#032E61] text-white">
              <Activity className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="font-bold tracking-[0.16em] text-[#00A859]">PAINFIX</p>
              <p className={`text-xs ${muted}`}>Physiotherapy Clinic · Multan</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className={
                theme === "dark"
                  ? "border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800"
                  : ""
              }
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              {theme === "light" ? t.darkMode : t.lightMode}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className={
                theme === "dark"
                  ? "border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800"
                  : ""
              }
              onClick={() => setLanguage(isUrdu ? "en" : "ur")}
            >
              {t.language}
            </Button>
            {portal && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className={
                  theme === "dark"
                    ? "border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800"
                    : ""
                }
                onClick={lockPortal}
              >
                <LogOut className="h-4 w-4" />
                {t.lock}
              </Button>
            )}
          </div>
        </header>

        {!portal ? (
          <section className={`overflow-hidden rounded-2xl border shadow-sm ${surface}`}>
            <div className="grid md:grid-cols-[0.9fr_1.1fr]">
              <div className="flex flex-col justify-between bg-[#032E61] p-6 text-white sm:p-9">
                <div>
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                    <ShieldCheck className="h-6 w-6" />
                  </span>
                  <p className="mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                    PAINFIX · {t.patientAccess}
                  </p>
                  <h1 className="mt-3 text-3xl font-semibold leading-tight">{t.title}</h1>
                  <p className="mt-3 max-w-md text-sm leading-7 text-blue-100">{t.subtitle}</p>
                </div>
                <div className="mt-10 flex items-start gap-3 border-t border-white/15 pt-5">
                  <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                  <p className="text-xs leading-6 text-blue-100">{t.security}</p>
                </div>
              </div>
              <div className="flex items-center p-6 sm:p-9">
                <div className="mx-auto w-full max-w-sm">
                  <div
                    className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${theme === "dark" ? "bg-slate-800 text-emerald-300" : "bg-emerald-50 text-[#00854A]"}`}
                  >
                    <LockKeyhole className="h-6 w-6" />
                  </div>
                  <h2 className={`text-xl font-semibold ${heading}`}>{t.enterPin}</h2>
                  <p className={`mt-2 text-sm leading-6 ${muted}`}>{t.subtitle}</p>
                  <form
                    className="mt-7 space-y-4"
                    onSubmit={(event) => {
                      event.preventDefault();
                      verify.mutate();
                    }}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="patient-pin">{t.pin}</Label>
                      <Input
                        id="patient-pin"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={pin}
                        onChange={(event) =>
                          setPin(event.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        placeholder="••••••"
                        className="h-14 text-center text-2xl font-semibold tracking-[0.55em]"
                        required
                        aria-label={t.pin}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="h-12 w-full bg-[#032E61] text-base font-semibold hover:bg-[#032E61]/90"
                      disabled={verify.isPending || pin.length !== 6}
                    >
                      {verify.isPending ? t.verifying : t.open}
                      {verify.isPending ? null : <ArrowUpRight className="h-4 w-4" />}
                    </Button>
                  </form>
                  <p className={`mt-5 text-xs leading-6 ${muted}`}>{t.security}</p>
                </div>
              </div>
            </div>
          </section>
        ) : dataQuery.isLoading ? (
          <section className={`space-y-4 rounded-2xl border p-5 sm:p-8 ${surface}`}>
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-28 w-full" />
            <div className="grid gap-3 sm:grid-cols-3">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          </section>
        ) : dataQuery.isError ? (
          <section className={`rounded-2xl border p-8 text-center ${surface}`}>
            <ShieldCheck className={`mx-auto h-8 w-8 ${muted}`} />
            <h1 className={`mt-3 text-lg font-semibold ${heading}`}>{t.error}</h1>
            <p className={`mt-2 text-sm ${muted}`}>
              {dataQuery.error instanceof Error
                ? dataQuery.error.message
                : "Could not load this record."}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Button variant="outline" onClick={() => void dataQuery.refetch()}>
                {t.retry}
              </Button>
              <Button onClick={lockPortal}>{t.enterPin}</Button>
            </div>
          </section>
        ) : portal && summary ? (
          <div className="space-y-5">
            <section className="overflow-hidden rounded-2xl bg-[#032E61] text-white shadow-sm">
              <div className="flex flex-wrap items-end justify-between gap-5 p-5 sm:p-8">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-300">
                    {t.welcome}
                  </p>
                  <h1 className="mt-2 break-words text-2xl font-semibold sm:text-3xl">
                    {portal.patient.full_name}
                  </h1>
                  <p className="mt-2 text-sm text-blue-100">{t.overview}</p>
                </div>
                <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3">
                  <p className="text-xs text-blue-100">{t.completedSessions}</p>
                  <p className="mt-1 text-3xl font-semibold tabular-nums">
                    {summary.completedSessions}
                  </p>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {[
                {
                  label: t.completedSessions,
                  value: summary.completedSessions,
                  icon: CheckCircle2,
                  tone: "green",
                },
                {
                  label: t.upcomingSessions,
                  value: summary.upcomingSessions,
                  icon: CalendarDays,
                  tone: "blue",
                },
                {
                  label: t.totalCharges,
                  value: money(summary.totalCharges, language),
                  icon: CircleDollarSign,
                  tone: "slate",
                },
                {
                  label: t.received,
                  value: money(summary.totalReceived, language),
                  icon: ArrowDownLeft,
                  tone: "green",
                },
                {
                  label: t.dues,
                  value: money(summary.outstandingDues, language),
                  icon: Wallet,
                  tone: "amber",
                },
                {
                  label: t.credit,
                  value: money(summary.advanceCredit, language),
                  icon: ArrowUpRight,
                  tone: "blue",
                },
              ].map((item) => {
                const Icon = item.icon;
                const iconTone =
                  item.tone === "green"
                    ? "bg-emerald-50 text-emerald-700"
                    : item.tone === "amber"
                      ? "bg-amber-50 text-amber-700"
                      : item.tone === "blue"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-slate-100 text-slate-700";
                return (
                  <article
                    key={item.label}
                    className={`min-w-0 rounded-xl border p-4 shadow-sm sm:p-5 ${surface}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-xs leading-5 sm:text-sm ${muted}`}>{item.label}</p>
                      <span
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${iconTone}`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                    </div>
                    <p
                      className={`mt-3 break-words text-lg font-semibold tabular-nums sm:text-xl ${heading}`}
                      dir="ltr"
                    >
                      {item.value}
                    </p>
                  </article>
                );
              })}
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <article className={`rounded-xl border p-5 ${surface}`}>
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-[#00A859]" />
                  <h2 className={`font-semibold ${heading}`}>{t.plan}</h2>
                </div>
                <p className={`mt-4 text-lg font-semibold ${heading}`}>
                  {portal.plan?.title ?? t.noPlan}
                </p>
                {summary.packageSessionsRemaining != null && (
                  <p className={`mt-2 text-sm ${muted}`}>
                    {t.remaining}:{" "}
                    <strong className={heading}>{summary.packageSessionsRemaining}</strong>
                  </p>
                )}
              </article>
              <article className={`rounded-xl border p-5 ${surface}`}>
                <div className="flex items-center gap-2">
                  <Clock3 className="h-5 w-5 text-[#00A859]" />
                  <h2 className={`font-semibold ${heading}`}>{t.next}</h2>
                </div>
                {summary.nextSession ? (
                  <>
                    <p className={`mt-4 text-lg font-semibold ${heading}`}>
                      {date(summary.nextSession.session_date, language)}
                    </p>
                    <p className={`mt-1 text-sm ${muted}`}>
                      {summary.nextSession.session_label ?? t.sessionDefault}
                    </p>
                  </>
                ) : (
                  <p className={`mt-4 text-sm ${muted}`}>{t.noNext}</p>
                )}
              </article>
            </section>

            <section className={`overflow-hidden rounded-xl border ${surface}`}>
              <div className={`flex items-center gap-3 border-b px-5 py-4 ${divider}`}>
                <CalendarDays className="h-5 w-5 text-[#00A859]" />
                <h2 className={`font-semibold ${heading}`}>{t.history}</h2>
              </div>
              {portal.sessions.length ? (
                <div className={`divide-y ${divider}`}>
                  {portal.sessions.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className={`break-words text-sm font-medium ${heading}`}>
                          {item.session_label || t.sessionDefault}
                        </p>
                        <p className={`mt-1 text-xs ${muted}`}>
                          {date(item.session_date, language)}
                        </p>
                      </div>
                      <span
                        className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${statusTone(item.status)}`}
                      >
                        {formatStatus(item.status)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`px-5 py-6 text-sm ${muted}`}>{t.noSessions}</p>
              )}
            </section>

            <section className={`overflow-hidden rounded-xl border ${surface}`}>
              <div className={`flex items-center gap-3 border-b px-5 py-4 ${divider}`}>
                <Wallet className="h-5 w-5 text-[#00A859]" />
                <h2 className={`font-semibold ${heading}`}>{t.statement}</h2>
              </div>
              {portal.ledger.length ? (
                <div className={`divide-y ${divider}`}>
                  {portal.ledger.map((entry, index) => (
                    <div
                      key={index}
                      className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className={`break-words text-sm font-medium ${heading}`}>
                          {entry.description}
                        </p>
                        <p className={`mt-1 text-xs ${muted}`}>
                          {date(entry.occurred_at, language)}
                        </p>
                      </div>
                      <p
                        className={`text-sm font-semibold tabular-nums ${entry.amount < 0 ? "text-emerald-600" : heading}`}
                        dir="ltr"
                      >
                        {entry.amount < 0 ? "− " : "+ "}
                        {money(Math.abs(Number(entry.amount)), language)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`px-5 py-6 text-sm ${muted}`}>{t.noEntries}</p>
              )}
            </section>

            {expiresAt && (
              <p className={`text-center text-xs ${muted}`}>
                {t.expires}: {date(expiresAt, language)}
              </p>
            )}
          </div>
        ) : null}

        <footer
          className={`mt-6 flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-xs ${divider} ${muted}`}
        >
          <span>PAINFIX · Physiotherapy Clinic · Multan</span>
          <span>{t.footer}</span>
        </footer>
      </div>
    </main>
  );
}
