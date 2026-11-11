import { createClient } from "npm:@supabase/supabase-js@2";

const baseCorsHeaders = {
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};
function corsHeaders(req: Request) {
  const origin = req.headers.get("origin");
  const allowed = new Set(
    [
      "https://painfixphysiotherapy.com",
      Deno.env.get("APP_ORIGIN"),
      Deno.env.get("PREVIEW_ORIGIN"),
    ].filter((value): value is string => Boolean(value)),
  );
  return {
    ...baseCorsHeaders,
    ...(origin && allowed.has(origin)
      ? { "Access-Control-Allow-Origin": origin, Vary: "Origin" }
      : {}),
  };
}
const json = (req: Request, body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders(req) });
const encoder = new TextEncoder();
const iterations = 310_000;

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}
async function digest(value: string) {
  return toBase64Url(new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value))));
}
function randomToken() {
  return toBase64Url(crypto.getRandomValues(new Uint8Array(32)));
}
async function hashPin(pin: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", encoder.encode(pin), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    key,
    256,
  );
  return `pbkdf2$sha256$${iterations}$${toBase64Url(salt)}$${toBase64Url(new Uint8Array(bits))}`;
}

const url = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const adminClient = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  if (req.method !== "POST") return json(req, { error: "Method not allowed." }, 405);

  try {
    const authorization = req.headers.get("Authorization") ?? "";
    const accessToken = authorization.replace(/^Bearer\s+/i, "");
    if (!accessToken) return json(req, { error: "Authentication required." }, 401);
    const { data: authData, error: authError } = await adminClient.auth.getUser(accessToken);
    if (authError || !authData.user) return json(req, { error: "Authentication required." }, 401);
    const clinicianId = authData.user.id;

    const body = await req.json();
    const patientId = typeof body.patientId === "string" ? body.patientId : "";
    const action = body.action;
    if (!patientId) return json(req, { error: "Patient is required." }, 400);

    const { data: patient, error: patientError } = await adminClient
      .from("personal_patients")
      .select("id")
      .eq("id", patientId)
      .eq("clinician_id", clinicianId)
      .maybeSingle();
    if (patientError || !patient) return json(req, { error: "Patient account not found." }, 404);

    const now = new Date().toISOString();
    if (action === "revoke") {
      const { error: revokeError } = await adminClient
        .from("personal_patient_portal_credentials")
        .update({ is_revoked: true })
        .eq("patient_id", patientId)
        .eq("clinician_id", clinicianId);
      if (revokeError) return json(req, { error: "Could not disable the patient link." }, 500);
      await adminClient
        .from("personal_patient_portal_sessions")
        .update({ revoked_at: now })
        .eq("patient_id", patientId)
        .eq("clinician_id", clinicianId)
        .is("revoked_at", null);
      const { error: revokeAuditError } = await adminClient
        .from("personal_patient_audit_events")
        .insert({
          clinician_id: clinicianId,
          patient_id: patientId,
          entity_type: "portal",
          action: "portal_access_revoked",
          details: {},
        });
      if (revokeAuditError)
        return json(req, { error: "Portal access changed but audit logging failed." }, 500);
      return json(req, { revoked: true });
    }

    if (action !== "create_or_rotate") return json(req, { error: "Invalid request." }, 400);
    const pin = typeof body.pin === "string" ? body.pin : "";
    if (!/^\d{6}$/.test(pin))
      return json(req, { error: "PIN must contain exactly six digits." }, 400);

    const token = randomToken();
    const [tokenDigest, pinHash] = await Promise.all([digest(token), hashPin(pin)]);
    const { error: upsertError } = await adminClient
      .from("personal_patient_portal_credentials")
      .upsert(
        {
          patient_id: patientId,
          clinician_id: clinicianId,
          token_digest: tokenDigest,
          pin_hash: pinHash,
          is_revoked: false,
          failed_attempts: 0,
          locked_until: null,
          last_accessed_at: null,
        },
        { onConflict: "patient_id" },
      );
    if (upsertError) return json(req, { error: "Could not create the patient link." }, 500);

    await adminClient
      .from("personal_patient_portal_sessions")
      .update({ revoked_at: now })
      .eq("patient_id", patientId)
      .eq("clinician_id", clinicianId)
      .is("revoked_at", null);
    const { error: createAuditError } = await adminClient
      .from("personal_patient_audit_events")
      .insert({
        clinician_id: clinicianId,
        patient_id: patientId,
        entity_type: "portal",
        action: "portal_link_created_or_rotated",
        details: {},
      });
    if (createAuditError)
      return json(req, { error: "Portal link created but audit logging failed." }, 500);
    return json(req, { token });
  } catch {
    return json(req, { error: "Unexpected error. Please try again." }, 500);
  }
});
