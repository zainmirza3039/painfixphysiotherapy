import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import {
  Activity, ArrowUpRight, BarChart3, Bell, BookOpen, CalendarClock, Calculator,
  ChevronRight, Dumbbell, ExternalLink, FileImage, Home, LayoutDashboard, LogOut,
  Menu, MessageSquare, Moon, Newspaper, Search, Settings, ShieldCheck, Sun,
  Stethoscope, UserCircle, Users, X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/admin/AdminAuthProvider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";

type Gate = "staff" | "admin" | "content" | "professional";
interface NavItem { to: string; label: string; icon: LucideIcon; gate: Gate; }
const NAV: NavItem[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, gate: "staff" },
  { to: "/admin/personal-patients", label: "Personal patient ledger", icon: UserCircle, gate: "staff" },
  { to: "/admin/patients", label: "Clinic patients", icon: Users, gate: "staff" },
  { to: "/admin/appointments", label: "Appointments", icon: CalendarClock, gate: "staff" },
  { to: "/admin/home-visits", label: "Home visits", icon: Home, gate: "staff" },
  { to: "/admin/messages", label: "Enquiries", icon: MessageSquare, gate: "admin" },
  { to: "/admin/profile", label: "My profile", icon: UserCircle, gate: "professional" },
  { to: "/admin/fitness-content", label: "Fitness content", icon: Dumbbell, gate: "content" },
  { to: "/admin/blog", label: "Blog & articles", icon: Newspaper, gate: "content" },
  { to: "/admin/calculators", label: "Calculators", icon: Calculator, gate: "content" },
  { to: "/admin/media", label: "Media library", icon: FileImage, gate: "content" },
  { to: "/admin/gallery", label: "Website gallery", icon: FileImage, gate: "admin" },
  { to: "/admin/reports", label: "Reports", icon: BarChart3, gate: "admin" },
  { to: "/admin/users", label: "Team & permissions", icon: ShieldCheck, gate: "admin" },
  { to: "/admin/clinicians", label: "Clinician profiles", icon: Stethoscope, gate: "admin" },
  { to: "/admin/internships", label: "Internship programs", icon: BookOpen, gate: "admin" },
  { to: "/admin/internship-applications", label: "Applications", icon: Users, gate: "admin" },
  { to: "/admin/internship-participants", label: "Participants", icon: CalendarClock, gate: "admin" },
  { to: "/admin/experience-records", label: "Experience records", icon: UserCircle, gate: "admin" },
  { to: "/admin/certificates", label: "Certificates", icon: ShieldCheck, gate: "admin" },
  { to: "/admin/settings", label: "Settings", icon: Settings, gate: "admin" },
];
const SECTIONS = [
  { label: "Workspace", routes: ["/admin"] },
  { label: "Patient care", routes: ["/admin/personal-patients", "/admin/patients", "/admin/appointments", "/admin/home-visits"] },
  { label: "Communication", routes: ["/admin/messages"] },
  { label: "Publishing", routes: ["/admin/fitness-content", "/admin/blog", "/admin/calculators", "/admin/media", "/admin/gallery"] },
  { label: "Administration", routes: ["/admin/reports", "/admin/users", "/admin/clinicians", "/admin/internships", "/admin/internship-applications", "/admin/internship-participants", "/admin/experience-records", "/admin/certificates", "/admin/settings", "/admin/profile"] },
] as const;

function useDarkMode() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("painfix-admin-theme");
    const next = saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    return () => document.documentElement.classList.remove("dark");
  }, []);
  const toggle = () => setDark((previous) => {
    const next = !previous;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("painfix-admin-theme", next ? "dark" : "light");
    return next;
  });
  return { dark, toggle };
}

export function AdminShell({ children }: { children: ReactNode }) {
  const { user, isAdmin, isStaff, isProfessional, canEditContent, canAccessPanel, loading } = useAdminAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { dark, toggle } = useDarkMode();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const { data: inboxCounts } = useQuery({
    enabled: isAdmin || isStaff,
    queryKey: ["admin", "inbox-notifications", isAdmin, isStaff],
    queryFn: async () => {
      const [messages, visits] = await Promise.all([
        isAdmin ? supabase.from("contact_submissions").select("id", { count: "exact", head: true }).or("status.is.null,status.eq.new") : Promise.resolve(null),
        supabase.from("home_visit_requests").select("id", { count: "exact", head: true }).or("status.is.null,status.eq.new"),
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

  if (loading) return (
    <div className="min-h-screen bg-[#f4f7f6] p-6 dark:bg-[#0b1723]">
      <div className="mx-auto max-w-6xl space-y-5">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
        <Skeleton className="h-72 w-full" />
      </div>
    </div>
  );

  if (!canAccessPanel) return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f7f6] px-4 dark:bg-[#0b1723]">
      <div className="max-w-md border border-border bg-card p-8 text-center shadow-sm">
        <ShieldCheck className="mx-auto h-9 w-9 text-secondary" />
        <h1 className="mt-4 text-xl font-semibold text-foreground">Access pending</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Your account ({user?.email}) is not yet authorised for the admin workspace. Please ask an administrator to grant access.</p>
        <Button variant="outline" className="mt-6" onClick={signOut}><LogOut className="mr-2 h-4 w-4" /> Sign out</Button>
      </div>
    </div>
  );

  const gatePass: Record<Gate, boolean> = { staff: isStaff, admin: isAdmin, content: canEditContent, professional: isProfessional };
  const items = NAV.filter((item) => gatePass[item.gate]);
  const sections = SECTIONS.map((section) => ({ ...section, items: items.filter((item) => section.routes.includes(item.to as never)) })).filter((section) => section.items.length);
  const activePage = items.find((item) => item.to === "/admin" ? pathname === item.to : pathname.startsWith(item.to));
  const panelLabel = isAdmin ? "Administrator" : isStaff ? "Clinic staff" : isProfessional ? "Clinician" : "Content editor";
  const notificationTarget = isAdmin ? "/admin/messages" : "/admin/home-visits";

  const sidebar = (
    <div className="admin-sidebar__inner">
      <div className="admin-brand">
        <div className="admin-brand__mark"><Activity className="h-5 w-5" /></div>
        <div className="min-w-0">
          <p className="admin-brand__name">PainFix</p>
          <p className="admin-brand__caption">CLINIC WORKSPACE</p>
        </div>
      </div>
      <div className="admin-sidebar__identity">
        <span className="admin-sidebar__online" />
        <span>{panelLabel} access</span>
      </div>
      <nav aria-label="Admin navigation" className="admin-sidebar__nav">
        {sections.map((section) => (
          <div className="admin-nav-section" key={section.label}>
            <p className="admin-nav-section__label">{section.label}</p>
            {section.items.map((item) => {
              const active = item.to === "/admin" ? pathname === item.to : pathname.startsWith(item.to);
              const count = item.to === "/admin/messages" ? unreadMessages : item.to === "/admin/home-visits" ? newHomeVisits : 0;
              return (
                <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)} aria-current={active ? "page" : undefined} className="admin-nav-link">
                  <item.icon className="admin-nav-link__icon" aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {count > 0 && <span className="admin-nav-link__count">{count}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="admin-sidebar__footer">
        <a href="/" target="_blank" rel="noreferrer" className="admin-sidebar__footer-link"><ExternalLink className="h-4 w-4" /> View website <ArrowUpRight className="ml-auto h-3.5 w-3.5" /></a>
        <button type="button" onClick={signOut} className="admin-sidebar__footer-link admin-sidebar__signout"><LogOut className="h-4 w-4" /> Sign out</button>
        <div className="admin-user-chip">
          <span className="admin-user-chip__avatar">{(user?.email?.[0] ?? "U").toUpperCase()}</span>
          <span className="min-w-0 flex-1"><span className="admin-user-chip__name">{user?.email?.split("@")[0] ?? "Workspace user"}</span><span className="admin-user-chip__role">{panelLabel}</span></span>
          <ChevronRight className="h-4 w-4 text-white/40" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-shell min-h-screen lg:flex">
      <aside className="admin-sidebar hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[252px] lg:shrink-0">{sidebar}</aside>
      <div className="admin-workspace min-w-0 flex-1">
        <header className="admin-topbar sticky top-0 z-40">
          <div className="admin-topbar__inner">
            <div className="flex min-w-0 items-center gap-3">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild><Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation"><Menu className="h-5 w-5" /></Button></SheetTrigger>
                <SheetContent side="left" className="admin-sidebar-sheet w-[290px] border-0 bg-[#062d52] p-0 text-white">
                  <SheetTitle className="sr-only">PainFix navigation</SheetTitle>{sidebar}
                </SheetContent>
              </Sheet>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground"><span>PAINFIX</span><span className="text-border">/</span><span>WORKSPACE</span></div>
                <p className="truncate text-[15px] font-semibold tracking-tight text-foreground">{activePage?.label ?? "Workspace"}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setCommandOpen(true)} className="admin-search-trigger hidden gap-2 sm:inline-flex"><Search className="h-4 w-4" /><span>Search workspace</span><kbd>⌘ K</kbd></Button>
              <Button type="button" variant="ghost" size="icon" className="sm:hidden" onClick={() => setCommandOpen(true)} aria-label="Search workspace"><Search className="h-4 w-4" /></Button>
              {(isAdmin || isStaff) && <Link to={notificationTarget} className="admin-icon-button relative" aria-label={totalNotifications ? totalNotifications + " new notifications" : "Notifications"}><Bell className="h-[18px] w-[18px]" />{totalNotifications > 0 && <span className="admin-notification-dot" />}</Link>}
              <Button variant="ghost" size="icon" className="admin-icon-button" onClick={toggle} aria-label="Toggle theme">{dark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}</Button>
              <span className="admin-topbar__email hidden xl:block">{user?.email}</span>
            </div>
          </div>
        </header>
        <main className="admin-main"><div className="mx-auto w-full max-w-[1500px]">{children}</div></main>
      </div>
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Find a page..." />
        <CommandList>
          <CommandEmpty>No matching pages found.</CommandEmpty>
          <CommandGroup heading="Workspace navigation">
            {items.map((item) => <CommandItem key={item.to} value={item.label + " " + item.to} onSelect={() => { setCommandOpen(false); setMobileOpen(false); navigate({ to: item.to }); }}><item.icon className="h-4 w-4" /><span>{item.label}</span><span className="ml-auto text-xs text-muted-foreground">{item.to}</span></CommandItem>)}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
