import { createFileRoute } from "@tanstack/react-router";
import { getTeamMemberBySlug } from "@/data/team";
import { DoctorProfile } from "@/components/site/DoctorProfile";
import { doctorProfileHead } from "@/lib/doctor-seo";

const doc = getTeamMemberBySlug("dr-zain-ul-abideen-pt-multan")!;

export const Route = createFileRoute("/dr-zain-ul-abideen-pt-multan")({
  head: () => doctorProfileHead(doc),
  component: () => <DoctorProfile doc={doc} />,
});
