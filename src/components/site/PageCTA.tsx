import { MessageCircle, Phone } from "lucide-react";
import { Reveal } from "./Reveal";
import { WHATSAPP_CONSULT_URL, PHONE_TEL, PHONE_DISPLAY } from "./constants";

interface PageCTAProps {
  title?: string;
  subtitle?: string;
}

export function PageCTA({
  title = "Have a question about your recovery?",
  subtitle = "Chat with our physiotherapists on WhatsApp — ask anything, get honest advice, and book only when you're ready.",
}: PageCTAProps) {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal anim="up">
          <div className="overflow-hidden rounded-md border-l-[5px] border-l-brand-green bg-primary px-6 py-12 text-center sm:px-12 sm:py-14">
            <h2 className="font-heading text-[clamp(1.75rem,3.2vw,2.5rem)] font-semibold leading-tight tracking-[-0.025em] text-primary-foreground">
              {title}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-primary-foreground/85 sm:text-base">
              {subtitle}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a
                href={WHATSAPP_CONSULT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center gap-2 rounded-md bg-background px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-background/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-glow focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp Consultation
              </a>
              <a
                href={PHONE_TEL}
                className="inline-flex min-h-12 items-center gap-2 rounded-md border border-primary-foreground/40 px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-glow focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              >
                <Phone className="h-4 w-4" /> Call {PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
