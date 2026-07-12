import { Star } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const reviews = [
  {
    name: "Ahmed R.",
    text: "After months of lower back pain, the personalized plan here finally fixed it. Professional, caring, and truly effective.",
    initial: "A",
  },
  {
    name: "Sana M.",
    text: "My frozen shoulder improved dramatically within weeks. The team explains everything and genuinely cares about recovery.",
    initial: "S",
  },
  {
    name: "Bilal K.",
    text: "Best physiotherapy clinic in Multan. Clean facility, modern equipment, and the manual therapy worked wonders for my knee.",
    initial: "B",
  },
  {
    name: "Hira F.",
    text: "Recovered from a sports injury faster than expected. The exercise program was tailored perfectly to my needs.",
    initial: "H",
  },
  {
    name: "Usman T.",
    text: "Highly recommend. The assessment was detailed and the treatment was evidence-based. My posture and pain both improved.",
    initial: "U",
  },
  {
    name: "Ayesha N.",
    text: "Compassionate and skilled team. The home physiotherapy service was a blessing for my elderly father's rehabilitation.",
    initial: "A",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Testimonials"
          title="Loved by our patients"
          subtitle="Real stories from people who reclaimed a pain-free life with us."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r, i) => (
            <Reveal key={r.name} anim="up" delay={(i % 3) * 90}>
              <figure className="hover-lift flex h-full flex-col rounded-[1.75rem] border border-border bg-card p-7 shadow-soft">
                <div
                  className="flex items-center gap-1 text-secondary"
                  aria-label="5 out of 5 stars"
                >
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star key={k} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground/90">
                  "{r.text}"
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-primary font-heading font-bold text-primary-foreground">
                    {r.initial}
                  </span>
                  <div>
                    <div className="text-sm font-bold text-foreground">{r.name}</div>
                    <div className="text-xs text-muted-foreground">Google Review</div>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
