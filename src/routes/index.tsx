import { createFileRoute } from "@tanstack/react-router";
import heroImg from "@/assets/hero.webp";
import { SITE_URL } from "@/components/site/constants";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { Stats } from "@/components/site/Stats";
import { WhyChooseUs } from "@/components/site/WhyChooseUs";
import { HomePhysio } from "@/components/site/HomePhysio";
import { Services } from "@/components/site/Services";
import { Conditions } from "@/components/site/Conditions";
import { About } from "@/components/site/About";
import { MeetDoctors } from "@/components/site/MeetDoctors";
import { Process } from "@/components/site/Process";
import { GoogleReviews } from "@/components/site/GoogleReviews";
import { TrustSignals } from "@/components/site/TrustSignals";
import { Gallery } from "@/components/site/Gallery";
import { FAQ } from "@/components/site/FAQ";
import { CTA } from "@/components/site/CTA";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFab } from "@/components/site/WhatsAppFab";

const TITLE = "PainFix Physiotherapy Clinic — Multan | Move Better, Recover Faster";
const DESCRIPTION =
  "Evidence-based physiotherapy and rehabilitation in Multan, Pakistan. Personalized treatment plans for back pain, sports injuries, and lasting recovery. Book your appointment today.";

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
        <WhyChooseUs />
        <Services />
        <Conditions />
        <HomePhysio />
        <About />
        <MeetDoctors />
        <Process />
        <GoogleReviews />
        <Gallery />
        <FAQ />
        <CTA />
        <Contact />
      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
