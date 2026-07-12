import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search, Trash2, MessageSquare, Eye, Mail, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminOnly } from "@/components/admin/AdminOnly";
import { fmtDateTime } from "@/admin/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [selected, setSelected] = useState<Message | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: rows, isLoading } = useQuery({
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
    const q = search.trim().toLowerCase();
    if (!q) return rows ?? [];
    return (rows ?? []).filter((r) =>
      [r.name, r.email, r.phone, r.message]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [rows, search]);

  async function updateStatus(m: Message, status: string) {
    const { error } = await supabase.from("contact_submissions").update({ status }).eq("id", m.id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin", "messages"] });
    qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "messages"] });
      qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      setDeleteId(null);
      toast.success("Message deleted");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  return (
    <div>
      <AdminPageHeader title="Messages" description="Contact form enquiries from your website." />

      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search messages…"
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
            <MessageSquare className="h-8 w-8" />
            <p className="text-sm">No messages yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
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
