import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/i18n/LanguageProvider";
import {
  createHomeVisitSubmissionGate,
  getLocalDateInputValue,
  HOME_VISIT_FIELD_LIMITS,
  submitHomeVisitRequest,
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
  const [submitted, setSubmitted] = useState(false);
  const [submissionGate] = useState(() => createHomeVisitSubmissionGate());
  const today = getLocalDateInputValue();

  const set = (key: keyof HomeVisitFormValues, value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  const validationMessages: Record<HomeVisitValidationError, string> = {
    required: f.required,
    phone: f.phoneInvalid,
    date: f.dateInvalid,
    length: f.fieldTooLong,
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (company || submissionGate.isPending) return;

    const validationError = validateHomeVisitForm(values, today);
    if (validationError) {
      toast.error(validationMessages[validationError]);
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitHomeVisitRequest(
        values,
        today,
        {
          insertRequest: async (payload) => {
            const { supabase } = await import("@/integrations/supabase/client");
            const { error } = await supabase.from("home_visit_requests").insert(payload);
            if (error) throw error;
          },
        },
        submissionGate,
      );

      if (result.status === "duplicate") return;
      if (result.status === "invalid") {
        toast.error(validationMessages[result.reason]);
        return;
      }
      if (result.status === "error") {
        console.error("Home visit request failed:", result.error);
        toast.error(f.error);
        return;
      }

      toast.success(f.success);
      setValues(createInitialValues());
      setSubmitted(true);
    } catch (error) {
      console.error("Home visit request failed:", error);
      toast.error(f.error);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClassName =
    "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20";
  const labelClassName = "mb-1.5 block text-sm font-semibold text-foreground";

  if (submitted) {
    return (
      <div role="status" className="rounded-2xl border border-secondary/30 bg-secondary/10 p-6">
        <CheckCircle2 className="h-7 w-7 text-secondary" aria-hidden="true" />
        <h3 className="mt-3 font-heading text-lg font-bold text-foreground">Request received</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Your home-visit request has been submitted. This is a request, not a confirmed appointment.
          The PainFix team will contact you to confirm availability.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-4 inline-flex min-h-11 items-center rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} aria-busy={submitting} className="grid gap-4 sm:grid-cols-2">
      <fieldset disabled={submitting} className="contents">
        <div>
          <label className={labelClassName} htmlFor="full_name">
            {f.fullName} *
          </label>
          <input
            id="full_name"
            name="full_name"
            autoComplete="name"
            maxLength={HOME_VISIT_FIELD_LIMITS.full_name}
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
            maxLength={HOME_VISIT_FIELD_LIMITS.phone}
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
            maxLength={HOME_VISIT_FIELD_LIMITS.address}
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
            maxLength={HOME_VISIT_FIELD_LIMITS.medical_condition}
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
            maxLength={HOME_VISIT_FIELD_LIMITS.notes}
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
          {submitting && (
            <p className="mb-3 text-sm text-muted-foreground" role="status" aria-live="polite">
              Sending your request securely…
            </p>
          )}
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
      </fieldset>
    </form>
  );
}
