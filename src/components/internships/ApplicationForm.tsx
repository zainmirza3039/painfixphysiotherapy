import { useState } from "react";
import { z } from "zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { applicationFormToPayload } from "@/lib/internship-application-form";
import { submitInternshipApplication } from "@/lib/internships.functions";
import type { Program } from "@/lib/internships.contract";

const fields: Array<[string, string, string, boolean, number]> = [
  ["full_name", "Full name", "Your name", true, 180],
  ["email", "Email address", "you@example.com", true, 254],
  ["phone", "Phone number", "+92…", true, 40],
  ["city", "City", "Your city", true, 120],
  ["educational_institution", "Institution", "University or employer", true, 240],
  [
    "degree_program",
    "Degree or qualification",
    "Your current or completed qualification",
    true,
    240,
  ],
  ["academic_status", "Academic status", "Student, graduate, or other", true, 120],
  ["clinical_exposure", "Relevant experience", "Briefly describe relevant experience", false, 4000],
  ["availability", "Availability", "When can you attend?", true, 1000],
  ["motivation", "Why are you applying?", "Tell us what you hope to learn", true, 4000],
];

export function ApplicationConfirmation({ reference }: { reference: string }) {
  return (
    <div className="rounded-2xl border border-secondary/30 bg-secondary/10 p-6" role="status">
      <CheckCircle2 className="h-7 w-7 text-secondary" />
      <h3 className="mt-3 font-heading text-xl font-bold text-foreground">Application received</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Keep this reference for your records. Submission does not guarantee selection or a
        certificate.
      </p>
      <p className="mt-4 break-all rounded-lg bg-background px-4 py-3 font-mono text-sm font-bold text-foreground">
        {reference}
      </p>
    </div>
  );
}

export function ApplicationForm({ program }: { program: Program }) {
  const [values, setValues] = useState<Record<string, string>>({ consent_privacy: "false" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<{ reference?: string; error?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const set = (key: string, value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setErrors({});
    setStatus({});
    let payload;
    try {
      payload = applicationFormToPayload(program.slug, values);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const next: Record<string, string> = {};
        for (const issue of error.issues) next[String(issue.path[0] ?? "form")] ??= issue.message;
        setErrors(next);
      } else {
        setStatus({ error: "Please review your application details." });
      }
      return;
    }
    setSubmitting(true);
    try {
      const response = await submitInternshipApplication({ data: payload });
      setStatus({ reference: response.reference });
    } catch (error) {
      setStatus({
        error:
          error instanceof Error
            ? error.message
            : "We could not submit your application. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (status.reference) return <ApplicationConfirmation reference={status.reference} />;
  return (
    <form
      onSubmit={submit}
      noValidate
      className="space-y-5"
      aria-describedby="application-notice"
      aria-busy={submitting}
    >
      <p id="application-notice" className="text-sm leading-6 text-muted-foreground">
        We review applications for this program only. Documents are not uploaded here; if needed,
        the team will request them later through an agreed secure method. Please do not send
        identity documents in this form.
      </p>
      {status.error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {status.error}
        </p>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map(([key, label, placeholder, required, maxLength]) => {
          const shared = {
            id: `application-${key}`,
            name: key,
            required,
            maxLength,
            placeholder,
            disabled: submitting,
            value: values[key] ?? "",
            onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
              set(key, event.target.value),
            "aria-invalid": Boolean(errors[key]),
            "aria-describedby": errors[key] ? `application-error-${key}` : undefined,
          };
          return (
            <div
              key={key}
              className={key === "motivation" || key === "clinical_exposure" ? "sm:col-span-2" : ""}
            >
              <label
                htmlFor={`application-${key}`}
                className="text-sm font-semibold text-foreground"
              >
                {label}
                {required && <span aria-hidden="true"> *</span>}
              </label>
              {key === "motivation" || key === "clinical_exposure" ? (
                <textarea
                  {...shared}
                  rows={4}
                  className="mt-2 w-full rounded-md border border-input bg-background px-3 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              ) : (
                <input
                  {...shared}
                  type={key === "email" ? "email" : key === "phone" ? "tel" : "text"}
                  className="mt-2 min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              )}
              {errors[key] && (
                <p
                  id={`application-error-${key}`}
                  className="mt-1 text-xs text-destructive"
                  role="alert"
                >
                  {errors[key]}
                </p>
              )}
            </div>
          );
        })}
      </div>
      <label className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
        <input
          type="checkbox"
          name="consent_privacy"
          required
          disabled={submitting}
          checked={values.consent_privacy === "true"}
          onChange={(event) => set("consent_privacy", event.target.checked ? "true" : "false")}
          aria-invalid={Boolean(errors.consent_privacy)}
          aria-describedby={errors.consent_privacy ? "application-error-consent" : undefined}
          className="mt-1 h-4 w-4 rounded border-input accent-primary"
        />
        <span>
          I agree that PainFix may use these details to review this application and contact me about
          it. I can request review or deletion through the clinic contact details; information is
          retained only as needed for this process and applicable records.
        </span>
      </label>
      {errors.consent_privacy && (
        <p id="application-error-consent" className="text-xs text-destructive" role="alert">
          {errors.consent_privacy}
        </p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-60"
      >
        {submitting && <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />}
        {submitting ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}
