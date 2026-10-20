import { createFileRoute } from "@tanstack/react-router";
import { AdminOnly } from "@/components/admin/AdminOnly";
import { InternshipAdminPage } from "@/components/admin/internships/InternshipAdminPage";

export const Route = createFileRoute("/_authenticated/admin/certificates")({
  component: () => (
    <AdminOnly>
      <InternshipAdminPage view="certificates" />
    </AdminOnly>
  ),
});
