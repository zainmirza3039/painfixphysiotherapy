import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Upload, Trash2, Copy, Loader2, Image as ImageIcon, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { rollbackOptimisticList, updateListOptimistically } from "@/admin/optimistic";
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

async function convertImageToWebP(file: File): Promise<File> {
  if (!["image/jpeg", "image/png"].includes(file.type)) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  try {
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext("2d");
    if (!context) return file;

    context.drawImage(bitmap, 0, 0);
    const webpBlob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.82),
    );

    // Keep the source when WebP does not provide a meaningful saving.
    if (!webpBlob || webpBlob.size >= file.size * 0.92) return file;

    const webpName = file.name.replace(/\.(jpe?g|png)$/i, ".webp");
    return new File([webpBlob], webpName, {
      type: "image/webp",
      lastModified: file.lastModified,
    });
  } finally {
    bitmap.close();
  }
}

function MediaPage() {
  const qc = useQueryClient();
  const { user, isAdmin } = useAdminAuth();
  const { data: galleryPaths = [] } = useQuery({
    queryKey: ["admin", "site-gallery"],
    enabled: isAdmin,
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase.from("site_gallery").select("storage_path");
      if (error) throw error;
      return (data ?? []).map((item) => item.storage_path);
    },
  });
  const galleryPathSet = new Set(galleryPaths);

  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleteName, setDeleteName] = useState<string | null>(null);

  // Admins manage the shared root; content professionals are scoped to their
  // own folder. This bucket contains public website assets only.
  const prefix = isAdmin ? "" : (user?.id ?? "");
  const withPrefix = (name: string) => (prefix ? `${prefix}/${name}` : name);

  const {
    data: files,
    isLoading,
    error: filesError,
    refetch,
  } = useQuery({
    queryKey: ["admin", "media", prefix],
    enabled: isAdmin || !!user?.id,
    queryFn: async (): Promise<MediaFile[]> => {
      const { data, error } = await supabase.storage
        .from("site-media")
        .list(prefix, { limit: 200, sortBy: { column: "created_at", order: "desc" } });
      if (error) throw error;
      const items = (data ?? []).filter((f) => f.id !== null);
      const mediaFiles = await Promise.all(
        items.map(async (f) => {
          const fullPath = withPrefix(f.name);
          const { data: publicAsset } = supabase.storage.from("site-media").getPublicUrl(fullPath);
          const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
          return {
            name: fullPath,
            label: f.name,
            size: f.metadata?.size ?? 0,
            url: publicAsset.publicUrl,
            isImage: ["jpg", "jpeg", "png", "gif", "webp", "avif"].includes(ext),
          };
        }),
      );
      return mediaFiles;
    },
  });

  const optimizeMutation = useMutation({
    mutationFn: async (file: MediaFile) => {
      const response = await fetch(file.url);
      if (!response.ok) throw new Error(`Unable to read ${file.label}`);

      const source = new File([await response.blob()], file.label, {
        type: file.label.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg",
      });
      const optimized = await convertImageToWebP(source);

      if (optimized === source) {
        return { optimized: false, savedBytes: 0 };
      }

      const baseName = optimized.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const objectPath = withPrefix(`${crypto.randomUUID()}-${baseName}`);
      const { error: uploadError } = await supabase.storage
        .from("site-media")
        .upload(objectPath, optimized, {
          cacheControl: "31536000",
          contentType: "image/webp",
          upsert: false,
        });
      if (uploadError) throw uploadError;

      const { data: updatedRows, error: updateError } = await supabase
        .from("site_gallery")
        .update({ storage_path: objectPath })
        .eq("storage_path", file.name)
        .select("id");

      if (updateError || !updatedRows?.length) {
        await supabase.storage.from("site-media").remove([objectPath]);
        if (updateError) throw updateError;
        throw new Error("This file is no longer linked to the website gallery. No changes were kept.");
      }

      return { optimized: true, savedBytes: source.size - optimized.size };
    },
    onSuccess: async (result) => {
      if (result.optimized) {
        toast.success(
          `WebP created. Saved ${(result.savedBytes / 1024).toFixed(0)} KB. Original retained.`,
        );
      } else {
        toast.info("WebP would not meaningfully reduce this image. Original retained.");
      }
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["admin", "media"] }),
        qc.invalidateQueries({ queryKey: ["admin", "site-gallery"] }),
        qc.invalidateQueries({ queryKey: ["public", "site-gallery"] }),
      ]);
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Image optimisation failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.storage.from("site-media").remove([name]);
      if (error) throw error;
    },
    onMutate: (name) =>
      updateListOptimistically<MediaFile>(qc, ["admin", "media", prefix], (current) =>
        current.filter((file) => file.name !== name),
      ),
    onError: (error, _name, context) => {
      rollbackOptimisticList(qc, ["admin", "media", prefix], context);
      toast.error(error instanceof Error ? error.message : "Delete failed");
    },
    onSuccess: () => {
      setDeleteName(null);
      toast.success("File deleted");
    },
    onSettled: () => void qc.invalidateQueries({ queryKey: ["admin", "media"] }),
  });

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    if (!selected.length) return;

    const allowedTypes = new Set([
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/avif",
    ]);
    const invalid = selected.find(
      (file) => !allowedTypes.has(file.type) || file.size <= 0 || file.size > 10 * 1024 * 1024,
    );

    if (invalid) {
      toast.error(`${invalid.name}: upload a JPG, PNG, WebP, GIF or AVIF image up to 10 MB.`);
      if (fileInput.current) fileInput.current.value = "";
      return;
    }

    setUploading(true);
    let uploaded = 0;
    const failures: string[] = [];

    try {
      for (const file of selected) {
        try {
          const optimized = await convertImageToWebP(file);
          const safeName = optimized.name.replace(/[^a-zA-Z0-9._-]/g, "_");
          const objectPath = withPrefix(`${crypto.randomUUID()}-${safeName}`);
          const { error } = await supabase.storage
            .from("site-media")
            .upload(objectPath, optimized, {
              cacheControl: "31536000",
              contentType: optimized.type,
              upsert: false,
            });
          if (error) throw error;
          uploaded += 1;
        } catch (error) {
          failures.push(
            `${file.name}: ${error instanceof Error ? error.message : "Upload failed"}`,
          );
        }
      }

      if (uploaded > 0) {
        await qc.invalidateQueries({ queryKey: ["admin", "media"] });
      }

      if (failures.length > 0) {
        toast.error(
          uploaded > 0
            ? `${uploaded} uploaded; ${failures.length} failed. ${failures[0]}`
            : failures[0],
        );
      } else {
        toast.success(
          `${uploaded} image${uploaded === 1 ? "" : "s"} uploaded; eligible JPG/PNG files were converted to WebP when at least 8% smaller.`,
        );
      }
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Media Library"
        description="Upload public website images (maximum 10 MB). Never upload patient records here."
        actions={
          <>
            <Link
              to="/admin/gallery"
              className="inline-flex h-9 items-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted"
            >
              Manage website gallery
            </Link>
            <input
              ref={fileInput}
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.webp,.gif,.avif"
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
      ) : filesError ? (
        <div className="rounded-2xl border border-destructive/30 bg-card p-6 text-center">
          <p className="text-sm text-destructive">
            {filesError instanceof Error ? filesError.message : "Unable to load media."}
          </p>
          <Button className="mt-3" variant="outline" size="sm" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      ) : !files?.length ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card py-20 text-muted-foreground">
          <ImageIcon className="h-8 w-8" />
          <p className="text-sm">No media yet. Upload your first file.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {files.map((f) => (
            <MediaCard
              key={f.name}
              file={f}
              onDelete={() => setDeleteName(f.name)}
              onOptimize={() => optimizeMutation.mutate(f)}
              canOptimize={isAdmin && galleryPathSet.has(f.name)}
              isOptimizing={
                optimizeMutation.isPending && optimizeMutation.variables?.name === f.name
              }
            />
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

function MediaCard({
  file,
  onDelete,
  onOptimize,
  canOptimize,
  isOptimizing,
}: {
  file: MediaFile;
  onDelete: () => void;
  onOptimize: () => void;
  canOptimize: boolean;
  isOptimizing: boolean;
}) {
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
              toast.success("Public image URL copied");
            }}
          >
            <Copy className="mr-1 h-3.5 w-3.5" /> {copied ? "Copied" : "Copy URL"}
          </Button>
          {canOptimize && /\.(jpe?g|png)$/i.test(file.label) && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2 text-xs"
              disabled={isOptimizing}
              onClick={onOptimize}
              title="Create a WebP copy and update any website gallery reference; keep the original"
            >
              {isOptimizing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "WebP"}
            </Button>
          )}
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
