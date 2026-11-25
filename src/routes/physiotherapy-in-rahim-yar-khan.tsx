import { createFileRoute, notFound } from "@tanstack/react-router";

// The RYK landing page is retired and has no equivalent replacement.
export const Route = createFileRoute("/physiotherapy-in-rahim-yar-khan")({
  beforeLoad: () => {
    throw notFound();
  },
  component: () => null,
});
