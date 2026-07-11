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
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary via-primary to-secondary px-6 py-14 text-center shadow-card sm:px-12 sm:py-16">
            <div className="pointer-events-none absolute -top-16 -right-10 h-64 w-64 rounded-full bg-secondary-glow/40 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-primary-glow/30 blur-3xl" />
            <h2 className="relative font-heading text-2xl font-extrabold text-primary-foreground sm:text-3xl">
              {title}
            </h2>
            <p className="relative mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-primary-foreground/85 sm:text-base">
              {subtitle}
            </p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <a
                href={WHATSAPP_CONSULT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="ripple inline-flex items-center gap-2 rounded-2xl bg-background px-6 py-3.5 text-sm font-semibold text-primary shadow-card transition-transform hover:scale-[1.03]"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp Consultation
              </a>
              <a
                href={PHONE_TEL}
                className="inline-flex items-center gap-2 rounded-2xl border border-primary-foreground/40 px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
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
