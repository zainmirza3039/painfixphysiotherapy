import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  Bell,
  Search,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/admin/AdminAuthProvider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

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
  const [commandOpen, setCommandOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    function handleGlobalShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }
    }

    window.addEventListener("keydown", handleGlobalShortcut);
    return () => window.removeEventListener("keydown", handleGlobalShortcut);
  }, []);
  const { data: inboxCounts } = useQuery({
    enabled: isAdmin || isStaff,
    queryKey: ["admin", "inbox-notifications", isAdmin, isStaff],
    queryFn: async () => {
      const [messages, visits] = await Promise.all([
        isAdmin
          ? supabase
              .from("contact_submissions")
              .select("id", { count: "exact", head: true })
              .or("status.is.null,status.eq.new")
          : Promise.resolve(null),
        supabase
          .from("home_visit_requests")
          .select("id", { count: "exact", head: true })
          .or("status.is.null,status.eq.new"),
      ]);
      if (messages?.error) throw messages.error;
      if (visits.error) throw visits.error;
      return { messages: messages?.count ?? 0, visits: visits.count ?? 0 };
    },
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });
  const unreadMessages = inboxCounts?.messages ?? 0;
  const newHomeVisits = inboxCounts?.visits ?? 0;
  const totalNotifications = unreadMessages + newHomeVisits;

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
                  {((item.to === "/admin/messages" && unreadMessages > 0) ||
                    (item.to === "/admin/home-visits" && newHomeVisits > 0)) && (
                    <span
                      aria-label={`${item.to === "/admin/messages" ? unreadMessages : newHomeVisits} new items`}
                      className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold tabular-nums text-white"
                    >
                      {item.to === "/admin/messages" ? unreadMessages : newHomeVisits}
                    </span>
                  )}
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
    <div className="admin-shell min-h-screen bg-surface lg:flex">
      <aside className="sticky top-0 hidden h-screen w-[272px] shrink-0 border-r border-border bg-card lg:block">
        {SidebarInner}
      </aside>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-40 border-b border-border bg-card/95 shadow-sm backdrop-blur">
          <div className="mx-auto flex min-h-[68px] max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 xl:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Activity className="h-5 w-5" />
                <span
                  aria-hidden="true"
                  className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-secondary"
                />
              </span>
              <div className="min-w-0">
                <p className="truncate font-heading text-base font-semibold tracking-tight text-foreground">
                  PainFix Admin
                </p>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {panelLabel} workspace
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCommandOpen(true)}
                className="mr-1 gap-2 text-muted-foreground"
                aria-label="Open command palette"
              >
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Search pages</span>
                <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium sm:inline">
                  ⌘ / Ctrl K
                </kbd>
              </Button>
              <span className="hidden max-w-[220px] truncate text-sm text-muted-foreground xl:inline">
                {user?.email}
              </span>
              {(isAdmin || isStaff) && (
                <Link
                  to={isAdmin ? "/admin/messages" : "/admin/home-visits"}
                  aria-label={
                    totalNotifications > 0
                      ? `${totalNotifications} new clinic notifications`
                      : "Clinic notifications"
                  }
                  title={
                    totalNotifications > 0
                      ? `${totalNotifications} new items`
                      : "No new notifications"
                  }
                  className="relative grid h-9 w-9 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
                  {totalNotifications > 0 && (
                    <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full border-2 border-card bg-rose-500" />
                  )}
                  <span className="sr-only">
                    {totalNotifications > 0
                      ? `${totalNotifications} new notifications`
                      : "No new notifications"}
                  </span>
                </Link>
              )}
              <span aria-hidden="true" className="hidden h-6 w-px bg-border xl:block" />
              <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
                {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="hidden sm:inline-flex"
              >
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </Button>
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    aria-label="Open admin navigation"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="admin-sidebar-sheet w-80 p-0">
                  <SheetTitle className="sr-only">Admin navigation</SheetTitle>
                  {SidebarInner}
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 sm:py-7 xl:px-8">
          <div className="min-w-0">{children}</div>
        </main>
      </div>
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Search admin pages and actions..." />
        <CommandList>
          <CommandEmpty>No matching pages found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {items.map((item) => (
              <CommandItem
                key={item.to}
                value={`${item.label} ${item.to}`}
                onSelect={() => {
                  setCommandOpen(false);
                  setMobileOpen(false);
                  navigate({ to: item.to });
                }}
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                <span>{item.label}</span>
                <span className="ml-auto text-xs text-muted-foreground">{item.to}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
