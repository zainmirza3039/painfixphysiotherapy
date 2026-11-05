import { Link, useRouterState } from "@tanstack/react-router";
import { House } from "lucide-react";
import { useI18n } from "@/i18n/LanguageProvider";

export function HomeVisitFab() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { t } = useI18n();

  if (pathname === "/home-visit" || pathname.startsWith("/admin") || pathname.startsWith("/auth")) {
    return null;
  }

  return (
    <Link
      to="/home-visit"
      aria-label={t.actions.bookHomeVisit}
      className="floating-cta-glow fixed bottom-[calc(env(safe-area-inset-bottom,0px)+4.5rem)] right-[calc(env(safe-area-inset-right,0px)+1.25rem)] z-[60] inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-[#00A859]/70 bg-[#032E61] px-3.5 text-xs font-semibold text-white shadow-card transition-colors duration-200 hover:bg-[#00A859] hover:text-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A859] focus-visible:ring-offset-2"
    >
      <House className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{t.actions.bookHomeVisit}</span>
    </Link>
  );
}
