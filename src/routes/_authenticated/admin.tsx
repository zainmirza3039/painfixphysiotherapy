import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminAuthProvider } from "@/admin/AdminAuthProvider";
import { AdminShell } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <AdminAuthProvider>
      <AdminShell>
        <Outlet />
      </AdminShell>
    </AdminAuthProvider>
  );
}
