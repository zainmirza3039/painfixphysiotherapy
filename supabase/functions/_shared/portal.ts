import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store",
  Pragma: "no-cache",
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function getAdminClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Supabase server credentials are not configured");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const encoder = new TextEncoder();
const hex = (bytes: Uint8Array) =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");

export async function sha256(value: string): Promise<string> {
  return hex(new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value))));
}

export async function pinDigest(pin: string): Promise<string> {
  const pepper = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!pepper) throw new Error("Portal PIN hashing is not configured");
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(pepper),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return hex(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(pin))));
}

export function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return hex(bytes);
}

export function validUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );
}

export async function requireAdmin(req: Request, admin: SupabaseClient) {
  const header = req.headers.get("Authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) throw new Error("Unauthorized");
  const { data, error } = await admin.auth.getUser(match[1]);
  if (error || !data.user) throw new Error("Unauthorized");
  const userId = data.user.id;
  const [adminRole, superRole] = await Promise.all([
    admin.rpc("has_role", { _user_id: userId, _role: "admin" }),
    admin.rpc("has_role", { _user_id: userId, _role: "super_admin" }),
  ]);
  if (adminRole.error || superRole.error) throw new Error("Unable to verify administrator access");
  if (!adminRole.data && !superRole.data) throw new Error("Forbidden");
  return userId;
}
