import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listPublishedClinicianProfiles } from "@/admin/clinicians.functions";

export function usePublishedClinicians() {
  const listClinicians = useServerFn(listPublishedClinicianProfiles);
  return useQuery({
    queryKey: ["public-clinician-profiles"],
    queryFn: () => listClinicians(),
    staleTime: 5 * 60_000,
  });
}
