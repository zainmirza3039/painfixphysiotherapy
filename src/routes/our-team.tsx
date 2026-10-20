import { createFileRoute } from "@tanstack/react-router";
import { MeetDoctors } from "@/components/site/MeetDoctors";
import { PageCTA } from "@/components/site/PageCTA";
import { PageHero } from "@/components/site/PageHero";
import { PageLayout } from "@/components/site/PageLayout";
import { breadcrumbLd, canonical, pageMeta } from "@/lib/seo";
import { listPublicClinicians } from "@/lib/public-clinicians";

const TITLE = "Our Physiotherapy Team in Multan | PainFix";
const DESCRIPTION =
  "Meet the physiotherapists and Doctors of Physical Therapy at PainFix Physiotherapy Clinic in Multan.";

export const Route = createFileRoute("/our-team")({
  loader: () => listPublicClinicians(),
  head: () => ({
    meta: pageMeta({ title: TITLE, description: DESCRIPTION, path: "/our-team" }),
    links: canonical("/our-team"),
    scripts: [
      breadcrumbLd([
        { label: "Home", path: "/" },
        { label: "Our Team", path: "/our-team" },
      ]),
    ],
  }),
  component: OurTeamPage,
});

function OurTeamPage() {
  const profiles = Route.useLoaderData();
  return (
    <PageLayout>
      <PageHero
        eyebrow="The clinicians"
        title="Meet the people behind your care."
        subtitle="Get to know the PainFix clinicians and view each physiotherapist’s profile, experience and areas of practice."
        crumbs={[
          { label: "Home", path: "/" },
          { label: "Our Team", path: "/our-team" },
        ]}
      />
      <MeetDoctors initialProfiles={profiles} />
      <PageCTA title="Talk with the PainFix team." />
    </PageLayout>
  );
}
