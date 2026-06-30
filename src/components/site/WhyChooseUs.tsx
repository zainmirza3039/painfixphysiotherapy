import { ClipboardList, Hand, FlaskConical, GraduationCap, Dumbbell, TrendingUp } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const items = [
  { icon: ClipboardList, title: "Comprehensive Assessment", desc: "Detailed evaluation to pinpoint the true root cause of your pain." },
  { icon: Hand, title: "Manual Therapy", desc: "Hands-on techniques that release tension and restore mobility." },
  { icon: FlaskConical, title: "Evidence-Based Practice", desc: "Treatments backed by the latest clinical research." },
  { icon: GraduationCap, title: "Patient Education", desc: "Understand your condition and stay in control of your recovery." },
  { icon: Dumbbell, title: "Personalized Exercise Programs", desc: "Tailored routines designed around your goals and lifestyle." },
  { icon: TrendingUp, title: "Long-Term Recovery", desc: "Focused on lasting results, not temporary pain relief." },
];

export function WhyChooseUs() {
  return (
    <section className="bg-surface py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Why Choose Us"
          title="A smarter approach to recovery"
          subtitle="We combine clinical expertise with genuine care to deliver outcomes you can feel."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <Reveal key={it.title} anim="up" delay={(i % 3) * 90}>
              <div className="hover-lift h-full rounded-[1.75rem] border border-border bg-card p-7 shadow-soft">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary/12 text-secondary">
                  <it.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-heading text-lg font-bold text-foreground">{it.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{it.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
