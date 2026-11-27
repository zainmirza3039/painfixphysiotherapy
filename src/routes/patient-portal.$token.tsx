import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  LockKeyhole,
  ShieldCheck,
  Sun,
  Moon,
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
const money = (n: number) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(n);
const date = (v: string) =>
  new Intl.DateTimeFormat("en-PK", { dateStyle: "medium", timeStyle: "short" }).format(new Date(v));

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
          subtitle: "اپنے علاج کے سیشنز اور ادائیگیوں کی تازہ تفصیل دیکھیں۔",
          pin: "چھ ہندسوں کا پن کوڈ",
          open: "تصدیق کریں / ٹھیک ہے",
          verifying: "تصدیق ہو رہی ہے…",
          theme: "روشن موڈ",
          sessions: "مکمل سیشنز",
          upcoming: "آنے والے سیشنز",
          charges: "کل چارجز",
          received: "وصول شدہ رقم",
          due: "بقایا رقم",
          credit: "ایڈوانس کریڈٹ",
          plan: "موجودہ پلان",
          remaining: "باقی پیکیج سیشنز",
          next: "اگلا سیشن",
          history: "سیشن ہسٹری",
          statement: "مالی اسٹیٹمنٹ",
          security: "آپ کا ریکارڈ محفوظ اور صرف پڑھنے کے لیے ہے۔ طبی نوٹس یہاں ظاہر نہیں ہوتے۔",
          language: "English",
          enterPin: "اپنا پن کوڈ درج کریں",
          noPlan: "کوئی فعال پلان نہیں",
          completed: "مکمل",
          scheduled: "شیڈول",
          cancelled: "منسوخ",
          rescheduled: "دوبارہ شیڈول",
        }
      : {
          title: "Patient Portal",
          subtitle: "View your latest treatment sessions and payment statement.",
          pin: "Six-digit PIN",
          open: "Verify / OK",
          verifying: "Verifying…",
          theme: "Dark mode",
          sessions: "Completed sessions",
          upcoming: "Upcoming sessions",
          charges: "Total charges",
          received: "Payments received",
          due: "Outstanding dues",
          credit: "Advance credit",
          plan: "Current plan",
          remaining: "Package sessions remaining",
          next: "Next session",
          history: "Session history",
          statement: "Financial statement",
          security: "This is a private, read-only record. Clinical notes are not displayed here.",
          language: "اردو",
          enterPin: "Enter your PIN",
          noPlan: "No active plan",
          completed: "Completed",
          scheduled: "Scheduled",
          cancelled: "Cancelled",
          rescheduled: "Rescheduled",
        };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    return () => document.documentElement.classList.remove("dark");
  }, [theme]);

  useEffect(() => {
    if (language !== "ur" || document.getElementById("painfix-nastaliq-font")) return;
    const link = document.createElement("link");
    link.id = "painfix-nastaliq-font";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, [language]);

  useEffect(() => {
    const stored = sessionStorage.getItem(`painfix-portal-${token}`);
    if (stored) setSessionToken(stored);
  }, [token]);

  const verify = useMutation({
    mutationFn: async () => {
      if (!/^\d{6}$/.test(pin))
        throw new Error(
          language === "ur" ? "چھ ہندسوں کا درست پن درج کریں۔" : "Enter a valid six-digit PIN.",
        );
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

  return (
    <main
      className={`personal-patients-portal min-h-screen px-4 py-6 text-slate-900 transition-colors sm:py-10 ${theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-[#F4F7FA]"}`}
      dir={language === "ur" ? "rtl" : "ltr"}
    >
      <div className="mx-auto max-w-4xl">
        <div className={`mb-5 flex flex-wrap items-center justify-between gap-3 border-b pb-4 ${theme === "dark" ? "border-slate-800" : "border-slate-200"}`}>
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#032E61] text-white">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-semibold tracking-wide text-[#032E61]">PAINFIX</span>
              <span className="block text-[11px] text-slate-500">
                Physiotherapy Clinic · Multan
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
              {theme === "light" ? <Moon className="mr-1 h-4 w-4" /> : <Sun className="mr-1 h-4 w-4" />}
              {t.theme}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setLanguage(language === "en" ? "ur" : "en")}>
              {t.language}
            </Button>
          </div>
        </div>
        <section className={`overflow-hidden rounded-xl border border-t-4 border-t-[#00A859] p-5 shadow-sm transition-colors sm:p-8 ${theme === "dark" ? "border-slate-800 bg-slate-900 text-slate-100" : "border-slate-200 bg-white"}`}>
          {!portal ? (
            <div className="mx-auto max-w-sm py-8">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-[#EAF1F8] text-[#032E61]">
                <LockKeyhole className="h-6 w-6" />
              </span>
              <h1 className="mt-4 text-center text-2xl font-semibold tracking-tight text-[#032E61]">
                {t.title}
              </h1>
              <p className="mt-2 text-center text-sm leading-6 text-slate-600">{t.subtitle}</p>
              <form
                className="mt-6 space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  verify.mutate();
                }}
              >
                <Label htmlFor="patient-pin">{t.pin}</Label>
                <Input
                  id="patient-pin"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="••••••"
                  className="h-12 text-center text-xl font-semibold tracking-[0.5em]"
                  required
                />
                <Button
                  type="submit"
                  className="h-11 w-full bg-[#032E61] font-medium hover:bg-[#032E61]/90"
                  disabled={verify.isPending}
                >
                  {verify.isPending ? t.verifying : t.open}
                </Button>
              </form>
              <p className="mt-4 text-center text-xs text-slate-500">{t.security}</p>
            </div>
          ) : dataQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-52" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
            </div>
          ) : dataQuery.isError ? (
            <div className="py-10 text-center">
              <p className="text-sm text-slate-600">
                {dataQuery.error instanceof Error
                  ? dataQuery.error.message
                  : "Could not load this record."}
              </p>
              <Button
                className="mt-4"
                onClick={() => {
                  setSessionToken(null);
                  sessionStorage.removeItem(`painfix-portal-${token}`);
                }}
              >
                Enter PIN again
              </Button>
            </div>
          ) : portal && summary ? (
            <>
              <div className="border-b border-slate-100 pb-5">
                <p className="text-sm text-slate-500">{t.title}</p>
                <h1 className="mt-1 text-2xl font-semibold text-[#032E61]">
                  {portal.patient.full_name}
                </h1>
                <p className="mt-2 text-xs text-slate-500">{t.security}</p>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { label: t.sessions, value: summary.completedSessions },
                  { label: t.upcoming, value: summary.upcomingSessions },
                  { label: t.charges, value: money(summary.totalCharges) },
                  { label: t.received, value: money(summary.totalReceived) },
                  { label: t.due, value: money(summary.outstandingDues) },
                  { label: t.credit, value: money(summary.advanceCredit) },
                ].map((item) => (
                  <div key={item.label} className={`rounded-lg border p-4 ${theme === "dark" ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"}`}>
                    <p className="text-xs text-slate-500">{item.label}</p>
                    <p className={`mt-2 break-words text-xl font-semibold tabular-nums ${theme === "dark" ? "text-slate-100" : "text-[#032E61]"}`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className={`rounded-lg border p-4 ${theme === "dark" ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-[#F8FAFC]"}`}>
                  <p className="text-xs text-slate-500">{t.plan}</p>
                  <p className="mt-1 font-semibold">{portal.plan?.title ?? t.noPlan}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {summary.packageSessionsRemaining == null
                      ? ""
                      : `${t.remaining}: ${summary.packageSessionsRemaining}`}
                  </p>
                </div>
                <div className={`rounded-xl p-4 ${theme === "dark" ? "bg-slate-800" : "bg-slate-50"}`}>
                  <p className="text-xs text-slate-500">{t.next}</p>
                  <p className="mt-1 font-semibold">
                    {summary.nextSession ? date(summary.nextSession.session_date) : "—"}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {summary.nextSession?.session_label ?? ""}
                  </p>
                </div>
              </div>
              <section className="mt-6">
                <h2 className="font-semibold">{t.history}</h2>
                {portal.sessions.length ? (
                  <div className={`mt-2 divide-y ${theme === "dark" ? "divide-slate-800" : "divide-slate-100"}`}>
                    {portal.sessions.map((s, i) => (
                      <div key={i} className="flex flex-wrap items-center justify-between gap-3 py-3">
                        <div>
                          <p className="text-sm font-medium">
                            {s.session_label || "Physiotherapy session"}
                          </p>
                          <p className="text-xs text-slate-500">{date(s.session_date)}</p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs">
                          {formatStatus(s.status)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">—</p>
                )}
              </section>
              <section className="mt-6">
                <h2 className="font-semibold">{t.statement}</h2>
                {portal.ledger.length ? (
                  <div className="mt-2 divide-y divide-slate-100">
                    {portal.ledger.map((e, i) => (
                      <div key={i} className="flex items-center justify-between gap-3 py-3">
                        <div>
                          <p className="text-sm font-medium">{e.description}</p>
                          <p className="text-xs text-slate-500">{date(e.occurred_at)}</p>
                        </div>
                        <p
                          className={`text-sm font-semibold ${e.amount < 0 ? "text-emerald-700" : "text-slate-800"}`}
                        >
                          {e.amount < 0 ? "− " : "+ "}
                          {money(Math.abs(Number(e.amount)))}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">—</p>
                )}
              </section>
              {expiresAt && (
                <p className="mt-5 text-center text-xs text-slate-400">
                  Secure session expires {date(expiresAt)}
                </p>
              )}
            </>
          ) : null}
        </section>
        <p className="mt-5 text-center text-xs text-slate-400">
          PainFix Physiotherapy Clinic · Move Better. Recover Faster.
        </p>
      </div>
    </main>
  );
}
