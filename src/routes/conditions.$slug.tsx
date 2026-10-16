import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  AlertCircle,
  Activity,
  ShieldAlert,
  Stethoscope,
  HeartPulse,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { getCondition, type Condition } from "@/data/conditions";
import { serviceMap } from "@/data/services";
import { conditionImageGallery } from "@/data/conditionImageGallery";
import { PageLayout } from "@/components/site/PageLayout";
import { PageHero } from "@/components/site/PageHero";
import { FaqAccordion } from "@/components/site/FaqAccordion";
import { PageCTA } from "@/components/site/PageCTA";
import { Reveal } from "@/components/site/Reveal";
import { pageMeta, canonical, breadcrumbLd, faqLd } from "@/lib/seo";

export const Route = createFileRoute("/conditions/$slug")({
  loader: ({ params }) => {
    const condition = getCondition(params.slug);
    if (!condition) throw notFound();
    return condition;
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Condition Not Found — PainFix" }, { name: "robots", content: "noindex" }],
      };
    }
    const path = `/conditions/${params.slug}`;
    return {
      meta: pageMeta({
        title: loaderData.metaTitle,
        description: loaderData.metaDescription,
        path,
      }),
      links: canonical(path),
      scripts: [
        breadcrumbLd([
          { label: "Home", path: "/" },
          { label: "Conditions", path: "/conditions" },
          { label: loaderData.title, path },
        ]),
        faqLd(loaderData.faqs),
      ],
    };
  },
  notFoundComponent: ConditionNotFound,
  component: ConditionDetail,
});

function ConditionNotFound() {
  return (
    <PageLayout>
      <section className="mx-auto max-w-3xl px-4 py-40 text-center">
        <h1 className="font-heading text-3xl font-extrabold text-foreground">
          Condition not found
        </h1>
        <p className="mt-3 text-muted-foreground">This condition page doesn't exist.</p>
        <Link
          to="/conditions"
          className="mt-6 inline-flex rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          View all conditions
        </Link>
      </section>
    </PageLayout>
  );
}

const blocks = [
  { key: "symptoms", title: "Common Symptoms", icon: AlertCircle },
  { key: "causes", title: "Causes", icon: Activity },
  { key: "riskFactors", title: "Risk Factors", icon: ShieldAlert },
  { key: "whenToSee", title: "When to See a Physiotherapist", icon: Stethoscope },
  { key: "howWeTreat", title: "How We Treat It", icon: HeartPulse },
] as const;

function ConditionDetail() {
  const c: Condition = Route.useLoaderData();
  const related = c.relatedServices.map((s) => serviceMap[s]).filter(Boolean);
  const visualReferences = conditionImageGallery[c.slug] ?? [];

  return (
    <PageLayout>
      <PageHero
        eyebrow="Condition We Treat"
        title={c.title}
        subtitle={c.intro[0]}
        crumbs={[
          { label: "Home", path: "/" },
          { label: "Conditions", path: "/conditions" },
          { label: c.title, path: `/conditions/${c.slug}` },
        ]}
      />

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Reveal anim="up">
            <h2 className="font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
              What is {c.title}?
            </h2>
            <div className="mt-5 space-y-4">
              {c.intro.map((p) => (
                <p key={p} className="text-base leading-relaxed text-muted-foreground">
                  {p}
                </p>
              ))}
            </div>
          </Reveal>

          {visualReferences.length > 0 && (
            <div className="mt-12" aria-labelledby="condition-visuals-heading">
              <h2
                id="condition-visuals-heading"
                className="font-heading text-2xl font-extrabold text-foreground sm:text-3xl"
              >
                Visual references for {c.title}
              </h2>
              <div
                className={`mt-6 grid gap-4 ${
                  visualReferences.length === 1
                    ? "max-w-xl sm:grid-cols-2"
                    : "sm:grid-cols-2 lg:grid-cols-3"
                }`}
              >
                {visualReferences.map((image) => (
                  <div
                    key={image.src}
                    className="overflow-hidden rounded-[1.25rem] border border-border bg-card shadow-soft"
                  >
                    <div className="aspect-[4/3] bg-surface">
                      <img
                        src={image.src}
                        alt={image.alt}
                        loading="lazy"
                        decoding="async"
                        width={image.width}
                        height={image.height}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {blocks.map((b, i) => (
              <Reveal key={b.key} anim="up" delay={(i % 2) * 70}>
                <div className="h-full rounded-[1.75rem] border border-border bg-card p-7 shadow-soft">
                  <h3 className="flex items-center gap-2 font-heading text-lg font-bold text-foreground">
                    <b.icon className="h-5 w-5 text-primary" /> {b.title}
                  </h3>
                  <ul className="mt-4 space-y-2.5">
                    {c[b.key].map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 text-sm text-muted-foreground"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal anim="up">
            <div className="mt-6 rounded-[1.75rem] border border-border bg-accent/50 p-7 shadow-soft">
              <h3 className="flex items-center gap-2 font-heading text-lg font-bold text-foreground">
                <TrendingUp className="h-5 w-5 text-primary" /> Expected Recovery
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.recovery}</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-surface py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
            Frequently Asked Questions
          </h2>
          <div className="mt-10">
            <FaqAccordion faqs={c.faqs} />
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
              How We Can Help
            </h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((service, i) => (
                <Reveal key={service.slug} anim="up" delay={i * 70}>
                  <Link
                    to="/services/$slug"
                    params={{ slug: service.slug }}
                    className="hover-lift group flex h-full flex-col rounded-[1.75rem] border border-border bg-card p-6 shadow-soft"
                  >
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary/12 text-secondary">
                      <service.icon className="h-6 w-6" />
                    </span>
                    <h3 className="mt-4 font-heading text-lg font-bold text-foreground">
                      {service.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {service.tagline}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                      Learn more{" "}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <PageCTA />
    </PageLayout>
  );
}
