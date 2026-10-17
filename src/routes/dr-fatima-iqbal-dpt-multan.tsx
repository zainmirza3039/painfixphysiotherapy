import { createFileRoute, notFound } from "@tanstack/react-router";
import { getPublishedClinicianProfileBySlug } from "@/admin/clinicians.functions";
import {
  ClinicianProfileNotFound,
  PublishedClinicianProfile,
} from "@/components/site/PublishedClinicianProfile";
import { publishedClinicianHead } from "@/lib/clinician-seo";

const SLUG = "dr-fatima-iqbal-dpt-multan";

export const Route = createFileRoute("/dr-fatima-iqbal-dpt-multan")({
  loader: async () => {
    const profile = await getPublishedClinicianProfileBySlug({ data: { slug: SLUG } });
    if (!profile) throw notFound();
    return profile;
  },
  head: ({ loaderData }) => publishedClinicianHead(loaderData),
  notFoundComponent: ClinicianProfileNotFound,
  component: FatimaClinicianProfileRoute,
});

function FatimaClinicianProfileRoute() {
  const profile = Route.useLoaderData();
  return <PublishedClinicianProfile profile={profile} />;
}
