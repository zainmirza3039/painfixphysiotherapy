import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/site/PageLayout";
import { PageHero } from "@/components/site/PageHero";
import { CertificateVerification } from "@/components/internships/CertificateVerification";
import { verifyCertificate } from "@/lib/internships.functions";
import { canonical, pageMeta } from "@/lib/seo";
import { z } from "zod";
const searchSchema = z.object({ reference: z.string().max(160).optional().default("") });
export const Route = createFileRoute("/verify-certificate")({
  validateSearch: searchSchema,
  headers: () => ({
    "Cache-Control": "no-store, max-age=0",
    "X-Robots-Tag": "noindex, nofollow, noarchive",
    "Referrer-Policy": "no-referrer",
  }),
  loader: async ({ location }) => {
    const reference = String((location.search as { reference?: string }).reference ?? "").trim();
    if (!reference) return { reference: "", result: null };
    try {
      return { reference, result: await verifyCertificate({ data: { reference } }) };
    } catch {
      return { reference, result: { status: "unavailable" as const } };
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
function VerifyCertificatePage() {
  const { reference, result } = Route.useLoaderData();
  return (
    <PageLayout>
      <PageHero
        eyebrow="Public verification"
        title="Verify a certificate"
        subtitle="Check an issued PainFix certificate using its unique reference. This page does not issue certificates or establish professional licensure."
        crumbs={[
          { label: "Home", path: "/" },
          { label: "Verify certificate", path: "/verify-certificate" },
        ]}
        showActions={false}
      />
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <CertificateVerification initialReference={reference} initialResult={result} />
      </section>
    </PageLayout>
  );
}
