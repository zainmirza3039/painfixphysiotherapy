import { createFileRoute, notFound } from "@tanstack/react-router";
import { getPublicClinicianBySlug } from "@/lib/public-clinicians";
import {
  ClinicianProfileNotFound,
  PublishedClinicianProfile,
} from "@/components/site/PublishedClinicianProfile";
import { publishedClinicianHead } from "@/lib/clinician-seo";

export const Route = createFileRoute("/$slug")({
  loader: async ({ params }) => {
    const profile = await getPublicClinicianBySlug(params.slug);
    if (!profile) throw notFound();
    return profile;
  },
  head: ({ loaderData }) => publishedClinicianHead(loaderData),
  notFoundComponent: ClinicianProfileNotFound,
  component: DynamicClinicianProfileRoute,
});

function DynamicClinicianProfileRoute() {
  const profile = Route.useLoaderData();
  return <PublishedClinicianProfile profile={profile} />;
}
