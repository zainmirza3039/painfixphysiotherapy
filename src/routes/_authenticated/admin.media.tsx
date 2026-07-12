import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Upload, Trash2, Copy, Loader2, Image as ImageIcon, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ContentOnly } from "@/components/admin/ContentOnly";
import { useAdminAuth } from "@/admin/AdminAuthProvider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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

export const Route = createFileRoute("/_authenticated/admin/media")({
  component: () => (
    <ContentOnly>
      <MediaPage />
    </ContentOnly>
  ),
});

interface MediaFile {
  name: string;
  label: string;
  size: number;
  url: string;
  isImage: boolean;
}

function MediaPage() {
  const qc = useQueryClient();
  const { user, isAdmin } = useAdminAuth();
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleteName, setDeleteName] = useState<string | null>(null);

  // Admins manage the shared root; content professionals are scoped to their
  // own private folder so they only ever see and touch their own files.
  const prefix = isAdmin ? "" : (user?.id ?? "");
  const withPrefix = (name: string) => (prefix ? `${prefix}/${name}` : name);

  const { data: files, isLoading } = useQuery({
    queryKey: ["admin", "media", prefix],
    enabled: isAdmin || !!user?.id,
    queryFn: async (): Promise<MediaFile[]> => {
      const { data, error } = await supabase.storage
        .from("media")
        .list(prefix, { limit: 200, sortBy: { column: "created_at", order: "desc" } });
      if (error) throw error;
      const items = (data ?? []).filter((f) => f.id !== null);
      const signed = await Promise.all(
        items.map(async (f) => {
          const fullPath = withPrefix(f.name);
          const { data: s } = await supabase.storage
            .from("media")
            .createSignedUrl(fullPath, 60 * 60 * 24 * 7);
          const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
          return {
            name: fullPath,
            label: f.name,
            size: f.metadata?.size ?? 0,
            url: s?.signedUrl ?? "",
            isImage: ["jpg", "jpeg", "png", "gif", "webp", "svg", "avif"].includes(ext),
          };
        }),
      );
      return signed;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.storage.from("media").remove([name]);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "media"] });
      setDeleteName(null);
      toast.success("File deleted");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    if (!selected.length) return;
    setUploading(true);
    try {
      for (const file of selected) {
        const safe = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
        const { error } = await supabase.storage.from("media").upload(withPrefix(safe), file, {
          cacheControl: "3600",
          upsert: false,
        });
        if (error) throw error;
      }
      toast.success("Upload complete");
      qc.invalidateQueries({ queryKey: ["admin", "media"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Media Library"
        description="Upload and manage images and documents."
        actions={
          <>
            <input
              ref={fileInput}
              type="file"
              multiple
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleUpload}
            />
            <Button size="sm" onClick={() => fileInput.current?.click()} disabled={uploading}>
              {uploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Upload
            </Button>
          </>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : !files?.length ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card py-20 text-muted-foreground">
          <ImageIcon className="h-8 w-8" />
          <p className="text-sm">No media yet. Upload your first file.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {files.map((f) => (
            <MediaCard key={f.name} file={f} onDelete={() => setDeleteName(f.name)} />
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteName} onOpenChange={(o) => !o && setDeleteName(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this file?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700"
              onClick={() => deleteName && deleteMutation.mutate(deleteName)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function MediaCard({ file, onDelete }: { file: MediaFile; onDelete: () => void }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <div className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="grid h-36 place-items-center overflow-hidden bg-muted">
        {file.isImage ? (
          <img
            src={file.url}
            alt={file.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <FileText className="h-10 w-10 text-muted-foreground" />
        )}
      </div>
      <div className="p-3">
        <p className="truncate text-xs font-medium text-foreground" title={file.label}>
          {file.label}
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {(file.size / 1024).toFixed(0)} KB
        </p>
        <div className="mt-2 flex gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 flex-1 text-xs"
            onClick={() => {
              navigator.clipboard.writeText(file.url);
              setCopied(true);
              toast.success("Signed URL copied");
            }}
          >
            <Copy className="mr-1 h-3.5 w-3.5" /> {copied ? "Copied" : "Copy URL"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete file"
            className="h-8 w-8 text-rose-600"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
