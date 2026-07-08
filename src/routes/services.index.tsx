import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { services } from "@/data/services";
import { PageLayout } from "@/components/site/PageLayout";
import { PageHero } from "@/components/site/PageHero";
import { PageCTA } from "@/components/site/PageCTA";
import { Reveal } from "@/components/site/Reveal";
import { pageMeta, canonical, breadcrumbLd } from "@/lib/seo";

const TITLE = "Physiotherapy Services in Multan | PainFix Physiotherapy Clinic";
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
                <Link
                  to="/services/$slug"
                  params={{ slug: service.slug }}
                  className="hover-lift group flex h-full flex-col rounded-[1.75rem] border border-border bg-card p-7 shadow-soft"
                >
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary/12 text-secondary">
                    <service.icon className="h-7 w-7" />
                  </span>
                  <h2 className="mt-5 font-heading text-xl font-bold text-foreground">{service.title}</h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{service.tagline}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    Learn more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <PageCTA />
    </PageLayout>
  );
}
