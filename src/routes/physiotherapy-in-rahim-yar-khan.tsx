import { createFileRoute, redirect } from "@tanstack/react-router";

// Retain a redirect for the retired URL so old bookmarks and indexed links do not expose content.
export const Route = createFileRoute("/physiotherapy-in-rahim-yar-khan")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
  component: () => null,
});
