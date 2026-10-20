import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, ShieldCheck } from "lucide-react";
import { PageLayout } from "@/components/site/PageLayout";
import { PageHero } from "@/components/site/PageHero";
import { PageCTA } from "@/components/site/PageCTA";
import { InternshipCard } from "@/components/internships/InternshipCard";
import { listInternshipPrograms } from "@/lib/internships.functions";
import { canonical, pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/internships/")({
  headers: () => ({ "Cache-Control": "no-store, max-age=0" }),
  loader: async () => {
    try {
      return { programs: await listInternshipPrograms(), error: null };
    } catch (error) {
      console.error("Unable to load internship programs", error);
      return {
        programs: [],
        error: "Programs are temporarily unavailable. Please try again later.",
      };
    }
  },
  head: () => ({
    meta: pageMeta({
      title: "Internship Programs | PainFix Physiotherapy Clinic",
      description:
        "Explore published PainFix internship programs, eligibility, objectives and application information.",
      path: "/internships",
    }),
    links: canonical("/internships"),
  }),
  component: InternshipsPage,
});
function InternshipsPage() {
  const { programs, error } = Route.useLoaderData();
  return (
    <PageLayout>
      <PageHero
        eyebrow="PainFix learning opportunities"
        title="Internship programs"
        subtitle="Review the programs currently published by PainFix. Details, eligibility and application status are shown from our program records."
        crumbs={[
          { label: "Home", path: "/" },
          { label: "Internships", path: "/internships" },
        ]}
        showActions={false}
        icon={<BookOpen className="h-7 w-7" />}
      />
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          {error ? (
            <div className="rounded-2xl border border-border bg-muted p-8 md:col-span-2">
              <h2 className="font-heading text-xl font-bold text-foreground">
                Programs unavailable
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            </div>
          ) : programs.length === 0 ? (
            <div className="rounded-2xl border border-border bg-muted p-8 md:col-span-2">
              <h2 className="font-heading text-xl font-bold text-foreground">
                No programs are published yet
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                There are no public internship programs to display at this time. Please check back
                later or contact the clinic with questions.
              </p>
            </div>
          ) : (
            programs.map((program) => <InternshipCard key={program.id} program={program} />)
          )}
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-16 sm:px-6 md:grid-cols-3 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-6">
          <ShieldCheck className="h-6 w-6 text-secondary" />
          <h2 className="mt-3 font-heading text-lg font-bold text-foreground">A clear process</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            We review submitted applications against each program’s published criteria. Applying
            does not guarantee selection.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <BookOpen className="h-6 w-6 text-secondary" />
          <h2 className="mt-3 font-heading text-lg font-bold text-foreground">What to expect</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Program pages explain schedule, requirements, attendance and completion criteria before
            you apply.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <ArrowRight className="h-6 w-6 text-secondary" />
          <h2 className="mt-3 font-heading text-lg font-bold text-foreground">Have a question?</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Contact the clinic if you need clarification about a published program.
          </p>
          <Link
            to="/contact"
            className="mt-3 inline-flex text-sm font-semibold text-primary hover:underline"
          >
            Contact PainFix
          </Link>
        </div>
      </section>
      <PageCTA />
    </PageLayout>
  );
}
