import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, ShieldCheck, Mail, X } from "lucide-react";
import { useAdminAuth } from "@/admin/AdminAuthProvider";
import { APP_ROLES, ROLE_LABELS, ROLE_DESCRIPTIONS, type AppRole } from "@/admin/roles";
import {
  listAdminUsers,
  createStaffUser,
  setUserRole,
  deleteStaffUser,
  type AdminUserRow,
} from "@/admin/admin.functions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminOnly } from "@/components/admin/AdminOnly";
import { fmtDateTime } from "@/admin/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: () => (
    <AdminOnly>
      <UsersPage />
    </AdminOnly>
  ),
});

function UsersPage() {
  const { user } = useAdminAuth();
  const qc = useQueryClient();
  const list = useServerFn(listAdminUsers);
  const create = useServerFn(createStaffUser);
  const setRole = useServerFn(setUserRole);
  const remove = useServerFn(deleteStaffUser);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "clinical_physiotherapist" as AppRole,
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => list(),
  });

  const createMutation = useMutation({
    mutationFn: () => create({ data: form }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      setDialogOpen(false);
      setForm({ email: "", password: "", role: "clinical_physiotherapist" });
      toast.success("Team member created");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Create failed"),
  });

  const roleMutation = useMutation({
    mutationFn: (vars: { userId: string; role: AppRole; enabled: boolean }) =>
      setRole({ data: vars }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("Roles updated");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => remove({ data: { userId } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      setDeleteId(null);
      toast.success("User removed");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  return (
    <div>
      <AdminPageHeader
        title="Team & Roles"
        description="Create team accounts and assign one or more roles to control access."
        actions={
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add team member
          </Button>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Last sign-in</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(users ?? []).map((u: AdminUserRow) => {
                  const isSelf = u.id === user?.id;
                  const userRoles = u.roles as AppRole[];
                  const available = APP_ROLES.filter((r) => !userRoles.includes(r));
                  return (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-2 font-medium text-foreground">
                          <Mail className="h-4 w-4 text-muted-foreground" /> {u.email}
                          {isSelf && (
                            <Badge variant="secondary" className="bg-primary/15 text-primary">
                              You
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {fmtDateTime(u.last_sign_in_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {userRoles.length === 0 && (
                            <span className="text-xs text-muted-foreground">No roles</span>
                          )}
                          {userRoles.map((r) => {
                            // Prevent removing your own admin/super_admin (lock-out guard).
                            const locked = isSelf && (r === "admin" || r === "super_admin");
                            return (
                              <Badge
                                key={r}
                                variant="secondary"
                                className="gap-1 bg-secondary/12 text-secondary"
                              >
                                {ROLE_LABELS[r] ?? r}
                                {!locked && (
                                  <button
                                    type="button"
                                    aria-label={`Remove ${ROLE_LABELS[r] ?? r} role`}
                                    className="rounded-full hover:text-rose-600"
                                    disabled={roleMutation.isPending}
                                    onClick={() =>
                                      roleMutation.mutate({ userId: u.id, role: r, enabled: false })
                                    }
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                )}
                              </Badge>
                            );
                          })}
                          {available.length > 0 && (
                            <Select
                              value=""
                              onValueChange={(v) =>
                                roleMutation.mutate({
                                  userId: u.id,
                                  role: v as AppRole,
                                  enabled: true,
                                })
                              }
                            >
                              <SelectTrigger className="h-7 w-[130px] text-xs">
                                <SelectValue placeholder="+ Add role" />
                              </SelectTrigger>
                              <SelectContent>
                                {available.map((r) => (
                                  <SelectItem key={r} value={r}>
                                    {ROLE_LABELS[r]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete user"
                          className="text-rose-600"
                          disabled={isSelf}
                          onClick={() => setDeleteId(u.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5" /> Super Admins &amp; Admins have full access. Staff
        manage patients, appointments and home visits. Professionals &amp; Content Editors manage
        their own profile and articles.
      </p>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add team member</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (form.password.length < 8)
                return toast.error("Password must be at least 8 characters");
              createMutation.mutate();
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Temporary password</Label>
              <Input
                type="text"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm({ ...form, role: v as AppRole })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APP_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[form.role]}</p>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this team member?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes their account and access. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
