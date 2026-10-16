import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

/** Accessible light/dark toggle for the public site header. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggle}
      role="switch"
      aria-checked={isDark}
      aria-label={label}
      title={label}
      className={`grid h-11 w-11 place-items-center rounded-xl border border-border bg-background text-foreground transition-colors hover:bg-accent hover:text-primary ${className}`}
    >
      {isDark ? (
        <Sun className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Moon className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );
}
