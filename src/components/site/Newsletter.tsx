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
      <p role="status" className="mt-4 text-sm text-muted-foreground">
        Newsletter subscriptions are not active yet. Contact the clinic to enquire about updates.
      </p>
    </div>
  );
}
