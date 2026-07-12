import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

/** Safe, serializable shape of a published professional profile. */
export interface PublicProfile {
  user_id: string;
  full_name: string;
  professional_title: string;
  slug: string | null;
  bio: string | null;
  photo_url: string | null;
  specialties: string[];
  years_experience: number | null;
  qualifications: string | null;
  phone: string | null;
  public_email: string | null;
  display_order: number;
}

const PUBLIC_COLUMNS =
  "user_id, full_name, professional_title, slug, bio, photo_url, specialties, years_experience, qualifications, phone, public_email, display_order";

/**
 * Read-only, anon-scoped Supabase client for public data.
 * Uses the publishable key so PostgREST applies the `Published profiles are public`
 * RLS policy (is_published = true). No session persistence — safe in SSR/Workers.
 */
function publicClient() {
  return createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

/** All published professional profiles, ordered for display. */
export const listPublishedProfiles = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicProfile[]> => {
    const supabase = publicClient();
    const { data, error } = await supabase
      .from("profiles")
      .select(PUBLIC_COLUMNS)
      .eq("is_published", true)
      .order("display_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as PublicProfile[];
  },
);

/** A single published profile by its public slug, or null when none is published. */
export const getPublishedProfileBySlug = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ data }): Promise<PublicProfile | null> => {
    const supabase = publicClient();
    const { data: row, error } = await supabase
      .from("profiles")
      .select(PUBLIC_COLUMNS)
      .eq("is_published", true)
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw error;
    return (row as PublicProfile | null) ?? null;
  });
