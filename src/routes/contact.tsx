import { createFileRoute } from "@tanstack/react-router";
import { Contact } from "@/components/site/Contact";
import { PageHero } from "@/components/site/PageHero";
import { PageLayout } from "@/components/site/PageLayout";
import { breadcrumbLd, canonical, pageMeta } from "@/lib/seo";
import { serviceImages } from "@/data/serviceImages";

const TITLE = "Contact PainFix Physiotherapy Clinic in Multan";
const DESCRIPTION =
  "Find PainFix Physiotherapy Clinic in Shalimar Colony, Multan. View clinic hours, get directions, call or send the team an enquiry.";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: pageMeta({ title: TITLE, description: DESCRIPTION, path: "/contact" }),
    links: canonical("/contact"),
    scripts: [
      breadcrumbLd([
        { label: "Home", path: "/" },
        { label: "Contact", path: "/contact" },
      ]),
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Visit or get in touch"
        title="Contact PainFix Physiotherapy Clinic, Multan."
        image={serviceImages["home-physiotherapy"]}
        imageAlt="Physiotherapist providing patient-centred care during a treatment session"
        subtitle="Find the clinic, call or message the team, or send an enquiry using the existing contact form."
        crumbs={[
          { label: "Home", path: "/" },
          { label: "Contact", path: "/contact" },
        ]}
      />
      <Contact />
    </PageLayout>
  );
}
