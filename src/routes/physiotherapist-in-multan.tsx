import { createFileRoute } from "@tanstack/react-router";
import { getLocalPage } from "@/data/localPages";
import { LocalLandingPage } from "@/components/site/LocalLandingPage";
import { localPageHead } from "@/lib/local-seo";

const page = getLocalPage("physiotherapist-in-multan")!;

export const Route = createFileRoute("/physiotherapist-in-multan")({
  head: () => localPageHead(page),
  component: () => <LocalLandingPage page={page} />,
});
