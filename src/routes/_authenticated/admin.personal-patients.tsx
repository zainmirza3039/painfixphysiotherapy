import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Archive, CalendarCheck2, CircleDollarSign, Plus, Search, Users } from "lucide-react";
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
type Entry = { patient_id: string; entry_type: string; amount: number };
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
  const { user } = useAdminAuth();
  const qc = useQueryClient();
  const [lang, setLang] = useState<"en" | "ur">("en");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const t = words[lang];

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
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const db = personalPatientDb;
      const [p, s, l] = await Promise.all([
        db
          .from("personal_patients")
          .select("id,full_name,phone,email,status,created_at")
          .order("created_at", { ascending: false }),
        db.from("personal_patient_sessions").select("patient_id,status"),
        db.from("personal_patient_ledger").select("patient_id,entry_type,amount"),
      ]);
      if (p.error) throw p.error;
      if (s.error) throw s.error;
      if (l.error) throw l.error;
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
      received: ledger
        .filter((e) => e.entry_type === "payment")
        .reduce((n, e) => n + Math.abs(Number(e.amount)), 0),
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
      const { error } = await personalPatientDb.from("personal_patients").insert({
        clinician_id: user.id,
        full_name: name.trim(),
        phone: phone.trim() || null,
        email: email.trim() || null,
        private_notes: notes.trim() || null,
      });
      if (error) throw error;
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
    mutationFn: async ({ id, status }: { id: string; status: "active" | "archived" }) => {
      const { error } = await personalPatientDb
        .from("personal_patients")
        .update({ status, archived_at: status === "archived" ? new Date().toISOString() : null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: async (_, variables) => {
      await qc.invalidateQueries({ queryKey: ["admin", "personal-patients", user?.id] });
      toast.success(variables.status === "archived" ? "Patient archived." : "Patient restored.");
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Could not update patient status."),
  });

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
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t.add}
          </Button>
        }
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {[
          { label: t.active, value: totals.active, Icon: Users },
          { label: t.sessions, value: totals.completed, Icon: CalendarCheck2 },
          { label: t.charges, value: money(totals.charges), Icon: CircleDollarSign },
          { label: t.received, value: money(totals.received), Icon: CircleDollarSign },
          { label: t.credit, value: money(totals.credit), Icon: CircleDollarSign },
          { label: t.dues, value: money(totals.due), Icon: CircleDollarSign },
        ].map(({ label, value, Icon }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{label}</span>
              <Icon className="h-4 w-4" />
            </div>
            <p className="mt-3 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>
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
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : query.isError ? (
        <AdminQueryError onRetry={() => void query.refetch()} />
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
          <Users className="mx-auto h-9 w-9 text-muted-foreground" />
          <h2 className="mt-3 font-semibold">
            {query.data?.patients.length ? t.noResults : t.empty}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {query.data?.patients.length ? "" : t.emptyHint}
          </p>
          {!query.data?.patients.length && (
            <Button className="mt-5" onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t.add}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {filtered.map((p) => {
            const ss = (query.data?.sessions ?? []).filter((s) => s.patient_id === p.id);
            const entries = (query.data?.ledger ?? []).filter((e) => e.patient_id === p.id);
            const received = entries
              .filter((e) => e.entry_type === "payment")
              .reduce((n, e) => n + Math.abs(Number(e.amount)), 0);
            const balance = entries.reduce((n, e) => n + Number(e.amount), 0);
            return (
              <article
                key={p.id}
                className="rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">{p.full_name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {p.phone || p.email || "—"}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {p.status === "on_hold"
                      ? t.hold
                      : p.status === "discharged"
                        ? t.discharged
                        : t.activeStatus}
                  </Badge>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">{t.sessions}</p>
                    <p className="mt-1 font-semibold">
                      {ss.filter((s) => s.status === "completed").length}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t.received}</p>
                    <p className="mt-1 font-semibold">{money(received)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t.dues}</p>
                    <p className="mt-1 font-semibold">
                      {balance > 0
                        ? money(balance)
                        : balance < 0
                          ? `+${money(-balance)} credit`
                          : money(0)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 border-t border-border pt-3">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      asChild
                      type="button"
                      variant="outline"
                      size="sm"
                      className="min-w-0 flex-1"
                    >
                      <Link to="/admin/personal-patients/$patientId" params={{ patientId: p.id }}>
                        {t.open}
                      </Link>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={updateStatus.isPending}
                      onClick={() =>
                        updateStatus.mutate({
                          id: p.id,
                          status: p.status === "archived" ? "active" : "archived",
                        })
                      }
                    >
                      {p.status === "archived" ? t.restore : t.archive}
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
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
