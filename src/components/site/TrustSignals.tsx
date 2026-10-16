import { ClipboardCheck, House, PersonStanding, Stethoscope } from "lucide-react";

const signals = [
  { icon: ClipboardCheck, title: "Assessment first", note: "Understand your needs" },
  { icon: Stethoscope, title: "DPT-led care", note: "Qualified physiotherapists" },
  { icon: PersonStanding, title: "A plan for you", note: "Treatment shaped around your goals" },
  { icon: House, title: "Clinic or home", note: "Home visits available" },
];

export function TrustSignals() {
  return (
    <section aria-label="How PainFix approaches care" className="home-trust-strip">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-border px-4 sm:px-6 lg:grid-cols-4 lg:divide-y-0 lg:px-8">
        {signals.map(({ icon: Icon, title, note }) => (
          <div key={title} className="flex items-start gap-3 px-3 py-4 sm:px-5 lg:py-6">
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-secondary" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{note}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
