import { createFileRoute, notFound } from "@tanstack/react-router";
import { getPublicClinicianBySlug } from "@/lib/public-clinicians";
import {
  ClinicianProfileNotFound,
  PublishedClinicianProfile,
} from "@/components/site/PublishedClinicianProfile";
import { publishedClinicianHead } from "@/lib/clinician-seo";

const SLUG = "dr-jalal-ud-din-pt-multan";

export const Route = createFileRoute("/dr-jalal-ud-din-pt-multan")({
  loader: async () => {
    const profile = await getPublicClinicianBySlug(SLUG);
    if (!profile) throw notFound();
    return profile;
  },
  head: ({ loaderData }) => publishedClinicianHead(loaderData),
  notFoundComponent: ClinicianProfileNotFound,
  component: JalalClinicianProfileRoute,
});

function JalalClinicianProfileRoute() {
  const profile = Route.useLoaderData();
  return <PublishedClinicianProfile profile={profile} />;
}
