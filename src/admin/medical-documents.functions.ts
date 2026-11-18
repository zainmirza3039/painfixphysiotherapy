import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

type AdminContext = { supabase: SupabaseClient<Database>; userId: string };

async function assertAdmin(context: AdminContext) {
  const [{ data: isAdmin, error: adminError }, { data: isSuper, error: superError }] =
    await Promise.all([
      context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" }),
      context.supabase.rpc("has_role", { _user_id: context.userId, _role: "super_admin" }),
    ]);
  if (adminError || superError) throw new Error("Unable to verify administrator permissions");
  if (!isAdmin && !isSuper) throw new Error("Forbidden: administrator access required");
}

export interface MedicalDocumentPatient {
  id: string;
  full_name: string;
  status: string;
  created_at: string;
}

export interface MedicalDocumentListItem {
  id: string;
  document_number: string;
  document_type: "receipt" | "estimate" | "treatment_report" | "expense_statement";
  status: "pending" | "issued" | "cancelled" | "superseded";
  patient_name_snapshot: string;
  issued_at: string | null;
  created_at: string;
}

export const listMedicalDocumentPatients = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MedicalDocumentPatient[]> => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as any;
    const { data, error } = await db
      .from("personal_patients")
      .select("id, full_name, status, created_at")
      .eq("clinician_id", context.userId)
      .is("archived_at", null)
      .order("full_name", { ascending: true })
      .limit(500);
    if (error) throw new Error("Unable to load your clinical patient records");
    return (data ?? []) as MedicalDocumentPatient[];
  });

export const listMedicalDocuments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MedicalDocumentListItem[]> => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as any;
    const { data, error } = await db
      .from("medical_documents")
      .select("id, document_number, document_type, status, patient_name_snapshot, issued_at, created_at")
      .eq("clinician_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error("Unable to load medical documents");
    return (data ?? []) as MedicalDocumentListItem[];
  });

const verificationInput = z.object({
  reference: z.string().trim().regex(/^[a-f0-9]{64}$/i, "Invalid verification reference"),
}).strict();

export type MedicalDocumentVerification =
  | { status: "not_found" }
  | {
      status: "issued" | "cancelled" | "superseded";
      patient_name: string;
      document_number: string;
      document_type: string;
      issued_at: string | null;
    };

/** Public projection only. Never return the stored snapshot, token hash, or patient ID. */
export const verifyMedicalDocument = createServerFn({ method: "GET" })
  .inputValidator((input) => verificationInput.parse(input))
  .handler(async ({ data }): Promise<MedicalDocumentVerification> => {
    const tokenBytes = new TextEncoder().encode(data.reference.toLowerCase());
    const digest = await crypto.subtle.digest("SHA-256", tokenBytes);
    const tokenHash = Array.from(new Uint8Array(digest), (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as any;
    const { data: row, error } = await db
      .from("medical_documents")
      .select("patient_name_snapshot, document_number, document_type, status, issued_at")
      .eq("verification_token_hash", tokenHash)
      .in("status", ["issued", "cancelled", "superseded"])
      .maybeSingle();

    if (error) throw new Error("Verification is temporarily unavailable");
    if (!row) return { status: "not_found" };
    return {
      status: row.status,
      patient_name: row.patient_name_snapshot,
      document_number: row.document_number,
      document_type: row.document_type,
      issued_at: row.issued_at,
    };
  });
