import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

// Integration-managed protected gate. Client-only because the Supabase session
// lives in localStorage, which the server cannot read. The Supabase client is
// imported dynamically inside beforeLoad so it stays out of the initial bundle
// on public pages — it only loads when an authenticated route is visited.
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/auth" });
    }
    return { user: data.user };
  },
  component: () => <Outlet />,
});
