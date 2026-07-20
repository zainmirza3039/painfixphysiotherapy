import { pageMeta, canonical, breadcrumbLd, faqLd } from "@/lib/seo";
import { SITE_URL, CLINIC_NAME } from "@/components/site/constants";
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
    meta: pageMeta({ title: page.metaTitle, description: page.metaDescription, path }),
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
          medicalSpecialty: "Physiotherapy",
          telephone: "+92-314-3039582",
          address: {
            "@type": "PostalAddress",
            streetAddress:
              "Usman Raja Market, Near Khair Ul Maarif School, Shalimar Colony",
            addressLocality: "Multan",
            addressRegion: "Punjab",
            addressCountry: "PK",
          },
          areaServed: {
            "@type": "City",
            name: "Multan",
          },
          founder: {
            "@type": "Person",
            name: "Dr. Zain Ul Abideen",
            jobTitle: "Doctor of Physical Therapy",
          },
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
            address: {
              "@type": "PostalAddress",
              streetAddress:
                "Usman Raja Market, Near Khair Ul Maarif School, Shalimar Colony",
              addressLocality: "Multan",
              addressRegion: "Punjab",
              addressCountry: "PK",
            },
            telephone: "+92-314-3039582",
          },
        }),
      },
