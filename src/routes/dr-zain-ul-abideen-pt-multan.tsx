import { createFileRoute } from "@tanstack/react-router";
import { getTeamMemberBySlug } from "@/data/team";
import { getPublishedProfileBySlug } from "@/lib/profiles.functions";
import { mergeDoctor } from "@/lib/doctorProfile";
import { DoctorProfile } from "@/components/site/DoctorProfile";
import { doctorProfileHead } from "@/lib/doctor-seo";

const SLUG = "dr-zain-ul-abideen-pt-multan";
const base = getTeamMemberBySlug(SLUG)!;

export const Route = createFileRoute("/dr-zain-ul-abideen-pt-multan")({
  loader: async () => {
    try {
      return { profile: await getPublishedProfileBySlug({ data: { slug: SLUG } }) };
    } catch {
      // Gracefully fall back to static content on any read failure.
      return { profile: null };
    }
  },
  head: ({ loaderData }) => doctorProfileHead(mergeDoctor(base, loaderData?.profile)),
  component: DoctorPage,
  errorComponent: DoctorErrorFallback,
  notFoundComponent: DoctorNotFoundFallback,
});

function DoctorPage() {
  const { profile } = Route.useLoaderData();
  return <DoctorProfile doc={mergeDoctor(base, profile)} />;
}

function DoctorErrorFallback() {
  return <DoctorFallback />;
}

function DoctorNotFoundFallback() {
  return <DoctorFallback />;
}

// Even on loader error, show the static profile rather than an error screen.
function DoctorFallback() {
  return <DoctorProfile doc={base} />;
}
