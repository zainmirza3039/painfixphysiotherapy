import { createFileRoute } from "@tanstack/react-router";
import { getLocalPage } from "@/data/localPages";
import { LocalLandingPage } from "@/components/site/LocalLandingPage";
import { localPageHead } from "@/lib/local-seo";
import { listPublicClinicians } from "@/lib/public-clinicians";

const page = getLocalPage("physiotherapy-in-multan")!;

export const Route = createFileRoute("/physiotherapy-in-multan")({
  loader: () => listPublicClinicians(),
  head: () => localPageHead(page),
  component: PhysiotherapyInMultanPage,
});

function PhysiotherapyInMultanPage() {
  const profiles = Route.useLoaderData();
  return <LocalLandingPage page={page} initialProfiles={profiles} />;
}
