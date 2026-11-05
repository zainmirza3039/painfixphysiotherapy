import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/components/site/constants";
import { faqLd } from "@/lib/seo";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { CityServices } from "@/components/site/CityServices";
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
import { WhatsAppFab } from "@/components/site/WhatsAppFab";
import heroAvif480 from "@/assets/hero-480.avif";
import heroAvif768 from "@/assets/hero-768.avif";
import heroAvif960 from "@/assets/hero-960.avif";

const TITLE = "Physiotherapist in Multan | PainFix Physiotherapy Clinic";
const DESCRIPTION =
  "Need a physiotherapist in Multan? PainFix provides personalised assessment, hands-on treatment and rehabilitation at its Shalimar Colony clinic, with selected home visits. Care is planned around your condition and recovery goals.";

export const Route = createFileRoute("/")({
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
    scripts: [faqLd(homeFaqs.map((f) => ({ q: f.q, a: f.a })))],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="painfix-home min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <CityServices />
        <Services />
        <Conditions />
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
      <WhatsAppFab />
    </div>
  );
}
