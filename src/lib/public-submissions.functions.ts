import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, setResponseHeader } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const contactInput = z
  .object({
    name: z.string().trim().min(1).max(200),
    email: z.string().trim().max(254).nullable(),
    phone: z.string().trim().min(1).max(40),
    message: z.string().trim().min(1).max(5000),
    website: z.string().max(500).optional(),
  })
  .strict();

const homeVisitInput = z
  .object({
    full_name: z.string().trim().min(1).max(200),
    phone: z
      .string()
      .trim()
      .min(1)
      .max(40)
      .refine((value) => {
        const digits = value.replace(/\D/g, "");
        return digits.length >= 7 && digits.length <= 15;
      }, "Enter a valid phone number"),
    address: z.string().trim().min(1).max(1000),
    medical_condition: z.string().trim().min(1).max(200),
    preferred_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    preferred_time: z.string().trim().min(1).max(20),
    notes: z.string().max(5000).nullable(),
  })
  .strict();

function publicClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Submission service unavailable");
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

async function checkRateLimit(kind: "contact" | "home_visit", secondary: string) {
  const forwarded =
    process.env.VERCEL === "1"
      ? getRequestHeader("x-vercel-forwarded-for")?.split(",", 1)[0]?.trim()
      : undefined;
  const source = forwarded || "shared-global";
  const secret = process.env.INTERNSHIP_RATE_LIMIT_SECRET ?? "deployment-rate-limit";
  const { createHash } = await import("node:crypto");
  const rateKey = createHash("sha256").update(secret + ":" + source).digest("hex");

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const rpc = supabaseAdmin as unknown as {
    rpc: (
      name: string,
      args: Record<string, string>,
    ) => Promise<{ data: unknown; error: unknown }>;
  };
  const { data, error } = await rpc.rpc("check_public_submission_rate_limit", {
    p_kind: kind,
    p_rate_key: rateKey,
    p_secondary: secondary,
  });
  if (error || data !== true) {
    if (error) console.error("Public submission rate-limit check failed", { kind });
    throw new Error("Too many requests. Please try again later.");
  }
}

export const submitContactMessage = createServerFn({ method: "POST" })
  .inputValidator((input) => contactInput.parse(input))
  .handler(async ({ data }) => {
    setResponseHeader("cache-control", "no-store");

    // Honeypot submissions are accepted silently but never persisted.
    if (data.website?.trim()) return { success: true };

    const normalizedEmail = data.email?.trim() ?? "";
    if (normalizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      throw new Error("Enter a valid email address.");
    }

    await checkRateLimit("contact", normalizedEmail || data.phone);
    const { error } = await publicClient().from("contact_submissions").insert({
      name: data.name,
      email: normalizedEmail || null,
      phone: data.phone,
      message: data.message,
    });
    if (error) {
      console.error("Contact submission insert failed", { code: error.code });
      throw new Error("Unable to send your message. Please try again.");
    }
    return { success: true };
  });

export const createHomeVisitRequest = createServerFn({ method: "POST" })
  .inputValidator((input) => homeVisitInput.parse(input))
  .handler(async ({ data }) => {
    setResponseHeader("cache-control", "no-store");
    const digits = data.phone.replace(/\D/g, "");
    await checkRateLimit("home_visit", digits);
    const { error } = await publicClient().from("home_visit_requests").insert({
      full_name: data.full_name,
      phone: data.phone,
      address: data.address,
      medical_condition: data.medical_condition,
      preferred_date: data.preferred_date,
      preferred_time: data.preferred_time,
      notes: data.notes?.trim() || null,
    });
    if (error) {
      console.error("Home visit submission insert failed", { code: error.code });
      throw new Error("Unable to submit your request. Please try again.");
    }
    return { success: true };
  });
