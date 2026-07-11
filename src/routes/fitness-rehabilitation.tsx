import { createFileRoute } from "@tanstack/react-router";
import { fitnessPage } from "@/data/wellness";
import { WellnessTopicPage } from "@/components/site/WellnessTopicPage";
import { pageMeta, canonical, breadcrumbLd, faqLd } from "@/lib/seo";
import { SITE_URL } from "@/components/site/constants";

const PATH = "/fitness-rehabilitation";

export const Route = createFileRoute("/fitness-rehabilitation")({
  head: () => ({
    meta: pageMeta({
      title: fitnessPage.metaTitle,
      description: fitnessPage.metaDescription,
      path: PATH,
    }),
    links: canonical(PATH),
    scripts: [
      breadcrumbLd([
        { label: "Home", path: "/" },
        { label: fitnessPage.title, path: PATH },
      ]),
      faqLd(fitnessPage.faqs),
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: fitnessPage.title,
          description: fitnessPage.metaDescription,
          url: `${SITE_URL}${PATH}`,
          serviceType: "Fitness & Rehabilitation",
          areaServed: "Multan, Pakistan",
          provider: { "@type": "MedicalClinic", name: "PainFix Physiotherapy Clinic" },
        }),
      },
    ],
  }),
  component: FitnessPage,
});

function FitnessPage() {
  return (
    <WellnessTopicPage
      page={fitnessPage}
      crumbs={[
        { label: "Home", path: "/" },
        { label: fitnessPage.title, path: PATH },
      ]}
    />
  );
}
