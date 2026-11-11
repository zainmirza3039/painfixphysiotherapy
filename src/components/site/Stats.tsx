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
        <div className="grid grid-cols-2 divide-x divide-y divide-border border-y border-border bg-background lg:grid-cols-4 lg:divide-y-0">
          {stats.map((s, i) => (
            <Reveal
              key={s.label}
              anim="up"
              delay={i * 45}
              className="px-3 py-5 text-center sm:px-5 lg:py-7"
            >
              <div className="font-heading text-2xl font-extrabold text-foreground sm:text-4xl">
                {s.value}
              </div>
              <div className="mt-1 text-sm font-medium text-muted-foreground">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
