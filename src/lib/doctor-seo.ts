import { pageMeta, canonical, breadcrumbLd } from "@/lib/seo";
import { SITE_URL, CLINIC_NAME, PHONE_TEL } from "@/components/site/constants";
import type { TeamMember } from "@/data/team";
import { isOnlineClinician } from "@/lib/clinician-service";

/**
 * Builds the full head() payload (meta, canonical, breadcrumb + Physician JSON-LD)
 * for a dedicated doctor profile page — optimized for doctor entity recognition
 * and local search ("Dr … PT Multan", "Physiotherapist in Multan").
 */
export function doctorProfileHead(doc: TeamMember) {
  const path = `/${doc.slug}`;
  const url = `${SITE_URL}${path}`;
  const onlineOnly = isOnlineClinician(doc);
  const city = doc.city || "Pakistan";
  const metaTitle =
    onlineOnly && !doc.profile.metaTitle.includes(city)
      ? `${doc.fullName} — Online Physiotherapy in ${city} | PainFix`
      : doc.profile.metaTitle;
  const metaDescription =
    onlineOnly && !doc.profile.metaDescription.includes(city)
      ? `Online physiotherapy consultation enquiries with ${doc.fullName}, based in ${city}.`
      : doc.profile.metaDescription;
  // Static imports are root-relative paths; admin-uploaded photos may be absolute URLs.
  const image = doc.photo
    ? /^https?:\/\//.test(doc.photo)
      ? doc.photo
      : `${SITE_URL}${doc.photo}`
    : undefined;

  return {
    meta: pageMeta({
      title: metaTitle,
      description: metaDescription,
      path,
      type: "article",
      image,
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
          "@type": onlineOnly ? "Person" : "Physician",
          name: doc.fullName,
          alternateName: doc.name,
          url,
          ...(image ? { image } : {}),
          jobTitle: doc.role,
          ...(!onlineOnly ? { medicalSpecialty: "Physiotherapy" } : {}),
          ...(doc.whatsapp || doc.phoneDisplay || !onlineOnly
            ? {
                telephone: doc.whatsapp
                  ? `+${doc.whatsapp}`
                  : doc.phoneDisplay || PHONE_TEL.replace("tel:", ""),
              }
            : {}),
          knowsAbout: doc.profile.expertise,
          worksFor: {
            "@type": "MedicalClinic",
            "@id": `${SITE_URL}/#clinic`,
            name: CLINIC_NAME,
            url: SITE_URL,
          },
          ...(onlineOnly
            ? {
                homeLocation: { "@type": "Place", name: doc.city || "Pakistan" },
                description: `Online-only physiotherapy consultations. Based in ${doc.city || "Pakistan"}; no physical clinic at this location.`,
              }
            : {
                areaServed: { "@type": "City", name: "Multan" },
                address: {
                  "@type": "PostalAddress",
                  streetAddress: "Usman Raja Market, Near Khair Ul Maarif School, Shalimar Colony",
                  addressLocality: "Multan",
                  addressRegion: "Punjab",
                  addressCountry: "PK",
                },
              }),
        }),
      },
    ],
  };
}
