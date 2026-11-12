import { useRouterState } from "@tanstack/react-router";
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
      <svg
        viewBox="0 0 448 512"
        className="h-7 w-7 fill-current"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32 101.5 32 1.9 131.5 1.9 253.9c0 39 10.2 77.1 29.6 110.7L0 480l118.2-31c32.5 17.7 69.1 27 105.6 27h.1c122.3 0 222-99.6 222-222 0-59.3-23.1-115.1-65-156.9zM223.9 438.7c-32.9 0-65.2-8.8-93.3-25.4l-6.7-4-70.1 18.4 18.7-68.4-4.4-7c-18.5-29.4-28.3-63.3-28.3-98.4 0-101.8 82.9-184.7 184.8-184.7 49.3 0 95.6 19.2 130.4 54.1 34.8 34.8 54 81.2 54 130.5-.1 101.9-83 184.9-184.8 184.9zm101.5-138.4c-5.6-2.8-33-16.3-38.1-18.1-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.4 18.1-17.7 21.8-3.2 3.7-6.5 4.2-12.1 1.4-33-16.5-54.7-29.5-76.5-66.9-5.8-10 5.8-9.3 16.5-30.9 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.2-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2s-9.7 1.4-14.8 6.9c-5.1 5.6-19.4 19-19.4 46.3s19.9 53.7 22.7 57.4c2.8 3.7 39.1 59.7 94.7 83.7 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 33-13.5 37.6-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.4-5-3.8-10.6-6.6z" />
      </svg>
    </a>
  );
}
