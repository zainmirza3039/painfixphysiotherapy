import { useRouterState } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { WHATSAPP_URL } from "./constants";

export function WhatsAppFab() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  if (
    pathname === "/book-appointment" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth")
  ) {
    return null;
  }

  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with PainFix on WhatsApp"
      title="Chat on WhatsApp"
      className="floating-cta-glow fab-safe-area fixed z-50 grid h-14 w-14 place-items-center rounded-full border-2 border-white/90 bg-[#00A859] text-white shadow-[0_10px_28px_rgba(0,168,89,0.32)] transition-[transform,box-shadow] duration-200 hover:scale-105 hover:shadow-[0_14px_34px_rgba(0,168,89,0.4)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#032E61] focus-visible:ring-offset-2"
    >
      <MessageCircle className="h-6 w-6" strokeWidth={2.2} aria-hidden="true" />
    </a>
  );
}
