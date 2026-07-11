import { createFileRoute } from "@tanstack/react-router";
import { getLocalPage } from "@/data/localPages";
import { LocalLandingPage } from "@/components/site/LocalLandingPage";
import { localPageHead } from "@/lib/local-seo";

const page = getLocalPage("physiotherapy-clinic-in-multan")!;

export const Route = createFileRoute("/physiotherapy-clinic-in-multan")({
  head: () => localPageHead(page),
  component: () => <LocalLandingPage page={page} />,
});
