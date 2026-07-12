import { useEffect, useRef, useState } from "react";
import {
  Menu,
  X,
  MessageCircle,
  LogIn,
  UserPlus,
  LayoutDashboard,
  ShieldCheck,
  User,
  CalendarCheck,
  LogOut,
  ChevronDown,
  Stethoscope,
  Hand,
  Dumbbell,
  Home as HomeIcon,
  Droplets,
  Salad,
  HeartPulse,
  Video,
  LayoutGrid,
  ArrowRight,
  Activity,
  type LucideIcon,
} from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  SERVICES_MENU,
  CONDITIONS_MENU,
  WHATSAPP_CONSULT_URL,
  CALENDLY_URL,
} from "./constants";

// NOTE: LanguageToggle intentionally not rendered in the public header.
// The i18n architecture (LanguageProvider, translations, LanguageToggle) is kept
// so an Urdu switch can be re-enabled once a complete Urdu version is ready.
import { ThemeToggle } from "./ThemeToggle";
import { SiteSearch } from "./SiteSearch";


type ServicesMenuItem = (typeof SERVICES_MENU)[number];
type ConditionsMenuItem = (typeof CONDITIONS_MENU)[number];

/* Small professional icon per core service (keyed by label). */
const SERVICE_ICONS: Record<string, LucideIcon> = {
  Physiotherapy: Stethoscope,
  "Manual Therapy": Hand,
  "Exercise Therapy": Dumbbell,
  "Home Physiotherapy": HomeIcon,
  "Hijama Therapy": Droplets,
  "Diet & Nutrition": Salad,
  "Personalised Fitness & Rehabilitation": HeartPulse,
};

/* Featured column of the Services mega menu — booking-focused shortcuts. */
type FeaturedItem = {
  label: string;
  desc: string;
  icon: LucideIcon;
  href?: string;
  external?: boolean;
  to?: string;
};
const FEATURED_SERVICES: FeaturedItem[] = [
  {
    label: "Book Consultation",
    desc: "Chat with us on WhatsApp",
    icon: MessageCircle,
    href: WHATSAPP_CONSULT_URL,
    external: true,
  },
  {
    label: "Home Visits",
    desc: "Expert physiotherapy at home",
    icon: HomeIcon,
    to: "/home-visit",
  },
  {
    label: "Video Consultation",
    desc: "Online session via Calendly",
    icon: Video,
    href: CALENDLY_URL,
    external: true,
  },
  {
    label: "View All Services",
    desc: "Browse the full range",
    icon: LayoutGrid,
    to: "/services",
  },
];


/**
 * Lightweight, UI-only auth affordance for the public header.
 * Reads the cached session (no network) and stays fresh via onAuthStateChange.
 * When signed in, it also resolves whether the user is an admin so the
 * profile menu can surface the Admin Dashboard. Route protection itself is
 * handled separately by the _authenticated gate.
 */
function useAuthState() {
  const [state, setState] = useState<{ signedIn: boolean; isAdmin: boolean }>({
    signedIn: false,
    isAdmin: false,
  });

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    (async () => {
      const { supabase } = await import("@/integrations/supabase/client");

      const resolveAdmin = async (userId: string) => {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId);
        return (data ?? []).some(
          (r) => r.role === "admin" || r.role === "super_admin",
        );
      };

      const apply = async (session: { user: { id: string } } | null) => {
        if (!active) return;
        if (!session) {
          setState({ signedIn: false, isAdmin: false });
          return;
        }
        setState({ signedIn: true, isAdmin: false });
        const isAdmin = await resolveAdmin(session.user.id);
        if (active) setState({ signedIn: true, isAdmin });
      };

      const { data } = await supabase.auth.getSession();
      await apply(data.session);

      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        void apply(session);
      });
      unsubscribe = () => sub.subscription.unsubscribe();
    })();

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  return state;
}

const linkClass =
  "rounded-full px-2.5 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary";

/* ---------- Desktop dropdown item links ---------- */

function ServiceLink({
  item,
  onNavigate,
  className,
  showDesc = false,
  withIcon = false,
}: {
  item: ServicesMenuItem;
  onNavigate: () => void;
  className: string;
  showDesc?: boolean;
  withIcon?: boolean;
}) {
  const Icon = SERVICE_ICONS[item.label] ?? Activity;
  const content = (
    <>
      {withIcon && (
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon className="h-[18px] w-[18px]" />
        </span>
      )}
      <span className="min-w-0">
        <span className="block font-semibold leading-tight">{item.label}</span>
        {showDesc && (
          <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
            {item.desc}
          </span>
        )}
      </span>
    </>
  );
  if (item.to === "/services/$slug") {
    return (
      <Link
        to="/services/$slug"
        params={{ slug: item.slug }}
        role="menuitem"
        onClick={onNavigate}
        className={className}
      >
        {content}
      </Link>
    );
  }
  return (
    <Link to={item.to} role="menuitem" onClick={onNavigate} className={className}>
      {content}
    </Link>
  );
}


function ConditionLink({
  item,
  onNavigate,
  className,
  withIcon = false,
}: {
  item: ConditionsMenuItem;
  onNavigate: () => void;
  className: string;
  withIcon?: boolean;
}) {
  return (
    <Link
      to="/conditions/$slug"
      params={{ slug: item.slug }}
      role="menuitem"
      onClick={onNavigate}
      className={className}
    >
      {withIcon && (
        <Activity className="h-4 w-4 shrink-0 text-primary/70 transition-colors group-hover:text-primary" />
      )}
      <span className="min-w-0">{item.label}</span>
    </Link>
  );
}


export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false); // mobile menu
  const [hidden, setHidden] = useState(false);
  const [menu, setMenu] = useState<null | "services" | "conditions">(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileServices, setMobileServices] = useState(false);
  const [mobileConditions, setMobileConditions] = useState(false);
  const lastYRef = useRef(0);
  const accountRef = useRef<HTMLDivElement>(null);
  const { signedIn, isAdmin } = useAuthState();
  const navigate = useNavigate();

  /* Sticky smart header: show near top, hide on scroll down, reveal on scroll up. */
  useEffect(() => {
    lastYRef.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      if (y < 80) {
        setHidden(false);
      } else if (y > lastYRef.current + 6) {
        setHidden(true);
        setMenu(null);
        setAccountOpen(false);
      } else if (y < lastYRef.current - 6) {
        setHidden(false);
      }
      lastYRef.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Close the account dropdown on outside click. */
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

  /* Escape closes any open desktop menu. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(null);
        setAccountOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* Lock body scroll while the full-screen mobile menu is open. */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  function closeMobile() {
    setOpen(false);
    setMobileServices(false);
    setMobileConditions(false);
  }

  async function handleSignOut() {
    setAccountOpen(false);
    closeMobile();
    const { supabase } = await import("@/integrations/supabase/client");
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  const dashboardLabel = isAdmin ? "Admin Dashboard" : "Dashboard";
  const DashboardIcon = isAdmin ? ShieldCheck : LayoutDashboard;



  return (
    <>
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 will-change-transform ${
        scrolled ? "glass shadow-soft py-2" : "bg-transparent py-4"
      } ${hidden && !open ? "-translate-y-full" : "translate-y-0"}`}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8"
      >
        <a
          href="/#home"
          className="flex min-w-0 items-center gap-2.5"
          aria-label="PainFix Physiotherapy Clinic home"
        >
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
            <span className="truncate text-[11px] font-medium text-muted-foreground">
              Physiotherapy Clinic
            </span>
          </span>
        </a>

        {/* ---------- Desktop navigation ---------- */}
        <div className="hidden items-center gap-0.5 xl:flex">
          <a href="/#home" className={linkClass}>
            Home
          </a>
          <a href="/#about" className={linkClass}>
            About
          </a>

          {/* Services dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setMenu("services")}
            onMouseLeave={() => setMenu(null)}
          >
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={menu === "services"}
              onClick={() => setMenu((m) => (m === "services" ? null : "services"))}
              className={`inline-flex items-center gap-1 ${linkClass}`}
            >
              Services
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${menu === "services" ? "rotate-180" : ""}`}
              />
            </button>
            {menu === "services" && (
              <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2">
                <div
                  role="menu"
                  className="grid w-[46rem] grid-cols-[1.4fr_1fr] gap-2 overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-card animate-fade-in"
                >
                  {/* Left: Core Services */}
                  <div>
                    <p className="px-2 pb-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                      Core Services
                    </p>
                    <div className="grid grid-cols-1 gap-0.5">
                      {SERVICES_MENU.map((item) => (
                        <ServiceLink
                          key={item.label}
                          item={item}
                          showDesc
                          withIcon
                          onNavigate={() => setMenu(null)}
                          className="group flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm text-foreground/85 transition-colors hover:bg-accent hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        />
                      ))}
                    </div>
                  </div>
                  {/* Right: Featured Services */}
                  <div className="rounded-xl bg-accent/40 p-2">
                    <p className="px-2 pb-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                      Featured
                    </p>
                    <div className="grid grid-cols-1 gap-0.5">
                      {FEATURED_SERVICES.map((f) => {
                        const inner = (
                          <>
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-background text-primary shadow-soft transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                              <f.icon className="h-[18px] w-[18px]" />
                            </span>
                            <span className="min-w-0">
                              <span className="block font-semibold leading-tight">
                                {f.label}
                              </span>
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                {f.desc}
                              </span>
                            </span>
                          </>
                        );
                        const cls =
                          "group flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm text-foreground/85 transition-colors hover:bg-background hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary";
                        return f.external ? (
                          <a
                            key={f.label}
                            href={f.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            role="menuitem"
                            onClick={() => setMenu(null)}
                            className={cls}
                          >
                            {inner}
                          </a>
                        ) : (
                          <Link
                            key={f.label}
                            to={f.to!}
                            role="menuitem"
                            onClick={() => setMenu(null)}
                            className={cls}
                          >
                            {inner}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Conditions dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setMenu("conditions")}
            onMouseLeave={() => setMenu(null)}
          >
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={menu === "conditions"}
              onClick={() =>
                setMenu((m) => (m === "conditions" ? null : "conditions"))
              }
              className={`inline-flex items-center gap-1 ${linkClass}`}
            >
              Conditions
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${menu === "conditions" ? "rotate-180" : ""}`}
              />
            </button>
            {menu === "conditions" && (
              <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2">
                <div
                  role="menu"
                  className="w-[34rem] overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-card animate-fade-in"
                >
                  <p className="px-2 pb-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                    Conditions We Treat
                  </p>
                  <div className="grid grid-cols-2 gap-0.5">
                    {CONDITIONS_MENU.map((item) => (
                      <ConditionLink
                        key={item.slug}
                        item={item}
                        withIcon
                        onNavigate={() => setMenu(null)}
                        className="group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm text-foreground/85 transition-colors hover:bg-accent hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    ))}
                  </div>
                  <Link
                    to="/conditions"
                    role="menuitem"
                    onClick={() => setMenu(null)}
                    className="mt-2 flex items-center justify-center gap-1.5 rounded-xl bg-accent px-3 py-2.5 text-center text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    View All Conditions <ArrowRight className="h-4 w-4" />
                  </Link>

                </div>
              </div>
            )}
          </div>

          <Link to="/home-visit" className={linkClass}>
            Home Physiotherapy
          </Link>
          <Link to="/fitness" className={linkClass}>
            Fitness
          </Link>
          <Link to="/blog" className={linkClass}>
            Blog
          </Link>
          <a href="/#gallery" className={linkClass}>
            Gallery
          </a>
          <a href="/#contact" className={linkClass}>
            Contact
          </a>
        </div>

        {/* ---------- Right controls ---------- */}
        <div className="flex items-center gap-1.5">
          <SiteSearch />
          <ThemeToggle />

          {/* Auth (desktop) */}
          {signedIn ? (
            <div ref={accountRef} className="relative hidden xl:block">
              <button
                type="button"
                onClick={() => setAccountOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={accountOpen}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-2 text-sm font-medium text-foreground/85 transition-colors hover:bg-accent hover:text-primary"
              >
                <User className="h-4 w-4" /> Profile
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${accountOpen ? "rotate-180" : ""}`}
                />
              </button>
              {accountOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-card p-1.5 shadow-card animate-fade-in"
                >
                  <Link
                    to="/admin/profile"
                    role="menuitem"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/85 transition-colors hover:bg-accent hover:text-primary"
                  >
                    <User className="h-4 w-4" /> My Profile
                  </Link>
                  <Link
                    to="/admin/appointments"
                    role="menuitem"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/85 transition-colors hover:bg-accent hover:text-primary"
                  >
                    <CalendarCheck className="h-4 w-4" /> My Appointments
                  </Link>
                  <Link
                    to="/admin"
                    role="menuitem"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/85 transition-colors hover:bg-accent hover:text-primary"
                  >
                    <DashboardIcon className="h-4 w-4" /> {dashboardLabel}
                  </Link>
                  <div className="my-1 border-t border-border" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-foreground/85 transition-colors hover:bg-accent hover:text-primary"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-1 xl:flex">
              <Link to="/auth" className={linkClass}>
                Sign In
              </Link>
              <Link
                to="/auth"
                className="rounded-full border border-primary px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Single primary CTA */}
          <a
            href={WHATSAPP_CONSULT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ripple hidden items-center gap-2 rounded-full bg-secondary px-4 py-2.5 text-sm font-semibold text-secondary-foreground shadow-soft transition-transform hover:scale-105 sm:inline-flex"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp Consultation
          </a>

          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => (open ? closeMobile() : setOpen(true))}
            className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-background text-foreground xl:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>
    </header>

      {/* ---------- Mobile full-screen slide menu ---------- */}
      {/* Rendered OUTSIDE the transformed <header> so its position:fixed
          children anchor to the viewport, not the header's box. */}
      <div className={`xl:hidden ${open ? "" : "pointer-events-none"}`}>

        {/* Backdrop */}
        <div
          onClick={closeMobile}
          className={`fixed inset-0 z-[60] bg-foreground/40 backdrop-blur-sm transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        />
        {/* Panel */}
        <aside
          className={`fixed inset-y-0 right-0 z-[70] flex h-full w-full max-w-md flex-col bg-background shadow-card transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
          aria-label="Mobile navigation"
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <span className="font-heading text-base font-bold text-foreground">Menu</span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={closeMobile}
              className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-background text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="grid gap-1">
              <a href="/#home" onClick={closeMobile} className="rounded-xl px-4 py-3.5 text-base font-medium text-foreground/85 hover:bg-accent hover:text-primary">
                Home
              </a>
              <a href="/#about" onClick={closeMobile} className="rounded-xl px-4 py-3.5 text-base font-medium text-foreground/85 hover:bg-accent hover:text-primary">
                About
              </a>

              {/* Services accordion */}
              <button
                type="button"
                aria-expanded={mobileServices}
                onClick={() => setMobileServices((v) => !v)}
                className="flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-medium text-foreground/85 hover:bg-accent hover:text-primary"
              >
                Services
                <ChevronDown className={`h-4 w-4 transition-transform ${mobileServices ? "rotate-180" : ""}`} />
              </button>
              {mobileServices && (
                <div className="animate-fade-in ml-3 grid gap-0.5 border-l border-border pl-3">
                  {SERVICES_MENU.map((item) => (
                    <ServiceLink
                      key={item.label}
                      item={item}
                      onNavigate={closeMobile}
                      className="block rounded-lg px-3 py-3 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-primary"
                    />
                  ))}
                  <Link
                    to="/services"
                    onClick={closeMobile}
                    className="mt-0.5 block rounded-lg px-3 py-3 text-sm font-semibold text-primary hover:bg-accent"
                  >
                    View All Services
                  </Link>
                </div>
              )}


              {/* Conditions accordion */}
              <button
                type="button"
                aria-expanded={mobileConditions}
                onClick={() => setMobileConditions((v) => !v)}
                className="flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-medium text-foreground/85 hover:bg-accent hover:text-primary"
              >
                Conditions
                <ChevronDown className={`h-4 w-4 transition-transform ${mobileConditions ? "rotate-180" : ""}`} />
              </button>
              {mobileConditions && (
                <div className="animate-fade-in ml-3 grid gap-0.5 border-l border-border pl-3">
                  {CONDITIONS_MENU.map((item) => (
                    <ConditionLink
                      key={item.slug}
                      item={item}
                      onNavigate={closeMobile}
                      className="block rounded-lg px-3 py-3 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-primary"
                    />
                  ))}
                  <Link
                    to="/conditions"
                    onClick={closeMobile}
                    className="mt-0.5 block rounded-lg px-3 py-3 text-sm font-semibold text-primary hover:bg-accent"
                  >
                    View All Conditions
                  </Link>
                </div>
              )}

              <Link to="/home-visit" onClick={closeMobile} className="rounded-xl px-4 py-3.5 text-base font-medium text-foreground/85 hover:bg-accent hover:text-primary">
                Home Physiotherapy
              </Link>
              <Link to="/fitness" onClick={closeMobile} className="rounded-xl px-4 py-3.5 text-base font-medium text-foreground/85 hover:bg-accent hover:text-primary">
                Fitness
              </Link>
              <Link to="/blog" onClick={closeMobile} className="rounded-xl px-4 py-3.5 text-base font-medium text-foreground/85 hover:bg-accent hover:text-primary">
                Blog
              </Link>
              <a href="/#gallery" onClick={closeMobile} className="rounded-xl px-4 py-3.5 text-base font-medium text-foreground/85 hover:bg-accent hover:text-primary">
                Gallery
              </a>
              <a href="/#contact" onClick={closeMobile} className="rounded-xl px-4 py-3.5 text-base font-medium text-foreground/85 hover:bg-accent hover:text-primary">
                Contact
              </a>

              {/* Auth (mobile) */}
              <div className="my-2 border-t border-border" />
              {signedIn ? (
                <>
                  <Link to="/admin/profile" onClick={closeMobile} className="inline-flex items-center gap-2 rounded-xl px-4 py-3.5 text-base font-medium text-foreground/85 hover:bg-accent hover:text-primary">
                    <User className="h-5 w-5" /> My Profile
                  </Link>
                  <Link to="/admin/appointments" onClick={closeMobile} className="inline-flex items-center gap-2 rounded-xl px-4 py-3.5 text-base font-medium text-foreground/85 hover:bg-accent hover:text-primary">
                    <CalendarCheck className="h-5 w-5" /> My Appointments
                  </Link>
                  <Link to="/admin" onClick={closeMobile} className="inline-flex items-center gap-2 rounded-xl px-4 py-3.5 text-base font-medium text-foreground/85 hover:bg-accent hover:text-primary">
                    <DashboardIcon className="h-5 w-5" /> {dashboardLabel}
                  </Link>
                  <button type="button" onClick={handleSignOut} className="inline-flex items-center gap-2 rounded-xl px-4 py-3.5 text-left text-base font-medium text-foreground/85 hover:bg-accent hover:text-primary">
                    <LogOut className="h-5 w-5" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/auth" onClick={closeMobile} className="inline-flex items-center gap-2 rounded-xl px-4 py-3.5 text-base font-medium text-foreground/85 hover:bg-accent hover:text-primary">
                    <LogIn className="h-5 w-5" /> Sign In
                  </Link>
                  <Link to="/auth" onClick={closeMobile} className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary px-4 py-3.5 text-base font-semibold text-primary hover:bg-primary hover:text-primary-foreground">
                    <UserPlus className="h-5 w-5" /> Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Single primary CTA pinned to the bottom */}
          <div className="border-t border-border p-4">
            <a
              href={WHATSAPP_CONSULT_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMobile}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-3.5 text-base font-semibold text-secondary-foreground shadow-soft"
            >
              <MessageCircle className="h-5 w-5" /> WhatsApp Consultation
            </a>
          </div>
        </aside>
      </div>
    </>
  );
}
