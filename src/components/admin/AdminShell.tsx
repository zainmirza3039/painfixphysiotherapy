import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Users,
  CalendarClock,
  Home,
  MessageSquare,
  Newspaper,
  Image as ImageIcon,
  BarChart3,
  Settings,
  ShieldCheck,
  Stethoscope,
  UserCircle,
  Moon,
  Sun,
  LogOut,
  Menu,
  Activity,
  Calculator,
  Dumbbell,
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/admin/AdminAuthProvider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  gate: "staff" | "admin" | "content" | "professional";
}

const NAV: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, gate: "staff" },
  { to: "/admin/patients", label: "Patients", icon: Users, gate: "staff" },
  { to: "/admin/appointments", label: "Appointments", icon: CalendarClock, gate: "staff" },
  { to: "/admin/home-visits", label: "Home Visits", icon: Home, gate: "staff" },
  { to: "/admin/messages", label: "Messages", icon: MessageSquare, gate: "admin" },
  { to: "/admin/profile", label: "My Profile", icon: UserCircle, gate: "professional" },
  { to: "/admin/fitness-content", label: "Fitness Content", icon: Dumbbell, gate: "content" },
  { to: "/admin/blog", label: "Blog CMS", icon: Newspaper, gate: "content" },
  { to: "/admin/calculators", label: "Calculators", icon: Calculator, gate: "content" },
  { to: "/admin/media", label: "Media Library", icon: ImageIcon, gate: "content" },
  { to: "/admin/gallery", label: "Website Gallery", icon: ImageIcon, gate: "admin" },
  { to: "/admin/reports", label: "Reports", icon: BarChart3, gate: "admin" },
  { to: "/admin/users", label: "Team & Roles", icon: ShieldCheck, gate: "admin" },
  { to: "/admin/clinicians", label: "Clinician Profiles", icon: Stethoscope, gate: "admin" },
  { to: "/admin/internships", label: "Internship Programs", icon: Newspaper, gate: "admin" },
  {
    to: "/admin/internship-applications",
    label: "Internship Applications",
    icon: Users,
    gate: "admin",
  },
  {
    to: "/admin/internship-participants",
    label: "Participants & Completion",
    icon: CalendarClock,
    gate: "admin",
  },
  { to: "/admin/experience-records", label: "Experience Records", icon: UserCircle, gate: "admin" },
  { to: "/admin/certificates", label: "Certificates", icon: ShieldCheck, gate: "admin" },
  { to: "/admin/settings", label: "Settings", icon: Settings, gate: "admin" },
];

const NAV_SECTIONS = [
  { label: "Overview", routes: ["/admin"] },
  {
    label: "Clinic",
    routes: ["/admin/patients", "/admin/appointments", "/admin/home-visits", "/admin/messages"],
  },
  {
    label: "Content",
    routes: [
      "/admin/fitness-content",
      "/admin/blog",
      "/admin/calculators",
      "/admin/media",
      "/admin/gallery",
    ],
  },
  { label: "My workspace", routes: ["/admin/profile"] },
  {
    label: "Administration",
    routes: [
      "/admin/reports",
      "/admin/users",
      "/admin/clinicians",
      "/admin/internships",
      "/admin/internship-applications",
      "/admin/internship-participants",
      "/admin/experience-records",
      "/admin/certificates",
      "/admin/settings",
    ],
  },
] as const;

function useDarkMode() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("painfix-admin-theme");
    const isDark = saved
      ? saved === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
    // Remove admin dark scope when leaving the admin area so the public site stays light.
    return () => document.documentElement.classList.remove("dark");
  }, []);

  const toggle = () => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("painfix-admin-theme", next ? "dark" : "light");
      return next;
    });
  };

  return { dark, toggle };
}

export function AdminShell({ children }: { children: ReactNode }) {
  const { user, isAdmin, isStaff, isProfessional, canEditContent, canAccessPanel, loading } =
    useAdminAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { dark, toggle } = useDarkMode();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface p-8">
        <div className="mx-auto max-w-5xl space-y-4">
          <Skeleton className="h-10 w-56" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Signed in but no panel role assigned yet.
  if (!canAccessPanel) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-4">
        <div className="max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-card">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/10 text-amber-600">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <h1 className="mt-4 font-heading text-xl font-bold text-foreground">Access pending</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account (<span className="font-medium">{user?.email}</span>) is not yet authorised
            for the admin panel. Please ask an administrator to grant you access.
          </p>
          <Button variant="outline" className="mt-6" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
      </div>
    );
  }

  const gatePass: Record<NavItem["gate"], boolean> = {
    staff: isStaff,
    admin: isAdmin,
    content: canEditContent,
    professional: isProfessional,
  };
  const items = NAV.filter((n) => gatePass[n.gate]);
  const navigation = NAV_SECTIONS.map((section) => ({
    ...section,
    items: items.filter((item) => section.routes.some((route) => route === item.to)),
  })).filter((section) => section.items.length > 0);
  const activePage = items.find((item) =>
    item.to === "/admin" ? pathname === item.to : pathname.startsWith(item.to),
  );
  const panelLabel = isAdmin
    ? "Administrator"
    : isStaff
      ? "Staff"
      : isProfessional
        ? "Professional"
        : "Content editor";

  const SidebarInner = (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-5 py-5">
        <div className="flex items-center gap-3">
          <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Activity className="h-5 w-5" />
            <span
              aria-hidden="true"
              className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-secondary"
            />
          </span>
          <div className="min-w-0 leading-tight">
            <p className="font-heading text-base font-semibold tracking-tight text-foreground">
              PainFix Admin
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Clinic workspace
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 border-t border-border/70 pt-3 text-xs font-medium text-muted-foreground">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-secondary" />
          {panelLabel} access
        </div>
      </div>
      <nav aria-label="Admin navigation" className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {navigation.map((section) => (
          <div key={section.label} className="space-y-1">
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/80">
              {section.label}
            </p>
            {section.items.map((item) => {
              const active =
                item.to === "/admin" ? pathname === item.to : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                    active
                      ? "font-semibold text-primary before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-r-full before:bg-secondary"
                      : "font-medium text-foreground/75 hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon
                    aria-hidden="true"
                    className={cn(
                      "h-[18px] w-[18px] shrink-0",
                      active
                        ? "text-secondary"
                        : "text-muted-foreground group-hover:text-foreground",
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="space-y-1 border-t border-border px-3 py-3">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground"
        >
          <ExternalLink className="h-4.5 w-4.5" /> View website
        </a>
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-500/10"
        >
          <LogOut className="h-4.5 w-4.5" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex min-h-[68px] max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 xl:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Activity className="h-5 w-5" />
              <span aria-hidden="true" className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-secondary" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-heading text-base font-semibold tracking-tight text-foreground">PainFix Admin</p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{panelLabel} workspace</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden max-w-[220px] truncate text-sm text-muted-foreground xl:inline">{user?.email}</span>
            <span aria-hidden="true" className="hidden h-6 w-px bg-border xl:block" />
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="outline" size="sm" onClick={signOut} className="hidden sm:inline-flex">
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Button>
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open admin navigation">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <SheetTitle className="sr-only">Admin navigation</SheetTitle>
                {SidebarInner}
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <nav aria-label="Admin navigation" className="hidden border-t border-border/70 lg:block">
          <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-5 gap-y-2 px-4 py-2.5 sm:px-6 xl:px-8">
            {navigation.map((section) => (
              <div key={section.label} className="flex min-w-0 items-center gap-1.5">
                <span className="mr-1 whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground/70">
                  {section.label}
                </span>
                {section.items.map((item) => {
                  const active = item.to === "/admin" ? pathname === item.to : pathname.startsWith(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "inline-flex min-h-9 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        active
                          ? "bg-primary/10 font-semibold text-primary"
                          : "text-foreground/70 hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <item.icon className={cn("h-3.5 w-3.5 shrink-0", active ? "text-secondary" : "text-muted-foreground")} aria-hidden="true" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ))}
            <a href="/" target="_blank" rel="noreferrer" className="ml-auto inline-flex min-h-9 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
              <ExternalLink className="h-3.5 w-3.5" /> Website
            </a>
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 sm:py-7 xl:px-8">
        {activePage && (
          <div className="mb-5 flex items-center justify-between border-b border-border/70 pb-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">PainFix Clinic Workspace</p>
              <h1 className="mt-1 font-heading text-xl font-semibold tracking-tight text-foreground">{activePage.label}</h1>
            </div>
            <span className="hidden rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground sm:inline-flex">{panelLabel}</span>
          </div>
        )}
        <div className="min-w-0">{children}</div>
      </main>
    </div>
  );
}
