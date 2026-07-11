import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Search,
  Download,
  Trash2,
  Home,
  Phone,
  MapPin,
  Eye,
  FileText,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useAdminAuth } from "@/admin/AdminAuthProvider";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { exportToCsv, fmtDate, fmtDateTime } from "@/admin/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
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

export const Route = createFileRoute("/_authenticated/admin/home-visits")({
  component: HomeVisitsPage,
});

type Visit = Database["public"]["Tables"]["home_visit_requests"]["Row"];

const STATUSES = ["new", "contacted", "scheduled", "completed", "cancelled"] as const;

function statusColor(status: string) {
  switch (status) {
    case "scheduled":
      return "bg-secondary/15 text-secondary";
    case "completed":
      return "bg-primary/15 text-primary";
    case "cancelled":
      return "bg-rose-500/15 text-rose-600 dark:text-rose-400";
    case "contacted":
      return "bg-amber-500/15 text-amber-600 dark:text-amber-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function HomeVisitsPage() {
  const { isAdmin } = useAdminAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Visit | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: rows, isLoading } = useQuery({
    queryKey: ["admin", "home-visits"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("home_visit_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (rows ?? []).filter((r) => {
      const status = r.status ?? "new";
      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (!q) return true;
      return [r.full_name, r.phone, r.address, r.medical_condition]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [rows, search, statusFilter]);

  async function updateStatus(v: Visit, status: string) {
    const { error } = await supabase.from("home_visit_requests").update({ status }).eq("id", v.id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin", "home-visits"] });
    qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    toast.success("Status updated");
  }

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("home_visit_requests").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "home-visits"] });
      qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      setDeleteId(null);
      toast.success("Request deleted");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  return (
    <div>
      <AdminPageHeader
        title="Home Visits"
        description="Manage home physiotherapy visit requests."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              exportToCsv(
                "painfix-home-visits",
                filtered.map((v) => ({
                  name: v.full_name,
                  phone: v.phone,
                  address: v.address,
                  age: v.patient_age,
                  condition: v.medical_condition,
                  preferred_date: v.preferred_date,
                  preferred_time: v.preferred_time,
                  status: v.status,
                  created_at: v.created_at,
                })),
              )
            }
            disabled={!filtered.length}
          >
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
            <Home className="h-8 w-8" />
            <p className="text-sm">No home visit requests found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Preferred</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium text-foreground">{v.full_name}</TableCell>
                    <TableCell>{v.phone}</TableCell>
                    <TableCell>{fmtDate(v.preferred_date)}{v.preferred_time ? `, ${v.preferred_time}` : ""}</TableCell>
                    <TableCell className="text-muted-foreground">{fmtDateTime(v.created_at)}</TableCell>
                    <TableCell>
                      <Select value={v.status ?? "new"} onValueChange={(s) => updateStatus(v, s)}>
                        <SelectTrigger className="h-8 w-[130px]">
                          <Badge variant="secondary" className={statusColor(v.status ?? "new")}>{v.status ?? "new"}</Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setSelected(v)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {isAdmin && (
                          <Button variant="ghost" size="icon" className="text-rose-600" onClick={() => setDeleteId(v.id)}>
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

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected?.full_name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <Detail label="Phone" value={selected.phone} />
              <Detail label="Age" value={selected.patient_age != null ? String(selected.patient_age) : "—"} />
              <Detail label="Address" value={selected.address} />
              <Detail label="Maps location" value={selected.maps_location ?? "—"} />
              <Detail label="Medical condition" value={selected.medical_condition ?? "—"} />
              <Detail label="Preferred" value={`${fmtDate(selected.preferred_date)}${selected.preferred_time ? `, ${selected.preferred_time}` : ""}`} />
              <Detail label="Notes" value={selected.notes ?? "—"} />
              <Detail label="Received" value={fmtDateTime(selected.created_at)} />
              <div className="flex flex-wrap gap-2 pt-2">
                <Button asChild size="sm" variant="secondary">
                  <a href={`tel:${selected.phone}`}><Phone className="mr-2 h-4 w-4" /> Call</a>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <a href={`https://wa.me/${selected.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer">
                    WhatsApp
                  </a>
                </Button>
                {selected.maps_location && (
                  <Button asChild size="sm" variant="outline">
                    <a href={selected.maps_location} target="_blank" rel="noreferrer">
                      <MapPin className="mr-2 h-4 w-4" /> Map
                    </a>
                  </Button>
                )}
                {selected.report_url && (
                  <Button asChild size="sm" variant="outline">
                    <a href={selected.report_url} target="_blank" rel="noreferrer">
                      <FileText className="mr-2 h-4 w-4" /> Report
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this request?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-rose-600 hover:bg-rose-700" onClick={() => deleteId && deleteMutation.mutate(deleteId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="w-32 shrink-0 font-medium text-muted-foreground">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
