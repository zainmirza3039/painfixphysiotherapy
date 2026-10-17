import { createFileRoute, notFound } from "@tanstack/react-router";
import { getPublishedClinicianProfileBySlug } from "@/admin/clinicians.functions";
import {
  ClinicianProfileNotFound,
  PublishedClinicianProfile,
} from "@/components/site/PublishedClinicianProfile";
import { publishedClinicianHead } from "@/lib/clinician-seo";

const SLUG = "dr-zain-ul-abideen-pt-multan";

export const Route = createFileRoute("/dr-zain-ul-abideen-pt-multan")({
  loader: async () => {
    const profile = await getPublishedClinicianProfileBySlug({ data: { slug: SLUG } });
    if (!profile) throw notFound();
    return profile;
  },
  head: ({ loaderData }) => publishedClinicianHead(loaderData),
  notFoundComponent: ClinicianProfileNotFound,
  component: ZainClinicianProfileRoute,
});

function ZainClinicianProfileRoute() {
  const profile = Route.useLoaderData();
  return <PublishedClinicianProfile profile={profile} />;
}
