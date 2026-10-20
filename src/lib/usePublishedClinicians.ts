import { useQuery } from "@tanstack/react-query";
import { listPublicClinicians } from "@/lib/public-clinicians";
import type { PublicClinicianContent } from "@/lib/clinician-view";

export function usePublishedClinicians(initialProfiles?: PublicClinicianContent[]) {
  return useQuery({
    queryKey: ["public-clinician-profiles"],
    queryFn: () => listPublicClinicians(),
    initialData: initialProfiles,
    staleTime: 5 * 60_000,
  });
}
