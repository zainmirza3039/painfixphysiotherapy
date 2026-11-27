import { createClient } from "npm:@supabase/supabase-js@2";

const headers = {
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
};
function response(req: Request, body: unknown, status = 200) {
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
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...headers,
      ...(origin && (allowed.has(origin) || preview)
        ? { "Access-Control-Allow-Origin": origin, Vary: "Origin" }
        : {}),
    },
  });
}
const encoder = new TextEncoder();
async function sha256Hex(value: string) {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
  return Array.from(digest, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
function tokenHex() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}
function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(value + "T00:00:00Z");
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}
function textField(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

const url = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return response(req, {});
  if (req.method !== "POST") return response(req, { error: "Method not allowed." }, 405);

  try {
    const authorization = req.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return response(req, { error: "Sign in required." }, 401);
    }

    const userClient = createClient(url, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: authData, error: authError } = await userClient.auth.getUser();
    const clinician = authData.user;
    if (authError || !clinician) {
      return response(req, { error: "Session expired. Sign in again." }, 401);
    }

    const body = await req.json();
    const patientId = typeof body?.patientId === "string" ? body.patientId : "";
    const diagnosis = textField(body?.diagnosis, 160);
    const clinicalFindings = textField(body?.clinicalFindings, 240);
    const treatmentSummary = textField(body?.treatmentSummary, 360);
    const treatmentAdvice = textField(body?.treatmentAdvice, 240);
    const treatmentStart = body?.treatmentStart;
    const treatmentEnd = body?.treatmentEnd;

    if (
      !/^[0-9a-f-]{36}$/i.test(patientId) ||
      !diagnosis ||
      !clinicalFindings ||
      !treatmentSummary ||
      !treatmentAdvice ||
      body?.consentConfirmed !== true ||
      !validDate(treatmentStart) ||
      !validDate(treatmentEnd) ||
      treatmentStart > treatmentEnd
    ) {
      return response(
        req,
        { error: "Complete all required clinical details, consent and treatment dates." },
        400,
      );
    }

    const { data: patient, error: patientError } = await admin
      .from("personal_patients")
      .select("id,full_name")
      .eq("id", patientId)
      .eq("clinician_id", clinician.id)
      .single();
    if (patientError || !patient) {
      return response(req, { error: "Patient record not found." }, 404);
    }

    const { data: sessions, error: sessionsError } = await admin
      .from("personal_patient_sessions")
      .select("id,session_date,status")
      .eq("patient_id", patientId)
      .eq("clinician_id", clinician.id)
      .eq("status", "completed")
      .is("deleted_at", null)
      .gte("session_date", new Date(treatmentStart + "T00:00:00+05:00").toISOString())
      .lte("session_date", new Date(treatmentEnd + "T23:59:59.999+05:00").toISOString());
    if (sessionsError) {
      return response(req, { error: "Could not validate completed sessions." }, 500);
    }
    if (!sessions?.length) {
      return response(
        req,
        { error: "No completed sessions exist in the selected treatment period." },
        400,
      );
    }

    const { data: ledger, error: ledgerError } = await admin
      .from("personal_patient_ledger")
      .select("id,entry_type,amount,description,payment_method,reference,occurred_at")
      .eq("patient_id", patientId)
      .eq("clinician_id", clinician.id)
      .order("occurred_at", { ascending: false });
    if (ledgerError) {
      return response(req, { error: "Could not validate the financial ledger." }, 500);
    }

    const entries = ledger ?? [];
    const totalCharges = entries
      .filter((entry) => entry.entry_type === "charge")
      .reduce((sum, entry) => sum + Number(entry.amount), 0);
    const totalPayments = entries
      .filter((entry) => entry.entry_type === "payment")
      .reduce((sum, entry) => sum + Math.abs(Number(entry.amount)), 0);
    const refunds = entries
      .filter((entry) => entry.entry_type === "refund")
      .reduce((sum, entry) => sum + Math.max(0, Number(entry.amount)), 0);
    const paymentReversals = entries
      .filter(
        (entry) =>
          entry.entry_type === "adjustment" && entry.description.startsWith("Payment reversal:"),
      )
      .reduce((sum, entry) => sum + Math.max(0, Number(entry.amount)), 0);
    const reversedPaymentIds = new Set(
      entries
        .filter(
          (entry) =>
            entry.entry_type === "adjustment" && entry.reference?.startsWith("payment-reversal:"),
        )
        .map((entry) => entry.reference!.slice("payment-reversal:".length)),
    );
    const amountPaid = Math.max(0, totalPayments - refunds - paymentReversals);
    const balance = entries.reduce((sum, entry) => sum + Number(entry.amount), 0);
    const latestPayment = entries.find(
      (entry) => entry.entry_type === "payment" && !reversedPaymentIds.has(entry.id),
    );

    const verificationToken = tokenHex();
    const issuedAt = new Date().toISOString();
    const documentNumber =
      "PFX-PT-" + new Date().getFullYear() + "-" + crypto.randomUUID().slice(0, 8).toUpperCase();
    const snapshot = {
      patientName: patient.full_name,
      diagnosis,
      clinicalFindings,
      treatmentSummary,
      treatmentAdvice,
      treatmentStart,
      treatmentEnd,
      completedSessions: sessions.length,
      totalCharges,
      amountPaid,
      balance,
      paymentMethod: latestPayment?.payment_method?.replaceAll("_", " ") || "Not specified",
      transactionReference: latestPayment?.reference || "Not recorded",
      issuedAt,
      documentNumber,
      verificationToken,
      patientConsentConfirmedAt: issuedAt,
      patientConsentStatement:
        "Clinician confirms that patient consent to sharing this certificate with the receiving organization has been obtained.",
    };
    const publicSnapshot = {
      patient: patient.full_name.trim().slice(0, 1) + "••••",
      treatment_start: treatmentStart,
      treatment_end: treatmentEnd,
      completed_sessions: sessions.length,
      amount_paid: amountPaid,
    };

    const { error: insertError } = await admin.from("personal_patient_treatment_documents").insert({
      clinician_id: clinician.id,
      patient_id: patientId,
      document_number: documentNumber,
      verification_token_hash: await sha256Hex(verificationToken),
      snapshot,
      public_snapshot: publicSnapshot,
    });
    if (insertError) {
      return response(req, { error: "Could not issue the treatment certificate." }, 500);
    }

    return response(req, { documentNumber, snapshot });
  } catch {
    return response(req, { error: "Unexpected error. Please retry." }, 500);
  }
});
