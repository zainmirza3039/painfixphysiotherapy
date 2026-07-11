import { useState, type FormEvent } from "react";
import { Loader2, Send, Upload } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/i18n/LanguageProvider";

const initial = {
  full_name: "",
  phone: "",
  address: "",
  maps_location: "",
  patient_age: "",
  medical_condition: "",
  preferred_date: "",
  preferred_time: "",
  notes: "",
};

export function HomeVisitForm() {
  const { t } = useI18n();
  const f = t.homeVisit.form;
  const [values, setValues] = useState(initial);
  const [file, setFile] = useState<File | null>(null);
  const [company, setCompany] = useState(""); // honeypot — real users leave this empty
  const [submitting, setSubmitting] = useState(false);

  const set = (key: keyof typeof initial, val: string) =>
    setValues((v) => ({ ...v, [key]: val }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // Silently drop bot submissions that fill the hidden honeypot field.
    if (company) return;
    if (!values.full_name.trim() || !values.phone.trim() || !values.address.trim()) {
      toast.error(f.required);
      return;
    }
    setSubmitting(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      let report_url: string | null = null;

      if (file) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(f.reportHint);
          setSubmitting(false);
          return;
        }
        const ext = file.name.split(".").pop() ?? "dat";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("medical-reports")
          .upload(path, file, { contentType: file.type || undefined });
        if (uploadError) throw uploadError;
        report_url = path;
      }

      const { error } = await supabase.from("home_visit_requests").insert({
        full_name: values.full_name.trim(),
        phone: values.phone.trim(),
        address: values.address.trim(),
        maps_location: values.maps_location.trim() || null,
        patient_age: values.patient_age ? Number(values.patient_age) : null,
        medical_condition: values.medical_condition.trim() || null,
        preferred_date: values.preferred_date || null,
        preferred_time: values.preferred_time.trim() || null,
        notes: values.notes.trim() || null,
        report_url,
      });
      if (error) throw error;

      toast.success(f.success);
      setValues(initial);
      setFile(null);
    } catch (err) {
      console.error("Home visit request failed:", err);
      toast.error(f.error);
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20";
  const labelCls = "mb-1.5 block text-sm font-semibold text-foreground";

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      {/* Honeypot: visually hidden, ignored by humans, filled by bots */}
      <div aria-hidden className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden" tabIndex={-1}>
        <label htmlFor="hv-company">Company</label>
        <input
          id="hv-company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>
      <div className="sm:col-span-1">
        <label className={labelCls} htmlFor="full_name">
          {f.fullName} *
        </label>
        <input
          id="full_name"
          className={inputCls}
          value={values.full_name}
          onChange={(e) => set("full_name", e.target.value)}
          required
        />
      </div>
      <div className="sm:col-span-1">
        <label className={labelCls} htmlFor="phone">
          {f.phone} *
        </label>
        <input
          id="phone"
          type="tel"
          className={inputCls}
          value={values.phone}
          onChange={(e) => set("phone", e.target.value)}
          required
        />
      </div>

      <div className="sm:col-span-2">
        <label className={labelCls} htmlFor="address">
          {f.address} *
        </label>
        <input
          id="address"
          className={inputCls}
          value={values.address}
          onChange={(e) => set("address", e.target.value)}
          required
        />
      </div>

      <div className="sm:col-span-2">
        <label className={labelCls} htmlFor="maps_location">
          {f.maps}
        </label>
        <input
          id="maps_location"
          className={inputCls}
          placeholder="https://maps.google.com/…"
          value={values.maps_location}
          onChange={(e) => set("maps_location", e.target.value)}
        />
      </div>

      <div>
        <label className={labelCls} htmlFor="patient_age">
          {f.age}
        </label>
        <input
          id="patient_age"
          type="number"
          min={0}
          max={120}
          className={inputCls}
          value={values.patient_age}
          onChange={(e) => set("patient_age", e.target.value)}
        />
      </div>
      <div>
        <label className={labelCls} htmlFor="medical_condition">
          {f.condition}
        </label>
        <input
          id="medical_condition"
          className={inputCls}
          value={values.medical_condition}
          onChange={(e) => set("medical_condition", e.target.value)}
        />
      </div>

      <div>
        <label className={labelCls} htmlFor="preferred_date">
          {f.date}
        </label>
        <input
          id="preferred_date"
          type="date"
          className={inputCls}
          value={values.preferred_date}
          onChange={(e) => set("preferred_date", e.target.value)}
        />
      </div>
      <div>
        <label className={labelCls} htmlFor="preferred_time">
          {f.time}
        </label>
        <input
          id="preferred_time"
          type="time"
          className={inputCls}
          value={values.preferred_time}
          onChange={(e) => set("preferred_time", e.target.value)}
        />
      </div>

      <div className="sm:col-span-2">
        <label className={labelCls} htmlFor="report">
          {f.report}
        </label>
        <label
          htmlFor="report"
          className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border bg-background px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary"
        >
          <Upload className="h-4 w-4 shrink-0 text-primary" />
          <span className="truncate">{file ? file.name : f.reportHint}</span>
        </label>
        <input
          id="report"
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>

      <div className="sm:col-span-2">
        <label className={labelCls} htmlFor="notes">
          {f.notes}
        </label>
        <textarea
          id="notes"
          rows={3}
          className={inputCls}
          value={values.notes}
          onChange={(e) => set("notes", e.target.value)}
        />
      </div>

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={submitting}
          className="ripple inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-card transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> {t.actions.submitting}
            </>
          ) : (
            <>
              <Send className="h-4 w-4" /> {t.actions.submit}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
