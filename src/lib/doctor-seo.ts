import { pageMeta, canonical, breadcrumbLd } from "@/lib/seo";
import { SITE_URL, CLINIC_NAME, PHONE_TEL } from "@/components/site/constants";
import type { TeamMember } from "@/data/team";
import { isOnlineClinician } from "@/lib/clinician-service";

/**
 * Builds the full head() payload (meta, canonical, breadcrumb + Person JSON-LD)
 * for a dedicated doctor profile page — optimized for doctor entity recognition
 * and local search ("Dr … PT Multan", "Physiotherapist in Multan").
 */
export function doctorProfileHead(doc: TeamMember) {
  const path = `/${doc.slug}`;
  const url = `${SITE_URL}${path}`;
  const onlineOnly = isOnlineClinician(doc);
  const city = doc.city || "Pakistan";
  const isZainProfile = doc.slug === "dr-zain-ul-abideen-pt-multan";
  const isJalalProfile = doc.slug === "dr-jalal-ud-din-pt-multan";
  const metaTitle = onlineOnly
    ? doc.slug === "dr-ariba-babar-pt"
      ? "Ariba Babar DPT | Online Physiotherapist in Rahim Yar Khan"
      : `${doc.fullName} — Online Physiotherapy in ${city} | PainFix`
    : isZainProfile
      ? `${doc.fullName} | Physiotherapist in Multan | PainFix`
      : isJalalProfile
        ? "Dr. Jalal Ud Din, DPT | Physiotherapist in Multan | PainFix"
        : doc.profile.metaTitle;
  const metaDescription = onlineOnly
    ? doc.slug === "dr-ariba-babar-pt"
      ? "Book an online video consultation with Ariba Babar, DPT, an online physiotherapist serving Rahim Yar Khan. Ask about availability and suitability via WhatsApp."
      : doc.profile.metaDescription.includes(city)
        ? doc.profile.metaDescription
        : `Online physiotherapy consultation enquiries with ${doc.fullName}, based in ${city}.`
    : isZainProfile
      ? `${doc.fullName} is a Doctor of Physical Therapy at PainFix in Multan. View professional qualifications, clinical focus and appointment details.`
      : isJalalProfile
        ? "Dr. Jalal Ud Din, DPT, is a clinical physiotherapist at PainFix in Multan, focusing on neurological and orthopaedic rehabilitation."
        : doc.profile.metaDescription;
  // Static imports are root-relative paths; admin-uploaded photos may be absolute URLs.
  const image = doc.photo
    ? /^https?:\\/\\//.test(doc.photo)
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
          "@type": "Person",
          name: doc.fullName,
          alternateName: doc.name,
          url,
          ...(image ? { image } : {}),
          jobTitle: doc.role,
          ...(doc.whatsapp || doc.phoneDisplay || !onlineOnly
            ? {
                telephone: doc.whatsapp
                  ? `+${doc.whatsapp}`
                  : doc.phoneDisplay || PHONE_TEL.replace("tel:", ""),
              }
            : {}),
          knowsAbout: doc.profile.expertise,
          ...(!onlineOnly
            ? {
                worksFor: {
                  "@type": "MedicalClinic",
                  "@id": `${SITE_URL}/#clinic`,
                  name: CLINIC_NAME,
                  url: SITE_URL,
                },
              }
            : {}),
          ...(onlineOnly
            ? {
                homeLocation: { "@type": "Place", name: doc.city || "Pakistan" },
                areaServed: { "@type": "City", name: doc.city || "Pakistan" },
                makesOffer: {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Online video physiotherapy consultation",
                    serviceType: "Online physiotherapy",
                    areaServed: { "@type": "City", name: doc.city || "Pakistan" },
                  },
                },
                description: `Online-only video physiotherapy consultations. Based in ${doc.city || "Pakistan"}; no physical clinic at this location.`,
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
