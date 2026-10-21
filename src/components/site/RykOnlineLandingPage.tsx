import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, MessageCircle, Video } from "lucide-react";
import { PageCTA } from "./PageCTA";
import { PageHero } from "./PageHero";
import { PageLayout } from "./PageLayout";
import { FaqAccordion } from "./FaqAccordion";
import { QuickAnswer } from "./QuickAnswer";
import { Reveal } from "./Reveal";

const faqItems = [
  {
    q: "Does PainFix have a physical clinic in Rahim Yar Khan?",
    a: "No. PainFix does not currently operate a physical clinic or local home-visit service in Rahim Yar Khan. RYK enquiries are handled as online physiotherapy enquiries with Ariba Babar, DPT.",
  },
  {
    q: "How does an online physiotherapy consultation work?",
    a: "Start with an enquiry so suitability and availability can be discussed. The consultation can cover your history, symptoms, movement concerns, education and a personalised rehabilitation plan where online care is appropriate.",
  },
  {
    q: "Can online physiotherapy help with back pain or mobility concerns?",
    a: "Online care may be suitable for education, exercise guidance, rehabilitation planning and follow-up for some conditions. Suitability depends on your symptoms and clinical situation, so discuss this before booking.",
  },
  {
    q: "How do I enquire about online physiotherapy in Rahim Yar Khan?",
    a: "Use the online booking enquiry or visit Ariba Babar's profile to contact her through WhatsApp. Availability and suitability are confirmed before an appointment is arranged.",
  },
];

const steps = [
  [
    "1",
    "Share your concern",
    "Tell us about your symptoms, goals and any relevant diagnosis or treatment history.",
  ],
  [
    "2",
    "Discuss suitability",
    "Ariba reviews whether online guidance is appropriate and explains the next step.",
  ],
  [
    "3",
    "Start a structured plan",
    "Where suitable, your consultation focuses on education, rehabilitation planning and safe exercises.",
  ],
];

export function RykOnlineLandingPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Online physiotherapy for Rahim Yar Khan"
        title="Online Physiotherapy in Rahim Yar Khan"
        subtitle="Enquire about online video physiotherapy with Ariba Babar, DPT — with suitability and availability confirmed before booking."
        crumbs={[
          { label: "Home", path: "/" },
          {
            label: "Rahim Yar Khan online physiotherapy",
            path: "/physiotherapy-in-rahim-yar-khan",
          },
        ]}
        icon={<Video className="h-8 w-8" />}
      />

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <QuickAnswer
            answer="PainFix provides online physiotherapy enquiries for people in Rahim Yar Khan through Ariba Babar, DPT. Care is online only: PainFix does not currently have a physical RYK clinic or local home-visit service. Start with an enquiry to discuss your symptoms, goals, suitability and availability."
            takeaways={[
              "Online video consultation with Ariba Babar, DPT",
              "Suitability and availability discussed before booking",
              "Assessment, education and rehabilitation planning where appropriate",
              "No physical PainFix clinic or local home visits in Rahim Yar Khan",
            ]}
          />
        </div>
      </section>

      <section className="bg-surface py-14 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
          <div>
            <p className="home-eyebrow">
              <span aria-hidden="true" /> A clear starting point
            </p>
            <h2 className="mt-4 font-heading text-3xl font-extrabold text-foreground sm:text-4xl">
              Online care, with honest boundaries
            </h2>
            <div className="mt-5 space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>
                An online physiotherapy consultation can help you understand your symptoms, plan
                rehabilitation and learn safe movement strategies when remote care is appropriate.
                The first step is a suitability discussion rather than an automatic promise that
                online care is right for every condition.
              </p>
              <p>
                Rahim Yar Khan patients connect with Ariba Babar, DPT, online. Multan clinic
                appointments and Multan home visits are separate services and are not offered in
                Rahim Yar Khan.
              </p>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="/book-appointment?city=rahim-yar-khan&service=online"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-card transition-transform hover:scale-[1.02]"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" /> Enquire about online care
              </a>
              <Link
                to="/$slug"
                params={{ slug: "ariba-babar" }}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-primary transition-colors hover:border-primary"
              >
                Meet Ariba Babar <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
          <aside className="rounded-[1.75rem] border border-border bg-card p-6 shadow-soft sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
              Service mode
            </p>
            <h2 className="mt-3 font-heading text-2xl font-bold text-foreground">
              Online only in RYK
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              There is no physical PainFix branch or local home-visit coverage in Rahim Yar Khan at
              this time.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-foreground">
              {[
                "Online video enquiry",
                "Suitability discussion",
                "Personalised guidance where appropriate",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-secondary"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="home-eyebrow">
              <span aria-hidden="true" /> What to expect
            </p>
            <h2 className="mt-4 font-heading text-3xl font-extrabold text-foreground sm:text-4xl">
              Three steps to an online enquiry
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map(([number, title, description], index) => (
              <Reveal key={number} anim="up" delay={index * 70}>
                <article className="h-full rounded-[1.5rem] border border-border bg-card p-6 shadow-soft">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {number}
                  </span>
                  <h3 className="mt-5 font-heading text-xl font-bold text-foreground">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl font-extrabold text-foreground sm:text-4xl">
            Frequently asked questions
          </h2>
          <div className="mt-8">
            <FaqAccordion faqs={faqItems} />
          </div>
        </div>
      </section>

      <PageCTA />
    </PageLayout>
  );
}

export { faqItems as rykOnlineFaqs };
