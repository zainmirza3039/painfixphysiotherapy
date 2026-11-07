import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { team } from "@/data/team";
import type { Database } from "@/integrations/supabase/types";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ContentOnly } from "@/components/admin/ContentOnly";
import { useAdminAuth } from "@/admin/AdminAuthProvider";
import { slugify } from "@/admin/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/admin/blog-editor")({
  component: () => (
    <ContentOnly>
      <BlogEditorPage />
    </ContentOnly>
  ),
});

type Post = Database["public"]["Tables"]["blog_posts"]["Row"];
const blank = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "",
  tags: "",
  author: "",
  medical_reviewer_key: "",
  featured_image: "",
  seo_title: "",
  meta_description: "",
  status: "draft",
  publish_at: "",
};

function BlogEditorPage() {
  const queryClient = useQueryClient();
  const { user, isAdmin } = useAdminAuth();
  const postId =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("postId")
      : null;
  const [form, setForm] = useState(blank);
  const [slugEdited, setSlugEdited] = useState(false);
  const [hasEdited, setHasEdited] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const [draftStatus, setDraftStatus] = useState<"idle" | "saving" | "saved" | "unavailable">("idle");
  const [savedLocalDraft, setSavedLocalDraft] = useState<{
    form: typeof blank;
    savedAt: number;
  } | null>(null);
  const draftKey = `painfix:blog-editor:${postId ?? "new"}`;

  const postQuery = useQuery({
    queryKey: ["admin", "blog-editor", postId],
    enabled: !!postId && (isAdmin || !!user?.id),
    queryFn: async (): Promise<Post> => {
      let query = supabase.from("blog_posts").select("*").eq("id", postId!).single();
      if (!isAdmin && user?.id)
        query = supabase
          .from("blog_posts")
          .select("*")
          .eq("id", postId!)
          .eq("author_id", user.id)
          .single();
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (postId && postQuery.isLoading) return;
    try {
      const raw = window.localStorage.getItem(draftKey);
      if (raw) {
        const parsed = JSON.parse(raw) as { form?: Partial<typeof blank>; savedAt?: number };
        if (parsed.form && typeof parsed.form === "object") {
          setSavedLocalDraft({
            form: { ...blank, ...parsed.form },
            savedAt: typeof parsed.savedAt === "number" ? parsed.savedAt : Date.now(),
          });
        }
      }
    } catch {
      setSavedLocalDraft(null);
    }
    setDraftReady(true);
  }, [draftKey, postId, postQuery.isLoading]);

  useEffect(() => {
    if (!draftReady || !hasEdited) return;
    setDraftStatus("saving");
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(
          draftKey,
          JSON.stringify({ form, savedAt: Date.now() }),
        );
        setDraftStatus("saved");
      } catch {
        setDraftStatus("unavailable");
      }
    }, 800);
    return () => window.clearTimeout(timer);
  }, [draftReady, draftKey, form, hasEdited]);

  useEffect(() => {
    if (!postQuery.data) return;
    const p = postQuery.data;
    setForm({
      title: p.title ?? "",
      slug: p.slug ?? "",
      excerpt: p.excerpt ?? "",
      content: p.content ?? "",
      category: p.category ?? "",
      tags: (p.tags ?? []).join(", "),
      author: p.author ?? "",
      medical_reviewer_key: p.medical_reviewer_key ?? "",
      featured_image: p.featured_image ?? "",
      seo_title: p.seo_title ?? "",
      meta_description: p.meta_description ?? "",
      status: p.status ?? "draft",
      publish_at: p.publish_at ? new Date(p.publish_at).toISOString().slice(0, 10) : "",
    });
    setSlugEdited(true);
  }, [postQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!form.title.trim()) throw new Error("Article title is required.");
      if (form.status === "published" && !form.content.trim()) {
        throw new Error("Add article content before publishing.");
      }
      if (form.meta_description.trim().length > 160) {
        throw new Error("Keep the meta description within 160 characters.");
      }
      const payload = {
        title: form.title.trim(),
        slug: (form.slug.trim() || slugify(form.title)).trim(),
        excerpt: form.excerpt.trim() || null,
        content: form.content.trim() || null,
        category: form.category.trim() || null,
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        author: form.author.trim() || null,
        medical_reviewer_key: form.medical_reviewer_key || null,
        featured_image: form.featured_image.trim() || null,
        seo_title: form.seo_title.trim() || null,
        meta_description: form.meta_description.trim() || null,
        status: form.status,
        publish_at: form.publish_at ? new Date(form.publish_at).toISOString() : null,
      };
      if (!user?.id) {
        throw new Error("Your login session is missing. Sign out, sign in again, and retry.");
      }

      if (postId) {
        let query = supabase.from("blog_posts").update(payload).eq("id", postId);
        if (!isAdmin) query = query.eq("author_id", user.id);
        const { data, error } = await query.select("id").maybeSingle();
        if (error) throw error;
        if (!data) {
          throw new Error(
            "This article was not updated. Check that your account has content-editor permission and owns this article.",
          );
        }
      } else {
        const { data, error } = await supabase
          .from("blog_posts")
          .insert({ ...payload, author_id: user.id })
          .select("id")
          .single();
        if (error) throw error;
        if (!data?.id) throw new Error("The database did not confirm that the article was saved.");
      }
    },
    onSuccess: async () => {
      try {
        window.localStorage.removeItem(draftKey);
      } catch {
        // A successful server save must not depend on browser storage availability.
      }
      await queryClient.invalidateQueries({ queryKey: ["admin", "blog"] });
      toast.success(postId ? "Article updated" : "Article created");
      window.location.assign("/admin/blog");
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Unable to save article"),
  });

  const set = (key: keyof typeof blank, value: string) => {
    setHasEdited(true);
    setForm((current) => ({ ...current, [key]: value }));
  };

  function restoreLocalDraft() {
    if (!savedLocalDraft) return;
    setForm({ ...blank, ...savedLocalDraft.form });
    setSlugEdited(true);
    setHasEdited(true);
    setSavedLocalDraft(null);
    toast.success("Local draft restored");
  }

  if (postId && postQuery.isLoading)
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-96" />
      </div>
    );
  if (postQuery.error)
    return (
      <div className="rounded-xl border border-destructive/30 p-5 text-sm text-destructive">
        {postQuery.error instanceof Error
          ? postQuery.error.message
          : "Unable to load this article."}
        <Button
          className="ml-3"
          variant="outline"
          onClick={() => window.location.assign("/admin/blog")}
        >
          Back to articles
        </Button>
      </div>
    );

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-10">
      <AdminPageHeader
        title={postId ? "Edit article" : "New article"}
        description="Write, review and manage the publishing details for this article."
        actions={
          <Button variant="outline" onClick={() => window.location.assign("/admin/blog")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Articles
          </Button>
        }
      />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          saveMutation.mutate();
        }}
        className="space-y-6"
      >
        <section className="space-y-4 rounded-xl border border-border bg-card p-5 sm:p-6">
          <div>
            <h2 className="font-heading text-lg font-semibold">Article</h2>
            <p className="text-sm text-muted-foreground">Main content and article details.</p>
          </div>
          <div className="space-y-1.5">
            <Label>Title *</Label>
            <Input
              value={form.title}
              maxLength={120}
              required
              onChange={(e) => {
                set("title", e.target.value);
                if (!slugEdited) set("slug", slugify(e.target.value));
              }}
              placeholder="Enter article title"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>URL slug</Label>
              <Input
                value={form.slug}
                maxLength={120}
                onChange={(e) => {
                  setSlugEdited(true);
                  set("slug", e.target.value);
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Input value={form.category} onChange={(e) => set("category", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Author</Label>
              <Input value={form.author} onChange={(e) => set("author", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Medical reviewer (optional)</Label>
              <Select
                value={form.medical_reviewer_key || "__none__"}
                onValueChange={(v) => set("medical_reviewer_key", v === "__none__" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="No medical reviewer assigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Not assigned</SelectItem>
                  {team.map((member) => (
                    <SelectItem key={member.initials} value={member.initials}>
                      {member.name} — {member.credentials}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Only assign a clinician who has actually reviewed this article.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Tags (comma separated)</Label>
              <Input value={form.tags} onChange={(e) => set("tags", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Publish date</Label>
              <Input
                type="date"
                value={form.publish_at}
                onChange={(e) => set("publish_at", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Featured image URL</Label>
            <Input
              value={form.featured_image}
              onChange={(e) => set("featured_image", e.target.value)}
              placeholder="https://…"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Excerpt</Label>
            <Textarea
              rows={3}
              maxLength={320}
              value={form.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              placeholder="Short summary shown in article listings"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Article content</Label>
            <Textarea
              className="min-h-[420px] resize-y leading-7"
              rows={20}
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              placeholder="Write the full article here…"
            />
          </div>
        </section>
        <section className="space-y-4 rounded-xl border border-border bg-card p-5 sm:p-6">
          <div>
            <h2 className="font-heading text-lg font-semibold">Search appearance</h2>
            <p className="text-sm text-muted-foreground">Optional metadata for search engines.</p>
          </div>
          <div className="space-y-1.5">
            <Label>SEO title</Label>
            <Input maxLength={70} value={form.seo_title} onChange={(e) => set("seo_title", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Meta description</Label>
            <Textarea
              rows={3}
              maxLength={160}
              value={form.meta_description}
              onChange={(e) => set("meta_description", e.target.value)}
            />
          </div>
        </section>
        <div className="sticky bottom-3 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background/95 p-3 shadow-lg backdrop-blur">
          <div className="min-w-0 space-y-1">
            <p className="text-xs text-muted-foreground">
              {form.status === "published"
                ? "This article is set to publish."
                : "This article is saved as a draft unless you change its status."}
            </p>
            <p className="text-xs text-muted-foreground" role="status" aria-live="polite">
              {draftStatus === "saving"
                ? "Saving a local draft…"
                : draftStatus === "saved"
                  ? "Local draft saved in this browser."
                  : draftStatus === "unavailable"
                    ? "Browser storage is unavailable; use Save article to keep your changes."
                    : "Changes are saved locally after you edit."}
            </p>
            {savedLocalDraft && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  A previous local draft is available.
                </span>
                <Button type="button" size="sm" variant="link" className="h-auto p-0" onClick={restoreLocalDraft}>
                  Restore local draft
                </Button>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => window.location.assign("/admin/blog")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saveMutation.isPending || (!!postId && postQuery.isLoading)}
            >
              {saveMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {postId ? "Save article" : "Create article"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
