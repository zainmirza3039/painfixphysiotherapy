import { Stethoscope, Search, HeartPulse, ShieldCheck } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const steps = [
  {
    n: "01",
    icon: Stethoscope,
    title: "Assessment",
    desc: "A thorough evaluation of your symptoms, history, and movement patterns.",
  },
  {
    n: "02",
    icon: Search,
    title: "Diagnosis",
    desc: "Identifying the precise root cause behind your pain, not just the symptoms.",
  },
  {
    n: "03",
    icon: HeartPulse,
    title: "Personalized Treatment",
    desc: "A hands-on plan and exercise program crafted around your body and goals.",
  },
  {
    n: "04",
    icon: ShieldCheck,
    title: "Recovery & Prevention",
    desc: "Rebuilding strength and giving you strategies to keep pain from returning.",
  },
];

export function Process() {
  return (
    <section className="bg-surface py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Our Treatment Process"
          title="Your journey to lasting recovery"
          subtitle="A clear, structured pathway from your first visit to long-term wellbeing."
        />

        <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal
              key={s.n}
              as="li"
              anim="up"
              delay={(i % 4) * 90}
              className="hover-lift h-full list-none rounded-[1.75rem] border border-border bg-card p-7 shadow-soft"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary/12 text-secondary">
                  <s.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className="font-heading text-2xl font-extrabold text-border" aria-hidden="true">
                  {s.n}
                </span>
              </div>
              <h3 className="mt-5 font-heading text-lg font-bold text-foreground">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
