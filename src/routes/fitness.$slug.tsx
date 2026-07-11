import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getFitnessPage, type FitnessPage } from "@/data/fitness";
import { WellnessTopicPage } from "@/components/site/WellnessTopicPage";
import { PageLayout } from "@/components/site/PageLayout";
import { pageMeta, canonical, breadcrumbLd, faqLd } from "@/lib/seo";
import { SITE_URL } from "@/components/site/constants";

export const Route = createFileRoute("/fitness/$slug")({
  loader: ({ params }) => {
    const page = getFitnessPage(params.slug);
    if (!page) throw notFound();
    return { slug: page.slug };
  },
  head: ({ params, loaderData }) => {
    const page = loaderData ? getFitnessPage(loaderData.slug) : undefined;
    if (!page) {
      return { meta: [{ title: "Not found — PainFix" }, { name: "robots", content: "noindex" }] };
    }
    const path = `/fitness/${params.slug}`;
    return {
      meta: pageMeta({ title: page.metaTitle, description: page.metaDescription, path }),
      links: canonical(path),
      scripts: [
        breadcrumbLd([
          { label: "Home", path: "/" },
          { label: "Fitness", path: "/fitness" },
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
            serviceType: "Fitness & Rehabilitation",
            areaServed: "Multan, Pakistan",
            provider: { "@type": "MedicalClinic", name: "PainFix Physiotherapy Clinic" },
          }),
        },
      ],
    };
  },
  notFoundComponent: FitnessNotFound,
  component: FitnessDetail,
});

function FitnessNotFound() {
  return (
    <PageLayout>
      <section className="mx-auto max-w-3xl px-4 py-40 text-center">
        <h1 className="font-heading text-3xl font-extrabold text-foreground">Page not found</h1>
        <p className="mt-3 text-muted-foreground">This fitness page doesn't exist.</p>
        <Link
          to="/fitness"
          className="mt-6 inline-flex rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          Explore Fitness
        </Link>
      </section>
    </PageLayout>
  );
}

function FitnessDetail() {
  const { slug } = Route.useLoaderData();
  const page = getFitnessPage(slug) as FitnessPage;
  return (
    <WellnessTopicPage
      page={page}
      crumbs={[
        { label: "Home", path: "/" },
        { label: "Fitness", path: "/fitness" },
        { label: page.title, path: `/fitness/${page.slug}` },
      ]}
    />
  );
}
