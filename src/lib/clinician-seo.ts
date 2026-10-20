import type { PublicClinicianContent } from "@/lib/clinician-view";
import { toClinicianView } from "@/lib/clinician-view";
import { doctorProfileHead } from "@/lib/doctor-seo";

export function publishedClinicianHead(profile?: PublicClinicianContent) {
  if (profile) return doctorProfileHead(toClinicianView(profile));
  return {
    meta: [
      { title: "Clinician Profile Not Found — PainFix" },
      { name: "robots", content: "noindex" },
    ],
  };
}
