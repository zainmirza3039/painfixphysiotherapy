import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { FileCheck2, ShieldCheck, CircleAlert } from "lucide-react";
import { PageLayout } from "@/components/site/PageLayout";
import { PageHero } from "@/components/site/PageHero";
import { canonical, pageMeta } from "@/lib/seo";
import { verifyMedicalDocument } from "@/admin/medical-documents.functions";

const searchSchema = z.object({ reference: z.string().max(160).optional().default("") });

export const Route = createFileRoute("/verify-medical-document")({
  validateSearch: searchSchema,
  headers: () => ({
    "Cache-Control": "no-store, max-age=0",
    "X-Robots-Tag": "noindex, nofollow, noarchive",
    "Referrer-Policy": "no-referrer",
  }),
  loader: async ({ location }) => {
    const reference = String((location.search as { reference?: string }).reference ?? "").trim();
    if (!reference) return { hasReference: false, result: null };
    try {
      return {
        hasReference: true,
        result: await verifyMedicalDocument({ data: { reference } }),
      };
    } catch {
      return { hasReference: true, result: { status: "unavailable" as const } };
    }
  },
  head: () => ({
    meta: [
      ...pageMeta({
        title: "Verify a PainFix medical document",
        description: "Verify the authenticity and current status of a PainFix medical document.",
        path: "/verify-medical-document",
      }),
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
    links: canonical("/verify-medical-document"),
  }),
  component: VerifyMedicalDocumentPage,
});

function VerifyMedicalDocumentPage() {
  const { hasReference, result } = Route.useLoaderData();
  const verified = result && result.status !== "not_found" && result.status !== "unavailable";
  const issuedDate = verified && result.issued_at
    ? new Date(result.issued_at).toLocaleDateString("en-GB", {
        day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
      })
    : null;

  return (
    <PageLayout>
      <PageHero
        eyebrow="Public verification"
        title="Verify a medical document"
        subtitle="Check whether a document reference was issued by PainFix and review its current status."
        crumbs={[
          { label: "Home", path: "/" },
          { label: "Verify medical document", path: "/verify-medical-document" },
        ]}
        showActions={false}
      />
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        {!hasReference ? (
          <div className="border border-border bg-card p-6 text-center">
            <ShieldCheck className="mx-auto h-8 w-8 text-primary" />
            <h2 className="mt-3 text-lg font-semibold text-foreground">Verification reference required</h2>
            <p className="mt-2 text-sm text-muted-foreground">Scan the QR code printed on the PainFix document to verify its reference.</p>
          </div>
        ) : verified ? (
          <div className="border border-border bg-card">
            <div className="flex items-center gap-3 border-b border-border p-5">
              <span className="grid h-10 w-10 place-items-center border border-secondary/40 text-secondary"><FileCheck2 className="h-5 w-5" /></span>
              <div>
                <h2 className="text-base font-semibold text-foreground">PainFix document record found</h2>
                <p className="mt-1 text-xs text-muted-foreground">This confirms issuance and the current recorded status only.</p>
              </div>
            </div>
            <dl className="grid gap-4 p-5 sm:grid-cols-2">
              <div><dt className="text-xs text-muted-foreground">Patient name</dt><dd className="mt-1 text-sm font-semibold text-foreground">{result.patient_name}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Document number</dt><dd className="mt-1 font-mono text-sm font-semibold text-foreground">{result.document_number}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Document type</dt><dd className="mt-1 text-sm capitalize text-foreground">{result.document_type.replaceAll("_", " ")}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Issue date</dt><dd className="mt-1 text-sm text-foreground">{issuedDate ?? "Not available"}</dd></div>
              <div className="sm:col-span-2"><dt className="text-xs text-muted-foreground">Current status</dt><dd className="mt-1 text-sm font-semibold capitalize text-foreground">{result.status}</dd></div>
            </dl>
            <p className="border-t border-border px-5 py-4 text-xs leading-5 text-muted-foreground">Verification confirms that this reference matches a PainFix document record. It does not independently validate the clinical events or replace the original signed document.</p>
          </div>
        ) : (
          <div className="border border-border bg-card p-6 text-center">
            <CircleAlert className="mx-auto h-8 w-8 text-muted-foreground" />
            <h2 className="mt-3 text-lg font-semibold text-foreground">
              {result?.status === "unavailable" ? "Verification temporarily unavailable" : "No matching document found"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {result?.status === "unavailable"
                ? "The verification service could not complete this request. Please try again later."
                : "This reference does not match an issued PainFix medical document."}
            </p>
          </div>
        )}
      </section>
    </PageLayout>
  );
}
