import { Mail } from "lucide-react";

/** Newsletter subscription placeholder (non-functional capture stub). */
export function Newsletter() {
  return (
    <div className="rounded-[1.75rem] border border-border bg-surface p-6 shadow-soft">
      <div className="flex items-center gap-2 text-sm font-bold text-foreground">
        <Mail className="h-4 w-4 text-secondary" /> Health Tips Newsletter
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Get evidence-based physiotherapy tips and recovery guides from PainFix Physiotherapy Clinic, Multan.
      </p>
      <form
        className="mt-4 flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => e.preventDefault()}
      >
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          placeholder="you@example.com"
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          className="ripple shrink-0 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
        >
          Subscribe
        </button>
      </form>
    </div>
  );
}
