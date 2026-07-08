import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import type { Faq } from "@/data/services";

export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-3xl divide-y divide-border rounded-[1.75rem] border border-border bg-card shadow-soft">
      {faqs.map((faq, i) => {
        const isOpen = open === i;
        return (
          <div key={faq.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            >
              <span className="font-heading font-semibold text-foreground">{faq.q}</span>
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-primary">
                {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </span>
            </button>
            {isOpen && (
              <div className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">{faq.a}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
