import { Link, useRouterState } from "@tanstack/react-router";
import { House } from "lucide-react";
import { useI18n } from "@/i18n/LanguageProvider";

export function HomeVisitFab() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { t } = useI18n();

  if (
    pathname === "/book-appointment" ||
    pathname === "/home-visit" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth")
  ) {
    return null;
  }

  return (
    <Link
      to="/home-visit"
      aria-label={t.actions.bookHomeVisit}
      title={t.actions.bookHomeVisit}
      className="floating-cta-glow fixed bottom-[calc(env(safe-area-inset-bottom,0px)+5.5rem)] right-[calc(env(safe-area-inset-right,0px)+1.25rem)] z-[60] grid h-12 w-12 place-items-center rounded-full border-2 border-white/90 bg-[#032E61] text-white shadow-[0_10px_26px_rgba(3,46,97,0.28)] transition-[transform,background-color,box-shadow] duration-200 hover:scale-105 hover:bg-[#00A859] hover:shadow-[0_14px_30px_rgba(0,168,89,0.28)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A859] focus-visible:ring-offset-2"
    >
      <House className="h-5 w-5" strokeWidth={2.2} aria-hidden="true" />
      <span className="sr-only">{t.actions.bookHomeVisit}</span>
    </Link>
  );
}
