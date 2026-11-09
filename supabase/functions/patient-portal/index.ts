import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders });
const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}
function fromBase64Url(value: string) {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
}
async function digest(value: string) {
  return toBase64Url(new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value))));
}
async function verifyPin(pin: string, encoded: string) {
  const [scheme, algorithm, iterationsText, saltText, expectedText] = encoded.split("$");
  if (scheme !== "pbkdf2" || algorithm !== "sha256") return false;
  const iterations = Number(iterationsText);
  if (!Number.isInteger(iterations) || iterations < 100_000 || iterations > 1_000_000) return false;
  const key = await crypto.subtle.importKey("raw", encoder.encode(pin), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: fromBase64Url(saltText), iterations },
    key,
    256,
  );
  const actual = new Uint8Array(bits);
  const expected = fromBase64Url(expectedText);
  if (actual.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ expected[i];
  return diff === 0;
}
function makeOpaqueToken() {
  return toBase64Url(crypto.getRandomValues(new Uint8Array(32)));
}

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);

  try {
    const body = await req.json();
    if (body?.action === "verify") {
      const token = typeof body.token === "string" ? body.token : "";
      const pin = typeof body.pin === "string" ? body.pin : "";
      if (token.length < 32 || token.length > 128 || !/^\d{6}$/.test(pin)) {
        return json({ error: "The link or PIN is incorrect." }, 401);
      }

      const tokenDigest = await digest(token);
      const { data: credential, error } = await supabase
        .from("personal_patient_portal_credentials")
        .select("patient_id,clinician_id,pin_hash,is_revoked,failed_attempts,locked_until")
        .eq("token_digest", tokenDigest)
        .maybeSingle();
      if (error || !credential || credential.is_revoked) {
        return json({ error: "The link or PIN is incorrect, or access has been disabled." }, 401);
      }

      const now = new Date();
      if (credential.locked_until && new Date(credential.locked_until) > now) {
        return json({ error: "Too many attempts. Please try again later." }, 429);
      }

      const valid = await verifyPin(pin, credential.pin_hash);
      if (!valid) {
        const attempts = Number(credential.failed_attempts ?? 0) + 1;
        const lockedUntil = attempts >= 5 ? new Date(now.getTime() + 15 * 60_000).toISOString() : null;
        await supabase.from("personal_patient_portal_credentials").update({
          failed_attempts: attempts >= 5 ? 0 : attempts,
          locked_until: lockedUntil,
        }).eq("token_digest", tokenDigest);
        return json({ error: lockedUntil ? "Too many attempts. Please try again in 15 minutes." : "The link or PIN is incorrect." }, lockedUntil ? 429 : 401);
      }

      const sessionToken = makeOpaqueToken();
      const sessionDigest = await digest(sessionToken);
      const expiresAt = new Date(now.getTime() + 2 * 60 * 60_000).toISOString();
      const [credentialUpdate, sessionInsert] = await Promise.all([
        supabase.from("personal_patient_portal_credentials").update({
          failed_attempts: 0, locked_until: null, last_accessed_at: now.toISOString(),
        }).eq("token_digest", tokenDigest),
        supabase.from("personal_patient_portal_sessions").insert({
          patient_id: credential.patient_id,
          clinician_id: credential.clinician_id,
          session_token_digest: sessionDigest,
          expires_at: expiresAt,
        }),
      ]);
      if (credentialUpdate.error || sessionInsert.error) return json({ error: "Could not open the patient account. Please try again." }, 500);
      return json({ sessionToken, expiresAt });
    }

    if (body?.action === "data") {
      const sessionToken = typeof body.sessionToken === "string" ? body.sessionToken : "";
      if (sessionToken.length < 32 || sessionToken.length > 128) return json({ error: "Session expired. Enter your PIN again." }, 401);
      const sessionDigest = await digest(sessionToken);
      const now = new Date().toISOString();
      const { data: portalSession, error: sessionError } = await supabase
        .from("personal_patient_portal_sessions")
        .select("patient_id,clinician_id")
        .eq("session_token_digest", sessionDigest)
        .gt("expires_at", now)
        .is("revoked_at", null)
        .maybeSingle();
      if (sessionError || !portalSession) return json({ error: "Session expired. Enter your PIN again." }, 401);

      const { data: credential } = await supabase
        .from("personal_patient_portal_credentials")
        .select("is_revoked")
        .eq("patient_id", portalSession.patient_id)
        .eq("clinician_id", portalSession.clinician_id)
        .maybeSingle();
      if (!credential || credential.is_revoked) return json({ error: "This patient link has been disabled." }, 403);

      const patientId = portalSession.patient_id;
      const clinicianId = portalSession.clinician_id;
      const [patient, plans, sessions, ledger] = await Promise.all([
        supabase.from("personal_patients").select("full_name,status").eq("id", patientId).eq("clinician_id", clinicianId).single(),
        supabase.from("personal_patient_plans").select("title,plan_type,package_sessions,package_fee,per_session_fee,is_active").eq("patient_id", patientId).eq("clinician_id", clinicianId).order("created_at", { ascending: false }),
        supabase.from("personal_patient_sessions").select("plan_id,session_date,status,session_label,charge_amount").eq("patient_id", patientId).eq("clinician_id", clinicianId).order("session_date", { ascending: true }),
        supabase.from("personal_patient_ledger").select("entry_type,amount,description,payment_method,occurred_at").eq("patient_id", patientId).eq("clinician_id", clinicianId).order("occurred_at", { ascending: false }),
      ]);
      for (const result of [patient, plans, sessions, ledger]) {
        if (result.error) return json({ error: "Could not load the patient statement." }, 500);
      }
      const entries = ledger.data ?? [];
      const charges = entries.filter((entry) => entry.entry_type === "charge").reduce((sum, entry) => sum + Number(entry.amount), 0);
      const received = entries.filter((entry) => entry.entry_type === "payment").reduce((sum, entry) => sum + Math.abs(Number(entry.amount)), 0);
      const balance = entries.reduce((sum, entry) => sum + Number(entry.amount), 0);
      const activePlan = (plans.data ?? []).find((plan) => plan.is_active) ?? null;
      const completed = (sessions.data ?? []).filter((session) => session.status === "completed").length;
      const upcoming = (sessions.data ?? []).filter((session) => session.status === "scheduled" && new Date(session.session_date).getTime() >= Date.now());
      const nextSession = upcoming.find((session) => new Date(session.session_date).getTime() >= Date.now()) ?? null;
      return json({
        patient: patient.data,
        plan: activePlan,
        sessions: (sessions.data ?? []).map(({ session_date, status, session_label, charge_amount }) => ({ session_date, status, session_label, charge_amount })),
        ledger: entries,
        summary: {
          completedSessions: completed,
          upcomingSessions: upcoming.length,
          totalCharges: charges,
          totalReceived: received,
          outstandingDues: Math.max(balance, 0),
          advanceCredit: Math.max(-balance, 0),
          packageSessionsRemaining: activePlan?.plan_type === "package" && activePlan.package_sessions != null
            ? Math.max(0, activePlan.package_sessions - (sessions.data ?? []).filter((session) => session.plan_id === activePlan.id && session.status === "completed").length)
            : null,
          nextSession,
        },
      });
    }

    return json({ error: "Invalid request." }, 400);
  } catch {
    return json({ error: "Unexpected error. Please try again." }, 500);
  }
});
