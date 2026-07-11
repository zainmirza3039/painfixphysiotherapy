import { useEffect, useRef, useState } from "react";
import {
  Menu,
  X,
  MessageCircle,
  Home,
  BookOpen,
  Dumbbell,
  LogIn,
  UserPlus,
  LayoutDashboard,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { NAV_LINKS } from "./constants";
import { openCalendlyPopup } from "./calendly";
// NOTE: LanguageToggle intentionally not rendered in the public header.
// The i18n architecture (LanguageProvider, translations, LanguageToggle) is kept
// so an Urdu switch can be re-enabled once a complete Urdu version is ready.
import { ThemeToggle } from "./ThemeToggle";
import { SiteSearch } from "./SiteSearch";
import logoAsset from "@/assets/painfix-logo-96.webp.asset.json";

/**
 * Lightweight, UI-only auth affordance for the public header.
 * Reads the cached session (no network) and stays fresh via onAuthStateChange.
 * Route protection is handled separately by the _authenticated gate.
 */
function useAuthState() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    (async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setSignedIn(!!data.session);
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        setSignedIn(!!session);
      });
      unsubscribe = () => sub.subscription.unsubscribe();
    })();

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  return signedIn;
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const lastYRef = useRef(0);
  const accountRef = useRef<HTMLDivElement>(null);
  const signedIn = useAuthState();
  const navigate = useNavigate();

  useEffect(() => {
    lastYRef.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      // Always show near the top; hide on scroll down, reveal on scroll up.
      if (y < 80) {
        setHidden(false);
      } else if (y > lastYRef.current + 6) {
        setHidden(true);
      } else if (y < lastYRef.current - 6) {
        setHidden(false);
      }
      lastYRef.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the account dropdown on outside click.
  useEffect(() => {
    if (!accountOpen) return;
    const onClick = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [accountOpen]);

  async function handleSignOut() {
    setAccountOpen(false);
    setOpen(false);
    const { supabase } = await import("@/integrations/supabase/client");
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 will-change-transform ${
        scrolled ? "glass shadow-soft py-2" : "bg-transparent py-4"
      } ${hidden && !open ? "-translate-y-full" : "translate-y-0"}`}
    >
      <nav aria-label="Primary" className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
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
            to="/fitness-rehabilitation"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-primary"
          >
            <Dumbbell className="h-4 w-4" /> Fitness
          </Link>
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-primary"
          >
            <BookOpen className="h-4 w-4" /> Blog
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <SiteSearch />
          <ThemeToggle />

          {/* Auth controls (desktop) */}
          {signedIn ? (
            <div ref={accountRef} className="relative hidden xl:block">
              <button
                type="button"
                onClick={() => setAccountOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={accountOpen}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-2 text-sm font-medium text-foreground/85 transition-colors hover:bg-accent hover:text-primary"
              >
                <User className="h-4 w-4" /> Account
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${accountOpen ? "rotate-180" : ""}`} />
              </button>
              {accountOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-border bg-card p-1.5 shadow-card"
                >
                  <Link
                    to="/admin"
                    role="menuitem"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/85 transition-colors hover:bg-accent hover:text-primary"
                  >
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                  <Link
                    to="/admin/profile"
                    role="menuitem"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/85 transition-colors hover:bg-accent hover:text-primary"
                  >
                    <User className="h-4 w-4" /> My Profile
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-foreground/85 transition-colors hover:bg-accent hover:text-primary"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 xl:flex">
              <Link
                to="/auth"
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-primary"
              >
                <LogIn className="h-4 w-4" /> Sign In
              </Link>
              <Link
                to="/auth"
                className="inline-flex items-center gap-1.5 rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <UserPlus className="h-4 w-4" /> Sign Up
              </Link>
            </div>
          )}

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
              to="/fitness-rehabilitation"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-foreground/85 transition-colors hover:bg-accent hover:text-primary"
            >
              <Dumbbell className="h-4 w-4" /> Fitness
            </Link>
            <Link
              to="/blog"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-foreground/85 transition-colors hover:bg-accent hover:text-primary"
            >
              <BookOpen className="h-4 w-4" /> Blog
            </Link>

            {/* Auth controls (mobile) */}
            <div className="my-2 border-t border-border" />
            {signedIn ? (
              <>
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-foreground/85 transition-colors hover:bg-accent hover:text-primary"
                >
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>
                <Link
                  to="/admin/profile"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-foreground/85 transition-colors hover:bg-accent hover:text-primary"
                >
                  <User className="h-4 w-4" /> My Profile
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-medium text-foreground/85 transition-colors hover:bg-accent hover:text-primary"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-foreground/85 transition-colors hover:bg-accent hover:text-primary"
                >
                  <LogIn className="h-4 w-4" /> Sign In
                </Link>
                <Link
                  to="/auth"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  <UserPlus className="h-4 w-4" /> Sign Up
                </Link>
              </>
            )}

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
