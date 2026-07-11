import { pageMeta, canonical, breadcrumbLd } from "@/lib/seo";
import { SITE_URL, CLINIC_NAME, PHONE_TEL } from "@/components/site/constants";
import type { TeamMember } from "@/data/team";

/**
 * Builds the full head() payload (meta, canonical, breadcrumb + Physician JSON-LD)
 * for a dedicated doctor profile page — optimized for doctor entity recognition
 * and local search ("Dr … PT Multan", "Physiotherapist in Multan").
 */
export function doctorProfileHead(doc: TeamMember) {
  const path = `/${doc.slug}`;
  const url = `${SITE_URL}${path}`;

  return {
    meta: pageMeta({
      title: doc.profile.metaTitle,
      description: doc.profile.metaDescription,
      path,
      type: "article",
      image: `${SITE_URL}${doc.photo}`,
    }),
    links: canonical(path),
    scripts: [
      breadcrumbLd([
        { label: "Home", path: "/" },
        { label: doc.fullName, path },
      ]),
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Physician",
          name: doc.fullName,
          alternateName: doc.name,
          url,
          image: `${SITE_URL}${doc.photo}`,
          jobTitle: doc.role,
          medicalSpecialty: "Physiotherapy",
          telephone: PHONE_TEL.replace("tel:", ""),
          knowsAbout: doc.profile.expertise,
          worksFor: {
            "@type": "MedicalClinic",
            "@id": `${SITE_URL}/#clinic`,
            name: CLINIC_NAME,
            url: SITE_URL,
          },
          areaServed: { "@type": "City", name: "Multan" },
          address: {
            "@type": "PostalAddress",
            streetAddress: "Usman Raja Market, Near Khair Ul Maarif School, Shalimar Colony",
            addressLocality: "Multan",
            addressRegion: "Punjab",
            addressCountry: "PK",
          },
        }),
      },
    ],
  };
}
