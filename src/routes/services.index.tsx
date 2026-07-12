import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MessageCircle } from "lucide-react";
import { services } from "@/data/services";
import { wellnessCards } from "@/data/wellnessCards";
import { WHATSAPP_CONSULT_URL } from "@/components/site/constants";
import { PageLayout } from "@/components/site/PageLayout";
import { PageHero } from "@/components/site/PageHero";
import { PageCTA } from "@/components/site/PageCTA";
import { Reveal } from "@/components/site/Reveal";
import { pageMeta, canonical, breadcrumbLd } from "@/lib/seo";

const TITLE = "Physiotherapy Services in Multan | PainFix Clinic";
const DESCRIPTION =
  "Explore our full range of physiotherapy services in Multan — manual therapy, exercise therapy, electrotherapy, sports rehab, home physiotherapy and more.";

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: pageMeta({ title: TITLE, description: DESCRIPTION, path: "/services" }),
    links: canonical("/services"),
    scripts: [
      breadcrumbLd([
        { label: "Home", path: "/" },
        { label: "Services", path: "/services" },
      ]),
    ],
  }),
  component: ServicesIndex,
});

function ServicesIndex() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Our Services"
        title="Comprehensive Physiotherapy Services"
        subtitle="Evidence-based treatment for pain, injury and recovery — delivered by experienced physiotherapists in Multan."
        crumbs={[
          { label: "Home", path: "/" },
          { label: "Services", path: "/services" },
        ]}
      />
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <Reveal key={service.slug} anim="up" delay={(i % 3) * 70}>
                <article className="hover-lift group relative flex h-full cursor-pointer flex-col rounded-[1.75rem] border border-border bg-card p-7 shadow-soft transition-shadow hover:border-primary/40 hover:shadow-card focus-within:ring-2 focus-within:ring-primary/50">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary/12 text-secondary">
                    <service.icon className="h-7 w-7" />
                  </span>
                  <h2 className="mt-5 font-heading text-xl font-bold text-foreground">
                    {service.title}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {service.tagline}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-2.5">
                    <Link
                      to="/services/$slug"
                      params={{ slug: service.slug }}
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-primary px-4 py-2 text-sm font-semibold text-primary transition-colors after:absolute after:inset-0 after:rounded-[1.75rem] after:content-[''] hover:bg-primary hover:text-primary-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      aria-label={`Learn more about ${service.title}`}
                    >
                      Learn More <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                    </Link>
                    <a
                      href={WHATSAPP_CONSULT_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative z-10 inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition-opacity hover:opacity-90"
                      aria-label={`Ask about ${service.title} on WhatsApp`}
                    >
                      <MessageCircle className="h-4 w-4" /> WhatsApp
                    </a>
                  </div>
                </article>
              </Reveal>
            ))}

            {/* Wellness offerings on their own routes (Fitness, Diet Plans). */}
            {wellnessCards.map((c, i) => (
              <Reveal key={c.to} anim="up" delay={((services.length + i) % 3) * 70}>
                <article className="hover-lift group relative flex h-full cursor-pointer flex-col rounded-[1.75rem] border border-border bg-card p-7 shadow-soft transition-shadow hover:border-primary/40 hover:shadow-card focus-within:ring-2 focus-within:ring-primary/50">
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary/12 text-secondary">
                      <c.icon className="h-7 w-7" />
                    </span>
                    {c.badge && (
                      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                        {c.badge}
                      </span>
                    )}
                  </div>
                  <h2 className="mt-5 font-heading text-xl font-bold text-foreground">{c.title}</h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {c.tagline}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-2.5">
                    <Link
                      to={c.to}
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-primary px-4 py-2 text-sm font-semibold text-primary transition-colors after:absolute after:inset-0 after:rounded-[1.75rem] after:content-[''] hover:bg-primary hover:text-primary-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      aria-label={`Learn more about ${c.title}`}
                    >
                      Learn More <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                    </Link>
                    <a
                      href={WHATSAPP_CONSULT_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative z-10 inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition-opacity hover:opacity-90"
                      aria-label={`Ask about ${c.title} on WhatsApp`}
                    >
                      <MessageCircle className="h-4 w-4" /> WhatsApp
                    </a>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <PageCTA />
    </PageLayout>
  );
}
