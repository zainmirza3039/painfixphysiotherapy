import { Languages } from "lucide-react";
import { useI18n } from "@/i18n/LanguageProvider";

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, toggle } = useI18n();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={lang === "en" ? "اردو میں تبدیل کریں" : "Switch to English"}
      className={`inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-primary ${className}`}
    >
      <Languages className="h-4 w-4" />
      <span className={lang === "ur" ? "font-heading" : ""}>{lang === "en" ? "اردو" : "English"}</span>
    </button>
  );
}
