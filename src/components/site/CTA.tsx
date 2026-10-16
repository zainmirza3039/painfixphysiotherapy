import { ArrowUpRight, CalendarDays, MessageCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Reveal } from "./Reveal";
import { WHATSAPP_CONSULT_URL } from "./constants";

export function CTA() {
  return (
    <section className="home-cta-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal anim="up">
          <div className="home-cta">
            <div className="max-w-2xl">
              <p className="home-eyebrow home-eyebrow--light">
                <span aria-hidden="true" /> Your next step
              </p>
              <h2 className="mt-4 font-heading text-4xl font-semibold leading-tight tracking-[-0.025em] text-white sm:text-5xl">
                Move Better. Recover Faster. Live Pain-Free.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-white/75">
                Book an appointment or send the PainFix team a message about what you need.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-56">
              <Link
                to="/book-appointment"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-[#EAF5EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              >
                <CalendarDays className="h-4 w-4" aria-hidden="true" /> Book an appointment
              </Link>
              <a
                href={WHATSAPP_CONSULT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/40 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp the clinic
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
