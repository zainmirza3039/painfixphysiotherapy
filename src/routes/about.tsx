import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { About } from "@/components/site/About";
import { PageCTA } from "@/components/site/PageCTA";
import { PageHero } from "@/components/site/PageHero";
import { PageLayout } from "@/components/site/PageLayout";
import { breadcrumbLd, canonical, pageMeta } from "@/lib/seo";

const TITLE = "About PainFix Physiotherapy Clinic in Multan";
const DESCRIPTION =
  "Learn about PainFix Physiotherapy Clinic in Multan and our thoughtful, assessment-led approach to physiotherapy, rehabilitation and recovery.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: pageMeta({ title: TITLE, description: DESCRIPTION, path: "/about" }),
    links: canonical("/about"),
    scripts: [
      breadcrumbLd([
        { label: "Home", path: "/" },
        { label: "About PainFix", path: "/about" },
      ]),
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="About PainFix"
        title="Care shaped around your movement and goals."
        subtitle="Physiotherapy and rehabilitation in Multan, with time to understand what has changed and discuss the next steps with you."
        crumbs={[
          { label: "Home", path: "/" },
          { label: "About PainFix", path: "/about" },
        ]}
      />
      <About />
      <div className="py-6">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Link
            to="/our-team"
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-primary px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Meet the PainFix physiotherapists{" "}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
      <PageCTA
        title="Have a question about PainFix?"
        subtitle="Talk with the team about our physiotherapy services, clinic information or the next step for your care."
      />
    </PageLayout>
  );
}
