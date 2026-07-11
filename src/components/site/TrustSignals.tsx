import { Star, ShieldCheck, Home, Stethoscope } from "lucide-react";
import { Reveal } from "./Reveal";

const signals = [
  { icon: Star, title: "4.9★ Google Reviews", note: "Rated by real patients" },
  { icon: ShieldCheck, title: "Evidence-Based Care", note: "Research-backed physiotherapy" },
  { icon: Home, title: "Home Physiotherapy", note: "Treatment at your doorstep" },
  { icon: Stethoscope, title: "Experienced Clinical Team", note: "Qualified DPT physiotherapists" },
];

export function TrustSignals() {
  return (
    <section aria-label="Why patients trust us" className="border-y border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {signals.map((s, i) => (
            <Reveal key={s.title} anim="up" delay={i * 80}>
              <div className="flex items-center gap-3 rounded-2xl p-2">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-secondary/12 text-secondary">
                  <s.icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-foreground">{s.title}</div>
                  <div className="truncate text-xs text-muted-foreground">{s.note}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
