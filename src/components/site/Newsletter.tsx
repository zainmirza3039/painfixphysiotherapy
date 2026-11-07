import { Mail } from "lucide-react";

/** Newsletter signup is intentionally unavailable until a verified subscription service is connected. */
export function Newsletter() {
  return (
    <div className="rounded-[1.75rem] border border-border bg-surface p-6 shadow-soft">
      <div className="flex items-center gap-2 text-sm font-bold text-foreground">
        <Mail className="h-4 w-4 text-secondary" /> Health Tips Newsletter
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Get evidence-based physiotherapy tips and recovery guides from PainFix Physiotherapy Clinic,
        Multan.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          disabled
          placeholder="Email subscriptions opening soon"
          className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground"
        />
        <span className="inline-flex shrink-0 items-center justify-center rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground">
          Coming soon
        </span>
      </div>
      <p role="status" className="mt-3 text-sm text-muted-foreground">
        Newsletter signups are not active yet. Contact the clinic to enquire about updates.
      </p>
    </div>
  );
}
