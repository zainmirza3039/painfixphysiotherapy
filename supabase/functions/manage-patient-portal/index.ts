import { getAdminClient, corsHeaders, json, pinDigest, randomToken, sha256, requireAdmin, validUuid } from "../_shared/portal.ts";

type Body = { action?: string; patientId?: string; pin?: string };

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const admin = getAdminClient();
    const clinicianId = await requireAdmin(req, admin);
    const body = await req.json() as Body;

    if (!validUuid(body.patientId)) return json({ error: "A valid patient account is required." }, 400);

    const { data: patient, error: patientError } = await admin
      .from("personal_patients")
      .select("id,clinician_id,archived_at")
      .eq("id", body.patientId)
      .eq("clinician_id", clinicianId)
      .maybeSingle();

    if (patientError || !patient || patient.archived_at !== null) {
      return json({ error: "Patient account not found." }, 404);
    }

    if (body.action === "revoke") {
      const { error } = await admin.rpc("manage_personal_patient_portal", {
        p_clinician_id: clinicianId,
        p_patient_id: patient.id,
        p_action: "revoke",
        p_token_digest: null,
        p_pin_hash: null,
      });
      if (error) {
        console.error("Portal revocation failed:", error.message);
        return json({ error: "Portal access could not be revoked." }, 503);
      }
      return json({ revoked: true });
    }

    if (body.action !== "create_or_rotate" || typeof body.pin !== "string" || !/^\\d{6}$/.test(body.pin)) {
      return json({ error: "Choose a valid action and enter a six-digit PIN." }, 400);
    }

    const token = randomToken();
    const [tokenDigest, hashedPin] = await Promise.all([sha256(token), pinDigest(body.pin)]);
    const { error } = await admin.rpc("manage_personal_patient_portal", {
      p_clinician_id: clinicianId,
      p_patient_id: patient.id,
      p_action: "create_or_rotate",
      p_token_digest: tokenDigest,
      p_pin_hash: hashedPin,
    });
    if (error) {
      console.error("Portal credential rotation failed:", error.message);
      return json({ error: "Portal access could not be created." }, 503);
    }
    return json({ token });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Portal management failed";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    if (status === 500) console.error("Manage patient portal failed:", message);
    return json({ error: status === 401 ? "Please sign in again." : status === 403 ? "Administrator access required." : "Portal access could not be updated." }, status);
  }
});
