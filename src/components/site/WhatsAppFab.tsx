import { useRouterState } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { WHATSAPP_URL } from "./constants";

export function WhatsAppFab() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  if (pathname.startsWith("/admin") || pathname.startsWith("/auth")) return null;

  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="floating-cta-glow fab-safe-area fixed z-50 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-[#00A859] text-white shadow-soft motion-safe:transition-transform motion-safe:hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
