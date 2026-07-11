import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getDietSubPage, DIET_NUTRITION_ENABLED } from "@/data/wellness";
import { WellnessTopicPage } from "@/components/site/WellnessTopicPage";
import { PageLayout } from "@/components/site/PageLayout";
import { pageMeta, canonical, breadcrumbLd, faqLd } from "@/lib/seo";
import { SITE_URL } from "@/components/site/constants";

export const Route = createFileRoute("/diet-nutrition/$slug")({
  loader: ({ params }) => {
    const page = getDietSubPage(params.slug);
    if (!page) throw notFound();
    return { slug: page.slug };
  },
  head: ({ params, loaderData }) => {
    const page = loaderData ? getDietSubPage(loaderData.slug) : undefined;
    if (!page) {
      return { meta: [{ title: "Not found — PainFix" }, { name: "robots", content: "noindex" }] };
    }
    const path = `/diet-nutrition/${params.slug}`;
    // Hidden until a qualified dietitian officially joins.
    if (!DIET_NUTRITION_ENABLED) {
      return {
        meta: [
          { title: page.metaTitle },
          { name: "description", content: page.metaDescription },
          { name: "robots", content: "noindex, nofollow" },
        ],
      };
    }
    return {
      meta: pageMeta({ title: page.metaTitle, description: page.metaDescription, path }),
      links: canonical(path),
      scripts: [
        breadcrumbLd([
          { label: "Home", path: "/" },
          { label: "Diet & Nutrition", path: "/diet-nutrition" },
          { label: page.title, path },
        ]),
        faqLd(page.faqs),
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: page.title,
            description: page.metaDescription,
            url: `${SITE_URL}${path}`,
            serviceType: "Diet & Nutrition",
            areaServed: "Multan, Pakistan",
            provider: { "@type": "MedicalClinic", name: "PainFix Physiotherapy Clinic" },
          }),
        },
      ],
    };
  },
  notFoundComponent: DietSubNotFound,
  component: DietSubPage,
});

function DietSubNotFound() {
  return (
    <PageLayout>
      <section className="mx-auto max-w-3xl px-4 py-40 text-center">
        <h1 className="font-heading text-3xl font-extrabold text-foreground">Page not found</h1>
        <p className="mt-3 text-muted-foreground">This page doesn&apos;t exist.</p>
        <Link
          to="/diet-nutrition"
          className="mt-6 inline-flex rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          View Diet &amp; Nutrition
        </Link>
      </section>
    </PageLayout>
  );
}

function DietSubPage() {
  const { slug } = Route.useLoaderData();
  const page = getDietSubPage(slug)!;
  return (
    <WellnessTopicPage
      page={page}
      comingSoon={!DIET_NUTRITION_ENABLED}
      crumbs={[
        { label: "Home", path: "/" },
        { label: "Diet & Nutrition", path: "/diet-nutrition" },
        { label: page.title, path: `/diet-nutrition/${page.slug}` },
      ]}
    />
  );
}
