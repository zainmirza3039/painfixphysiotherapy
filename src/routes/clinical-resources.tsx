import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Download, FileText, GraduationCap } from "lucide-react";
import { PageLayout } from "@/components/site/PageLayout";
import { PageHero } from "@/components/site/PageHero";
import { PageCTA } from "@/components/site/PageCTA";
import { canonical, pageMeta, breadcrumbLd } from "@/lib/seo";

const PATH = "/clinical-resources";
const TITLE = "Clinical Physiotherapy Resources | PainFix Multan";
const DESCRIPTION =
  "Clinical education from PainFix Multan, including evidence-based guidance on chronic non-specific low back pain management.";

export const Route = createFileRoute("/clinical-resources")({
  head: () => ({
    meta: pageMeta({ title: TITLE, description: DESCRIPTION, path: PATH }),
    links: canonical(PATH),
    scripts: [
      breadcrumbLd([
        { label: "Home", path: "/" },
        { label: "Clinical Resources", path: PATH },
      ]),
    ],
  }),
  component: ClinicalResourcesPage,
});

const PRESENTATION_PARTS = [
  {
    number: "01",
    title: "Clinical Understanding & Assessment",
    description:
      "A structured overview of chronic non-specific low back pain, clinical reasoning, red-flag screening, history taking, physical examination, imaging considerations and patient communication.",
    filename: "chronic-low-back-pain-part-1-assessment.pdf",
    topics: ["Clinical assessment", "Red flags", "Biopsychosocial approach"],
  },
  {
    number: "02",
    title: "Treatment & Rehabilitation",
    description:
      "An overview of evidence-informed management, including manual therapy as an adjunct, exercise prescription, graded activity, education, self-management and outcome-based reassessment.",
    filename: "chronic-low-back-pain-part-2-rehabilitation.pdf",
    topics: ["Treatment planning", "Exercise rehabilitation", "Reassessment"],
  },
];

function ClinicalResourcesPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="PainFix Learning Library"
        title="Clinical Resources"
        subtitle="Educational material prepared by PainFix to support informed discussion and continued learning in physiotherapy and rehabilitation."
        icon={<BookOpen className="h-8 w-8" />}
        crumbs={[
          { label: "Home", path: "/" },
          { label: "Clinical Resources", path: PATH },
        ]}
        showActions={false}
      />

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <section aria-labelledby="featured-resource-heading">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-secondary">
              Featured presentation · 2 parts
            </p>
            <h2
              id="featured-resource-heading"
              className="mt-3 font-heading text-2xl font-bold text-foreground sm:text-3xl"
            >
              Evidence-Based Physiotherapy for Chronic Non-Specific Low Back Pain
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
              A clinical education presentation covering assessment through rehabilitation. The two
              parts are organised separately so readers can access the topic they need.
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {PRESENTATION_PARTS.map((part) => (
              <article
                key={part.number}
                className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-soft"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 font-heading text-sm font-bold text-primary">
                    {part.number}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
                    <FileText className="h-3.5 w-3.5" />
                    PDF
                  </span>
                </div>
                <h3 className="mt-5 font-heading text-xl font-bold text-foreground">
                  {part.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-7 text-muted-foreground">
                  {part.description}
                </p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {part.topics.map((topic) => (
                    <li
                      key={topic}
                      className="rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground"
                    >
                      {topic}
                    </li>
                  ))}
                </ul>
                <a
                  href={`/resources/${part.filename}`}
                  download
                  className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label={`Download PDF: ${part.title}`}
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-2xl border border-border bg-muted/60 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary/10 text-secondary">
              <GraduationCap className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-heading text-lg font-bold text-foreground">
                About these resources
              </h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Prepared for educational purposes by Dr. Zain Ul Abideen, DPT, Clinical
                Physiotherapist, PainFix Physiotherapy Clinic, Multan. These materials do not
                replace an individual clinical assessment, professional judgement or current
                clinical guidelines. Readers should consult the references included in each
                presentation and check for updated guidance before applying recommendations.
              </p>
            </div>
          </div>
        </section>
      </main>
      <PageCTA />
    </PageLayout>
  );
}
