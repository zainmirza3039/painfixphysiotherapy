import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";

export type Theme = "light" | "dark";

/** Public-site theme key. Kept separate from the admin key ("painfix-admin-theme"). */
const STORAGE_KEY = "painfix-theme";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStored(): Theme | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "dark" || v === "light" ? v : null;
  } catch {
    return null;
  }
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = readStored();
  if (stored) return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Website-wide dark mode for the public site.
 * - Persists an explicit choice in localStorage ("painfix-theme").
 * - Falls back to the OS preference when no choice has been made.
 * - Applies `.dark` to <html> ONLY on public routes; the admin dashboard
 *   keeps its own independent theme controller under /admin.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const inAdmin = pathname.startsWith("/admin");

  // Sync from storage / system after hydration (matches the pre-hydration script).
  useEffect(() => {
    setThemeState(getInitialTheme());
    setMounted(true);
  }, []);

  // Apply on public routes; never touch the DOM class while in the admin area.
  useEffect(() => {
    if (!mounted || inAdmin) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme, mounted, inAdmin]);

  // Follow OS changes only when the user hasn't made an explicit choice.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => {
      if (readStored()) return;
      setThemeState(e.matches ? "dark" : "light");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const setTheme = (t: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* ignore storage errors (private mode etc.) */
    }
    setThemeState(t);
  };

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

/** Inline script string applied before paint to prevent a light/dark flash. */
export const THEME_INIT_SCRIPT = `(function(){try{var p=location.pathname;if(p.indexOf('/admin')===0)return;var k='${STORAGE_KEY}';var s=localStorage.getItem(k);var d=(s==='dark'||s==='light')?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;var e=document.documentElement;if(d){e.classList.add('dark');}else{e.classList.remove('dark');}}catch(_){}})();`;
