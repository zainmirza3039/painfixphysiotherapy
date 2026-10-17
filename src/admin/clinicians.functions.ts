import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  CLINICIAN_PHOTO_BUCKET,
  clinicianPhotoUploadRequestSchema,
  clinicianProfileInputSchema,
  extensionForClinicianPhotoType,
  isClinicianPhotoPathForId,
  type AdminClinicianProfile,
  type ClinicianProfileInput,
  type PublicClinicianProfile,
} from "@/admin/clinician-profile.contract";

const PUBLIC_COLUMNS =
  "id, slug, name, full_name, designation, professional_title, credentials, bio, seo_bio, specialties, tags, years_experience, qualifications, photo_path, photo_url, phone_display, whatsapp_number, meta_title, meta_description, intro, expertise, conditions_treated, approach, display_order";

function publicClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Missing public Supabase configuration");
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

async function assertAdmin(context: { supabase: SupabaseClient<Database>; userId: string }) {
  const { data: isAdmin, error } = await context.supabase.rpc("is_admin", {
    _user_id: context.userId,
  });
  if (error) throw new Error("Unable to verify administrator permissions");
  if (!isAdmin) throw new Error("Forbidden: admin access required");
}

function withPublicPhotoUrl(
  row: Tables<"clinician_profiles">,
  storage: SupabaseClient<Database>["storage"],
): PublicClinicianProfile {
  const resolved = row.photo_path
    ? storage.from(CLINICIAN_PHOTO_BUCKET).getPublicUrl(row.photo_path).data.publicUrl
    : row.photo_url;
  const {
    created_at: _createdAt,
    updated_at: _updatedAt,
    is_active: _isActive,
    is_published: _isPublished,
    photo_url: _legacyPhotoUrl,
    ...publicFields
  } = row;
  return { ...publicFields, photo_url: resolved };
}

function withAdminPhotoUrl(
  row: Tables<"clinician_profiles">,
  storage: SupabaseClient<Database>["storage"],
): AdminClinicianProfile {
  return {
    ...row,
    resolved_photo_url: row.photo_path
      ? storage.from(CLINICIAN_PHOTO_BUCKET).getPublicUrl(row.photo_path).data.publicUrl
      : row.photo_url,
  };
}

/** Public list: anon-scoped, explicit public projection and active/published filter. */
export const listPublishedClinicianProfiles = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicClinicianProfile[]> => {
    const supabase = publicClient();
    const { data, error } = await supabase
      .from("clinician_profiles")
      .select(PUBLIC_COLUMNS)
      .eq("is_active", true)
      .eq("is_published", true)
      .order("display_order", { ascending: true })
      .order("full_name", { ascending: true });
    if (error) throw new Error("Unable to load clinician profiles");
    return (data ?? []).map((row) =>
      withPublicPhotoUrl(row as Tables<"clinician_profiles">, supabase.storage),
    );
  },
);

/** Public slug lookup: unpublished or inactive profiles are indistinguishable from missing profiles. */
export const getPublishedClinicianProfileBySlug = createServerFn({
  method: "GET",
})
  .inputValidator((input) =>
    z
      .object({ slug: z.string().trim().min(1).max(100) })
      .strict()
      .parse(input),
  )
  .handler(async ({ data }): Promise<PublicClinicianProfile | null> => {
    const supabase = publicClient();
    const { data: row, error } = await supabase
      .from("clinician_profiles")
      .select(PUBLIC_COLUMNS)
      .eq("slug", data.slug)
      .eq("is_active", true)
      .eq("is_published", true)
      .maybeSingle();
    if (error) throw new Error("Unable to load clinician profile");
    return row ? withPublicPhotoUrl(row as Tables<"clinician_profiles">, supabase.storage) : null;
  });

/** Admin list: verified bearer token plus database-backed admin/super_admin role. */
export const listAdminClinicianProfiles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminClinicianProfile[]> => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("clinician_profiles")
      .select("*")
      .order("display_order", { ascending: true })
      .order("full_name", { ascending: true });
    if (error) throw new Error("Unable to load clinician management records");
    return (data ?? []).map((row) => withAdminPhotoUrl(row, supabaseAdmin.storage));
  });

/** Admin create/update. New records are inserted without creating an auth account. */
export const saveAdminClinicianProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => clinicianProfileInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, ...values } = data as ClinicianProfileInput;
    if (id && values.photo_path && !isClinicianPhotoPathForId(values.photo_path, id)) {
      throw new Error("The selected photo does not belong to this clinician");
    }
    if (!id && values.photo_path) {
      throw new Error("Create the clinician record before uploading a photo");
    }
    const payload = {
      ...values,
      ...(values.photo_path || !id ? { photo_url: null } : {}),
    };
    const query = id
      ? supabaseAdmin.from("clinician_profiles").update(payload).eq("id", id)
      : supabaseAdmin.from("clinician_profiles").insert(payload);
    const { data: row, error } = await query.select("*").single();
    if (error) {
      if (error.code === "23505") {
        throw new Error("That profile URL is already in use");
      }
      if (error.code === "23514") {
        throw new Error("A profile field is outside the allowed format");
      }
      throw new Error("Unable to save clinician profile");
    }
    return withAdminPhotoUrl(row, supabaseAdmin.storage);
  });

/** Safely remove from public display without deleting the underlying profile or photo. */
export const removeAdminClinicianProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).strict().parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("clinician_profiles")
      .update({ is_active: false, is_published: false })
      .eq("id", data.id)
      .select("id")
      .maybeSingle();
    if (error) throw new Error("Unable to remove clinician from public display");
    if (!row) throw new Error("Clinician profile not found");
    return { id: row.id, removed: true };
  });

/** Clear the portrait reference without deleting the stored object. */
export const clearAdminClinicianPhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).strict().parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("clinician_profiles")
      .update({ photo_path: null, photo_url: null })
      .eq("id", data.id)
      .select("id")
      .maybeSingle();
    if (error) throw new Error("Unable to clear clinician portrait");
    if (!row) throw new Error("Clinician profile not found");
    return { id: row.id, cleared: true };
  });

/** Issue a one-object signed upload URL only after checking the caller and target profile. */
export const createAdminClinicianPhotoUploadUrl = createServerFn({
  method: "POST",
})
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => clinicianPhotoUploadRequestSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("clinician_profiles")
      .select("id")
      .eq("id", data.clinicianId)
      .maybeSingle();
    if (profileError) throw new Error("Unable to verify clinician profile");
    if (!profile) throw new Error("Clinician profile not found");

    const extension = extensionForClinicianPhotoType(data.contentType);
    const path = `clinician-profiles/${data.clinicianId}/${crypto.randomUUID()}.${extension}`;
    const { data: signed, error } = await supabaseAdmin.storage
      .from(CLINICIAN_PHOTO_BUCKET)
      .createSignedUploadUrl(path, { upsert: false });
    if (error) throw new Error("Unable to prepare clinician photo upload");
    return { bucket: CLINICIAN_PHOTO_BUCKET, path, token: signed.token };
  });

/** Admin-only delete; refuses to remove an object while any profile references it. */
export const deleteAdminClinicianPhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({ clinicianId: z.string().uuid(), photoPath: z.string().min(1) })
      .strict()
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    if (!isClinicianPhotoPathForId(data.photoPath, data.clinicianId)) {
      throw new Error("Invalid clinician photo path");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count, error: referenceError } = await supabaseAdmin
      .from("clinician_profiles")
      .select("id", { count: "exact", head: true })
      .eq("photo_path", data.photoPath);
    if (referenceError) throw new Error("Unable to verify photo references");
    if ((count ?? 0) > 0) {
      throw new Error("Clear or replace the profile photo before deleting its file");
    }
    const { error } = await supabaseAdmin.storage
      .from(CLINICIAN_PHOTO_BUCKET)
      .remove([data.photoPath]);
    if (error) throw new Error("Unable to delete clinician photo");
    return { path: data.photoPath, deleted: true };
  });
