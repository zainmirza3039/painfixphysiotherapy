import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search, Trash2, MessageSquare, Eye, Mail, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminQueryError } from "@/components/admin/AdminQueryError";
import { rollbackOptimisticList, updateListOptimistically } from "@/admin/optimistic";
import { AdminOnly } from "@/components/admin/AdminOnly";
import { fmtDateTime } from "@/admin/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

export const Route = createFileRoute("/_authenticated/admin/messages")({
  component: () => (
    <AdminOnly>
      <MessagesPage />
    </AdminOnly>
  ),
});

type Message = Database["public"]["Tables"]["contact_submissions"]["Row"];
const STATUSES = ["new", "read", "replied", "archived"] as const;

function statusColor(status: string) {
  switch (status) {
    case "replied":
      return "bg-secondary/15 text-secondary";
    case "read":
      return "bg-primary/15 text-primary";
    case "archived":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-amber-500/15 text-amber-600 dark:text-amber-400";
  }
}

function MessagesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 250);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Message | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: rows, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_submissions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return (rows ?? []).filter((row) => {
      if (statusFilter !== "all" && (row.status ?? "new") !== statusFilter) return false;
      if (!q) return true;
      return [row.name, row.email, row.phone, row.message]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [rows, debouncedSearch, statusFilter]);

  function toggleMessage(id: string, checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function toggleAllMessages(checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      for (const row of filtered) {
        if (checked) next.add(row.id);
        else next.delete(row.id);
      }
      return next;
    });
  }

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("contact_submissions").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onMutate: ({ id, status }) =>
      updateListOptimistically<Message>(qc, ["admin", "messages"], (current) =>
        current.map((message) => (message.id === id ? { ...message, status } : message)),
      ),
    onError: (error, _variables, context) => {
      rollbackOptimisticList(qc, ["admin", "messages"], context);
      toast.error(error instanceof Error ? error.message : "Unable to update message status");
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "messages"] });
      void qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });

  const bulkStatusMutation = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: string }) => {
      const { error } = await supabase
        .from("contact_submissions")
        .update({ status })
        .in("id", ids);
      if (error) throw error;
    },
    onMutate: ({ ids, status }) =>
      updateListOptimistically<Message>(qc, ["admin", "messages"], (current) =>
        current.map((message) => (ids.includes(message.id) ? { ...message, status } : message)),
      ),
    onError: (error, _variables, context) => {
      rollbackOptimisticList(qc, ["admin", "messages"], context);
      toast.error(error instanceof Error ? error.message : "Unable to update selected messages");
    },
    onSuccess: (_data, variables) => {
      setSelectedIds(new Set());
      toast.success(`${variables.ids.length} messages updated`);
    },
    onSettled: () => void qc.invalidateQueries({ queryKey: ["admin", "messages"] }),
  });

  function updateStatus(m: Message, status: string) {
    bulkStatusMutation.reset();
    statusMutation.mutate({ id: m.id, status });
  }

  function openMessage(m: Message) {
    setSelected(m);
    if ((m.status ?? "new") === "new") updateStatus(m, "read");
  }

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contact_submissions").delete().eq("id", id);
      if (error) throw error;
    },
    onMutate: (id) =>
      updateListOptimistically<Message>(qc, ["admin", "messages"], (current) =>
        current.filter((message) => message.id !== id),
      ),
    onError: (error, _id, context) => {
      rollbackOptimisticList(qc, ["admin", "messages"], context);
      toast.error(error instanceof Error ? error.message : "Delete failed");
    },
    onSuccess: () => {
      setDeleteId(null);
      toast.success("Message deleted");
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "messages"] });
      void qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });

  return (
    <div>
      <AdminPageHeader title="Messages" description="Contact form enquiries from your website." />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search messages…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]" aria-label="Filter messages by status">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          <span className="mr-1 text-xs text-muted-foreground" aria-live="polite">
            {selectedIds.size} selected
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={selectedIds.size === 0 || bulkStatusMutation.isPending}
            onClick={() => bulkStatusMutation.mutate({ ids: [...selectedIds], status: "read" })}
          >
            Mark read
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={selectedIds.size === 0 || bulkStatusMutation.isPending}
            onClick={() => bulkStatusMutation.mutate({ ids: [...selectedIds], status: "archived" })}
          >
            Archive
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : isError ? (
          <AdminQueryError onRetry={() => void refetch()} />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
            <MessageSquare className="h-8 w-8" />
            <p className="text-sm">No messages yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      aria-label="Select all visible messages"
                      checked={
                        filtered.length > 0 && filtered.every((row) => selectedIds.has(row.id))
                          ? true
                          : filtered.some((row) => selectedIds.has(row.id))
                            ? "indeterminate"
                            : false
                      }
                      onCheckedChange={(checked) => toggleAllMessages(checked === true)}
                    />
                  </TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((m) => (
                  <TableRow
                    key={m.id}
                    className={(m.status ?? "new") === "new" ? "font-medium" : ""}
                  >
                    <TableCell>
                      <Checkbox
                        aria-label={`Select message from ${m.name}`}
                        checked={selectedIds.has(m.id)}
                        onCheckedChange={(checked) => toggleMessage(m.id, checked === true)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="text-foreground">{m.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {m.email ?? m.phone ?? ""}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[280px] truncate text-muted-foreground">
                      {m.message}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {fmtDateTime(m.created_at)}
                    </TableCell>
                    <TableCell>
                      <Select value={m.status ?? "new"} onValueChange={(s) => updateStatus(m, s)}>
                        <SelectTrigger className="h-8 w-[120px]">
                          <Badge variant="secondary" className={statusColor(m.status ?? "new")}>
                            {m.status ?? "new"}
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
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="View message"
                          onClick={() => openMessage(m)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete message"
                          className="text-rose-600"
                          onClick={() => setDeleteId(m.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <p className="whitespace-pre-wrap rounded-xl bg-muted p-4 text-sm text-foreground">
                {selected.message}
              </p>
              <p className="text-xs text-muted-foreground">
                Received {fmtDateTime(selected.created_at)}
              </p>
              <div className="flex flex-wrap gap-2">
                {selected.email && (
                  <Button asChild size="sm" variant="secondary">
                    <a href={`mailto:${selected.email}`}>
                      <Mail className="mr-2 h-4 w-4" /> Reply by email
                    </a>
                  </Button>
                )}
                {selected.phone && (
                  <Button asChild size="sm" variant="outline">
                    <a href={`tel:${selected.phone}`}>
                      <Phone className="mr-2 h-4 w-4" /> Call
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
            <AlertDialogTitle>Delete this message?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
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
