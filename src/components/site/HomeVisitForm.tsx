import { useRef, useState, type FormEvent } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/i18n/LanguageProvider";
import {
  createSingleSubmissionGuard,
  getLocalDateInputValue,
  persistHomeVisitRequest,
  validateHomeVisitForm,
  type HomeVisitFormValues,
  type HomeVisitValidationError,
} from "@/lib/home-visit-form";

const createInitialValues = (): HomeVisitFormValues => ({
  full_name: "",
  phone: "",
  address: "",
  medical_condition: "",
  preferred_date: "",
  preferred_time: "",
  notes: "",
});

export function HomeVisitForm() {
  const { t } = useI18n();
  const f = t.homeVisit.form;
  const [values, setValues] = useState<HomeVisitFormValues>(createInitialValues);
  const [company, setCompany] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submissionGuard = useRef(createSingleSubmissionGuard());
  const today = getLocalDateInputValue();

  const set = (key: keyof HomeVisitFormValues, value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  const validationMessages: Record<HomeVisitValidationError, string> = {
    required: f.required,
    phone: f.phoneInvalid,
    date: f.dateInvalid,
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (company || !submissionGuard.current.enter()) return;

    const validationError = validateHomeVisitForm(values, today);
    if (validationError) {
      toast.error(validationMessages[validationError]);
      submissionGuard.current.release();
      return;
    }

    setSubmitting(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      await persistHomeVisitRequest(
        (payload) => supabase.from("home_visit_requests").insert(payload),
        values,
      );

      toast.success(f.success);
      setValues(createInitialValues());
    } catch (error) {
      console.error("Home visit request failed:", error);
      toast.error(f.error);
    } finally {
      submissionGuard.current.release();
      setSubmitting(false);
    }
  };

  const inputClassName =
    "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20";
  const labelClassName = "mb-1.5 block text-sm font-semibold text-foreground";

  return (
    <form onSubmit={onSubmit} aria-busy={submitting} className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className={labelClassName} htmlFor="full_name">
          {f.fullName} *
        </label>
        <input
          id="full_name"
          name="full_name"
          autoComplete="name"
          maxLength={120}
          className={inputClassName}
          value={values.full_name}
          onChange={(event) => set("full_name", event.target.value)}
          required
        />
      </div>
      <div>
        <label className={labelClassName} htmlFor="phone">
          {f.phone} *
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          maxLength={24}
          className={inputClassName}
          value={values.phone}
          onChange={(event) => set("phone", event.target.value)}
          required
        />
      </div>

      <div className="sm:col-span-2">
        <label className={labelClassName} htmlFor="address">
          {f.address} *
        </label>
        <input
          id="address"
          name="address"
          autoComplete="address-line1"
          maxLength={200}
          placeholder={f.addressHint}
          className={inputClassName}
          value={values.address}
          onChange={(event) => set("address", event.target.value)}
          required
        />
      </div>

      <div className="sm:col-span-2">
        <label className={labelClassName} htmlFor="medical_condition">
          {f.condition} *
        </label>
        <input
          id="medical_condition"
          name="medical_condition"
          maxLength={200}
          className={inputClassName}
          value={values.medical_condition}
          onChange={(event) => set("medical_condition", event.target.value)}
          required
        />
      </div>

      <div>
        <label className={labelClassName} htmlFor="preferred_date">
          {f.date} *
        </label>
        <input
          id="preferred_date"
          name="preferred_date"
          type="date"
          min={today}
          className={inputClassName}
          value={values.preferred_date}
          onChange={(event) => set("preferred_date", event.target.value)}
          required
        />
      </div>
      <div>
        <label className={labelClassName} htmlFor="preferred_time">
          {f.time} *
        </label>
        <input
          id="preferred_time"
          name="preferred_time"
          type="time"
          className={inputClassName}
          value={values.preferred_time}
          onChange={(event) => set("preferred_time", event.target.value)}
          required
        />
      </div>

      <div className="sm:col-span-2">
        <label className={labelClassName} htmlFor="notes">
          {f.notes}
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          maxLength={1000}
          className={inputClassName}
          value={values.notes}
          onChange={(event) => set("notes", event.target.value)}
        />
      </div>

      <div
        aria-hidden="true"
        className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden"
      >
        <label htmlFor="company">Company</label>
        <input
          id="company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(event) => setCompany(event.target.value)}
        />
      </div>

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={submitting}
          className="ripple inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-card transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> {t.actions.submitting}
            </>
          ) : (
            <>
              <Send className="h-4 w-4" aria-hidden="true" /> {t.actions.submit}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
