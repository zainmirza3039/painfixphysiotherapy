import type { TeamMember } from "@/data/team";

export function isOnlineClinician(doc: TeamMember): boolean {
  return doc.serviceMode === "online_only";
}

export function clinicianServiceLabel(doc: TeamMember): string {
  return isOnlineClinician(doc)
    ? `Online physiotherapy · ${doc.city || "Pakistan"}`
    : `Clinic-based physiotherapy · ${doc.city || "Multan"}`;
}

export function clinicianWhatsAppUrl(doc: TeamMember): string | null {
  if (!doc.whatsapp) return null;
  const message = isOnlineClinician(doc)
    ? `Hi, I'd like to enquire about an online physiotherapy consultation with ${doc.name} through PainFix. Please share availability and booking details.`
    : `Hi, I'd like a physiotherapy consultation with ${doc.name} at PainFix Physiotherapy Clinic.`;
  return `https://wa.me/${doc.whatsapp}?text=${encodeURIComponent(message)}`;
}
