import type { PublicClinicianProfile } from "@/admin/clinician-profile.contract";
import { toClinicianView } from "@/lib/clinician-view";
import { doctorProfileHead } from "@/lib/doctor-seo";

export function publishedClinicianHead(profile?: PublicClinicianProfile) {
  if (profile) return doctorProfileHead(toClinicianView(profile));
  return {
    meta: [
      { title: "Clinician Profile Not Found — PainFix" },
      { name: "robots", content: "noindex" },
    ],
  };
}
