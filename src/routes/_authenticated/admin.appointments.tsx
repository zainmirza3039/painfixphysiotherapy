import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Search, Download, Pencil, Loader2, CalendarClock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { exportToCsv, fmtDateTime } from "@/admin/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export const Route = createFileRoute("/_authenticated/admin/appointments")({
  component: AppointmentsPage,
});

type Appointment = Database["public"]["Tables"]["appointments"]["Row"];

const STATUSES = ["pending", "confirmed", "completed", "cancelled", "no-show"] as const;

const empty = {
  patient_name: "",
  phone: "",
  email: "",
  service: "",
  appointment_at: "",
  assigned_therapist: "",
  status: "pending",
  notes: "",
};

function statusColor(status: string) {
  switch (status) {
    case "confirmed":
      return "bg-secondary/15 text-secondary";
    case "completed":
      return "bg-primary/15 text-primary";
    case "cancelled":
    case "no-show":
      return "bg-rose-500/15 text-rose-600 dark:text-rose-400";
    default:
      return "bg-amber-500/15 text-amber-600 dark:text-amber-400";
  }
}

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(+d)) return "";
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

function AppointmentsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [form, setForm] = useState({ ...empty });

  const { data: rows, isLoading } = useQuery({
    queryKey: ["admin", "appointments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .order("appointment_at", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (rows ?? []).filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      return [r.patient_name, r.phone, r.service, r.assigned_therapist]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [rows, search, statusFilter]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        patient_name: form.patient_name.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        service: form.service.trim() || null,
        appointment_at: form.appointment_at ? new Date(form.appointment_at).toISOString() : null,
        assigned_therapist: form.assigned_therapist.trim() || null,
        status: form.status,
        notes: form.notes.trim() || null,
        source: editing?.source ?? "admin",
      };
      if (editing) {
        const { error } = await supabase.from("appointments").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("appointments").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "appointments"] });
      qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      setDialogOpen(false);
      toast.success(editing ? "Appointment updated" : "Appointment created");
    },
    onError: (e) => {
      // Extract Supabase error details
      const error =
        e && typeof e === "object"
          ? (e as { code?: string; message?: string; details?: string; hint?: string })
          : {};
      const errorCode = error?.code || "UNKNOWN";
      const errorMessage = error?.message || String(e);
      const errorDetails = error?.details || "";
      const errorHint = error?.hint || "";

      // Log comprehensive error to console for debugging
      console.error("[APPOINTMENT SAVE ERROR]", {
        code: errorCode,
        message: errorMessage,
        details: errorDetails,
        hint: errorHint,
        fullError: error,
      });

      // Build user-friendly error message
      let displayMessage = errorMessage;

      if (errorDetails) {
        displayMessage = errorDetails;
      } else if (errorHint) {
        displayMessage = errorHint;
      } else if (errorCode === "PGRST301") {
        displayMessage = "Permission denied. You may not have staff/admin access.";
      } else if (!displayMessage || displayMessage === "null") {
        displayMessage = "Save failed";
      }

      // Show error to user
      toast.error(displayMessage);
    },
  });

  async function quickStatus(a: Appointment, status: string) {
    const { error } = await supabase.from("appointments").update({ status }).eq("id", a.id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin", "appointments"] });
    qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    toast.success("Status updated");
  }

  function openNew() {
    setEditing(null);
    setForm({ ...empty });
    setDialogOpen(true);
  }

  function openEdit(a: Appointment) {
    setEditing(a);
    setForm({
      patient_name: a.patient_name ?? "",
      phone: a.phone ?? "",
      email: a.email ?? "",
      service: a.service ?? "",
      appointment_at: toLocalInput(a.appointment_at),
      assigned_therapist: a.assigned_therapist ?? "",
      status: a.status ?? "pending",
      notes: a.notes ?? "",
    });
    setDialogOpen(true);
  }

  return (
    <div>
      <AdminPageHeader
        title="Appointments"
        description="Schedule, confirm and track patient appointments."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                exportToCsv(
                  "painfix-appointments",
                  filtered.map((a) => ({
                    patient: a.patient_name,
                    phone: a.phone,
                    service: a.service,
                    appointment_at: a.appointment_at,
                    therapist: a.assigned_therapist,
                    status: a.status,
                    source: a.source,
                  })),
                )
              }
              disabled={!filtered.length}
            >
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button size="sm" onClick={openNew}>
              <Plus className="mr-2 h-4 w-4" /> New appointment
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
            <CalendarClock className="h-8 w-8" />
            <p className="text-sm">No appointments found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>When</TableHead>
                  <TableHead>Therapist</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div className="font-medium text-foreground">{a.patient_name}</div>
                      <div className="text-xs text-muted-foreground">{a.phone ?? ""}</div>
                    </TableCell>
                    <TableCell>{a.service ?? "—"}</TableCell>
                    <TableCell>{fmtDateTime(a.appointment_at)}</TableCell>
                    <TableCell>{a.assigned_therapist ?? "—"}</TableCell>
                    <TableCell>
                      <Select value={a.status} onValueChange={(v) => quickStatus(a, v)}>
                        <SelectTrigger className="h-8 w-[130px]">
                          <Badge variant="secondary" className={statusColor(a.status)}>
                            {a.status}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Edit appointment"
                        onClick={() => openEdit(a)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit appointment" : "New appointment"}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!form.patient_name.trim()) return toast.error("Patient name is required");
              saveMutation.mutate();
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label>
                Patient name <span className="text-rose-500">*</span>
              </Label>
              <Input
                value={form.patient_name}
                onChange={(e) => setForm({ ...form, patient_name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Service</Label>
                <Input
                  value={form.service}
                  onChange={(e) => setForm({ ...form, service: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Therapist</Label>
                <Input
                  value={form.assigned_therapist}
                  onChange={(e) => setForm({ ...form, assigned_therapist: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Date & time</Label>
                <Input
                  type="datetime-local"
                  value={form.appointment_at}
                  onChange={(e) => setForm({ ...form, appointment_at: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
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
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editing ? "Save changes" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
