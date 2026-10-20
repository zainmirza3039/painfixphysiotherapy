import { createFileRoute, isNotFound, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, BookOpen } from "lucide-react";
import { PageLayout } from "@/components/site/PageLayout";
import { PageHero } from "@/components/site/PageHero";
import { ProgramDetail } from "@/components/internships/ProgramDetail";
import { getInternshipProgram } from "@/lib/internships.functions";
import { canonical, pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/internships/$slug")({
  headers: () => ({ "Cache-Control": "no-store, max-age=0" }),
  loader: async ({ params }) => {
    try {
      const program = await getInternshipProgram({ data: { slug: params.slug } });
      if (!program) throw notFound();
      return { program, error: null };
    } catch (error) {
      if (isNotFound(error)) throw error;
      console.error("Unable to load internship program", error);
      return {
        program: null,
        error: "This program is temporarily unavailable. Please try again later.",
      };
    }
  },
  head: ({ params, loaderData }) => {
    const title = loaderData?.program?.title ?? "Internship program";
    return {
      meta: pageMeta({
        title: `${title} | PainFix Physiotherapy Clinic`,
        description:
          loaderData?.program?.description ??
          "Review a PainFix internship program and its application information.",
        path: `/internships/${params.slug}`,
      }),
      links: canonical(`/internships/${params.slug}`),
    };
  },
  component: InternshipDetailPage,
});
function InternshipDetailPage() {
  const { program, error } = Route.useLoaderData();
  if (error)
    return (
      <PageLayout>
        <PageHero
          eyebrow="Internships"
          title="Program unavailable"
          subtitle={error}
          crumbs={[
            { label: "Home", path: "/" },
            { label: "Internships", path: "/internships" },
          ]}
          showActions={false}
          icon={<BookOpen className="h-7 w-7" />}
        />
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <Link to="/internships" className="font-semibold text-primary hover:underline">
            Browse published programs
          </Link>
        </div>
      </PageLayout>
    );
  if (!program)
    return (
      <PageLayout>
        <PageHero
          eyebrow="Internships"
          title="Program not found"
          subtitle="This program is not published or may have been removed."
          crumbs={[
            { label: "Home", path: "/" },
            { label: "Internships", path: "/internships" },
          ]}
          showActions={false}
          icon={<BookOpen className="h-7 w-7" />}
        />
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <Link
            to="/internships"
            className="inline-flex items-center gap-2 font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Browse published programs
          </Link>
        </div>
      </PageLayout>
    );
  return (
    <PageLayout>
      <PageHero
        eyebrow={program.discipline}
        title={program.title}
        subtitle="Published program information from PainFix Physiotherapy Clinic."
        crumbs={[
          { label: "Home", path: "/" },
          { label: "Internships", path: "/internships" },
          { label: program.title, path: `/internships/${program.slug}` },
        ]}
        showActions={false}
        icon={<BookOpen className="h-7 w-7" />}
      />
      <ProgramDetail program={program} />
    </PageLayout>
  );
}
