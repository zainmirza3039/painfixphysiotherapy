import { createFileRoute } from "@tanstack/react-router";
import { CLINIC_ADDRESS, CLINIC_NAME, GOOGLE_BUSINESS_PROFILE_URL, SITE_URL, SOCIAL_LINKS } from "@/components/site/constants";
import { faqLd } from "@/lib/seo";
import { listPublicClinicians } from "@/lib/public-clinicians";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { CityServices } from "@/components/site/CityServices";
import { MeetDoctors } from "@/components/site/MeetDoctors";
import { TrustSignals } from "@/components/site/TrustSignals";
import { Services } from "@/components/site/Services";
import { Conditions } from "@/components/site/Conditions";
import { WhyChooseUs } from "@/components/site/WhyChooseUs";
import { HomePhysio } from "@/components/site/HomePhysio";
import { PhysioFitness } from "@/components/site/PhysioFitness";
import { GoogleReviews } from "@/components/site/GoogleReviews";
import { HomeBmi } from "@/components/site/HomeBmi";
import { ConsultationFees } from "@/components/site/ConsultationFees";
import { FAQ } from "@/components/site/FAQ";
import { homeFaqs } from "@/components/site/home-faqs";
import { CTA } from "@/components/site/CTA";
import { Footer } from "@/components/site/Footer";
import heroAvif480 from "@/assets/hero-480.avif";
import heroAvif768 from "@/assets/hero-768.avif";
import heroAvif960 from "@/assets/hero-960.avif";

const TITLE = "Physiotherapist in Multan | PainFix Physiotherapy Clinic";
const DESCRIPTION =
  "Looking for a physiotherapist in Multan? PainFix offers DPT-led assessment, hands-on treatment and rehabilitation at our Shalimar Colony clinic, with selected home visits.";

export const Route = createFileRoute("/")({
  loader: () => listPublicClinicians(),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PainFix Physiotherapy Clinic" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: `${SITE_URL}/` },
      { property: "og:image", content: `${SITE_URL}/painfix-logo.png` },
      { property: "og:image:alt", content: "PainFix Physiotherapy Clinic logo" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: `${SITE_URL}/painfix-logo.png` },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/` },
      {
        rel: "preload",
        as: "image",
        type: "image/avif",
        imageSrcSet: `${heroAvif480} 480w, ${heroAvif768} 768w, ${heroAvif960} 960w`,
        imageSizes:
          "(min-width: 1280px) 552px, (min-width: 1024px) 42vw, (min-width: 640px) 80vw, 100vw",
        fetchPriority: "high",
      },
    ],
    scripts: [
      faqLd(homeFaqs.map((f) => ({ q: f.q, a: f.a }))),
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
          areaServed: { "@type": "City", name: "Multan" },
          employee: [
            { "@id": SITE_URL + "/dr-zain-ul-abideen-pt-multan#person" },
            { "@id": SITE_URL + "/dr-jalal-ud-din-pt-multan#person" },
            { "@id": SITE_URL + "/dr-fatima-iqbal-dpt-multan#person" },
          ],
          sameAs: Object.values(SOCIAL_LINKS).map((profile) => profile.url),
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  const profiles = Route.useLoaderData();
  return (
    <div className="painfix-home min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Conditions />
        <CityServices />
        <MeetDoctors initialProfiles={profiles} />
        <HomePhysio />
        <WhyChooseUs />
        <GoogleReviews />
        <TrustSignals />
        <PhysioFitness />
        <HomeBmi />
        <ConsultationFees />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
