import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2, Loader2, Dumbbell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ContentOnly } from "@/components/admin/ContentOnly";
import { useAdminAuth } from "@/admin/AdminAuthProvider";
import { fmtDate, slugify } from "@/admin/utils";
import {
  FITNESS_CONTENT_TYPES,
  FITNESS_TYPE_LABELS,
  fitnessTypeLabel,
} from "@/lib/fitnessContent";
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

export const Route = createFileRoute("/_authenticated/admin/fitness-content")({
  component: () => (
    <ContentOnly>
      <FitnessContentPage />
    </ContentOnly>
  ),
});

type Row = Database["public"]["Tables"]["fitness_content"]["Row"];

const empty = {
  content_type: "programme",
  title: "",
  slug: "",
  category: "",
  tags: "",
  excerpt: "",
  body: "",
  featured_image: "",
  seo_title: "",
  meta_description: "",
  status: "draft",
  sort_order: "100",
};

function FitnessContentPage() {
  const qc = useQueryClient();
  const { user, isAdmin } = useAdminAuth();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [slugTouched, setSlugTouched] = useState(false);
  const [deleteRow, setDeleteRow] = useState<Row | null>(null);

  const { data: rows, isLoading } = useQuery({
    queryKey: ["admin", "fitness-content"],
    queryFn: async (): Promise<Row[]> => {
      // RLS returns admins everything and authors only their own rows.
      const { data, error } = await supabase
        .from("fitness_content")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = useMemo(() => {
    let list = rows ?? [];
    if (typeFilter !== "all") list = list.filter((r) => r.content_type === typeFilter);
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((r) => r.title.toLowerCase().includes(q));
    return list;
  }, [rows, search, typeFilter]);

  function openNew() {
    setEditing(null);
    setForm({ ...empty });
    setSlugTouched(false);
    setDialogOpen(true);
  }

  function openEdit(row: Row) {
    setEditing(row);
    setForm({
      content_type: row.content_type,
      title: row.title,
      slug: row.slug ?? "",
      category: row.category ?? "",
      tags: (row.tags ?? []).join(", "),
      excerpt: row.excerpt ?? "",
      body: row.body ?? "",
      featured_image: row.featured_image ?? "",
      seo_title: row.seo_title ?? "",
      meta_description: row.meta_description ?? "",
      status: row.status,
      sort_order: String(row.sort_order ?? 100),
    });
    setSlugTouched(true);
    setDialogOpen(true);
  }

  const save = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not signed in");
      const payload = {
        content_type: form.content_type,
        title: form.title.trim(),
        slug: (form.slug.trim() || slugify(form.title)).trim() || null,
        category: form.category.trim() || null,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        excerpt: form.excerpt.trim() || null,
        body: form.body.trim() || null,
        featured_image: form.featured_image.trim() || null,
        seo_title: form.seo_title.trim() || null,
        meta_description: form.meta_description.trim() || null,
        status: form.status,
        sort_order: Number(form.sort_order) || 100,
      };
      if (editing) {
        const { error } = await supabase
          .from("fitness_content")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        // New rows are always owned by the current professional.
        const { error } = await supabase
          .from("fitness_content")
          .insert({ ...payload, author_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "fitness-content"] });
      toast.success(editing ? "Content updated" : "Content created");
      setDialogOpen(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("fitness_content").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "fitness-content"] });
      toast.success("Content deleted");
      setDeleteRow(null);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  return (
    <div>
      <AdminPageHeader
        title="Fitness Content"
        description={
          isAdmin
            ? "Manage all fitness programmes, plans, guides and resources across the platform."
            : "Create and manage your own fitness programmes, plans, guides and resources."
        }
        actions={
          <Button onClick={openNew}>
            <Plus className="mr-2 h-4 w-4" /> New content
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="sm:w-64">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {FITNESS_CONTENT_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {FITNESS_TYPE_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card py-20 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary/10 text-secondary">
            <Dumbbell className="h-6 w-6" />
          </span>
          <p className="font-heading font-semibold text-foreground">No fitness content yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Create your first programme, workout plan or guide. Published items appear on the public
            website.
          </p>
          <Button onClick={openNew} className="mt-2">
            <Plus className="mr-2 h-4 w-4" /> New content
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium text-foreground">{row.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {fitnessTypeLabel(row.content_type)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={row.status === "published" ? "default" : "secondary"}>
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {fmtDate(row.updated_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(row)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-rose-600 hover:text-rose-700"
                      onClick={() => setDeleteRow(row)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit content" : "New content"}</DialogTitle>
          </DialogHeader>
          <form
            id="fitness-content-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!form.title.trim()) return toast.error("Title is required");
              save.mutate();
            }}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Content type</Label>
                <Select
                  value={form.content_type}
                  onValueChange={(v) => setForm((f) => ({ ...f, content_type: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FITNESS_CONTENT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {FITNESS_TYPE_LABELS[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>
                Title <span className="text-rose-500">*</span>
              </Label>
              <Input
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setForm((f) => ({
                    ...f,
                    title,
                    slug: slugTouched ? f.slug : slugify(title),
                  }));
                }}
                placeholder="8-Week Home Strength Programme"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>URL slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setForm((f) => ({ ...f, slug: slugify(e.target.value) }));
                  }}
                  placeholder="home-strength-programme"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  placeholder="Strength, Mobility…"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Short summary / excerpt</Label>
              <Textarea
                rows={2}
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                placeholder="A one or two sentence summary shown in listings."
              />
            </div>

            <div className="space-y-1.5">
              <Label>Body content</Label>
              <Textarea
                rows={7}
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                placeholder="Full details, instructions, sessions, etc."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Featured image URL</Label>
                <Input
                  value={form.featured_image}
                  onChange={(e) => setForm((f) => ({ ...f, featured_image: e.target.value }))}
                  placeholder="https://…"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Tags</Label>
                <Input
                  value={form.tags}
                  onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  placeholder="beginner, home, no-equipment"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>SEO title</Label>
              <Input
                value={form.seo_title}
                onChange={(e) => setForm((f) => ({ ...f, seo_title: e.target.value }))}
                placeholder="Under 60 characters"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Meta description</Label>
              <Textarea
                rows={2}
                value={form.meta_description}
                onChange={(e) => setForm((f) => ({ ...f, meta_description: e.target.value }))}
                placeholder="Under 160 characters"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Sort order</Label>
              <Input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
                placeholder="100"
              />
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="fitness-content-form" disabled={save.isPending}>
              {save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteRow} onOpenChange={(o) => !o && setDeleteRow(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this content?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteRow?.title}" will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700"
              onClick={() => deleteRow && remove.mutate(deleteRow.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
