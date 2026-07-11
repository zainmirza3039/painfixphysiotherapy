import { useEffect, useState } from "react";
import { Menu, X, MessageCircle, Home, BookOpen } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { NAV_LINKS } from "./constants";
import { openCalendlyPopup } from "./calendly";
import { LanguageToggle } from "./LanguageToggle";
import { ThemeToggle } from "./ThemeToggle";
import logoAsset from "@/assets/painfix-logo-96.webp.asset.json";


export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "glass shadow-soft py-2" : "bg-transparent py-4"
      }`}
    >
      <nav aria-label="Primary" className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a href="/#home" className="flex min-w-0 items-center gap-2.5" aria-label="PainFix Physiotherapy Clinic home">
          <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-background shadow-soft ring-1 ring-border">
            <img
              src={logoAsset.url}
              alt="PainFix Physiotherapy Clinic logo"
              width={44}
              height={44}
              className="h-full w-full object-contain p-0.5"
            />
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate font-heading text-base font-bold text-foreground sm:text-lg">
              PainFix
            </span>
            <span className="truncate text-[11px] font-medium text-muted-foreground">Physiotherapy Clinic</span>
          </span>

        </a>

        <div className="hidden items-center gap-1 xl:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-primary"
            >
              {l.label}
            </a>
          ))}
          <Link
            to="/home-visit"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-primary"
          >
            <Home className="h-4 w-4" /> Home Visit
          </Link>
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-primary"
          >
            <BookOpen className="h-4 w-4" /> Blog
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageToggle className="hidden sm:inline-flex" />
          <button
            type="button"
            onClick={() => openCalendlyPopup()}
            className="ripple hidden items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-semibold text-secondary-foreground shadow-soft transition-transform hover:scale-105 sm:inline-flex"
          >
            Book Appointment
          </button>
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-background text-foreground xl:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="glass mx-4 mt-2 rounded-2xl p-4 shadow-card xl:hidden">
          <div className="grid gap-1">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-foreground/85 transition-colors hover:bg-accent hover:text-primary"
              >
                {l.label}
              </a>
            ))}
            <Link
              to="/home-visit"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-foreground/85 transition-colors hover:bg-accent hover:text-primary"
            >
              <Home className="h-4 w-4" /> Home Visit
            </Link>
            <Link
              to="/blog"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-foreground/85 transition-colors hover:bg-accent hover:text-primary"
            >
              <BookOpen className="h-4 w-4" /> Blog
            </Link>
            <div className="px-1 pt-1">
              <LanguageToggle className="w-full justify-center" />
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                openCalendlyPopup();
              }}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-3 text-sm font-semibold text-secondary-foreground"
            >
              <MessageCircle className="h-4 w-4" /> Book Appointment
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
