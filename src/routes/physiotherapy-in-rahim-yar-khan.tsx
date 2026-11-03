import { createFileRoute } from "@tanstack/react-router";
import { RykOnlineLandingPage, rykOnlineFaqs } from "@/components/site/RykOnlineLandingPage";
import { SITE_URL } from "@/components/site/constants";
import { breadcrumbLd, canonical, faqLd, pageMeta } from "@/lib/seo";

const PATH = "/physiotherapy-in-rahim-yar-khan";
const TITLE = "Online Video Physiotherapy in Rahim Yar Khan | PainFix";
const DESCRIPTION =
  "Online physiotherapy in Rahim Yar Khan from PainFix. Discuss suitability, exercise guidance and rehabilitation planning before booking. Online care only.";

export const Route = createFileRoute("/physiotherapy-in-rahim-yar-khan")({
  head: () => ({
    meta: [
      ...pageMeta({
        title: TITLE,
        description: DESCRIPTION,
        path: PATH,
        image: `${SITE_URL}/painfix-logo.png`,
      }),
      {
        name: "keywords",
        content:
          "online physiotherapy Rahim Yar Khan, video physiotherapy, physiotherapist Rahim Yar Khan, online rehabilitation, exercise guidance",
      },
    ],
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
            areaServed: {
              "@type": "City",
              name: "Rahim Yar Khan",
              containedInPlace: { "@type": "AdministrativeArea", name: "Punjab" },
            },
            provider: {
              "@type": "Person",
              name: "Ariba Babar, DPT",
              url: `${SITE_URL}/ariba-babar`,
            },
          },
          mainEntity: {
            "@type": "Service",
            name: "Online video physiotherapy for Rahim Yar Khan",
            serviceType: "Online physiotherapy",
            areaServed: { "@type": "City", name: "Rahim Yar Khan" },
            provider: { "@type": "Organization", name: "PainFix Physiotherapy Clinic" },
            availableChannel: {
              "@type": "ServiceChannel",
              serviceUrl: `${SITE_URL}/book-appointment?city=rahim-yar-khan&service=online`,
              serviceType: "Online video consultation",
            },
          },
        }),
      },
    ],
  }),
  component: RykOnlineLandingPage,
});
