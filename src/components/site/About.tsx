import { CheckCircle2 } from "lucide-react";
import clinicImg from "@/assets/clinic-exterior.webp";
import { Reveal } from "./Reveal";

const points = [
  "Detailed, individualized assessment for every patient",
  "Treatment plans built around long-term recovery",
  "Patient-centered, evidence-based physiotherapy",
];

export function About() {
  return (
    <section id="about" className="py-16 sm:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <Reveal anim="left">
          <div className="relative">
            <div className="overflow-hidden rounded-[2rem] shadow-glow ring-1 ring-border">
              <img
                src={clinicImg}
                alt="Exterior storefront of PainFix Physiotherapy Clinic in Shalimar Colony, Multan"
                width={880}
                height={1105}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="glass absolute -bottom-6 -right-2 rounded-2xl px-6 py-4 shadow-card sm:-right-6">
              <div className="font-heading text-3xl font-extrabold text-primary">1000+</div>
              <div className="text-xs font-medium text-muted-foreground">
                Patients on the road to recovery
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal anim="right">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-accent-foreground">
            About Us
          </span>
          <h2 className="mt-4 font-heading text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
            Recovery built around <span className="text-gradient">you</span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            PainFix Physiotherapy Clinic provides patient-centered rehabilitation using
            evidence-based physiotherapy.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Every patient receives a detailed assessment followed by an individualized treatment
            plan focused on long-term recovery rather than temporary pain relief.
          </p>
          <ul className="mt-7 space-y-3">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                <span className="text-foreground">{p}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
