import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/components/site/constants";
import { faqLd } from "@/lib/seo";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
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

const TITLE = "PainFix Physiotherapy Multan | Move Better, Recover Faster";
const DESCRIPTION =
  "Evidence-based physiotherapy in Multan. Personalized treatment for back pain, sports injuries, and lasting recovery. Book your appointment today.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: `${SITE_URL}/` },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/` }],
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
