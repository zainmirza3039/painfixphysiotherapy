import { Building2, Calendar, Check, MessageCircle, Video } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { openCalendlyPopup } from "./calendly";
import { WHATSAPP_CONSULT_URL } from "./constants";

interface Fee {
  icon: typeof Building2;
  title: string;
  price: string;
  description: string;
  points: string[];
  cta: "whatsapp" | "calendly";
}

const fees: Fee[] = [
  {
    icon: Building2,
    title: "In-clinic consultation",
    price: "Rs. 2,000",
    description: "Initial assessment and treatment plan.",
    points: [
      "Detailed physical assessment",
      "Personalized treatment plan",
      "Hands-on physiotherapy session",
    ],
    cta: "whatsapp",
  },
  {
    icon: Video,
    title: "Video consultation",
    price: "Rs. 1,000",
    description: "Online consultation for follow-ups and second opinions.",
    points: ["Convenient online session", "Ideal for follow-ups", "Expert second opinions"],
    cta: "calendly",
  },
];

export function ConsultationFees() {
  return (
    <section id="fees" className="home-section home-section--tint scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Consultation fees"
          title="Know the fee before you book."
          subtitle="Current consultation options listed by PainFix. Contact the team if you need to confirm details before booking."
        />
        <div className="mx-auto mt-10 max-w-5xl divide-y divide-border border-y border-border">
          {fees.map((fee, index) => {
            const Icon = fee.icon;
            return (
              <Reveal key={fee.title} anim="up" delay={index * 60}>
                <article className="home-fee-row">
                  <div className="home-fee-row__title">
                    <Icon className="h-5 w-5 shrink-0 text-secondary" aria-hidden="true" />
                    <div>
                      <h3 className="font-heading text-2xl font-semibold text-foreground">
                        {fee.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">{fee.description}</p>
                    </div>
                  </div>
                  <ul className="home-fee-row__details">
                    {fee.points.map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <Check
                          className="mt-0.5 h-4 w-4 shrink-0 text-secondary"
                          aria-hidden="true"
                        />{" "}
                        {point}
                      </li>
                    ))}
                  </ul>
                  <div className="home-fee-row__action">
                    <p className="font-heading text-3xl font-semibold text-primary">{fee.price}</p>
                    {fee.cta === "whatsapp" ? (
                      <a
                        href={WHATSAPP_CONSULT_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      >
                        <MessageCircle className="h-4 w-4" aria-hidden="true" /> Ask on WhatsApp
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openCalendlyPopup()}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      >
                        <Calendar className="h-4 w-4" aria-hidden="true" /> Book online
                      </button>
                    )}
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
