import { useState, type FormEvent } from "react";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/i18n/LanguageProvider";
import { GoogleReviewButton } from "./GoogleReviewButton";

export function ContactForm() {
  const { t } = useI18n();
  const c = t.contact;
  const [values, setValues] = useState({ name: "", email: "", phone: "", message: "" });
  const [botField, setBotField] = useState(""); // honeypot — real users leave this empty
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // Silently drop bot submissions that fill the hidden honeypot field.
    if (botField) return;
    if (!values.name.trim() || !values.phone.trim() || !values.message.trim()) {
      toast.error(c.required);
      return;
    }
    if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      toast.error(c.error);
      return;
    }
    setSubmitting(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase.from("contact_submissions").insert({
        name: values.name.trim(),
        email: values.email.trim() || null,
        phone: values.phone.trim() || null,
        message: values.message.trim(),
      });
      if (error) throw error;
      toast.success(c.success);
      setValues({ name: "", email: "", phone: "", message: "" });
      setSubmitted(true);
    } catch (err) {
      console.error("Contact submission failed:", err);
      toast.error(c.error);
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20";
  const labelCls = "mb-1.5 block text-sm font-semibold text-foreground";

  if (submitted) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-border bg-surface p-8 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-secondary/12 text-secondary">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h4 className="mt-4 font-heading text-lg font-bold text-foreground">Thank you!</h4>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Your message has been received. Our team will get back to you shortly. If we've helped you,
          we'd love a quick review of your experience.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <GoogleReviewButton variant="solid" />
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="inline-flex items-center justify-center rounded-2xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition-transform hover:scale-[1.03]"
          >
            Send another message
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="c-name">
            {c.name} *
          </label>
          <input
            id="c-name"
            className={inputCls}
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="c-phone">
            {c.phoneField}
          </label>
          <input
            id="c-phone"
            type="tel"
            className={inputCls}
            value={values.phone}
            onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
          />
        </div>
      </div>
      <div>
        <label className={labelCls} htmlFor="c-email">
          {c.email}
        </label>
        <input
          id="c-email"
          type="email"
          className={inputCls}
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
        />
      </div>
      <div>
        <label className={labelCls} htmlFor="c-message">
          {c.message} *
        </label>
        <textarea
          id="c-message"
          rows={4}
          className={inputCls}
          value={values.message}
          onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
          required
        />
      </div>
      {/* Honeypot: visually hidden, ignored by humans, filled by bots */}
      <div aria-hidden className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden" tabIndex={-1}>
        <label htmlFor="c-website">Website</label>
        <input
          id="c-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={botField}
          onChange={(e) => setBotField(e.target.value)}
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="ripple inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-card transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> {t.actions.sending}
          </>
        ) : (
          <>
            <Send className="h-4 w-4" /> {t.actions.sendMessage}
          </>
        )}
      </button>
    </form>
  );
}
