import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/site/PageLayout";
import { PageHero } from "@/components/site/PageHero";
import { PageCTA } from "@/components/site/PageCTA";
import { GoogleReviews } from "@/components/site/GoogleReviews";
import { pageMeta, canonical, breadcrumbLd } from "@/lib/seo";

const PATH = "/success-stories";
const TITLE = "Patient Feedback on Google | PainFix Physiotherapy Multan";
const DESCRIPTION =
  "Read current public reviews and ratings for PainFix Physiotherapy Clinic on Google. Review content and ratings are hosted by Google and may change.";

export const Route = createFileRoute("/success-stories")({
  head: () => ({
    meta: pageMeta({ title: TITLE, description: DESCRIPTION, path: PATH }),
    links: canonical(PATH),
    scripts: [
      breadcrumbLd([
        { label: "Home", path: "/" },
        { label: "Patient feedback", path: PATH },
      ]),
    ],
  }),
  component: PatientFeedback,
});

function PatientFeedback() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Patient feedback"
        title="Read current Google reviews"
        subtitle="For current public reviews, ratings and clinic details, open PainFix's Google Business Profile. Google controls the content and numbers shown there."
        crumbs={[
          { label: "Home", path: "/" },
          { label: "Patient feedback", path: PATH },
        ]}
      />
      <GoogleReviews />
      <PageCTA />
    </PageLayout>
  );
}
