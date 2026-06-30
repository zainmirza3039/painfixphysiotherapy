import { Reveal } from "./Reveal";

const stats = [
  { value: "1000+", label: "Patients Treated" },
  { value: "98%", label: "Patient Satisfaction" },
  { value: "5★", label: "Patient Reviews" },
  { value: "Personalized", label: "Treatment Plans" },
];

export function Stats() {
  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 rounded-[2rem] bg-gradient-to-br from-primary via-primary to-secondary p-6 shadow-card sm:p-10 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} anim="up" delay={i * 90} className="text-center">
              <div className="font-heading text-2xl font-extrabold text-primary-foreground sm:text-4xl">{s.value}</div>
              <div className="mt-1 text-sm font-medium text-primary-foreground/75">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
