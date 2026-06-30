import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const steps = [
  { n: "1", title: "Assessment", desc: "A thorough evaluation of your symptoms, history, and movement." },
  { n: "2", title: "Clinical Diagnosis", desc: "Identifying the precise root cause behind your pain." },
  { n: "3", title: "Personalized Treatment", desc: "A plan crafted specifically for your body and goals." },
  { n: "4", title: "Exercise Rehabilitation", desc: "Guided, progressive exercises that rebuild strength." },
  { n: "5", title: "Recovery", desc: "Restoring full, pain-free movement and function." },
  { n: "6", title: "Prevention", desc: "Strategies and education to keep pain from returning." },
];

export function Process() {
  return (
    <section className="bg-surface py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Treatment Process"
          title="Your journey to lasting recovery"
          subtitle="A clear, structured pathway from first visit to long-term wellbeing."
        />

        <div className="relative mt-14">
          <div className="absolute left-5 top-0 hidden h-full w-px bg-gradient-to-b from-secondary via-primary to-secondary lg:left-1/2 lg:block" />
          <div className="space-y-6 lg:space-y-0">
            {steps.map((s, i) => (
              <Reveal
                key={s.n}
                anim={i % 2 === 0 ? "left" : "right"}
                className={`relative lg:flex lg:items-center lg:gap-8 ${i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"}`}
              >
                <div className="lg:w-1/2">
                  <div className="hover-lift rounded-[1.75rem] border border-border bg-card p-6 shadow-soft">
                    <div className="flex items-center gap-4">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary font-heading text-lg font-bold text-primary-foreground">
                        {s.n}
                      </span>
                      <h3 className="font-heading text-lg font-bold text-foreground">{s.title}</h3>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
                <span className="absolute left-5 top-7 hidden h-4 w-4 -translate-x-1/2 rounded-full border-4 border-surface bg-secondary lg:left-1/2 lg:block" />
                <div className="hidden lg:block lg:w-1/2" />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
