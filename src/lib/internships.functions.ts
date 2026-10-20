import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, setResponseHeader } from "@tanstack/react-start/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { PostgrestError } from "@supabase/postgrest-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { InternshipDatabase } from "@/integrations/supabase/internship-types";
import {
  applicationSchema,
  applicationStatusSchema,
  certificateEventSchema,
  certificateSchema,
  experienceInputSchema,
  experienceSchema,
  isApplicationOpen,
  participantInputSchema,
  participantSchema,
  programInputSchema,
  programSchema,
  submissionSchema,
  verificationCertificateSchema,
  type Application,
  type Certificate,
  type CertificateEvent,
  type ExperienceRecord,
  type Participant,
  type Program,
  type VerificationResult,
} from "@/lib/internships.contract";

type Client = SupabaseClient<InternshipDatabase>;
type Functions = InternshipDatabase["public"]["Functions"];
type FunctionName = keyof Functions;
type RpcResult<K extends FunctionName> = {
  data: Functions[K]["Returns"] | null;
  error: PostgrestError | null;
};

const client = (): Client => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Internship service unavailable");
  return createClient<InternshipDatabase>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
};

const adminClient = async (): Promise<Client> => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as Client;
};

const requestKey = async (): Promise<string> => {
  // Only trust this platform header on Vercel. Other deployments deliberately use
  // one shared bucket because no unforgeable client IP is available here.
  const forwarded =
    process.env.VERCEL === "1"
      ? getRequestHeader("x-vercel-forwarded-for")?.split(",", 1)[0]?.trim()
      : undefined;
  const source = forwarded || "shared-global";
  const { createHash } = await import("node:crypto");
  return createHash("sha256")
    .update(`${process.env.INTERNSHIP_RATE_LIMIT_SECRET ?? "deployment-rate-limit"}:${source}`)
    .digest("hex");
};

const unavailable = (error: unknown): never => {
  console.error("Internship backend operation failed", { operation: "internship" });
  throw new Error("Internship service unavailable");
};

const noStore = () => setResponseHeader("cache-control", "no-store");

const rpc = async <K extends FunctionName>(
  name: K,
  args: Functions[K]["Args"],
): Promise<RpcResult<K>> => (await (await adminClient()).rpc(name, args)) as RpcResult<K>;

const pageSize = 1000;
const maxRows = 10000;
async function loadAll<T>(
  loadPage: (
    from: number,
    to: number,
  ) => Promise<{ data: T[] | null; error: PostgrestError | null }>,
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await loadPage(from, from + pageSize - 1);
    if (error) throw error;
    rows.push(...(data ?? []));
    if ((data?.length ?? 0) < pageSize) return rows;
    if (rows.length >= maxRows) throw new Error("Too many records; use filters");
  }
}

export const listInternshipPrograms = createServerFn({ method: "GET" }).handler(
  async (): Promise<Program[]> => {
    noStore();
    try {
      const { data, error } = await client()
        .from("internship_programs")
        .select("*")
        .eq("status", "published")
        .order("title");
      if (error) return unavailable(error);
      return (data ?? []).map((row) => programSchema.parse(row));
    } catch (error) {
      return unavailable(error);
    }
  },
);

export const getInternshipProgram = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z
      .object({
        slug: z
          .string()
          .trim()
          .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
          .max(120),
      })
      .strict()
      .parse(input),
  )
  .handler(async ({ data }): Promise<Program | null> => {
    noStore();
    try {
      const { data: row, error } = await client()
        .from("internship_programs")
        .select("*")
        .eq("slug", data.slug)
        .eq("status", "published")
        .maybeSingle();
      if (error) return unavailable(error);
      return row ? programSchema.parse(row) : null;
    } catch (error) {
      return unavailable(error);
    }
  });

export const submitInternshipApplication = createServerFn({ method: "POST" })
  .inputValidator((input) => submissionSchema.parse(input))
  .handler(async ({ data }) => {
    noStore();
    try {
      const rateKey = await requestKey();
      const admitted = await rpc("internship_check_public_rate_limit", {
        p_kind: "submit",
        p_rate_key: rateKey,
        p_secondary: data.email,
      });
      if (admitted.error) return unavailable(admitted.error);
      if (admitted.data !== true) throw new Error("Too many submissions. Please try again later");
      const { data: result, error } = await rpc("submit_internship_application", {
        p_payload: submissionSchema.parse(data),
        p_rate_key: rateKey,
      });
      if (error) {
        if (error.message?.includes("duplicate"))
          throw new Error("An application for this program was already submitted recently");
        if (error.message?.includes("program unavailable"))
          throw new Error("This program is not accepting applications");
        if (error.message?.includes("rate limited"))
          throw new Error("Too many submissions. Please try again later");
        return unavailable(error);
      }
      return z.object({ reference: z.string().min(12).max(80) }).parse(result);
    } catch (error) {
      if (error instanceof Error && !error.message.includes("unavailable")) throw error;
      return unavailable(error);
    }
  });

export const verifyCertificate = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({ reference: z.string().trim().min(1).max(160) })
      .strict()
      .parse(input),
  )
  .handler(async ({ data }): Promise<VerificationResult> => {
    noStore();
    try {
      const rateKey = await requestKey();
      const admitted = await rpc("internship_check_public_rate_limit", {
        p_kind: "verify",
        p_rate_key: rateKey,
        p_secondary: data.reference,
      });
      if (admitted.error) return unavailable(admitted.error);
      if (admitted.data !== true) return { status: "unavailable" };
      const { data: rows, error } = await rpc("verify_internship_certificate", {
        p_reference: data.reference,
        p_rate_key: rateKey,
      });
      if (error) {
        if (error.message?.includes("rate limited")) return { status: "unavailable" };
        return unavailable(error);
      }
      const row = (Array.isArray(rows) ? rows[0] : rows) as
        | { status?: string; certificate?: VerificationResult["certificate"] | null }
        | undefined;
      if (!row || !["valid", "revoked", "not_found", "unavailable"].includes(row.status ?? ""))
        return { status: "not_found" };
      if (row.status === "valid" || row.status === "revoked") {
        return {
          status: row.status,
          certificate: verificationCertificateSchema.parse(row.certificate),
        };
      }
      return { status: row.status as "not_found" | "unavailable" };
    } catch (error) {
      return unavailable(error);
    }
  });

async function assertAdmin(context: { supabase: unknown; userId: string }) {
  const { data, error } = await (context.supabase as Client).rpc("is_admin", {
    _user_id: context.userId,
  });
  if (error || data !== true) throw new Error("Forbidden: admin access required");
}

export const listInternshipAdminData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(
    async ({
      context,
    }): Promise<{
      programs: Program[];
      applications: Application[];
      participants: Participant[];
      experience: ExperienceRecord[];
      certificates: Certificate[];
      events: CertificateEvent[];
    }> => {
      noStore();
      await assertAdmin(context);
      const s = await adminClient();
      const [
        programRows,
        applicationRows,
        participantRows,
        experienceRows,
        certificateRows,
        eventRows,
      ] = await Promise.all([
        loadAll<Program>(
          async (from, to) => await s.from("internship_programs").select("*").range(from, to),
        ),
        loadAll<Application>(
          async (from, to) => await s.from("internship_applications").select("*").range(from, to),
        ),
        loadAll<Participant>(
          async (from, to) => await s.from("internship_participants").select("*").range(from, to),
        ),
        loadAll<ExperienceRecord>(
          async (from, to) =>
            await s.from("professional_experience_records").select("*").range(from, to),
        ),
        loadAll<Certificate>(
          async (from, to) => await s.from("certificates").select("*").range(from, to),
        ),
        loadAll<CertificateEvent>(
          async (from, to) => await s.from("certificate_events").select("*").range(from, to),
        ),
      ]);
      const programs = programRows.map((row) => programSchema.parse(row));
      const slugById = new Map(programs.map((program) => [program.id, program.slug]));
      const applications = applicationRows.map((row) => {
        const slug = slugById.get(row.program_id ?? "");
        if (!slug) throw new Error("Unable to load internship management records");
        return applicationSchema.parse({ ...row, program_slug: slug }) as Application;
      });
      return {
        programs,
        applications,
        participants: participantRows.map((row) => participantSchema.parse(row)),
        experience: experienceRows.map((row) => experienceSchema.parse(row)),
        certificates: certificateRows.map((row) => certificateSchema.parse(row)),
        events: eventRows.map((row) => certificateEventSchema.parse(row)),
      };
    },
  );

async function adminRpc<K extends FunctionName>(
  context: { supabase: unknown; userId: string },
  fn: K,
  args: Omit<Functions[K]["Args"], "_actor_id">,
) {
  await assertAdmin(context);
  const { data, error } = await rpc(fn, {
    ...args,
    _actor_id: context.userId,
  } as Functions[K]["Args"]);
  if (error) {
    console.error("Internship admin operation failed", { operation: String(fn) });
    throw new Error(
      error.message?.includes("forbidden")
        ? "Forbidden: admin access required"
        : "Unable to complete internship operation",
    );
  }
  return data;
}

export const saveInternshipProgram = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => programInputSchema.parse(input))
  .handler(async ({ data, context }) =>
    programSchema.parse(await adminRpc(context, "admin_save_internship_program", { p: data })),
  );
export const reviewInternshipApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid(),
        status: applicationStatusSchema,
        internal_notes: z.string().max(5000).nullable(),
      })
      .strict()
      .parse(input),
  )
  .handler(
    async ({ data, context }) =>
      applicationSchema.parse(
        await adminRpc(context, "admin_review_internship_application", {
          p_id: data.id,
          p_status: data.status,
          p_notes: data.internal_notes,
        }),
      ) as Application,
  );
export const saveInternshipParticipant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => participantInputSchema.parse(input))
  .handler(async ({ data, context }) =>
    participantSchema.parse(
      await adminRpc(context, "admin_save_internship_participant", { p: data }),
    ),
  );
export const saveExperienceRecord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => experienceInputSchema.parse(input))
  .handler(async ({ data, context }) =>
    experienceSchema.parse(await adminRpc(context, "admin_save_experience_record", { p: data })),
  );
const issueInput = z
  .object({
    type: z.enum(["internship", "experience"]),
    source_id: z.string().uuid(),
    signatory_name: z.string().trim().min(1).max(180),
    signatory_designation: z.string().trim().min(1).max(180),
    replacement_for: z.string().uuid().optional(),
    replacement_reason: z.string().trim().min(3).max(2000).optional(),
  })
  .strict();
export const issueCertificate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => issueInput.parse(input))
  .handler(async ({ data, context }) =>
    certificateSchema.parse(
      await adminRpc(context, "admin_issue_internship_certificate", {
        p_type: data.type,
        p_source_id: data.source_id,
        p_signatory_name: data.signatory_name,
        p_signatory_designation: data.signatory_designation,
        p_replacement_for: data.replacement_for ?? null,
        p_replacement_reason: data.replacement_reason ?? null,
      }),
    ),
  );
export const revokeCertificate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({ id: z.string().uuid(), reason: z.string().trim().min(3).max(2000) })
      .strict()
      .parse(input),
  )
  .handler(async ({ data, context }) =>
    certificateSchema.parse(
      await adminRpc(context, "admin_revoke_internship_certificate", {
        p_id: data.id,
        p_reason: data.reason,
      }),
    ),
  );
export const anonymizeInternshipApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({ id: z.string().uuid(), reason: z.string().trim().min(3).max(2000) })
      .strict()
      .parse(input),
  )
  .handler(
    async ({ data, context }) =>
      applicationSchema.parse(
        await adminRpc(context, "admin_anonymize_internship_application", {
          p_id: data.id,
          p_reason: data.reason,
        }),
      ) as Application,
  );

export { isApplicationOpen };
