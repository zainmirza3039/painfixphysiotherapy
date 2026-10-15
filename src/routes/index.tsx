import { createFileRoute } from "@tanstack/react-router";
import heroAvif480 from "@/assets/hero-480.avif";
import heroAvif768 from "@/assets/hero-768.avif";
import heroAvif960 from "@/assets/hero-960.avif";
import { SITE_URL } from "@/components/site/constants";
import { faqLd } from "@/lib/seo";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { Stats } from "@/components/site/Stats";
import { WhyChooseUs } from "@/components/site/WhyChooseUs";
import { HomePhysio } from "@/components/site/HomePhysio";
import { SymptomNavigator } from "@/components/site/SymptomNavigator";
import { Services } from "@/components/site/Services";
import { Conditions } from "@/components/site/Conditions";
import { About } from "@/components/site/About";
import { MeetDoctors } from "@/components/site/MeetDoctors";
import { Process } from "@/components/site/Process";
import { PhysioFitness } from "@/components/site/PhysioFitness";
import { HomeBmi } from "@/components/site/HomeBmi";
import { ConsultationFees } from "@/components/site/ConsultationFees";
import { GoogleReviews } from "@/components/site/GoogleReviews";
import { TrustSignals } from "@/components/site/TrustSignals";
import { Gallery } from "@/components/site/Gallery";
import { FAQ, homeFaqs } from "@/components/site/FAQ";
import { Contact } from "@/components/site/Contact";
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
    links: [
      { rel: "canonical", href: `${SITE_URL}/` },
      {
        rel: "preload",
        as: "image",
        type: "image/avif",
        href: heroAvif480,
        imageSrcset: `${heroAvif480} 480w, ${heroAvif768} 768w, ${heroAvif960} 960w`,
        imageSizes: "(min-width: 1024px) 600px, (min-width: 640px) 448px, 90vw",
        fetchPriority: "high",
      },
    ],
    scripts: [faqLd(homeFaqs.map((f) => ({ q: f.q, a: f.a })))],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <TrustSignals />
        <SymptomNavigator />
        <Services />
        <MeetDoctors />
        <Process />
        <Conditions />
        <WhyChooseUs />
        <HomePhysio />
        <About />
        <PhysioFitness />
        <GoogleReviews />
        <Gallery />
        <FAQ />
        <HomeBmi />
        <ConsultationFees />
        <Contact />
      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
