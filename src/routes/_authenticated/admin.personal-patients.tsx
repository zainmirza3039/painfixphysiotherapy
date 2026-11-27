import { createFileRoute, Link, Navigate, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Archive, CalendarCheck2, CircleDollarSign, Plus, Search, Users } from "lucide-react";
import { personalPatientDb } from "@/admin/personal-patients.db";
import { PatientLedgerImport } from "@/components/admin/PatientLedgerImport";
import { DailyAttendanceLedger } from "@/components/admin/DailyAttendanceLedger";
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

export const Route = createFileRoute("/_authenticated/admin/personal-patients")({
  component: PersonalPatientsPage,
});

type Patient = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  status: string;
  created_at: string;
};
type Session = { patient_id: string; status: string };
type Entry = {
  patient_id: string;
  entry_type: string;
  amount: number;
  description: string;
  reference: string | null;
};
const words = {
  en: {
    title: "Personal Patients",
    desc: "Your private caseload, treatment sessions and patient accounts.",
    add: "Add patient",
    search: "Search by name, phone or patient ID…",
    active: "Active patients",
    sessions: "Completed sessions",
    received: "Payments received",
    dues: "Outstanding dues",
    empty: "No personal patients yet",
    emptyHint: "Add your first patient to start tracking sessions and payments.",
    name: "Patient name",
    phone: "Phone number",
    email: "Email (optional)",
    notes: "Private clinician notes",
    noteHint: "Never shown in the patient portal.",
    cancel: "Cancel",
    save: "Save patient",
    saving: "Saving…",
    language: "اردو",
    activeStatus: "Active",
    hold: "On hold",
    discharged: "Discharged",
    noResults: "No matching patients.",
    open: "Open patient account",
    charges: "Total charges",
    credit: "Advance credit",
    archived: "Show archived",
    restore: "Restore",
    archive: "Archive",
  },
  ur: {
    title: "ذاتی مریض",
    desc: "اپنے مریضوں، علاج کے سیشنز اور مالی ریکارڈ کا نجی انتظام۔",
    add: "مریض شامل کریں",
    search: "نام، فون یا مریض ID تلاش کریں…",
    active: "فعال مریض",
    sessions: "مکمل سیشنز",
    received: "وصول شدہ رقم",
    dues: "بقایا رقم",
    empty: "ابھی کوئی ذاتی مریض موجود نہیں",
    emptyHint: "سیشنز اور ادائیگیاں ریکارڈ کرنے کے لیے پہلا مریض شامل کریں۔",
    name: "مریض کا نام",
    phone: "فون نمبر",
    email: "ای میل (اختیاری)",
    notes: "معالج کے نجی نوٹس",
    noteHint: "یہ مریض کے پورٹل پر ظاہر نہیں ہوں گے۔",
    cancel: "منسوخ",
    save: "مریض محفوظ کریں",
    saving: "محفوظ ہو رہا ہے…",
    language: "English",
    activeStatus: "فعال",
    hold: "عارضی روک",
    discharged: "فارغ",
    noResults: "کوئی متعلقہ مریض نہیں ملا۔",
    open: "مریض کا اکاؤنٹ کھولیں",
    charges: "کل چارجز",
    credit: "ایڈوانس کریڈٹ",
    archived: "محفوظ شدہ دکھائیں",
    restore: "بحال کریں",
    archive: "محفوظ کریں",
  },
} as const;
const money = (n: number) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(n);

function PersonalPatientsPage() {
  const { user, hasRole } = useAdminAuth();
  const qc = useQueryClient();
  const [lang, setLang] = useState<"en" | "ur">("en");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const t = words[lang];
  const isClinicalPhysiotherapist = hasRole("clinical_physiotherapist");
  // Super Admin may fully manage only the ledger owned by their own auth user ID.
  // Cross-clinician review remains on the separate read-only clinician-ledgers route.
  const canManageOwnLedger =
    isClinicalPhysiotherapist || (hasRole("super_admin") && Boolean(user?.id));

  useEffect(() => {
    const id = "painfix-nastaliq-font";
    if (lang === "ur" && !document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap";
      document.head.appendChild(link);
    }
  }, [lang]);

  const query = useQuery({
    queryKey: ["admin", "personal-patients", user?.id],
    enabled: Boolean(user?.id) && canManageOwnLedger,
    queryFn: async () => {
      const db = personalPatientDb;
      const p = await db
        .from("personal_patients")
        .select("id,full_name,phone,email,status,created_at")
        .order("created_at", { ascending: false });
      if (p.error) throw p.error;
      const [sessionsResult, ledgerResult] = await Promise.allSettled([
        db.from("personal_patient_sessions").select("patient_id,status"),
        db
          .from("personal_patient_ledger")
          .select("patient_id,entry_type,amount,description,reference"),
      ]);
      if (sessionsResult.status === "rejected") throw sessionsResult.reason;
      if (ledgerResult.status === "rejected") throw ledgerResult.reason;
      const s = sessionsResult.value;
      const l = ledgerResult.value;
      if (s.error) throw new Error(`Could not load patient sessions: ${s.error.message}`);
      if (l.error) throw new Error(`Could not load patient financial records: ${l.error.message}`);
      return {
        patients: p.data as Patient[],
        sessions: s.data as Session[],
        ledger: l.data as Entry[],
      };
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (query.data?.patients ?? []).filter(
      (p) =>
        (showArchived || p.status !== "archived") &&
        (!q || [p.full_name, p.phone ?? "", p.id].some((v) => v.toLowerCase().includes(q))),
    );
  }, [query.data?.patients, search, showArchived]);

  const totals = useMemo(() => {
    const sessions = query.data?.sessions ?? [];
    const ledger = query.data?.ledger ?? [];
    return {
      active: (query.data?.patients ?? []).filter((p) => p.status === "active").length,
      completed: sessions.filter((s) => s.status === "completed").length,
      received: Math.max(
        0,
        ledger
          .filter((e) => e.entry_type === "payment")
          .reduce((n, e) => n + Math.abs(Number(e.amount)), 0) -
          ledger
            .filter((e) => e.entry_type === "refund")
            .reduce((n, e) => n + Math.max(0, Number(e.amount)), 0) -
          ledger
            .filter(
              (e) => e.entry_type === "adjustment" && e.description.startsWith("Payment reversal:"),
            )
            .reduce((n, e) => n + Math.max(0, Number(e.amount)), 0),
      ),
      charges: ledger
        .filter((e) => e.entry_type === "charge")
        .reduce((n, e) => n + Number(e.amount), 0),
      due: Math.max(
        0,
        ledger.reduce((n, e) => n + Number(e.amount), 0),
      ),
      credit: Math.max(0, -ledger.reduce((n, e) => n + Number(e.amount), 0)),
    };
  }, [query.data]);

  const save = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Please sign in again.");
      if (!name.trim()) throw new Error("Patient name is required.");
      const { data, error } = await personalPatientDb
        .from("personal_patients")
        .insert({
          clinician_id: user.id,
          full_name: name.trim(),
          phone: phone.trim() || null,
          email: email.trim() || null,
          private_notes: notes.trim() || null,
        })
        .select("id")
        .single();
      if (error) throw error;
      const insertedPatient = data as { id?: string } | null;
      if (!insertedPatient?.id) {
        throw new Error("Patient creation could not be confirmed.");
      }
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "personal-patients", user?.id] });
      setOpen(false);
      setName("");
      setPhone("");
      setEmail("");
      setNotes("");
      toast.success(lang === "ur" ? "مریض محفوظ ہو گیا۔" : "Patient saved.");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save patient."),
  });

  const updateStatus = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "active" | "on_hold" | "discharged" | "archived";
    }) => {
      const { error } = await personalPatientDb
        .from("personal_patients")
        .update({ status, archived_at: status === "archived" ? new Date().toISOString() : null })
        .eq("id", id)
        .eq("clinician_id", user?.id ?? "")
        .select("id")
        .single();
      if (error) throw error;
    },
    onSuccess: async (_, variables) => {
      await qc.invalidateQueries({ queryKey: ["admin", "personal-patients", user?.id] });
      toast.success(variables.status === "archived" ? "Patient archived." : "Patient restored.");
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Could not update patient status."),
  });

  if (!canManageOwnLedger) return <Navigate to="/admin" replace />;

  if (pathname.startsWith("/admin/personal-patients/")) {
    return <Outlet />;
  }

  return (
    <div className="personal-patients-portal" dir={lang === "ur" ? "rtl" : "ltr"}>
      <div className="mb-5 flex justify-end">
        <Button variant="outline" size="sm" onClick={() => setLang(lang === "en" ? "ur" : "en")}>
          {t.language}
        </Button>
      </div>
      <AdminPageHeader
        title={t.title}
        description={t.desc}
        actions={
          <div className="flex flex-wrap gap-2">
            {user?.id && (
              <PatientLedgerImport
                clinicianId={user.id}
                patients={query.data?.patients ?? []}
                onImported={() => {
                  void qc.invalidateQueries({ queryKey: ["admin", "personal-patients", user.id] });
                }}
              />
            )}
            <Button size="sm" onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t.add}
            </Button>
          </div>
        }
      />
      {user?.id && (
        <DailyAttendanceLedger clinicianId={user.id} patients={query.data?.patients ?? []} />
      )}
      <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: t.active,
            value: totals.active,
            Icon: Users,
            detail: "Currently in your caseload",
          },
          {
            label: t.sessions,
            value: totals.completed,
            Icon: CalendarCheck2,
            detail: "Across all patient records",
          },
          {
            label: t.received,
            value: money(totals.received),
            Icon: CircleDollarSign,
            detail: "Payments recorded",
          },
          {
            label: t.dues,
            value: money(totals.due),
            Icon: CircleDollarSign,
            detail: "Outstanding patient balance",
            emphasis: true,
          },
        ].map(({ label, value, Icon, detail, emphasis }) => (
          <div
            key={label}
            className={`rounded-xl border bg-card px-4 py-4 shadow-sm ${
              emphasis ? "border-amber-300/70 dark:border-amber-700/60" : "border-border"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
              </p>
              <span
                className={`grid h-8 w-8 place-items-center rounded-lg ${
                  emphasis
                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                    : "bg-primary/8 text-primary"
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight tabular-nums text-foreground">
              {value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
          </div>
        ))}
      </section>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder={t.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          variant={showArchived ? "default" : "outline"}
          size="sm"
          onClick={() => setShowArchived((value) => !value)}
        >
          <Archive className="mr-2 h-4 w-4" />
          {t.archived}
        </Button>
      </div>
      {query.isLoading ? (
        <div className="space-y-2 rounded-xl border border-border bg-card p-4">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : query.isError ? (
        <div className="rounded-xl border border-border bg-card p-4">
          <AdminQueryError onRetry={() => void query.refetch()} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
          <Users className="mx-auto h-9 w-9 text-muted-foreground" />
          <h3 className="mt-3 text-sm font-semibold text-foreground">
            {query.data?.patients.length ? t.noResults : t.empty}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {query.data?.patients.length
              ? "Try another name, phone number or patient ID."
              : t.emptyHint}
          </p>
          {!query.data?.patients.length && (
            <Button className="mt-5" onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t.add}
            </Button>
          )}
        </div>
      ) : (
        <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Patient accounts</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {filtered.length} patient{filtered.length === 1 ? "" : "s"} shown · balances update
                from the financial ledger
              </p>
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              {new Intl.DateTimeFormat("en-PK", { dateStyle: "full" }).format(new Date())}
            </span>
          </div>
          <div className="space-y-3 p-3 sm:hidden">
            {filtered.map((p) => {
              const patientSessions = (query.data?.sessions ?? []).filter(
                (session) => session.patient_id === p.id,
              );
              const completedCount = patientSessions.filter(
                (session) => session.status === "completed",
              ).length;
              const entries = (query.data?.ledger ?? []).filter(
                (entry) => entry.patient_id === p.id,
              );
              const grossReceived = entries
                .filter((entry) => entry.entry_type === "payment")
                .reduce((total, entry) => total + Math.abs(Number(entry.amount)), 0);
              const reversedPayments = entries
                .filter(
                  (entry) =>
                    entry.entry_type === "adjustment" &&
                    entry.description.startsWith("Payment reversal:"),
                )
                .reduce((total, entry) => total + Number(entry.amount), 0);
              const received = Math.max(0, grossReceived - reversedPayments);
              const balance = entries.reduce((total, entry) => total + Number(entry.amount), 0);
              return (
                <article key={p.id} className="rounded-lg border border-border bg-background p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="break-words font-semibold text-foreground">{p.full_name}</p>
                      <p className="mt-1 break-words text-xs text-muted-foreground">
                        {p.phone || p.email || "No contact details"}
                      </p>
                      <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                        {p.id.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                    <Badge variant="secondary">{p.status.replaceAll("_", " ")}</Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border pt-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Completed sessions</p>
                      <p className="mt-1 font-semibold tabular-nums">{completedCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Payments received</p>
                      <p className="mt-1 font-semibold tabular-nums">{money(received)}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Balance</p>
                      <p className="mt-1 font-semibold tabular-nums">
                        {balance > 0
                          ? money(balance)
                          : balance < 0
                            ? `+${money(-balance)} credit`
                            : money(0)}
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/admin/personal-patients/$patientId"
                    params={{ patientId: p.id }}
                    className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground"
                  >
                    Open patient account
                  </Link>
                </article>
              );
            })}
          </div>
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="bg-muted/50 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Patient</th>
                  <th className="px-4 py-3">Sessions</th>
                  <th className="px-4 py-3">Payments received</th>
                  <th className="px-4 py-3">Balance</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => {
                  const patientSessions = (query.data?.sessions ?? []).filter(
                    (session) => session.patient_id === p.id,
                  );
                  const completedCount = patientSessions.filter(
                    (session) => session.status === "completed",
                  ).length;
                  const entries = (query.data?.ledger ?? []).filter(
                    (entry) => entry.patient_id === p.id,
                  );
                  const grossReceived = entries
                    .filter((entry) => entry.entry_type === "payment")
                    .reduce((total, entry) => total + Math.abs(Number(entry.amount)), 0);
                  const reversedPayments = entries
                    .filter(
                      (entry) =>
                        entry.entry_type === "adjustment" &&
                        entry.description.startsWith("Payment reversal:"),
                    )
                    .reduce((total, entry) => total + Number(entry.amount), 0);
                  const received = Math.max(0, grossReceived - reversedPayments);
                  const balance = entries.reduce((total, entry) => total + Number(entry.amount), 0);
                  return (
                    <tr key={p.id} className="transition-colors hover:bg-muted/30">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-foreground">{p.full_name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {p.phone || p.email || "No contact details"}
                          <span className="mx-1 text-border">·</span>
                          <span className="font-mono">{p.id.slice(0, 8).toUpperCase()}</span>
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-semibold tabular-nums text-foreground">
                          {completedCount}
                        </span>
                        <span className="ml-1 text-xs text-muted-foreground">completed</span>
                      </td>
                      <td className="px-4 py-4 font-medium tabular-nums text-foreground">
                        {money(received)}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`font-semibold tabular-nums ${
                            balance > 0 ? "text-amber-700 dark:text-amber-300" : "text-foreground"
                          }`}
                        >
                          {balance > 0
                            ? money(balance)
                            : balance < 0
                              ? `+${money(-balance)} credit`
                              : money(0)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <Badge
                          variant="secondary"
                          className={
                            p.status === "active"
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                              : p.status === "on_hold"
                                ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                                : "bg-muted text-muted-foreground"
                          }
                        >
                          {p.status === "on_hold"
                            ? t.hold
                            : p.status === "discharged"
                              ? t.discharged
                              : p.status === "archived"
                                ? "Archived"
                                : t.activeStatus}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            aria-label={`Status for ${p.full_name}`}
                            className="h-8 max-w-28 rounded-md border border-input bg-background px-2 text-xs"
                            value={p.status}
                            disabled={updateStatus.isPending}
                            onChange={(event) =>
                              updateStatus.mutate({
                                id: p.id,
                                status: event.target.value as
                                  | "active"
                                  | "on_hold"
                                  | "discharged"
                                  | "archived",
                              })
                            }
                          >
                            <option value="active">Active</option>
                            <option value="on_hold">On hold</option>
                            <option value="discharged">Discharged</option>
                            <option value="archived">Archived</option>
                          </select>
                          <Button asChild size="sm" className="h-8 px-3">
                            <Link
                              to="/admin/personal-patients/$patientId"
                              params={{ patientId: p.id }}
                            >
                              {t.open}
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t.add}</DialogTitle>
            <DialogDescription>{t.noteHint}</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>{t.name}</Label>
              <Input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={160}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{t.phone}</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t.email}</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t.notes}</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
              <p className="text-xs text-muted-foreground">{t.noteHint}</p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t.cancel}
              </Button>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? t.saving : t.save}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
