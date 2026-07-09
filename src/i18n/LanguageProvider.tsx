import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { translations, type Dict, type Lang } from "./translations";

type I18nContextValue = {
  lang: Lang;
  dir: "ltr" | "rtl";
  t: Dict;
  setLang: (lang: Lang) => void;
  toggle: () => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);
const STORAGE_KEY = "painfix-lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // Read saved preference after mount to avoid SSR hydration mismatch.
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "ur") setLangState(saved);
  }, []);

  const dir: "ltr" | "rtl" = lang === "ur" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    // Load the heavy Urdu webfont only when Urdu is actually selected.
    if (lang === "ur" && !document.getElementById("urdu-font")) {
      const link = document.createElement("link");
      link.id = "urdu-font";
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap";
      document.head.appendChild(link);
    }
  }, [lang, dir]);

  const setLang = (next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore storage errors */
    }
  };

  const toggle = () => setLang(lang === "en" ? "ur" : "en");

  return (
    <I18nContext.Provider value={{ lang, dir, t: translations[lang], setLang, toggle }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within a LanguageProvider");
  return ctx;
}
