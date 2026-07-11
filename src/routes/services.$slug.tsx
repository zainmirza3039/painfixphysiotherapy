import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { CheckCircle2, Sparkles, ClipboardList, Wrench, BookOpen, ShieldAlert, Users } from "lucide-react";
import { getService, type Service } from "@/data/services";
import { serviceImages, serviceImageAlt, serviceImageAltFallback } from "@/data/serviceImages";
import {
  whoCanBenefit,
  relatedConditionsForService,
  relatedArticlesForService,
} from "@/data/serviceExtras";
import { PageLayout } from "@/components/site/PageLayout";
import { PageHero } from "@/components/site/PageHero";
import { FaqAccordion } from "@/components/site/FaqAccordion";
import { PageCTA } from "@/components/site/PageCTA";
import { RelatedServices } from "@/components/site/RelatedServices";
import { RelatedConditions } from "@/components/site/RelatedConditions";
import { RelatedArticles } from "@/components/site/RelatedArticles";
import { Reveal } from "@/components/site/Reveal";
import { pageMeta, canonical, breadcrumbLd, faqLd } from "@/lib/seo";
import { SITE_URL } from "@/components/site/constants";

export const Route = createFileRoute("/services/$slug")({
  loader: ({ params }) => {
    const service = getService(params.slug);
    if (!service) throw notFound();
    // Return only the serializable slug — the service object contains a
    // non-serializable lucide `icon` component that breaks SSR dehydration.
    return { slug: service.slug };
  },
  head: ({ params, loaderData }) => {
    const service = loaderData ? getService(loaderData.slug) : undefined;
    if (!service) {
      return { meta: [{ title: "Service Not Found — PainFix" }, { name: "robots", content: "noindex" }] };
    }
    const path = `/services/${params.slug}`;
    return {
      meta: pageMeta({ title: service.metaTitle, description: service.metaDescription, path }),
      links: canonical(path),
      scripts: [
        breadcrumbLd([
          { label: "Home", path: "/" },
          { label: "Services", path: "/services" },
          { label: service.title, path },
        ]),
        faqLd(service.faqs),
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MedicalTherapy",
            name: service.title,
            description: service.metaDescription,
            url: `${SITE_URL}${path}`,
            provider: { "@type": "MedicalClinic", name: "PainFix Physiotherapy Clinic" },
          }),
        },
      ],
    };
  },
  notFoundComponent: ServiceNotFound,
  component: ServiceDetail,
});

function ServiceNotFound() {
  return (
    <PageLayout>
      <section className="mx-auto max-w-3xl px-4 py-40 text-center">
        <h1 className="font-heading text-3xl font-extrabold text-foreground">Service not found</h1>
        <p className="mt-3 text-muted-foreground">This service page doesn't exist.</p>
        <Link to="/services" className="mt-6 inline-flex rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
          View all services
        </Link>
      </section>
    </PageLayout>
  );
}

function ServiceDetail() {
  const { slug } = Route.useLoaderData();
  const service = getService(slug) as Service;
  const Icon = service.icon;

  return (
    <PageLayout>
      <PageHero
        eyebrow="Physiotherapy Service"
        title={service.title}
        subtitle={service.tagline}
        icon={<Icon className="h-8 w-8" />}
        crumbs={[
          { label: "Home", path: "/" },
          { label: "Services", path: "/services" },
          { label: service.title, path: `/services/${service.slug}` },
        ]}
      />

      {/* Overview */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Reveal anim="up">
            <h2 className="font-heading text-2xl font-extrabold text-foreground sm:text-3xl">Overview</h2>
            <div className="mt-5 space-y-4">
              {service.overview.map((p) => (
                <p key={p} className="text-base leading-relaxed text-muted-foreground">{p}</p>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Conditions + Benefits */}
      <section className="bg-surface py-14 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <Reveal anim="left">
            <div className="rounded-[1.75rem] border border-border bg-card p-8 shadow-soft">
              <h2 className="flex items-center gap-2 font-heading text-xl font-bold text-foreground">
                <ClipboardList className="h-5 w-5 text-primary" /> {service.conditionsLabel ?? "Conditions Treated"}
              </h2>
              <ul className="mt-5 space-y-3">
                {service.conditionsTreated.map((c) => (
                  <li key={c} className="flex items-start gap-3 text-sm text-foreground">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary" /> {c}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal anim="right">
            <div className="rounded-[1.75rem] border border-border bg-card p-8 shadow-soft">
              <h2 className="flex items-center gap-2 font-heading text-xl font-bold text-foreground">
                <Sparkles className="h-5 w-5 text-primary" /> Benefits
              </h2>
              <ul className="mt-5 space-y-3">
                {service.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm text-foreground">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary" /> {b}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Treatment Process */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
            Treatment Process
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {service.process.map((step, i) => (
              <Reveal key={step.title} anim="up" delay={i * 70}>
                <div className="hover-lift h-full rounded-[1.75rem] border border-border bg-card p-6 shadow-soft">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 font-heading text-lg font-bold text-primary">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 font-heading font-bold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Evidence & Safety */}
      {((service.evidence && service.evidence.length > 0) ||
        (service.contraindications && service.contraindications.length > 0)) && (
        <section className="bg-surface py-14 sm:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            {service.evidence && service.evidence.length > 0 && (
              <Reveal anim="left">
                <div className="h-full rounded-[1.75rem] border border-border bg-card p-8 shadow-soft">
                  <h2 className="flex items-center gap-2 font-heading text-xl font-bold text-foreground">
                    <BookOpen className="h-5 w-5 text-primary" /> Evidence &amp; Our Approach
                  </h2>
                  <div className="mt-5 space-y-4">
                    {service.evidence.map((p) => (
                      <p key={p} className="text-sm leading-relaxed text-muted-foreground">{p}</p>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}
            {service.contraindications && service.contraindications.length > 0 && (
              <Reveal anim="right">
                <div className="h-full rounded-[1.75rem] border border-border bg-card p-8 shadow-soft">
                  <h2 className="flex items-center gap-2 font-heading text-xl font-bold text-foreground">
                    <ShieldAlert className="h-5 w-5 text-secondary" /> When to Avoid / Tell Us
                  </h2>
                  <ul className="mt-5 space-y-3">
                    {service.contraindications.map((c) => (
                      <li key={c} className="flex items-start gap-3 text-sm text-foreground">
                        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-secondary" /> {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            )}
          </div>
        </section>
      )}

      {/* Equipment */}
      {service.equipment && service.equipment.length > 0 && (
        <section className="bg-surface py-14 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="flex items-center justify-center gap-2 text-center font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
              <Wrench className="h-6 w-6 text-primary" /> Equipment Used
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {service.equipment.map((e) => (
                <span key={e} className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground shadow-soft">
                  {e}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
            Frequently Asked Questions
          </h2>
          <div className="mt-10">
            <FaqAccordion faqs={service.faqs} />
          </div>
        </div>
      </section>

      <PageCTA />
      <RelatedServices slugs={service.related} />
    </PageLayout>
  );
}
