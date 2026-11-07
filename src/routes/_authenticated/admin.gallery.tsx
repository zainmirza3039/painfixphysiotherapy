import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Check, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminOnly } from "@/components/admin/AdminOnly";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { rollbackOptimisticList, updateListOptimistically } from "@/admin/optimistic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/admin/gallery")({
  component: () => (
    <AdminOnly>
      <GalleryManagerPage />
    </AdminOnly>
  ),
});

function reorderGalleryItems(
  items: GalleryRow[],
  first: GalleryRow,
  second: GalleryRow,
): GalleryRow[] {
  return items
    .map((item) => {
      if (item.id === first.id) return { ...item, display_order: second.display_order };
      if (item.id === second.id) return { ...item, display_order: first.display_order };
      return item;
    })
    .sort((a, b) => a.display_order - b.display_order);
}

type GalleryRow = {
  id: string;
  storage_path: string;
  caption: string;
  alt_text: string;
  display_order: number;
};

type MediaAsset = {
  name: string;
  url: string;
};

function GalleryManagerPage() {
  const queryClient = useQueryClient();

  const galleryQuery = useQuery({
    queryKey: ["admin", "site-gallery"],
    queryFn: async (): Promise<GalleryRow[]> => {
      const { data, error } = await supabase
        .from("site_gallery")
        .select("id, storage_path, caption, alt_text, display_order")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const mediaQuery = useQuery({
    queryKey: ["admin", "gallery-media-assets"],
    queryFn: async (): Promise<MediaAsset[]> => {
      const { data, error } = await supabase.storage
        .from("site-media")
        .list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } });
      if (error) throw error;

      return (data ?? [])
        .filter((file) => file.id !== null && /\.(jpe?g|png|webp|gif|avif)$/i.test(file.name))
        .map((file) => {
          const { data: asset } = supabase.storage.from("site-media").getPublicUrl(file.name);
          return { name: file.name, url: asset.publicUrl };
        });
    },
  });

  const refreshGallery = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin", "site-gallery"] });
    await queryClient.invalidateQueries({ queryKey: ["public", "site-gallery"] });
  };

  const addMutation = useMutation({
    mutationFn: async (asset: MediaAsset) => {
      const current = galleryQuery.data ?? [];
      if (current.some((item) => item.storage_path === asset.name)) {
        throw new Error("This image is already in the website gallery.");
      }

      const caption = asset.name
        .replace(/^.*\//, "")
        .replace(/^[0-9a-f-]{20,}-/i, "")
        .replace(/\.[^.]+$/, "")
        .replace(/[-_]+/g, " ")
        .trim();

      const { error } = await supabase.from("site_gallery").insert({
        storage_path: asset.name,
        caption: caption || "PainFix Clinic",
        alt_text: "Photo from PainFix Physiotherapy Clinic in Multan",
        display_order: current.length,
        is_active: true,
      });
      if (error) throw error;
    },
    onMutate: async (asset) => {
      const current = galleryQuery.data ?? [];
      const caption = asset.name
        .replace(/^.*\//, "")
        .replace(/\.[^.]+$/, "")
        .replace(/[-_]+/g, " ")
        .trim();
      return updateListOptimistically<GalleryRow>(
        queryClient,
        ["admin", "site-gallery"],
        (items) => [
          ...items,
          {
            id: `optimistic-${asset.name}`,
            storage_path: asset.name,
            caption: caption || "PainFix Clinic",
            alt_text: "Photo from PainFix Physiotherapy Clinic in Multan",
            display_order: current.length,
          },
        ],
      );
    },
    onSuccess: () => toast.success("Image added to website gallery"),
    onError: (error, _asset, context) => {
      rollbackOptimisticList(queryClient, ["admin", "site-gallery"], context);
      toast.error(error instanceof Error ? error.message : "Unable to add image");
    },
    onSettled: () => void refreshGallery(),
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("site_gallery").delete().eq("id", id);
      if (error) throw error;
    },
    onMutate: (id) =>
      updateListOptimistically<GalleryRow>(queryClient, ["admin", "site-gallery"], (items) =>
        items.filter((item) => item.id !== id),
      ),
    onSuccess: () => toast.success("Image removed from gallery. The Media Library file was kept."),
    onError: (error, _id, context) => {
      rollbackOptimisticList(queryClient, ["admin", "site-gallery"], context);
      toast.error(error instanceof Error ? error.message : "Unable to remove image");
    },
    onSettled: () => void refreshGallery(),
  });

  const updateMutation = useMutation({
    mutationFn: async (item: GalleryRow) => {
      const { error } = await supabase
        .from("site_gallery")
        .update({ caption: item.caption, alt_text: item.alt_text })
        .eq("id", item.id);
      if (error) throw error;
    },
    onMutate: (item) =>
      updateListOptimistically<GalleryRow>(queryClient, ["admin", "site-gallery"], (items) =>
        items.map((current) =>
          current.id === item.id
            ? { ...current, caption: item.caption, alt_text: item.alt_text }
            : current,
        ),
      ),
    onError: (error, _item, context) => {
      rollbackOptimisticList(queryClient, ["admin", "site-gallery"], context);
      toast.error(error instanceof Error ? error.message : "Unable to save gallery details");
    },
    onSettled: () => void refreshGallery(),
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ first, second }: { first: GalleryRow; second: GalleryRow }) => {
      const { error: firstError } = await supabase
        .from("site_gallery")
        .update({ display_order: second.display_order })
        .eq("id", first.id);
      if (firstError) throw firstError;

      const { error: secondError } = await supabase
        .from("site_gallery")
        .update({ display_order: first.display_order })
        .eq("id", second.id);
      if (secondError) throw secondError;
    },
    onMutate: ({ first, second }) =>
      updateListOptimistically<GalleryRow>(queryClient, ["admin", "site-gallery"], (items) =>
        reorderGalleryItems(items, first, second),
      ),
    onError: (error, _variables, context) => {
      rollbackOptimisticList(queryClient, ["admin", "site-gallery"], context);
      toast.error(error instanceof Error ? error.message : "Unable to reorder gallery");
    },
    onSettled: () => void refreshGallery(),
  });

  const items = galleryQuery.data ?? [];
  const selectedPaths = new Set(items.map((item) => item.storage_path));

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Website Gallery"
        description="Choose clinic photos from the Media Library, edit their captions and accessibility text, and control their order on the public gallery page."
      />

      <section className="space-y-3">
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Current website gallery
          </h2>
          <p className="text-sm text-muted-foreground">
            Removing an image here only removes it from the website gallery. It does not delete the
            original Media Library file.
          </p>
        </div>

        {galleryQuery.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-64" />
            ))}
          </div>
        ) : galleryQuery.error ? (
          <p className="rounded-xl border border-destructive/30 p-4 text-sm text-destructive">
            {galleryQuery.error instanceof Error
              ? galleryQuery.error.message
              : "Unable to load gallery. Apply the site gallery database migration first."}
          </p>
        ) : items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No managed images yet. Add clinic photos from the Media Library below.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => {
              const { data: image } = supabase.storage
                .from("site-media")
                .getPublicUrl(item.storage_path);

              return (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-xl border border-border bg-card"
                >
                  <img
                    src={image.publicUrl}
                    alt={item.alt_text}
                    className="h-48 w-full object-cover"
                    loading="lazy"
                  />
                  <div className="space-y-3 p-4">
                    <div className="space-y-1.5">
                      <Label htmlFor={"caption-" + item.id}>Gallery caption</Label>
                      <Input
                        id={"caption-" + item.id}
                        defaultValue={item.caption}
                        key={item.id + item.caption}
                        onBlur={(event) => {
                          const caption = event.currentTarget.value.trim();
                          if (caption && caption !== item.caption) {
                            updateMutation.mutate({ ...item, caption });
                          }
                        }}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor={"alt-" + item.id}>Image description (alt text)</Label>
                      <Input
                        id={"alt-" + item.id}
                        defaultValue={item.alt_text}
                        key={item.id + item.alt_text}
                        onBlur={(event) => {
                          const alt_text = event.currentTarget.value.trim();
                          if (alt_text && alt_text !== item.alt_text) {
                            updateMutation.mutate({ ...item, alt_text });
                          }
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="outline"
                          aria-label="Move image up"
                          disabled={index === 0 || reorderMutation.isPending}
                          onClick={() =>
                            reorderMutation.mutate({ first: item, second: items[index - 1]! })
                          }
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          aria-label="Move image down"
                          disabled={index === items.length - 1 || reorderMutation.isPending}
                          onClick={() =>
                            reorderMutation.mutate({ first: item, second: items[index + 1]! })
                          }
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={removeMutation.isPending}
                        onClick={() => removeMutation.mutate(item.id)}
                      >
                        <Trash2 className="mr-1.5 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Add from Media Library
          </h2>
          <p className="text-sm text-muted-foreground">
            Upload your real clinic photos in Media Library first, then add them here.
          </p>
        </div>

        {mediaQuery.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-48" />
            ))}
          </div>
        ) : mediaQuery.error ? (
          <p className="rounded-xl border border-destructive/30 p-4 text-sm text-destructive">
            {mediaQuery.error instanceof Error
              ? mediaQuery.error.message
              : "Unable to load Media Library files."}
          </p>
        ) : mediaQuery.data?.length ? (
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {mediaQuery.data.map((asset) => {
              const selected = selectedPaths.has(asset.name);

              return (
                <article
                  key={asset.name}
                  className="overflow-hidden rounded-xl border border-border bg-card"
                >
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="h-36 w-full object-cover"
                    loading="lazy"
                  />
                  <div className="p-3">
                    <p className="truncate text-xs font-medium text-foreground" title={asset.name}>
                      {asset.name}
                    </p>
                    <Button
                      className="mt-3 w-full"
                      size="sm"
                      variant={selected ? "secondary" : "default"}
                      disabled={selected || addMutation.isPending}
                      onClick={() => addMutation.mutate(asset)}
                    >
                      {addMutation.isPending && addMutation.variables?.name === asset.name ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : selected ? (
                        <Check className="mr-2 h-4 w-4" />
                      ) : (
                        <ImagePlus className="mr-2 h-4 w-4" />
                      )}
                      {selected ? "In gallery" : "Add to gallery"}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No images found in the root of Media Library. Upload clinic images as an administrator
            to make them available here.
          </p>
        )}
      </section>
    </div>
  );
}
