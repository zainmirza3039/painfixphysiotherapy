import { Check } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const conditions = [
  "Neck Pain",
  "Low Back Pain",
  "Sciatica",
  "Frozen Shoulder",
  "Cervical Radiculopathy",
  "Knee Pain",
  "Osteoarthritis",
  "Sports Injuries",
  "Stroke Rehabilitation",
  "Plantar Fasciitis",
  "Balance Disorders",
  "Post Surgical Rehabilitation",
];

export function Conditions() {
  return (
    <section id="conditions" className="bg-surface py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Conditions We Treat"
          title="Expert care for a wide range of conditions"
          subtitle="From everyday aches to complex rehabilitation, we help you get back to doing what you love."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {conditions.map((c, i) => (
            <Reveal key={c} anim="up" delay={(i % 3) * 70}>
              <div className="hover-lift flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 shadow-soft">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary/15 text-secondary">
                  <Check className="h-4 w-4" />
                </span>
                <span className="font-medium text-foreground">{c}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
