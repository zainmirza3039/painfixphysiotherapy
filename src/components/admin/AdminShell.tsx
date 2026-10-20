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
  const panelLabel = isAdmin
    ? "Administrator"
    : isStaff
      ? "Staff"
      : isProfessional
        ? "Professional"
        : "Content editor";

  const SidebarInner = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
          <Activity className="h-5 w-5" />
        </span>
        <div className="leading-tight">
          <p className="font-heading text-sm font-bold text-foreground">PainFix Admin</p>
          <p className="text-[11px] text-muted-foreground">{panelLabel}</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {items.map((item) => {
          const active =
            item.to === "/admin" ? pathname === "/admin" : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-foreground/70 hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
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
    <div className="flex min-h-screen bg-surface">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:block">
        <div className="sticky top-0 h-screen">{SidebarInner}</div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-card/80 px-4 py-3 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                {SidebarInner}
              </SheetContent>
            </Sheet>
            <span className="text-sm font-medium text-muted-foreground">{panelLabel} panel</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <span className="hidden text-sm text-muted-foreground sm:inline">{user?.email}</span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
