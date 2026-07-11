import { useState } from "react";
import { Plus } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export const homeFaqs = [
  {
    q: "Do I need a doctor's referral to book an appointment?",
    a: "No referral is required. You can book a physiotherapy assessment directly with us and we'll take care of the rest.",
  },
  {
    q: "How long does each session last?",
    a: "Initial assessments typically take 45–60 minutes, while follow-up treatment sessions usually last 30–45 minutes depending on your plan.",
  },
  {
    q: "How many sessions will I need?",
    a: "It varies by condition. After your assessment, we'll provide a clear, personalized treatment plan with an estimated number of sessions.",
  },
  {
    q: "Do you offer home physiotherapy?",
    a: "Yes. We provide home physiotherapy services for patients who are unable to travel, including post-surgical and stroke rehabilitation.",
  },
  {
    q: "What conditions do you treat?",
    a: "We treat a wide range of conditions including back and neck pain, sciatica, sports injuries, arthritis, frozen shoulder, and post-surgical rehabilitation.",
  },
  {
    q: "How do I book an appointment?",
    a: "Simply tap any 'Book Appointment' or 'WhatsApp Now' button, or call us at 0314-3039582. We'll confirm a time that works for you.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="FAQ" title="Frequently asked questions" />
        <div className="mt-12 space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={f.q} anim="up" delay={(i % 4) * 60}>
                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="font-heading text-base font-semibold text-foreground">{f.q}</span>
                    <Plus
                      className={`h-5 w-5 shrink-0 text-secondary transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
                    />
                  </button>
                  <div
                    className="grid transition-all duration-300 ease-out"
                    style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
