import { useState } from "react";
import { Plus } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { homeFaqs } from "./home-faqs";

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="home-section scroll-mt-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Questions, answered" title="Before your first visit." />
        <div className="mt-10 border-t border-border">
          {homeFaqs.map((item, index) => {
            const isOpen = open === index;
            const answerId = `home-faq-answer-${index}`;
            return (
              <Reveal key={item.q} anim="up">
                <article className="border-b border-border">
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={answerId}
                      onClick={() => setOpen(isOpen ? null : index)}
                      className="flex min-h-16 w-full items-center justify-between gap-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <span className="font-heading text-xl font-semibold leading-snug text-foreground sm:text-2xl">
                        {item.q}
                      </span>
                      <Plus
                        className={`h-5 w-5 shrink-0 text-secondary transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}
                        aria-hidden="true"
                      />
                    </button>
                  </h3>
                  <div id={answerId} hidden={!isOpen}>
                    <p className="max-w-3xl pb-5 pr-8 text-sm leading-7 text-muted-foreground">
                      {item.a}
                    </p>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
