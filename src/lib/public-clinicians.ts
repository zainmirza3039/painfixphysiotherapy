import {
  getPublishedClinicianProfileBySlug,
  listPublishedClinicianProfiles,
} from "@/admin/clinicians.functions";
import { team, getTeamMemberBySlug } from "@/data/team";
import type { PublicClinicianContent } from "@/lib/clinician-view";
import { withPublicClinicianFallback } from "@/lib/clinician-public-fallback";

/** Presentation fallback only. Admin CRUD, search and sitemap keep their own error handling. */
export function listPublicClinicians(): Promise<PublicClinicianContent[]> {
  return withPublicClinicianFallback<PublicClinicianContent[]>(
    () => listPublishedClinicianProfiles(),
    () => team,
  );
}

export function getPublicClinicianBySlug(slug: string): Promise<PublicClinicianContent | null> {
  return withPublicClinicianFallback<PublicClinicianContent | null>(
    () => getPublishedClinicianProfileBySlug({ data: { slug } }),
    () => getTeamMemberBySlug(slug) ?? null,
  );
}
