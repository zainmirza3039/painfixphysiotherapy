import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listPublishedClinicianProfiles } from "@/admin/clinicians.functions";
import type { PublicClinicianProfile } from "@/admin/clinician-profile.contract";

export function usePublishedClinicians(initialProfiles?: PublicClinicianProfile[]) {
  const listClinicians = useServerFn(listPublishedClinicianProfiles);
  return useQuery({
    queryKey: ["public-clinician-profiles"],
    queryFn: () => listClinicians(),
    initialData: initialProfiles,
    staleTime: 5 * 60_000,
  });
}
