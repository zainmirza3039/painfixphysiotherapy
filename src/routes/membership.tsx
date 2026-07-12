import { createFileRoute } from "@tanstack/react-router";
import { HeartHandshake, Check, MessageCircle } from "lucide-react";
import { PageLayout } from "@/components/site/PageLayout";
import { PageHero } from "@/components/site/PageHero";
import { PageCTA } from "@/components/site/PageCTA";
import { Reveal } from "@/components/site/Reveal";
import { MEMBERSHIP_PLANS } from "@/data/membership";
import { WHATSAPP_URL } from "@/components/site/constants";
import { pageMeta, canonical, breadcrumbLd } from "@/lib/seo";
import { SITE_URL } from "@/components/site/constants";

const PATH = "/membership";
const TITLE = "Fitness Membership & Packages in Multan | PainFix";
const DESCRIPTION =
  "Physiotherapy + fitness membership packages in Multan at PainFix — flexible monthly plans with supervised sessions, personalised programmes and expert support.";

export const Route = createFileRoute("/membership")({
  head: () => ({
    meta: pageMeta({ title: TITLE, description: DESCRIPTION, path: PATH }),
    links: canonical(PATH),
    scripts: [
      breadcrumbLd([
        { label: "Home", path: "/" },
        { label: "Fitness", path: "/fitness" },
        { label: "Membership", path: PATH },
      ]),
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "OfferCatalog",
          name: "PainFix Fitness Membership Packages",
          url: `${SITE_URL}${PATH}`,
          itemListElement: MEMBERSHIP_PLANS.map((p) => ({
            "@type": "Offer",
            name: p.name,
            description: p.tagline,
            priceCurrency: "PKR",
          })),
        }),
      },
    ],
  }),
  component: Membership,
});

function waLink(planName: string) {
  return `${WHATSAPP_URL}?text=${encodeURIComponent(
    `Hi PainFix, I'm interested in the ${planName} membership package. Please share details.`,
  )}`;
}

function Membership() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Membership & Packages"
        title="Physiotherapy + Fitness Membership"
        subtitle="Flexible monthly plans that combine physiotherapist-led fitness, supervised sessions and personalised programmes — so you keep progressing safely."
        icon={<HeartHandshake className="h-8 w-8" />}
        crumbs={[
          { label: "Home", path: "/" },
          { label: "Fitness", path: "/fitness" },
          { label: "Membership", path: PATH },
        ]}
      />

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {MEMBERSHIP_PLANS.map((plan, i) => (
              <Reveal key={plan.slug} anim="up" delay={i * 80}>
                <div
                  className={`relative flex h-full flex-col rounded-[1.75rem] border bg-card p-7 shadow-soft ${
                    plan.featured ? "border-secondary ring-2 ring-secondary/30" : "border-border"
                  }`}
                >
                  {plan.featured && (
                    <span className="absolute -top-3 left-7 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
                      Most popular
                    </span>
                  )}
                  <h2 className="font-heading text-xl font-extrabold text-foreground">
                    {plan.name}
                  </h2>
                  <p className="mt-1.5 text-sm text-muted-foreground">{plan.tagline}</p>
                  <div className="mt-4 flex items-end gap-1">
                    <span className="font-heading text-2xl font-extrabold text-primary">
                      {plan.price}
                    </span>
                    <span className="pb-1 text-xs text-muted-foreground">{plan.period}</span>
                  </div>
                  <ul className="mt-5 flex-1 space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-secondary" /> {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={waLink(plan.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-6 inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold shadow-card transition-transform hover:scale-[1.02] ${
                      plan.featured
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    <MessageCircle className="h-4 w-4" /> Enquire on WhatsApp
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-relaxed text-muted-foreground">
            Prices are starting points and confirmed after your assessment. Every plan is tailored
            to your health, goals and any existing conditions. Contact us on WhatsApp for exact
            pricing and availability.
          </p>
        </div>
      </section>

      <PageCTA />
    </PageLayout>
  );
}
