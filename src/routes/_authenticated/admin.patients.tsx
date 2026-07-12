import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Search, Download, Pencil, Trash2, Loader2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useAdminAuth } from "@/admin/AdminAuthProvider";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { exportToCsv, fmtDate } from "@/admin/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

export const Route = createFileRoute("/_authenticated/admin/patients")({
  component: PatientsPage,
});

type Patient = Database["public"]["Tables"]["patients"]["Row"];

const STATUSES = ["active", "recovering", "discharged", "on-hold"] as const;

const empty = {
  name: "",
  phone: "",
  email: "",
  age: "",
  gender: "",
  address: "",
  medical_condition: "",
  diagnosis: "",
  treatment_plan: "",
  assigned_physiotherapist: "",
  follow_up_date: "",
  status: "active",
  notes: "",
};

function statusColor(status: string) {
  switch (status) {
    case "active":
      return "bg-secondary/15 text-secondary";
    case "recovering":
      return "bg-amber-500/15 text-amber-600 dark:text-amber-400";
    case "discharged":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-primary/15 text-primary";
  }
}

function PatientsPage() {
  const { isAdmin } = useAdminAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: patients, isLoading } = useQuery({
    queryKey: ["admin", "patients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return patients ?? [];
    return (patients ?? []).filter((p) =>
      [p.name, p.phone, p.patient_code, p.diagnosis, p.assigned_physiotherapist]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [patients, search]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        age: form.age ? Number(form.age) : null,
        gender: form.gender || null,
        address: form.address.trim() || null,
        medical_condition: form.medical_condition.trim() || null,
        diagnosis: form.diagnosis.trim() || null,
        treatment_plan: form.treatment_plan.trim() || null,
        assigned_physiotherapist: form.assigned_physiotherapist.trim() || null,
        follow_up_date: form.follow_up_date || null,
        status: form.status,
        notes: form.notes.trim() || null,
      };
      if (editing) {
        const { error } = await supabase.from("patients").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("patients").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "patients"] });
      qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      setDialogOpen(false);
      toast.success(editing ? "Patient updated" : "Patient added");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("patients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "patients"] });
      qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      setDeleteId(null);
      toast.success("Patient deleted");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  function openNew() {
    setEditing(null);
    setForm({ ...empty });
    setDialogOpen(true);
  }

  function openEdit(p: Patient) {
    setEditing(p);
    setForm({
      name: p.name ?? "",
      phone: p.phone ?? "",
      email: p.email ?? "",
      age: p.age != null ? String(p.age) : "",
      gender: p.gender ?? "",
      address: p.address ?? "",
      medical_condition: p.medical_condition ?? "",
      diagnosis: p.diagnosis ?? "",
      treatment_plan: p.treatment_plan ?? "",
      assigned_physiotherapist: p.assigned_physiotherapist ?? "",
      follow_up_date: p.follow_up_date ?? "",
      status: p.status ?? "active",
      notes: p.notes ?? "",
    });
    setDialogOpen(true);
  }

  function handleExport() {
    exportToCsv(
      "painfix-patients",
      (filtered ?? []).map((p) => ({
        patient_code: p.patient_code,
        name: p.name,
        phone: p.phone,
        email: p.email,
        age: p.age,
        gender: p.gender,
        status: p.status,
        diagnosis: p.diagnosis,
        physiotherapist: p.assigned_physiotherapist,
        follow_up_date: p.follow_up_date,
        created_at: p.created_at,
      })),
    );
  }

  return (
    <div>
      <AdminPageHeader
        title="Patients"
        description="Manage patient records, diagnoses and treatment plans."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={!filtered.length}>
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button size="sm" onClick={openNew}>
              <Plus className="mr-2 h-4 w-4" /> Add patient
            </Button>
          </>
        }
      />

      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search name, phone, code…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
            <Users className="h-8 w-8" />
            <p className="text-sm">No patients found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Physiotherapist</TableHead>
                  <TableHead>Follow-up</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {p.patient_code}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{p.name}</TableCell>
                    <TableCell>{p.phone ?? "—"}</TableCell>
                    <TableCell className="max-w-[180px] truncate">{p.diagnosis ?? "—"}</TableCell>
                    <TableCell>{p.assigned_physiotherapist ?? "—"}</TableCell>
                    <TableCell>{fmtDate(p.follow_up_date)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusColor(p.status)}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Edit patient"
                          onClick={() => openEdit(p)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Delete patient"
                            className="text-rose-600 hover:text-rose-700"
                            onClick={() => setDeleteId(p.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit patient" : "Add patient"}</DialogTitle>
            <DialogDescription>
              {editing ? `Editing ${editing.patient_code}` : "Create a new patient record."}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!form.name.trim()) return toast.error("Name is required");
              saveMutation.mutate();
            }}
            className="grid gap-4 sm:grid-cols-2"
          >
            <Field label="Full name" required>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </Field>
            <Field label="Phone">
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Age">
                <Input
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                />
              </Field>
              <Field label="Gender">
                <Select
                  value={form.gender || undefined}
                  onValueChange={(v) => setForm({ ...form, gender: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Assigned physiotherapist">
              <Input
                value={form.assigned_physiotherapist}
                onChange={(e) => setForm({ ...form, assigned_physiotherapist: e.target.value })}
              />
            </Field>
            <Field label="Status">
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Follow-up date">
              <Input
                type="date"
                value={form.follow_up_date}
                onChange={(e) => setForm({ ...form, follow_up_date: e.target.value })}
              />
            </Field>
            <Field label="Address" full>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </Field>
            <Field label="Medical condition" full>
              <Input
                value={form.medical_condition}
                onChange={(e) => setForm({ ...form, medical_condition: e.target.value })}
              />
            </Field>
            <Field label="Diagnosis" full>
              <Textarea
                rows={2}
                value={form.diagnosis}
                onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
              />
            </Field>
            <Field label="Treatment plan" full>
              <Textarea
                rows={2}
                value={form.treatment_plan}
                onChange={(e) => setForm({ ...form, treatment_plan: e.target.value })}
              />
            </Field>
            <Field label="Notes" full>
              <Textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </Field>
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editing ? "Save changes" : "Add patient"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this patient?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the patient record. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Field({
  label,
  children,
  required,
  full,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  full?: boolean;
}) {
  return (
    <div className={`space-y-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <Label>
        {label} {required && <span className="text-rose-500">*</span>}
      </Label>
      {children}
    </div>
  );
}
