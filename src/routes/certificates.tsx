import { Link, createFileRoute } from "@tanstack/react-router";
import { Award, CheckCircle2, ShieldCheck } from "lucide-react";
import { PageLayout } from "@/components/site/PageLayout";
import { PageHero } from "@/components/site/PageHero";
import { PageCTA } from "@/components/site/PageCTA";
import { canonical, pageMeta } from "@/lib/seo";
export const Route = createFileRoute("/certificates")({
  head: () => ({
    meta: pageMeta({
      title: "PainFix Certificates | Verify a certificate",
      description:
        "Learn what PainFix internship completion and professional experience certificates confirm, and verify a certificate reference.",
      path: "/certificates",
    }),
    links: canonical("/certificates"),
  }),
  component: CertificatesPage,
});
function CertificatesPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Credentials and records"
        title="PainFix certificates"
        subtitle="Understand the limited purpose of certificates issued by PainFix and verify an issued reference online."
        crumbs={[
          { label: "Home", path: "/" },
          { label: "Certificates", path: "/certificates" },
        ]}
        showActions={false}
        icon={<Award className="h-7 w-7" />}
      />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <CheckCircle2 className="h-7 w-7 text-secondary" />
            <h2 className="mt-4 font-heading text-xl font-bold text-foreground">
              Internship completion certificates
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Where issued, this records completion of a PainFix internship against the relevant
              program’s completion criteria. It is not issued automatically with an application.
            </p>
          </article>
          <article className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <ShieldCheck className="h-7 w-7 text-secondary" />
            <h2 className="mt-4 font-heading text-xl font-bold text-foreground">
              Professional experience certificates
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Where eligible and supported by verified PainFix records, this may confirm genuine
              professional work or engagement. It is not offered solely on request without
              supporting records.
            </p>
          </article>
        </div>
        <section className="mt-8 rounded-2xl border border-border bg-muted p-6">
          <h2 className="font-heading text-xl font-bold text-foreground">
            What a PainFix certificate does not confirm
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            A PainFix certificate is not a university degree, government registration, statutory
            licence, or independently accredited qualification. It does not replace the requirements
            of a regulator, university, employer, or professional body.
          </p>
        </section>
        <section className="mt-8 rounded-2xl border border-primary/20 bg-accent p-6">
          <h2 className="font-heading text-xl font-bold text-foreground">
            Verify an issued certificate
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Use the unguessable reference printed on the certificate or its canonical QR link.
          </p>
          <Link
            to="/verify-certificate"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Open verification
          </Link>
        </section>
      </main>
      <PageCTA />
    </PageLayout>
  );
}
