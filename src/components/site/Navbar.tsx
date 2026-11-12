import { useEffect, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  Droplets,
  Dumbbell,
  Hand,
  HeartPulse,
  Home as HomeIcon,
  LayoutDashboard,
  LogIn,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  Navigation,
  Phone,
  Salad,
  ShieldCheck,
  Stethoscope,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  CONDITIONS_MENU,
  MAP_DIRECTIONS_URL,
  PHONE_TEL,
  SERVICES_MENU,
  WHATSAPP_CONSULT_URL,
} from "./constants";
import type { TeamMember } from "@/data/team";
import { clinicianWhatsAppUrl, isOnlineClinician } from "@/lib/clinician-service";
import { SiteSearch } from "./SiteSearch";
import { ThemeToggle } from "./ThemeToggle";

type ServiceItem = (typeof SERVICES_MENU)[number];
type ConditionItem = (typeof CONDITIONS_MENU)[number];

const SERVICE_ICONS: Record<string, LucideIcon> = {
  Physiotherapy: Stethoscope,
  "Manual Therapy": Hand,
  "Exercise Therapy": Dumbbell,
  "Home Physiotherapy": HomeIcon,
  "Hijama Therapy": Droplets,
  "Diet & Nutrition": Salad,
  "Personalised Fitness & Rehabilitation": HeartPulse,
};

function useAuthState() {
  const [state, setState] = useState({ signedIn: false, isAdmin: false });

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    void (async () => {
      const { supabase } = await import("@/integrations/supabase/client");

      const apply = async (session: { user: { id: string } } | null) => {
        if (!active) return;

        if (!session) {
          setState({ signedIn: false, isAdmin: false });
          return;
        }

        setState({ signedIn: true, isAdmin: false });
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id);

        if (active) {
          setState({
            signedIn: true,
            isAdmin: (data ?? []).some(
              (role) => role.role === "admin" || role.role === "super_admin",
            ),
          });
        }
      };

      const { data } = await supabase.auth.getSession();
      await apply(data.session);

      const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
        void apply(session);
      });
      unsubscribe = () => subscription.subscription.unsubscribe();
    })();

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  return state;
}

function ServiceLink({
  item,
  onNavigate,
}: {
  item: ServiceItem;
  onNavigate: () => void;
}) {
  const Icon = SERVICE_ICONS[item.label] ?? Activity;
  const className =
    "apple-press flex min-h-14 items-center gap-3 rounded-2xl px-2.5 py-2 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

  const content = (
    <>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/8 text-primary">
        <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-foreground">{item.label}</span>
        <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
          {item.desc}
        </span>
      </span>
      <ChevronRight className="h-4 w-4 text-muted-foreground/70" aria-hidden="true" />
    </>
  );

  if (item.to === "/services/$slug") {
    return (
      <Link
        to="/services/$slug"
        params={{ slug: item.slug }}
        onClick={onNavigate}
        className={className}
      >
        {content}
      </Link>
    );
  }

  return (
    <Link to={item.to} onClick={onNavigate} className={className}>
      {content}
    </Link>
  );
}

function ConditionLink({
  item,
  onNavigate,
}: {
  item: ConditionItem;
  onNavigate: () => void;
}) {
  return (
    <Link
      to="/conditions/$slug"
      params={{ slug: item.slug }}
      onClick={onNavigate}
      className="apple-press flex min-h-11 items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm font-medium text-foreground/85 transition-colors hover:bg-accent hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <span className="flex items-center gap-2.5">
        <Activity className="h-4 w-4 text-secondary" aria-hidden="true" />
        {item.label}
      </span>
      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" aria-hidden="true" />
    </Link>
  );
}

const PRIMARY_LINKS = [
  { label: "Home", to: "/" },
  { label: "About PainFix", to: "/about" },
  { label: "Our clinicians", to: "/our-team" },
  { label: "Fitness", to: "/fitness" },
  { label: "Home visits", to: "/home-visit" },
  { label: "Patient stories", to: "/success-stories" },
  { label: "Articles & guides", to: "/blog" },
  { label: "Gallery", to: "/gallery" },
  { label: "Contact", to: "/contact" },
] as const;

export function Navbar({ onlineClinician }: { onlineClinician?: TeamMember }) {
  const onlineOnly = Boolean(onlineClinician && isOnlineClinician(onlineClinician));
  const bookingUrl =
    onlineOnly && onlineClinician
      ? clinicianWhatsAppUrl(onlineClinician)
      : WHATSAPP_CONSULT_URL;
  const { signedIn, isAdmin } = useAuthState();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);
  const isActive = (path: string) =>
    path === "/"
      ? pathname === "/"
      : pathname === path || pathname.startsWith(path + "/");

  async function handleSignOut() {
    closeMenu();
    const { supabase } = await import("@/integrations/supabase/client");
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  const services = SERVICES_MENU.filter((item) => item.label !== "Home Physiotherapy");
  const conditions = CONDITIONS_MENU;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
        <div
          className={
            "mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-border/70 bg-background shadow-[0_4px_18px_rgba(22,50,74,0.08)] transition-[height,padding,box-shadow] duration-300 " +
            (compact
              ? "h-14 px-3 shadow-[0_5px_22px_rgba(22,50,74,0.10)]"
              : "h-[68px] px-4")
          }
        >
          <Link
            to="/"
            onClick={closeMenu}
            aria-current={pathname === "/" ? "page" : undefined}
            className="apple-press flex min-w-0 items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border border-border/50 bg-white shadow-sm">
              <img
                src="/painfix-logo-96.webp"
                alt="PainFix Physiotherapy Clinic logo"
                width={40}
                height={40}
                className="h-full w-full rounded-full object-contain p-1"
              />
            </span>
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="truncate font-heading text-base font-bold text-foreground sm:text-lg">
                PainFix
              </span>
              <span className="hidden truncate text-[10px] font-medium text-muted-foreground sm:block">
                Physiotherapy Clinic
              </span>
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <SiteSearch className="apple-press h-10 w-10 rounded-xl border-0 bg-transparent hover:bg-accent" />
            <div className="hidden sm:block">
              <ThemeToggle className="apple-press h-10 w-10 rounded-xl border-0 bg-transparent hover:bg-accent" />
            </div>
            <Link
              to="/book-appointment"
              className="apple-press hidden min-h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:inline-flex"
            >
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              <span>Book appointment</span>
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open PainFix navigation"
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
              className="apple-press grid h-10 w-10 place-items-center rounded-xl border border-border/70 bg-card text-foreground transition-colors hover:bg-accent hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <DialogPrimitive.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-foreground/25 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in data-[state=closed]:fade-out duration-200" />
          <DialogPrimitive.Content
            className="fixed left-1/2 top-3 z-[61] flex max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-5xl -translate-x-1/2 flex-col overflow-hidden rounded-[28px] border border-border bg-background shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-top-3 data-[state=closed]:slide-out-to-top-3 duration-300 sm:top-5 sm:max-h-[calc(100dvh-2.5rem)]"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-border/70 px-5 py-4 sm:px-7">
              <div>
                <DialogPrimitive.Title className="font-heading text-xl font-semibold text-foreground">
                  Explore PainFix
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="mt-1 text-xs text-muted-foreground">
                  Find care, clinicians and practical recovery guidance.
                </DialogPrimitive.Description>
              </div>
              <DialogPrimitive.Close
                aria-label="Close navigation"
                className="apple-press grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </DialogPrimitive.Close>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-7 sm:py-6">
              <div className="grid gap-7 lg:grid-cols-[0.82fr_1.18fr]">
                <section aria-labelledby="painfix-menu-main">
                  <h2
                    id="painfix-menu-main"
                    className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    Explore
                  </h2>
                  <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
                    {PRIMARY_LINKS.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={closeMenu}
                        aria-current={isActive(item.to) ? "page" : undefined}
                        className={
                          "apple-press flex min-h-12 items-center justify-between rounded-xl px-3 text-sm font-semibold transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary " +
                          (isActive(item.to)
                            ? "bg-accent text-primary"
                            : "text-foreground/85")
                        }
                      >
                        {item.label}
                        <ChevronRight
                          className="h-4 w-4 text-muted-foreground/60"
                          aria-hidden="true"
                        />
                      </Link>
                    ))}
                  </div>

                  <div className="mt-6 rounded-2xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <MapPin className="h-4 w-4 text-secondary" aria-hidden="true" />
                      PainFix · Multan
                    </div>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Shalimar Colony, Multan
                    </p>
                    <a
                      href={MAP_DIRECTIONS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={closeMenu}
                      className="apple-press mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-primary transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <Navigation className="h-4 w-4" aria-hidden="true" />
                      Get directions
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </section>

                <div className="grid gap-7 sm:grid-cols-2">
                  <section aria-labelledby="painfix-menu-services">
                    <div className="mb-3 flex items-center justify-between px-2">
                      <h2
                        id="painfix-menu-services"
                        className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                      >
                        Services
                      </h2>
                      <Link
                        to="/services"
                        onClick={closeMenu}
                        className="apple-press text-xs font-semibold text-primary hover:underline"
                      >
                        View all
                      </Link>
                    </div>
                    <div className="grid gap-1">
                      {services.map((item) => (
                        <ServiceLink
                          key={item.label}
                          item={item}
                          onNavigate={closeMenu}
                        />
                      ))}
                      {!onlineOnly && (
                        <Link
                          to="/home-visit"
                          onClick={closeMenu}
                          className="apple-press flex min-h-14 items-center gap-3 rounded-2xl px-2.5 py-2 transition-colors hover:bg-accent"
                        >
                          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/8 text-primary">
                            <HomeIcon className="h-[18px] w-[18px]" aria-hidden="true" />
                          </span>
                          <span className="flex-1">
                            <span className="block text-sm font-semibold text-foreground">
                              Home visits
                            </span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              Physiotherapy at home
                            </span>
                          </span>
                          <ChevronRight
                            className="h-4 w-4 text-muted-foreground/70"
                            aria-hidden="true"
                          />
                        </Link>
                      )}
                    </div>
                  </section>

                  <section aria-labelledby="painfix-menu-conditions">
                    <div className="mb-3 flex items-center justify-between px-2">
                      <h2
                        id="painfix-menu-conditions"
                        className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                      >
                        Conditions
                      </h2>
                      <Link
                        to="/conditions"
                        onClick={closeMenu}
                        className="apple-press text-xs font-semibold text-primary hover:underline"
                      >
                        View all
                      </Link>
                    </div>
                    <div className="grid gap-0.5">
                      {conditions.map((item) => (
                        <ConditionLink
                          key={item.slug}
                          item={item}
                          onNavigate={closeMenu}
                        />
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-3 border-t border-border/70 bg-card/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <div className="flex flex-wrap items-center gap-2">
                {signedIn ? (
                  <>
                    <Link
                      to="/admin/profile"
                      onClick={closeMenu}
                      className="apple-press inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-foreground hover:bg-accent"
                    >
                      <UserRound className="h-4 w-4" aria-hidden="true" />
                      My profile
                    </Link>
                    <Link
                      to="/admin/appointments"
                      onClick={closeMenu}
                      className="apple-press inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-foreground hover:bg-accent"
                    >
                      <CalendarDays className="h-4 w-4" aria-hidden="true" />
                      Appointments
                    </Link>
                    <Link
                      to="/admin"
                      onClick={closeMenu}
                      className="apple-press inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-foreground hover:bg-accent"
                    >
                      {isAdmin ? (
                        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                      )}
                      {isAdmin ? "Admin" : "Dashboard"}
                    </Link>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="apple-press inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-foreground hover:bg-accent"
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      Sign out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    onClick={closeMenu}
                    className="apple-press inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-foreground hover:bg-accent"
                  >
                    <LogIn className="h-4 w-4" aria-hidden="true" />
                    Sign in
                  </Link>
                )}
                <ThemeToggle className="apple-press h-10 w-10 rounded-xl border-0 bg-transparent hover:bg-accent sm:hidden" />
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Link
                  to="/book-appointment"
                  onClick={closeMenu}
                  className="apple-press inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <CalendarDays className="h-4 w-4" aria-hidden="true" />
                  Book an appointment
                </Link>
                {bookingUrl && (
                  <a
                    href={bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeMenu}
                    className="apple-press inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <MessageCircle className="h-4 w-4 text-secondary" aria-hidden="true" />
                    WhatsApp
                  </a>
                )}
                <a
                  href={PHONE_TEL}
                  onClick={closeMenu}
                  aria-label="Call PainFix"
                  className="apple-press hidden h-11 w-11 items-center justify-center rounded-xl border border-border bg-background text-foreground transition-colors hover:bg-accent sm:inline-flex"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
