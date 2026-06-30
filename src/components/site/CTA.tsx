import { Calendar, MessageCircle } from "lucide-react";
import { Reveal } from "./Reveal";
import { WHATSAPP_URL } from "./constants";

export function CTA() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal anim="up">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary via-primary to-secondary px-6 py-14 text-center shadow-card sm:px-12 sm:py-20">
            <div className="pointer-events-none absolute -top-16 -right-10 h-64 w-64 rounded-full bg-secondary-glow/40 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-primary-glow/30 blur-3xl" />

            <h2 className="relative font-heading text-3xl font-extrabold leading-tight text-primary-foreground sm:text-4xl">
              Ready to Begin Your Recovery?
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-base text-primary-foreground/80">
              Take the first step toward a stronger, pain-free life. Our team is ready to help you move better.
            </p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="ripple inline-flex items-center gap-2 rounded-2xl bg-background px-6 py-3.5 text-sm font-semibold text-primary shadow-soft transition-transform hover:scale-105"
              >
                <Calendar className="h-4 w-4" /> Book Appointment
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border border-primary-foreground/40 px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
