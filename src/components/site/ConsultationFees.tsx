import { Building2, Calendar, Home, MessageCircle, Video } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { WHATSAPP_CONSULT_URL } from "./constants";
import { SERVICE_FEES } from "@/data/serviceFees";

interface FeeItem {
  icon: typeof Building2;
  fee: (typeof SERVICE_FEES)[keyof typeof SERVICE_FEES];
  cta: "whatsapp" | "homeVisit" | "booking";
}

const fees: FeeItem[] = [
  { icon: Building2, fee: SERVICE_FEES.clinic, cta: "whatsapp" },
  { icon: Home, fee: SERVICE_FEES.homeVisit, cta: "homeVisit" },
  { icon: Video, fee: SERVICE_FEES.video, cta: "booking" },
];

const buttonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

export function ConsultationFees() {
  return (
    <section id="fees" className="home-section home-section--tint scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Clinic, home and video fees"
          title="Know the fee before you book."
          subtitle="Confirmed fees for in-clinic appointments, home visits and video consultations."
        />
        <div className="mx-auto mt-10 max-w-5xl divide-y divide-border border-y border-border">
          {fees.map(({ icon: Icon, fee, cta }, index) => (
            <Reveal key={fee.name} anim="up" delay={index * 60}>
              <article className="home-fee-row">
                <div className="home-fee-row__title">
                  <Icon className="h-5 w-5 shrink-0 text-secondary" aria-hidden="true" />
                  <div>
                    <h3 className="font-heading text-2xl font-semibold text-foreground">
                      {fee.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">{fee.description}</p>
                  </div>
                </div>
                <p className="home-fee-row__details text-sm text-muted-foreground">
                  Amount shown in PKR.
                </p>
                <div className="home-fee-row__action">
                  <p className="font-heading text-3xl font-semibold text-primary">
                    {fee.displayPrice}
                  </p>
                  {cta === "whatsapp" ? (
                    <a
                      href={WHATSAPP_CONSULT_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonClass}
                    >
                      <MessageCircle className="h-4 w-4" aria-hidden="true" /> Ask on WhatsApp
                    </a>
                  ) : cta === "homeVisit" ? (
                    <Link to="/home-visit" className={buttonClass}>
                      <Home className="h-4 w-4" aria-hidden="true" /> Request home visit
                    </Link>
                  ) : (
                    <Link to="/book-appointment" className={buttonClass}>
                      <Calendar className="h-4 w-4" aria-hidden="true" /> Book online
                    </Link>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
