import { ClipboardList, MessagesSquare, MoveRight } from "lucide-react";
import { Reveal } from "./Reveal";

const principles = [
  {
    number: "01",
    icon: ClipboardList,
    title: "We begin with your story",
    description:
      "Your history, symptoms and movement help shape the assessment—not just the place that hurts.",
  },
  {
    number: "02",
    icon: MessagesSquare,
    title: "We plan with you",
    description:
      "We explain what we find, discuss suitable options, and build a plan around your priorities.",
  },
  {
    number: "03",
    icon: MoveRight,
    title: "We build practical progress",
    description:
      "Where appropriate, care can combine hands-on treatment, exercise and guidance for everyday movement.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="home-section home-section--navy">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div>
            <p className="home-eyebrow home-eyebrow--light">
              <span aria-hidden="true" /> How care works
            </p>
            <h2 className="home-section-title home-section-title--light mt-4">
              Clear steps. Care with you, not just for you.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/75">
              Physiotherapy is a partnership. We want you to understand the plan, take part in your
              recovery and know what the next step is.
            </p>
          </div>
          <ol className="home-principles">
            {principles.map(({ number, icon: Icon, title, description }, index) => (
              <Reveal key={number} anim="up" delay={index * 70} as="li" className="home-principle">
                <span className="home-principle__number">{number}</span>
                <span className="home-principle__icon">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <h3 className="text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">{description}</p>
                </span>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
