import { createClient } from "npm:@supabase/supabase-js@2";

const baseHeaders = {
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
  "Cache-Control": "no-store, max-age=0",
};
function headers(req: Request) {
  const origin = req.headers.get("origin");
  const allowed = new Set(
    [
      "https://painfixphysiotherapy.com",
      Deno.env.get("APP_ORIGIN"),
      Deno.env.get("PREVIEW_ORIGIN"),
    ].filter((value): value is string => Boolean(value)),
  );
  const preview =
    origin != null &&
    /^https:\/\/painfixphysiotherapy-[a-z0-9-]+-zainmirza3039s-projects\.vercel\.app$/.test(origin);
  return {
    ...baseHeaders,
    ...(origin && (allowed.has(origin) || preview)
      ? { "Access-Control-Allow-Origin": origin, Vary: "Origin" }
      : {}),
  };
}
const respond = (req: Request, body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: headers(req) });

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

async function sha256Hex(value: string) {
  const digest = new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
  );
  return Array.from(digest, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: headers(req) });
  if (req.method !== "POST") return respond(req, { status: "not_found" }, 405);

  try {
    const body = await req.json();
    const token = typeof body?.token === "string" ? body.token : "";
    if (!/^[a-f0-9]{64}$/.test(token)) return respond(req, { status: "not_found" });

    const tokenHash = await sha256Hex(token);
    const { data, error } = await supabase
      .from("personal_patient_treatment_documents")
      .select("document_number,status,issued_at,public_snapshot")
      .eq("verification_token_hash", tokenHash)
      .maybeSingle();

    if (error || !data) return respond(req, { status: "not_found" });

    // Explicit response allow-list. Never return the private snapshot or patient notes.
    const snapshot = data.public_snapshot as Record<string, unknown>;
    const message =
      data.status === "valid"
        ? "This document is recorded as valid in the PainFix issuance register."
        : data.status === "revoked"
          ? "This document has been revoked by PainFix and is not valid."
          : "This document has been superseded. Contact PainFix for the current document.";

    return respond(req, {
      status: data.status,
      document_number: data.document_number,
      issued_at: data.issued_at,
      clinic: "PainFix Physiotherapy Clinic",
      patient: typeof snapshot.patient === "string" ? snapshot.patient : null,
      treatment_start:
        typeof snapshot.treatment_start === "string" ? snapshot.treatment_start : null,
      treatment_end: typeof snapshot.treatment_end === "string" ? snapshot.treatment_end : null,
      completed_sessions:
        typeof snapshot.completed_sessions === "number" ? snapshot.completed_sessions : null,
      amount_paid: typeof snapshot.amount_paid === "number" ? snapshot.amount_paid : null,
      currency: "PKR",
      message,
    });
  } catch {
    return respond(req, { status: "not_found" }, 400);
  }
});
