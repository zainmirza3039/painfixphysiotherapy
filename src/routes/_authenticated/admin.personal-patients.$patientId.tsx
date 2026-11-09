import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, CalendarPlus, CheckCircle2, CircleDollarSign, CreditCard, Plus, UserRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/admin/AdminAuthProvider";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminQueryError } from "@/components/admin/AdminQueryError";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/admin/personal-patients/$patientId")({ component: PersonalPatientDetailPage });

type Patient = { id: string; full_name: string; phone: string | null; email: string | null; private_notes: string | null; status: string };
type Plan = { id: string; plan_type: string; title: string; package_sessions: number | null; package_fee: number | null; per_session_fee: number | null; is_active: boolean };
type Session = { id: string; plan_id: string | null; session_date: string; status: string; session_label: string | null; charge_amount: number; private_note: string | null };
type Entry = { id: string; entry_type: string; amount: number; description: string; payment_method: string | null; occurred_at: string };
const money = (n: number) => new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(n);
const date = (v: string) => new Intl.DateTimeFormat("en-PK", { dateStyle: "medium", timeStyle: "short" }).format(new Date(v));

function PersonalPatientDetailPage() {
  const { patientId } = Route.useParams();
  const { user } = useAdminAuth();
  const qc = useQueryClient();
  const [language, setLanguage] = useState<"en" | "ur">("en");
  const [planOpen, setPlanOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
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

  const t = language === "ur" ? { back: "ذاتی مریضوں کی فہرست", plan: "بلنگ پلان", addSession: "سیشن شامل کریں", payment: "ادائیگی درج کریں", completed: "مکمل سیشنز", upcoming: "آنے والے سیشنز", charges: "کل چارجز", received: "وصول شدہ رقم", billing: "مالی خلاصہ", plans: "بلنگ پلانز", sessions: "سیشنز کی تفصیل", statement: "مالی اسٹیٹمنٹ", privateNotes: "معالج کے نجی نوٹس — مریض کو نہیں دکھائے جائیں گے", due: "بقایا رقم", credit: "ایڈوانس کریڈٹ", settled: "حساب برابر", remaining: "باقی پیکیج سیشنز", noPlan: "کوئی فعال پلان نہیں", addPlan: "بلنگ پلان شامل کریں", schedule: "سیشن شیڈول کریں", save: "محفوظ کریں", cancel: "منسوخ", language: "English", completedStatus: "مکمل", scheduled: "شیڈول", cancelled: "منسوخ", rescheduled: "دوبارہ شیڈول", markComplete: "مکمل کریں", recordPayment: "ادائیگی درج کریں" } : { back: "Back to Personal Patients", plan: "Billing plan", addSession: "Add session", payment: "Record payment", completed: "Completed sessions", upcoming: "Upcoming sessions", charges: "Total charges", received: "Received", billing: "Billing overview", plans: "Billing plans", sessions: "Session history", statement: "Financial statement", privateNotes: "Private clinician notes — never shared with patient", due: "Outstanding dues", credit: "Advance credit", settled: "Settled", remaining: "Package sessions left", noPlan: "No active plan", addPlan: "Add billing plan", schedule: "Schedule session", save: "Save", cancel: "Cancel", language: "اردو", completedStatus: "Completed", scheduled: "Scheduled", cancelled: "Cancelled", rescheduled: "Rescheduled", markComplete: "Complete", recordPayment: "Record payment" };

  useEffect(() => {
    if (language !== "ur" || document.getElementById("painfix-nastaliq-font")) return;
    const link = document.createElement("link");
    link.id = "painfix-nastaliq-font"; link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, [language]);

  const query = useQuery({
    queryKey: ["admin", "personal-patient-detail", user?.id, patientId],
    enabled: Boolean(user?.id && patientId),
    queryFn: async () => {
      const db = supabase as any;
      const [p, plans, sessions, ledger] = await Promise.all([
        db.from("personal_patients").select("id,full_name,phone,email,private_notes,status").eq("id", patientId).single(),
        db.from("personal_patient_plans").select("id,plan_type,title,package_sessions,package_fee,per_session_fee,is_active").eq("patient_id", patientId).order("created_at", { ascending: false }),
        db.from("personal_patient_sessions").select("id,plan_id,session_date,status,session_label,charge_amount,private_note").eq("patient_id", patientId).order("session_date", { ascending: false }),
        db.from("personal_patient_ledger").select("id,entry_type,amount,description,payment_method,occurred_at").eq("patient_id", patientId).order("occurred_at", { ascending: false }),
      ]);
      for (const result of [p, plans, sessions, ledger]) if (result.error) throw result.error;
      return { patient: p.data as Patient, plans: plans.data as Plan[], sessions: sessions.data as Session[], ledger: ledger.data as Entry[] };
    },
  });

  const data = query.data;
  const activePlan = data?.plans.find((p) => p.is_active);
  const completed = data?.sessions.filter((s) => s.status === "completed").length ?? 0;
  const scheduled = data?.sessions.filter((s) => s.status === "scheduled").length ?? 0;
  const totalCharges = data?.ledger.filter((e) => e.entry_type === "charge").reduce((n, e) => n + Number(e.amount), 0) ?? 0;
  const received = data?.ledger.filter((e) => e.entry_type === "payment").reduce((n, e) => n + Math.abs(Number(e.amount)), 0) ?? 0;
  const balance = data?.ledger.reduce((n, e) => n + Number(e.amount), 0) ?? 0;
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "personal-patient-detail", user?.id, patientId] });

  const createPlan = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Please sign in again.");
      if (!planTitle.trim()) throw new Error("Plan title is required.");
      const sessions = planType === "package" ? Number(packageSessions) : null;
      const fee = planType === "package" ? Number(packageFee) : null;
      const perFee = planType === "per_session" ? Number(perSessionFee) : planType === "custom" && perSessionFee ? Number(perSessionFee) : null;
      if (planType === "package" && (!sessions || sessions < 1 || !Number.isFinite(fee) || fee < 0)) throw new Error("Enter valid package sessions and fee.");
      if (planType === "per_session" && (!Number.isFinite(perFee) || (perFee ?? 0) < 0)) throw new Error("Enter a valid per-session fee.");
      const { error } = await (supabase as any).from("personal_patient_plans").insert({
        clinician_id: user.id, patient_id: patientId, plan_type: planType, title: planTitle.trim(),
        package_sessions: sessions, package_fee: fee, per_session_fee: perFee,
      });
      if (error) throw error;
    },
    onSuccess: async () => { await refresh(); setPlanOpen(false); toast.success("Billing plan saved."); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save plan."),
  });

  const createSession = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Please sign in again.");
      if (!sessionDate) throw new Error("Select a session date and time.");
      const charge = Number(sessionCharge);
      if (!Number.isFinite(charge) || charge < 0) throw new Error("Enter a valid session fee.");
      const { error } = await (supabase as any).from("personal_patient_sessions").insert({
        clinician_id: user.id, patient_id: patientId, plan_id: activePlan?.id ?? null,
        session_date: new Date(sessionDate).toISOString(), status: "scheduled",
        session_label: sessionLabel.trim() || null, charge_amount: charge,
        private_note: sessionNote.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: async () => { await refresh(); setSessionOpen(false); setSessionDate(""); setSessionLabel(""); setSessionCharge(String(activePlan?.per_session_fee ?? 0)); setSessionNote(""); toast.success("Session scheduled. It is not counted as completed yet."); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not schedule session."),
  });

  const addPayment = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Please sign in again.");
      const amount = Number(paymentAmount);
      if (!Number.isFinite(amount) || amount <= 0) throw new Error("Enter a payment amount greater than zero.");
      const { error } = await (supabase as any).from("personal_patient_ledger").insert({
        clinician_id: user.id, patient_id: patientId, entry_type: "payment", amount: -amount,
        description: paymentDescription.trim() || "Patient payment", payment_method: paymentMethod,
      });
      if (error) throw error;
    },
    onSuccess: async () => { await refresh(); setPaymentOpen(false); setPaymentAmount(""); setPaymentDescription("Patient payment"); toast.success("Payment recorded."); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not record payment."),
  });

  const updateSession = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "completed" | "cancelled" | "rescheduled" }) => {
      const { error } = await (supabase as any).from("personal_patient_sessions").update({
        status, completed_at: status === "completed" ? new Date().toISOString() : null,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => { await refresh(); toast.success("Session status updated."); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update session."),
  });

  const activePlanCompleted = activePlan ? (data?.sessions ?? []).filter((s) => s.plan_id === activePlan.id && s.status === "completed").length : 0;
  const remaining = activePlan?.plan_type === "package" && activePlan.package_sessions != null
    ? Math.max(0, activePlan.package_sessions - activePlanCompleted) : null;

  if (query.isLoading) return <div className="space-y-4"><Skeleton className="h-12 w-72" /><Skeleton className="h-44 rounded-xl" /><Skeleton className="h-72 rounded-xl" /></div>;
  if (query.isError || !data) return <AdminQueryError onRetry={() => void query.refetch()} />;

  return <div className="personal-patients-portal space-y-5" dir={language === "ur" ? "rtl" : "ltr"}>
    <div className="flex justify-end"><Button variant="outline" size="sm" onClick={() => setLanguage(language === "en" ? "ur" : "en")}>{t.language}</Button></div>
    <Link to="/admin/personal-patients" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />{t.back}</Link>
    <AdminPageHeader title={data.patient.full_name} description={[data.patient.phone, data.patient.email].filter(Boolean).join(" · ") || "Personal patient account"} actions={<div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => setPlanOpen(true)}><Plus className="mr-2 h-4 w-4" />{t.plan}</Button><Button variant="outline" onClick={() => { setSessionCharge(String(activePlan?.per_session_fee ?? 0)); setSessionOpen(true); }}><CalendarPlus className="mr-2 h-4 w-4" />{t.addSession}</Button><Button onClick={() => setPaymentOpen(true)}><CreditCard className="mr-2 h-4 w-4" />{t.payment}</Button></div>} />
    {data.patient.private_notes && <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.privateNotes}</p><p className="mt-2 whitespace-pre-wrap text-sm">{data.patient.private_notes}</p></div>}
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[{label:t.completed,value:completed},{label:t.upcoming,value:scheduled},{label:t.charges,value:money(totalCharges)},{label:t.received,value:money(received)}].map((x)=><div key={x.label} className="rounded-xl border border-border bg-card p-4"><p className="text-sm text-muted-foreground">{x.label}</p><p className="mt-2 text-xl font-semibold">{x.value}</p></div>)}
    </div>
    <div className="grid gap-4 xl:grid-cols-2">
      <section className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-3"><h2 className="font-semibold">{t.billing}</h2><Badge variant={balance > 0 ? "destructive" : "secondary"}>{balance > 0 ? t.due : balance < 0 ? t.credit : t.settled}</Badge></div>
        <p className="mt-3 text-3xl font-semibold">{money(Math.abs(balance))}</p><p className="text-xs text-muted-foreground">{balance > 0 ? t.due : balance < 0 ? t.credit : t.settled}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-3 text-sm"><div><p className="text-muted-foreground">{t.plan}</p><p className="mt-1 font-medium">{activePlan?.title ?? t.noPlan}</p></div><div><p className="text-muted-foreground">{t.remaining}</p><p className="mt-1 font-medium">{remaining == null ? "—" : remaining}</p></div></div>
      </section>
      <section className="rounded-xl border border-border bg-card p-4"><h2 className="font-semibold">{t.plans}</h2>{data.plans.length ? <div className="mt-3 space-y-3">{data.plans.map((p)=><div key={p.id} className="flex items-start justify-between gap-3 border-t border-border pt-3 first:border-0 first:pt-0"><div><p className="font-medium">{p.title}</p><p className="text-sm text-muted-foreground">{p.plan_type === "package" ? `${p.package_sessions} sessions · ${money(Number(p.package_fee ?? 0))}` : p.plan_type === "per_session" ? `${money(Number(p.per_session_fee ?? 0))} per session` : "Custom billing"}</p></div><Badge variant={p.is_active ? "default" : "secondary"}>{p.is_active ? "Active" : "Inactive"}</Badge></div>)}</div> : <p className="mt-3 text-sm text-muted-foreground">No billing plan added yet.</p>}</section>
    </div>
    <section className="rounded-xl border border-border bg-card p-4"><div className="flex items-center justify-between"><h2 className="font-semibold">{t.sessions}</h2><Badge variant="secondary">{data.sessions.length} total</Badge></div>
      {data.sessions.length ? <div className="mt-3 divide-y divide-border">{data.sessions.map((s)=><div key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="font-medium">{s.session_label || "Physiotherapy session"}</p><p className="text-sm text-muted-foreground">{date(s.session_date)} · {money(Number(s.charge_amount))}</p>{s.private_note && <p className="mt-1 text-xs text-muted-foreground">{s.private_note}</p>}</div><div className="flex items-center gap-2"><Badge variant={s.status === "completed" ? "default" : s.status === "cancelled" ? "destructive" : "secondary"}>{s.status}</Badge>{s.status === "scheduled" && <><Button size="sm" variant="outline" disabled={updateSession.isPending} onClick={() => updateSession.mutate({id:s.id,status:"completed"})}><CheckCircle2 className="mr-1 h-4 w-4" />{t.markComplete}</Button><Button size="sm" variant="ghost" disabled={updateSession.isPending} onClick={() => updateSession.mutate({id:s.id,status:"cancelled"})}>{t.cancel}</Button><Button size="sm" variant="ghost" disabled={updateSession.isPending} onClick={() => updateSession.mutate({id:s.id,status:"rescheduled"})}>{t.rescheduled}</Button></>}</div></div>)}</div> : <p className="mt-3 text-sm text-muted-foreground">No sessions scheduled yet.</p>}
    </section>
    <section className="rounded-xl border border-border bg-card p-4"><h2 className="font-semibold">{t.statement}</h2><p className="mt-1 text-xs text-muted-foreground">Charges, payments, refunds and credits are recorded as separate ledger entries.</p>
      {data.ledger.length ? <div className="mt-3 divide-y divide-border">{data.ledger.map((e)=><div key={e.id} className="flex items-center justify-between gap-3 py-3"><div><p className="font-medium">{e.description}</p><p className="text-xs text-muted-foreground">{date(e.occurred_at)}{e.payment_method ? ` · ${e.payment_method.replace("_"," ")}` : ""}</p></div><p className={`font-semibold tabular-nums ${e.amount < 0 ? "text-emerald-600" : "text-foreground"}`}>{e.amount < 0 ? "− " : "+ "}{money(Math.abs(Number(e.amount)))}</p></div>)}</div> : <p className="mt-3 text-sm text-muted-foreground">No financial entries yet.</p>}
    </section>
    <Dialog open={planOpen} onOpenChange={setPlanOpen}><DialogContent><DialogHeader><DialogTitle>{t.addPlan}</DialogTitle><DialogDescription>Package fees are charged once when the plan is saved. Included sessions are not charged again.</DialogDescription></DialogHeader><form className="space-y-3" onSubmit={(e)=>{e.preventDefault();createPlan.mutate();}}>
      <div className="space-y-1"><Label>{language === "ur" ? "بلنگ کی قسم" : "Billing type"}</Label><select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={planType} onChange={(e)=>setPlanType(e.target.value as typeof planType)}><option value="package">Package fee</option><option value="per_session">Per-session fee</option><option value="custom">Custom fee</option></select></div>
      <div className="space-y-1"><Label>{language === "ur" ? "پلان کا عنوان" : "Plan title"}</Label><Input value={planTitle} onChange={(e)=>setPlanTitle(e.target.value)} required /></div>
      {planType === "package" && <><div className="space-y-1"><Label>{language === "ur" ? "شامل سیشنز" : "Included sessions"}</Label><Input type="number" min="1" step="1" value={packageSessions} onChange={(e)=>setPackageSessions(e.target.value)} required /></div><div className="space-y-1"><Label>{language === "ur" ? "پیکیج کی کل فیس (روپے)" : "Total package fee (PKR)"}</Label><Input type="number" min="0" step="1" value={packageFee} onChange={(e)=>setPackageFee(e.target.value)} required /></div></>}
      {planType !== "package" && <div className="space-y-1"><Label>{planType === "per_session" ? "Fee per completed session (PKR)" : "Default session fee (optional)"}</Label><Input type="number" min="0" step="1" value={perSessionFee} onChange={(e)=>setPerSessionFee(e.target.value)} required={planType === "per_session"} /></div>}
      <DialogFooter><Button type="button" variant="outline" onClick={()=>setPlanOpen(false)}>Cancel</Button><Button type="submit" disabled={createPlan.isPending}>{createPlan.isPending ? "Saving…" : "Save plan"}</Button></DialogFooter>
    </form></DialogContent></Dialog>
    <Dialog open={sessionOpen} onOpenChange={setSessionOpen}><DialogContent><DialogHeader><DialogTitle>{t.schedule}</DialogTitle><DialogDescription>A scheduled session is not counted as completed until you mark it complete.</DialogDescription></DialogHeader><form className="space-y-3" onSubmit={(e)=>{e.preventDefault();createSession.mutate();}}>
      <div className="space-y-1"><Label>{language === "ur" ? "تاریخ اور وقت" : "Date and time"}</Label><Input type="datetime-local" value={sessionDate} onChange={(e)=>setSessionDate(e.target.value)} required /></div>
      <div className="space-y-1"><Label>{language === "ur" ? "سیشن کا عنوان (اختیاری)" : "Session label (optional)"}</Label><Input value={sessionLabel} onChange={(e)=>setSessionLabel(e.target.value)} placeholder="e.g. Follow-up session" /></div>
      <div className="space-y-1"><Label>{language === "ur" ? "اضافی / سیشن فیس (روپے)" : "Extra / session fee (PKR)"}</Label><Input type="number" min="0" step="1" value={sessionCharge} onChange={(e)=>setSessionCharge(e.target.value)} required /><p className="text-xs text-muted-foreground">Set 0 for a session included in a prepaid package. This fee is charged only when marked completed.</p></div>
      <div className="space-y-1"><Label>{language === "ur" ? "معالج کا نجی نوٹ" : "Private clinician note"}</Label><Textarea rows={2} value={sessionNote} onChange={(e)=>setSessionNote(e.target.value)} /></div>
      <DialogFooter><Button type="button" variant="outline" onClick={()=>setSessionOpen(false)}>Cancel</Button><Button type="submit" disabled={createSession.isPending}>{createSession.isPending ? "Saving…" : "Schedule session"}</Button></DialogFooter>
    </form></DialogContent></Dialog>
    <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}><DialogContent><DialogHeader><DialogTitle>{t.recordPayment}</DialogTitle><DialogDescription>Payments reduce the due balance. Any excess remains as advance credit for future charges.</DialogDescription></DialogHeader><form className="space-y-3" onSubmit={(e)=>{e.preventDefault();addPayment.mutate();}}>
      <div className="space-y-1"><Label>{language === "ur" ? "وصول شدہ رقم (روپے)" : "Amount received (PKR)"}</Label><Input type="number" min="1" step="1" value={paymentAmount} onChange={(e)=>setPaymentAmount(e.target.value)} required /></div>
      <div className="space-y-1"><Label>{language === "ur" ? "ادائیگی کا طریقہ" : "Payment method"}</Label><select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={paymentMethod} onChange={(e)=>setPaymentMethod(e.target.value)}><option value="cash">Cash</option><option value="bank_transfer">Bank transfer</option><option value="jazzcash">JazzCash</option><option value="easypaisa">Easypaisa</option><option value="card">Card</option><option value="other">Other</option></select></div>
      <div className="space-y-1"><Label>{language === "ur" ? "تفصیل" : "Description"}</Label><Input value={paymentDescription} onChange={(e)=>setPaymentDescription(e.target.value)} /></div>
      <DialogFooter><Button type="button" variant="outline" onClick={()=>setPaymentOpen(false)}>Cancel</Button><Button type="submit" disabled={addPayment.isPending}>{addPayment.isPending ? "Saving…" : "Record payment"}</Button></DialogFooter>
    </form></DialogContent></Dialog>
  </div>;
}
