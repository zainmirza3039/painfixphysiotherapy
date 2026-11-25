import { createFileRoute, redirect } from "@tanstack/react-router";

// Consolidate overlapping Multan city-intent URLs on the primary homepage.
export const Route = createFileRoute("/physiotherapy-clinic-in-multan")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
  component: () => null,
});
