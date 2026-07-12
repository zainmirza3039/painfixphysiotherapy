import {
  Dumbbell,
  Activity,
  ShieldPlus,
  HeartPulse,
  Zap,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";
import { WHATSAPP_CONSULT_URL } from "./constants";

const PILLARS = [
  {
    icon: Dumbbell,
    title: "Strength",
    text: "Progressive strengthening to rebuild power, stability and confidence.",
  },
  {
    icon: Activity,
    title: "Mobility",
    text: "Restore a full, comfortable range of motion in every joint.",
  },
  {
    icon: ShieldPlus,
    title: "Injury Prevention",
    text: "Screening and conditioning to reduce your risk of recurring injury.",
  },
  {
    icon: HeartPulse,
    title: "Rehabilitation",
    text: "Evidence-based recovery after injury, surgery or long inactivity.",
  },
  {
    icon: Zap,
    title: "Functional Fitness",
    text: "Move, lift and work better in everyday life and sport.",
  },
];

export function PhysioFitness() {
  return (
    <section id="physiotherapy-fitness" className="bg-surface py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Physiotherapy + Fitness"
          title="More than pain relief — long-term physical health"
          subtitle="We don't just help reduce pain. We help you restore movement, build strength, improve mobility, prevent injuries, and achieve long-term physical health through evidence-based rehabilitation and personalised exercise programmes."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} anim="up" delay={(i % 3) * 70}>
              <div className="hover-lift h-full rounded-[1.5rem] border border-border bg-card p-6 shadow-soft">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary/12 text-secondary">
                  <p.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-heading text-lg font-bold text-foreground">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
              </div>
            </Reveal>
          ))}
          <Reveal anim="up">
            <div className="flex h-full flex-col justify-center gap-3 rounded-[1.5rem] border border-primary/20 bg-primary/5 p-6">
              <a
                href={WHATSAPP_CONSULT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="ripple inline-flex items-center justify-center gap-2 rounded-2xl bg-secondary px-6 py-3.5 text-sm font-semibold text-secondary-foreground shadow-card transition-transform hover:scale-[1.03]"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp Consultation
              </a>
              <Link
                to="/fitness-rehabilitation"
                className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                Explore Fitness &amp; Rehabilitation <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
