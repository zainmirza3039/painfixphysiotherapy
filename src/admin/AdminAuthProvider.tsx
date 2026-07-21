import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  ADMIN_ROLES,
  CONTENT_ROLES,
  PANEL_ROLES,
  PROFESSIONAL_ROLES,
  type AppRole,
} from "@/admin/roles";

interface AdminAuthValue {
  user: User | null;
  roles: AppRole[];
  /** admin OR super_admin */
  isAdmin: boolean;
  isSuperAdmin: boolean;
  /** admin/super_admin OR staff — clinical data access */
  isStaff: boolean;
  /** a clinical / wellness professional (physio, dietitian, fitness) */
  isProfessional: boolean;
  /** allowed to author & manage their own blog content */
  canEditContent: boolean;
  /** allowed into the admin/portal area at all */
  canAccessPanel: boolean;
  loading: boolean;
  hasRole: (role: AppRole) => boolean;
  hasAnyRole: (roles: AppRole[]) => boolean;
  refresh: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const {
      data: { user: current },
    } = await supabase.auth.getUser();
    setUser(current ?? null);

    if (!current) {
      setRoles([]);
      setLoading(false);
      return;
    }

    let { data: rows } = await supabase.from("user_roles").select("role").eq("user_id", current.id);

    // First-login bootstrap: grants admin ONLY to the designated owner email.
    if (!rows || rows.length === 0) {
      await supabase.rpc("bootstrap_admin");
      const res = await supabase.from("user_roles").select("role").eq("user_id", current.id);
      rows = res.data;
    }

    setRoles((rows ?? []).map((r) => r.role as AppRole));
    setLoading(false);
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  const hasRole = (role: AppRole) => roles.includes(role);
  const hasRole = (role: AppRole) => roles.includes(role);
  const hasAnyRole = (list: AppRole[]) => list.some((r) => roles.includes(r));

  const isAdmin = hasAnyRole(ADMIN_ROLES);
  const isSuperAdmin = hasRole("super_admin");
  const isStaff = isAdmin || hasRole("staff");
  const isProfessional = hasAnyRole(PROFESSIONAL_ROLES);
  const canEditContent = hasAnyRole(CONTENT_ROLES);
  const canAccessPanel = hasAnyRole(PANEL_ROLES);

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        roles,
        isAdmin,
        isSuperAdmin,
        isStaff,
        isProfessional,
        canEditContent,
        canAccessPanel,
        loading,
        hasRole,
        hasAnyRole,
        refresh: load,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
