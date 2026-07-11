import { createFileRoute } from "@tanstack/react-router";
import { dietMainPage, dietSubPages, DIET_NUTRITION_ENABLED } from "@/data/wellness";
import { WellnessTopicPage } from "@/components/site/WellnessTopicPage";
import { pageMeta, canonical, breadcrumbLd, faqLd } from "@/lib/seo";
import { SITE_URL } from "@/components/site/constants";

const PATH = "/diet-nutrition";

export const Route = createFileRoute("/diet-nutrition/")({
  head: () => {
    // Hidden until a qualified dietitian officially joins: keep it out of the index.
    if (!DIET_NUTRITION_ENABLED) {
      return {
        meta: [
          { title: dietMainPage.metaTitle },
          { name: "description", content: dietMainPage.metaDescription },
          { name: "robots", content: "noindex, nofollow" },
        ],
      };
    }
    return {
      meta: pageMeta({
        title: dietMainPage.metaTitle,
        description: dietMainPage.metaDescription,
        path: PATH,
      }),
      links: canonical(PATH),
      scripts: [
        breadcrumbLd([
          { label: "Home", path: "/" },
          { label: dietMainPage.title, path: PATH },
        ]),
        faqLd(dietMainPage.faqs),
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: dietMainPage.title,
            description: dietMainPage.metaDescription,
            url: `${SITE_URL}${PATH}`,
            serviceType: "Diet & Nutrition",
            areaServed: "Multan, Pakistan",
            provider: { "@type": "MedicalClinic", name: "PainFix Physiotherapy Clinic" },
          }),
        },
      ],
    };
  },
  component: DietIndex,
});

function DietIndex() {
  return (
    <WellnessTopicPage
      page={dietMainPage}
      comingSoon={!DIET_NUTRITION_ENABLED}
      crumbs={[
        { label: "Home", path: "/" },
        { label: dietMainPage.title, path: PATH },
      ]}
    />
  );
}

// Referenced so tree-shaking keeps the sub-page data warm alongside the section.
export const _dietSubPageCount = dietSubPages.length;
