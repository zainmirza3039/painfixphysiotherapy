import { createFileRoute } from "@tanstack/react-router";
import { Gallery } from "@/components/site/Gallery";
import { PageCTA } from "@/components/site/PageCTA";
import { PageHero } from "@/components/site/PageHero";
import { PageLayout } from "@/components/site/PageLayout";
import { breadcrumbLd, canonical, pageMeta } from "@/lib/seo";

const TITLE = "PainFix Physiotherapy Clinic Gallery | Multan";
const DESCRIPTION =
  "Explore photos of PainFix Physiotherapy Clinic in Multan, including our treatment rooms, clinic space and physiotherapy sessions.";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: pageMeta({ title: TITLE, description: DESCRIPTION, path: "/gallery" }),
    links: canonical("/gallery"),
    scripts: [
      breadcrumbLd([
        { label: "Home", path: "/" },
        { label: "Gallery", path: "/gallery" },
      ]),
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Gallery"
        title="Inside the PainFix clinic."
        subtitle="A look at our clinic in Multan and the spaces where assessment, treatment and rehabilitation take place."
        crumbs={[
          { label: "Home", path: "/" },
          { label: "Gallery", path: "/gallery" },
        ]}
      />
      <Gallery />
      <PageCTA title="Have a question about visiting the clinic?" />
    </PageLayout>
  );
}
