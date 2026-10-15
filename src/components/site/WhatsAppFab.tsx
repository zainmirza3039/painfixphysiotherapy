import { MessageCircle } from "lucide-react";
import { WHATSAPP_URL } from "./constants";

export function WhatsAppFab() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-secondary text-secondary-foreground shadow-soft transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
