import { getAdminClient, corsHeaders, json, pinDigest, randomToken, sha256 } from "../_shared/portal.ts";

type Body = { action?: string; token?: string; pin?: string; sessionToken?: string };

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json() as Body;
    const admin = getAdminClient();

    if (body.action === "verify") {
      if (typeof body.token !== "string" || !/^[a-f0-9]{64}$/i.test(body.token) ||
          typeof body.pin !== "string" || !/^\d{6}$/.test(body.pin)) {
        return json({ error: "Enter a valid portal link and six-digit PIN." }, 400);
      }

      const sessionToken = randomToken();
      const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
      const [tokenHash, submittedPinHash, sessionHash] = await Promise.all([
        sha256(body.token.toLowerCase()),
        pinDigest(body.pin),
        sha256(sessionToken),
      ]);

      const { data, error } = await admin.rpc("verify_personal_patient_portal_pin", {
        p_token_digest: tokenHash,
        p_pin_digest: submittedPinHash,
        p_session_digest: sessionHash,
        p_expires_at: expiresAt,
      });

      if (error) {
        console.error("Portal PIN verification failed:", error.message);
        return json({ error: "Portal verification is temporarily unavailable." }, 503);
      }
      const verified = Array.isArray(data) && data[0]?.verified === true;
      if (!verified) return json({ error: "The PIN is incorrect or portal access is temporarily locked." }, 401);

      return json({ sessionToken, expiresAt });
    }

    if (body.action === "data") {
      if (typeof body.sessionToken !== "string" || !/^[a-f0-9]{64}$/i.test(body.sessionToken)) {
        return json({ error: "Your portal session is invalid. Enter your PIN again." }, 401);
      }
      const sessionHash = await sha256(body.sessionToken.toLowerCase());
      const { data: sessionRows, error: sessionError } = await admin.rpc(
        "resolve_personal_patient_portal_session",
        { p_session_digest: sessionHash },
      );
      const session = Array.isArray(sessionRows) ? sessionRows[0] : null;
      if (sessionError || !session?.patient_id || !session?.clinician_id) {
        return json({ error: "Your session has expired or portal access was revoked." }, 401);
      }

      const patientId = session.patient_id as string;
      const clinicianId = session.clinician_id as string;
      const [patientResult, planResult, sessionResult, ledgerResult, summaryResult] = await Promise.all([
        admin.from("personal_patients")
          .select("id,full_name,status,archived_at")
          .eq("id", patientId).eq("clinician_id", clinicianId).is("archived_at", null).maybeSingle(),
        admin.from("personal_patient_plans")
          .select("id,title,plan_type,package_sessions,package_fee,per_session_fee")
          .eq("patient_id", patientId).eq("clinician_id", clinicianId)
          .eq("is_active", true).order("created_at", { ascending: false }).limit(1),
        admin.from("personal_patient_sessions")
          .select("id,session_date,status,session_label,charge_amount,plan_id")
          .eq("patient_id", patientId).eq("clinician_id", clinicianId)
          .order("session_date", { ascending: false }).limit(100),
        admin.from("personal_patient_ledger")
          .select("id,entry_type,amount,description,payment_method,occurred_at")
          .eq("patient_id", patientId).eq("clinician_id", clinicianId)
          .order("occurred_at", { ascending: false }).limit(100),
        admin.rpc("get_personal_patient_portal_summary", {
          p_patient_id: patientId,
          p_clinician_id: clinicianId,
        }),
      ]);

      if (patientResult.error || planResult.error || sessionResult.error || ledgerResult.error ||
          summaryResult.error || !patientResult.data) {
        console.error("Portal record query failed", {
          patient: patientResult.error?.message,
          plan: planResult.error?.message,
          sessions: sessionResult.error?.message,
          ledger: ledgerResult.error?.message,
          summary: summaryResult.error?.message,
        });
        return json({ error: "Unable to load this patient record." }, 503);
      }

      const sessions = (sessionResult.data ?? []).map((row: Record<string, unknown>) => ({
        session_date: String(row.session_date),
        status: String(row.status),
        session_label: typeof row.session_label === "string" ? row.session_label : null,
        charge_amount: Number(row.charge_amount ?? 0),
        plan_id: typeof row.plan_id === "string" ? row.plan_id : null,
      }));
      const ledger = (ledgerResult.data ?? []).map((row: Record<string, unknown>) => ({
        entry_type: String(row.entry_type),
        amount: Number(row.amount),
        description: typeof row.description === "string" ? row.description : "Account entry",
        payment_method: typeof row.payment_method === "string" ? row.payment_method : null,
        occurred_at: String(row.occurred_at),
      }));
      const planRow = Array.isArray(planResult.data) ? planResult.data[0] ?? null : null;
      const summary = summaryResult.data as Record<string, unknown>;

      return json({
        patient: { full_name: patientResult.data.full_name, status: patientResult.data.status },
        plan: planRow ? {
          title: planRow.title,
          plan_type: planRow.plan_type,
          package_sessions: planRow.package_sessions,
          package_fee: planRow.package_fee,
          per_session_fee: planRow.per_session_fee,
        } : null,
        sessions: sessions.map(({ plan_id: _planId, ...row }) => row),
        ledger,
        summary,
      });
    }

    return json({ error: "Unsupported portal action." }, 400);
  } catch (error) {
    console.error("Patient portal request failed:", error);
    return json({ error: "The portal request could not be completed." }, 500);
  }
});
