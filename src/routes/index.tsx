import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/components/site/constants";
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
import painfixSign960 from "@/assets/painfix-sign-960.webp";
import painfixSign1800 from "@/assets/painfix-sign-1800.webp";

const TITLE = "Physiotherapist in Multan | PainFix Physiotherapy Clinic";
const DESCRIPTION =
  "PainFix Physiotherapy Clinic in Multan: Physiotherapy near you for back pain, rehabilitation and home visits, with DPT-led assessment.";

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
        type: "image/webp",
        imageSrcSet: `${painfixSign960} 960w, ${painfixSign1800} 1800w`,
        imageSizes: "100vw",
        fetchPriority: "high",
      },
    ],
    scripts: [faqLd(homeFaqs.map((f) => ({ q: f.q, a: f.a })))],
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
