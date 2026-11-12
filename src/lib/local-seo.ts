import { pageMeta, canonical, breadcrumbLd, faqLd } from "@/lib/seo";
import {
  SITE_URL,
  CLINIC_NAME,
  CLINIC_ADDRESS,
  GOOGLE_BUSINESS_PROFILE_URL,
  SOCIAL_LINKS,
} from "@/components/site/constants";
import type { LocalPage } from "@/data/localPages";

/**
 * Builds the full head() payload (meta, canonical, breadcrumb + FAQ + MedicalClinic
 * JSON-LD) for a local-SEO pillar landing page. Keeps every route file DRY while
 * reinforcing the clinic as a single local entity (references the root @id).
 */
export function localPageHead(page: LocalPage) {
  const path = `/${page.slug}`;
  const url = `${SITE_URL}${path}`;

  return {
    meta: pageMeta({
      title: page.metaTitle,
      description: page.metaDescription,
      path,
      image: `${SITE_URL}/painfix-logo.png`,
    }),
    links: canonical(path),
    scripts: [
      breadcrumbLd([
        { label: "Home", path: "/" },
        { label: page.title, path },
      ]),
      faqLd(page.faqs),
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "MedicalClinic",
          "@id": SITE_URL + "/#clinic",
          name: CLINIC_NAME,
          url: SITE_URL,
          image: `${SITE_URL}/painfix-logo.png`,
          logo: `${SITE_URL}/painfix-logo.png`,
          medicalSpecialty: "Physiotherapy",
          telephone: "+92-314-3039582",
          address: {
            "@type": "PostalAddress",
            streetAddress: CLINIC_ADDRESS,
            addressLocality: "Multan",
            addressRegion: "Punjab",
            addressCountry: "PK",
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: 30.239469,
            longitude: 71.4856386,
          },
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
              opens: "11:00",
              closes: "16:00",
            },
          ],
          hasMap: GOOGLE_BUSINESS_PROFILE_URL,
          areaServed: {
            "@type": "City",
            name: "Multan",
          },
          employee: [
            { "@id": SITE_URL + "/dr-zain-ul-abideen-pt-multan#person" },
            { "@id": SITE_URL + "/dr-jalal-ud-din-pt-multan#person" },
            { "@id": SITE_URL + "/dr-fatima-iqbal-dpt-multan#person" },
          ],
          sameAs: Object.values(SOCIAL_LINKS).map((profile) => profile.url),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "MedicalWebPage",
          name: page.metaTitle,
          description: page.metaDescription,
          url,
          about: {
            "@type": "MedicalClinic",
            "@id": SITE_URL + "/#clinic",
            name: CLINIC_NAME,
            url: SITE_URL,
            medicalSpecialty: "Physiotherapy",
            areaServed: {
              "@type": "City",
              name: "Multan",
            },
            image: `${SITE_URL}/painfix-logo.png`,
            address: {
              "@type": "PostalAddress",
              streetAddress: CLINIC_ADDRESS,
              addressLocality: "Multan",
              addressRegion: "Punjab",
              addressCountry: "PK",
            },
            telephone: "+92-314-3039582",
          },
        }),
      },
    ],
  };
}
