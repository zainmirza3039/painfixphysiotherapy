import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "staff";

interface AdminAuthValue {
  user: User | null;
  roles: AppRole[];
  isAdmin: boolean;
  isStaff: boolean; // admin OR staff
  loading: boolean;
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

    let { data: rows } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", current.id);

    // First-login bootstrap: grants admin ONLY to the designated owner email.
    if (!rows || rows.length === 0) {
      await supabase.rpc("bootstrap_admin");
      const res = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", current.id);
      rows = res.data;
    }

    setRoles((rows ?? []).map((r) => r.role as AppRole));
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const isAdmin = roles.includes("admin");
  const isStaff = isAdmin || roles.includes("staff");

  return (
    <AdminAuthContext.Provider
      value={{ user, roles, isAdmin, isStaff, loading, refresh: load }}
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
