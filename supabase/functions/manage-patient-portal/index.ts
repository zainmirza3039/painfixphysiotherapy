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
      .select("id,clinician_id,status")
      .eq("id", body.patientId)
      .eq("clinician_id", clinicianId)
      .maybeSingle();

    if (patientError || !patient || patient.status === "archived") {
      return json({ error: "Patient account not found." }, 404);
    }

    if (body.action === "revoke") {
      const now = new Date().toISOString();
      const [credentialUpdate, sessionUpdate] = await Promise.all([
        admin.from("personal_patient_portal_credentials")
          .update({ is_revoked: true, locked_until: null, failed_attempts: 0, updated_at: now })
          .eq("patient_id", patient.id).eq("clinician_id", clinicianId),
        admin.from("personal_patient_portal_sessions")
          .update({ revoked_at: now })
          .eq("patient_id", patient.id).eq("clinician_id", clinicianId)
          .is("revoked_at", null),
      ]);
      if (credentialUpdate.error || sessionUpdate.error) {
        console.error("Portal revocation failed", credentialUpdate.error?.message, sessionUpdate.error?.message);
        return json({ error: "Portal access could not be revoked." }, 503);
      }
      const { error: auditError } = await admin.from("personal_patient_audit_events").insert({
        clinician_id: clinicianId,
        patient_id: patient.id,
        entity_type: "portal",
        entity_id: patient.id,
        action: "portal_revoked",
        details: { revoked_at: now },
      });
      if (auditError) {
        console.error("Portal revoke audit event failed:", auditError.message);
        return json({ error: "Portal was revoked but its audit event could not be recorded. Contact support." }, 503);
      }
      return json({ revoked: true });
    }

    if (body.action !== "create_or_rotate" || typeof body.pin !== "string" || !/^\d{6}$/.test(body.pin)) {
      return json({ error: "Choose a valid action and enter a six-digit PIN." }, 400);
    }

    const token = randomToken();
    const [tokenDigest, hashedPin] = await Promise.all([sha256(token), pinDigest(body.pin)]);
    const now = new Date().toISOString();

    const { error: sessionError } = await admin.from("personal_patient_portal_sessions")
      .update({ revoked_at: now })
      .eq("patient_id", patient.id).eq("clinician_id", clinicianId)
      .is("revoked_at", null);
    if (sessionError) return json({ error: "Existing portal sessions could not be closed." }, 503);

    const { error: credentialError } = await admin.from("personal_patient_portal_credentials")
      .upsert({
        patient_id: patient.id,
        clinician_id: clinicianId,
        token_digest: tokenDigest,
        pin_hash: hashedPin,
        is_revoked: false,
        failed_attempts: 0,
        locked_until: null,
        updated_at: now,
      }, { onConflict: "patient_id" });
    if (credentialError) {
      console.error("Portal credential rotation failed:", credentialError.message);
      return json({ error: "Portal access could not be created." }, 503);
    }

    const { error: auditError } = await admin.from("personal_patient_audit_events").insert({
      clinician_id: clinicianId,
      patient_id: patient.id,
      entity_type: "portal",
      entity_id: patient.id,
      action: "portal_created_or_rotated",
      details: { created_at: now },
    });
    if (auditError) {
      console.error("Portal credential audit event failed:", auditError.message);
      return json({ error: "Portal credentials were updated but the audit event failed. Contact support." }, 503);
    }

    return json({ token });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Portal management failed";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    if (status === 500) console.error("Manage patient portal failed:", message);
    return json({ error: status === 401 ? "Please sign in again." : status === 403 ? "Administrator access required." : "Portal access could not be updated." }, status);
  }
});
