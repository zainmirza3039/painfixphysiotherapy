import { createFileRoute, notFound } from "@tanstack/react-router";
import { getPublishedClinicianProfileBySlug } from "@/admin/clinicians.functions";
import {
  ClinicianProfileNotFound,
  PublishedClinicianProfile,
} from "@/components/site/PublishedClinicianProfile";
import { publishedClinicianHead } from "@/lib/clinician-seo";

export const Route = createFileRoute("/$slug")({
  loader: async ({ params }) => {
    const profile = await getPublishedClinicianProfileBySlug({ data: { slug: params.slug } });
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
