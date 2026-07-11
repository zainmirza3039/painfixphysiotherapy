import { Building2, Video, Calendar, MessageCircle, CheckCircle2 } from "lucide-react";
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
    title: "In-Clinic Consultation",
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
    title: "Video Consultation",
    price: "Rs. 1,000",
    description: "Online consultation for follow-ups and second opinions.",
    points: [
      "Convenient online session",
      "Ideal for follow-ups",
      "Expert second opinions",
    ],
    cta: "calendly",
  },
];

export function ConsultationFees() {
  return (
    <section id="fees" className="bg-surface py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Consultation Fees"
          title="Simple, transparent pricing"
          subtitle="Clear, upfront fees for expert physiotherapy care — in the clinic or online."
        />
        <div className="mx-auto mt-12 grid max-w-4xl gap-5 sm:grid-cols-2">
          {fees.map((fee, i) => (
            <Reveal key={fee.title} anim="up" delay={i * 90}>
              <div className="hover-lift flex h-full flex-col rounded-[1.75rem] border border-border bg-card p-8 shadow-soft">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <fee.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-heading text-xl font-bold text-foreground">{fee.title}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-heading text-3xl font-extrabold text-secondary">{fee.price}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{fee.description}</p>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {fee.points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-sm text-foreground">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary" /> {p}
                    </li>
                  ))}
                </ul>
                {fee.cta === "whatsapp" ? (
                  <a
                    href={WHATSAPP_CONSULT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ripple mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-card transition-transform hover:scale-[1.02]"
                  >
                    <MessageCircle className="h-4 w-4" /> Book via WhatsApp
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => openCalendlyPopup()}
                    className="ripple mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-card transition-transform hover:scale-[1.02]"
                  >
                    <Calendar className="h-4 w-4" /> Book Video Consultation
                  </button>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
