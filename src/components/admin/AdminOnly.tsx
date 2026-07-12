import type { ReactNode } from "react";
import { ShieldAlert } from "lucide-react";
import { useAdminAuth } from "@/admin/AdminAuthProvider";

export function AdminOnly({ children }: { children: ReactNode }) {
  const { isAdmin } = useAdminAuth();
  if (isAdmin) return <>{children}</>;
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card py-20 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-500/10 text-rose-600">
        <ShieldAlert className="h-6 w-6" />
      </span>
      <h2 className="font-heading text-lg font-bold text-foreground">
        Administrator access required
      </h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        You don't have permission to view this section. Contact an administrator if you need access.
      </p>
    </div>
  );
}
