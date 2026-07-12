import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

/**
 * Safe, serializable shape of a CMS blog post exposed to the public website.
 * Only columns needed to render public blog surfaces are projected.
 */
export interface PublicDbPost {
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  seo_title: string | null;
  meta_description: string | null;
  featured_image: string | null;
  category: string | null;
  tags: string[];
  author: string | null;
  publish_at: string | null;
  created_at: string;
  updated_at: string;
}

const PUBLIC_COLUMNS =
  "slug, title, excerpt, content, seo_title, meta_description, featured_image, category, tags, author, publish_at, created_at, updated_at";

/**
 * Read-only, anon-scoped Supabase client for public data.
 * Uses the publishable key so PostgREST applies the `Public can read published posts`
 * RLS policy (status = 'published' AND publish_at is null or in the past).
 * No session persistence — safe in SSR / Workers.
 */
function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

/** All published CMS blog posts, newest first. RLS filters out drafts/scheduled posts. */
export const listPublishedBlogPosts = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicDbPost[]> => {
    const supabase = publicClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select(PUBLIC_COLUMNS)
      .eq("status", "published")
      .order("publish_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    // Defensive: RLS already enforces publish window, but guard scheduled posts too.
    const now = Date.now();
    return ((data ?? []) as PublicDbPost[]).filter(
      (p) => !p.publish_at || new Date(p.publish_at).getTime() <= now,
    );
  },
);

/** A single published CMS blog post by slug, or null when none is published. */
export const getPublishedBlogPostBySlug = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ data }): Promise<PublicDbPost | null> => {
    const supabase = publicClient();
    const { data: row, error } = await supabase
      .from("blog_posts")
      .select(PUBLIC_COLUMNS)
      .eq("status", "published")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw error;
    const post = (row as PublicDbPost | null) ?? null;
    if (post?.publish_at && new Date(post.publish_at).getTime() > Date.now()) return null;
    return post;
  });
