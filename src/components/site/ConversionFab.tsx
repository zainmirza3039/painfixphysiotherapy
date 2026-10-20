import { MessageCircle, Phone } from "lucide-react";
import { WHATSAPP_CONSULT_URL, PHONE_TEL } from "./constants";
import type { TeamMember } from "@/data/team";
import { clinicianWhatsAppUrl, isOnlineClinician } from "@/lib/clinician-service";

/** Sticky floating conversion actions shown on every page. */
export function ConversionFab({ onlineClinician }: { onlineClinician?: TeamMember }) {
  const onlineOnly = onlineClinician && isOnlineClinician(onlineClinician);
  const whatsappUrl = onlineOnly ? clinicianWhatsAppUrl(onlineClinician) : WHATSAPP_CONSULT_URL;
  return (
    <div className="fab-safe-area fixed z-50 flex flex-col items-end gap-3">
      {!onlineOnly && (
        <a
          href={PHONE_TEL}
          aria-label="Call PainFix Physiotherapy Clinic"
          className="flex h-12 items-center gap-2 rounded-full bg-foreground px-4 text-background shadow-card motion-safe:transition-transform motion-safe:hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <Phone className="h-5 w-5" />
          <span className="hidden text-sm font-semibold sm:inline">Call</span>
        </a>
      )}
      {whatsappUrl && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={
            onlineOnly
              ? `Enquire about online physiotherapy with ${onlineClinician.name} on WhatsApp`
              : "Chat with us on WhatsApp"
          }
          className="relative grid h-14 w-14 place-items-center rounded-full bg-secondary text-secondary-foreground shadow-glow motion-safe:transition-transform motion-safe:hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="absolute inline-flex h-full w-full rounded-full bg-secondary/40 motion-safe:animate-ping" />
        </a>
      )}
    </div>
  );
}
