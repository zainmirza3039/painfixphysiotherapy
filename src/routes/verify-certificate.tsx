import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/site/PageLayout";
import { PageHero } from "@/components/site/PageHero";
import { CertificateVerification } from "@/components/internships/CertificateVerification";
import { verifyCertificate } from "@/lib/internships.functions";
import { supabase } from "@/integrations/supabase/client";
import { canonical, pageMeta } from "@/lib/seo";
import { z } from "zod";

const searchSchema = z.object({
  reference: z.string().max(160).optional().default(""),
  type: z.enum(["certificate", "treatment"]).optional().default("certificate"),
});
type TreatmentVerificationResult = {
  status: "valid" | "revoked" | "superseded" | "not_found";
  document_number?: string;
  issued_at?: string;
  clinic?: string;
  patient?: string;
  treatment_start?: string;
  treatment_end?: string;
  completed_sessions?: number;
  amount_paid?: number;
  currency?: string;
  message?: string;
};

export const Route = createFileRoute("/verify-certificate")({
  validateSearch: searchSchema,
  headers: () => ({
    "Cache-Control": "no-store, max-age=0",
    "X-Robots-Tag": "noindex, nofollow, noarchive",
    "Referrer-Policy": "no-referrer",
  }),
  loader: async ({ location }) => {
    const search = location.search as { reference?: string; type?: string };
    const reference = String(search.reference ?? "").trim();
    if (search.type === "treatment") {
      if (!/^[a-f0-9]{64}$/.test(reference)) {
        return {
          reference,
          kind: "treatment" as const,
          treatmentResult: { status: "not_found" as const },
          certificateResult: null,
        };
      }
      try {
        const { data, error } = await supabase.functions.invoke(
          "verify-treatment-document",
          { body: { token: reference } },
        );
        return {
          reference,
          kind: "treatment" as const,
          treatmentResult:
            error || !data
              ? { status: "not_found" as const }
              : (data as TreatmentVerificationResult),
          certificateResult: null,
        };
      } catch {
        return {
          reference,
          kind: "treatment" as const,
          treatmentResult: { status: "not_found" as const },
          certificateResult: null,
        };
      }
    }
    if (!reference) {
      return {
        reference: "",
        kind: "certificate" as const,
        treatmentResult: null,
        certificateResult: null,
      };
    }
    try {
      return {
        reference,
        kind: "certificate" as const,
        treatmentResult: null,
        certificateResult: await verifyCertificate({ data: { reference } }),
      };
    } catch {
      return {
        reference,
        kind: "certificate" as const,
        treatmentResult: null,
        certificateResult: { status: "unavailable" as const },
      };
    }
  },
  head: () => ({
    meta: [
      ...pageMeta({
        title: "Verify a PainFix certificate",
        description: "Verify an issued PainFix certificate by its reference number.",
        path: "/verify-certificate",
      }),
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
    links: canonical("/verify-certificate"),
  }),
  component: VerifyCertificatePage,
});

function TreatmentVerification({ result }: { result: TreatmentVerificationResult }) {
  const date = (value?: string) =>
    value
      ? new Date(value + "T00:00:00Z").toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
          timeZone: "UTC",
        })
      : "—";
  if (result.status === "not_found") {
    return (
      <div className="rounded-xl border border-destructive/30 bg-card p-6">
        <h2 className="font-semibold text-destructive">Document not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This reference does not match a document in the PainFix verification register.
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold">PainFix treatment verification record</h2>
        <span
          className={
            result.status === "valid"
              ? "rounded-md bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800"
              : "rounded-md bg-red-50 px-3 py-1 text-sm font-semibold text-red-800"
          }
        >
          {result.status.toUpperCase()}
        </span>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{result.message}</p>
      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        {[
          ["Document number", result.document_number],
          ["Issued by", result.clinic],
          ["Patient", result.patient],
          ["Treatment period", date(result.treatment_start) + " – " + date(result.treatment_end)],
          ["Completed sessions", String(result.completed_sessions ?? "—")],
          [
            "Amount received",
            (result.currency ?? "PKR") +
              " " +
              Number(result.amount_paid ?? 0).toLocaleString("en-PK"),
          ],
          [
            "Issue date",
            result.issued_at ? new Date(result.issued_at).toLocaleDateString("en-GB") : "—",
          ],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-1 font-medium">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">
        This confirms document authenticity and status only. It does not determine insurance
        eligibility, policy coverage or reimbursement.
      </p>
    </div>
  );
}

function VerifyCertificatePage() {
  const { reference, kind, treatmentResult, certificateResult } = Route.useLoaderData();
  return (
    <PageLayout>
      <PageHero
        eyebrow="Public verification"
        title={kind === "treatment" ? "Verify a treatment certificate" : "Verify a certificate"}
        subtitle="Check an issued PainFix document using its unique QR reference. Verification does not establish professional licensure or guarantee reimbursement."
        crumbs={[
          { label: "Home", path: "/" },
          { label: "Verify certificate", path: "/verify-certificate" },
        ]}
        showActions={false}
      />
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        {kind === "treatment" ? (
          <TreatmentVerification result={treatmentResult as TreatmentVerificationResult} />
        ) : (
          <CertificateVerification initialReference={reference} initialResult={certificateResult} />
        )}
      </section>
    </PageLayout>
  );
}
