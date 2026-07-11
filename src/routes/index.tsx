import { createFileRoute } from "@tanstack/react-router";
import heroImg from "@/assets/hero.webp";
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
      { rel: "preload", as: "image", href: heroImg, fetchPriority: "high" },
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
        <HomeBmi />
        <Stats />
        <TrustSignals />
        <WhyChooseUs />
        <SymptomNavigator />
        <Services />
        <Conditions />
        <HomePhysio />
        <About />
        <MeetDoctors />
        <Process />
        <PhysioFitness />
        <GoogleReviews />
        <Gallery />
        <FAQ />
        <ConsultationFees />
        <Contact />
      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
