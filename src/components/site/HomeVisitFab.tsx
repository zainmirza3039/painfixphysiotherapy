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
      className="home-visit-fab fixed bottom-[calc(env(safe-area-inset-bottom,0px)+1.25rem)] left-4 right-[5.25rem] z-[60] flex min-h-14 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-secondary/70 bg-[#032E61] px-4 text-sm font-semibold text-white shadow-card transition-colors duration-200 hover:bg-[#00A859] hover:text-[#091b2d] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A859] focus-visible:ring-offset-2 sm:left-auto"
    >
      <House className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span>{t.actions.bookHomeVisit}</span>
    </Link>
  );
}
