import {
  Hand,
  Dumbbell,
  Trophy,
  Zap,
  Home,
  PersonStanding,
  Briefcase,
  ShieldPlus,
} from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const services = [
  { icon: Hand, title: "Manual Therapy" },
  { icon: Dumbbell, title: "Exercise Therapy" },
  { icon: Trophy, title: "Sports Rehabilitation" },
  { icon: Zap, title: "Electrotherapy" },
  { icon: Home, title: "Home Physiotherapy" },
  { icon: PersonStanding, title: "Posture Assessment" },
  { icon: Briefcase, title: "Ergonomic Consultation" },
  { icon: ShieldPlus, title: "Pain Management" },
];

export function Services() {
  return (
    <section id="services" className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Services"
          title="Treatments tailored to you"
          subtitle="A full spectrum of physiotherapy services delivered with precision and care."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <Reveal key={s.title} anim="up" delay={(i % 4) * 80}>
              <div className="hover-lift group h-full rounded-[1.75rem] border border-border bg-card p-7 text-center shadow-soft">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground transition-transform group-hover:scale-110">
                  <s.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-heading text-base font-bold text-foreground">{s.title}</h3>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
