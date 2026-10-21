import { createFileRoute } from "@tanstack/react-router";
import { RykOnlineLandingPage, rykOnlineFaqs } from "@/components/site/RykOnlineLandingPage";
import { SITE_URL } from "@/components/site/constants";
import { breadcrumbLd, canonical, faqLd, pageMeta } from "@/lib/seo";

const PATH = "/physiotherapy-in-rahim-yar-khan";
const TITLE = "Online Physiotherapy in Rahim Yar Khan | PainFix";
const DESCRIPTION =
  "Enquire about online video physiotherapy in Rahim Yar Khan with Ariba Babar, DPT. Suitability and availability are confirmed before booking; no physical RYK clinic or home visits are offered.";

export const Route = createFileRoute("/physiotherapy-in-rahim-yar-khan")({
  head: () => ({
    meta: pageMeta({ title: TITLE, description: DESCRIPTION, path: PATH }),
    links: canonical(PATH),
    scripts: [
      breadcrumbLd([
        { label: "Home", path: "/" },
        { label: "Rahim Yar Khan online physiotherapy", path: PATH },
      ]),
      faqLd(rykOnlineFaqs),
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "MedicalWebPage",
          name: TITLE,
          description: DESCRIPTION,
          url: `${SITE_URL}${PATH}`,
          about: {
            "@type": "MedicalTherapy",
            name: "Online physiotherapy consultation",
            areaServed: { "@type": "City", name: "Rahim Yar Khan" },
            provider: {
              "@type": "Person",
              name: "Ariba Babar, DPT",
              url: `${SITE_URL}/ariba-babar`,
            },
          },
        }),
      },
    ],
  }),
  component: RykOnlineLandingPage,
});
