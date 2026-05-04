import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/site/PolicyPage";
export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "privacy — BloodMC" }] }),
  component: () => <PolicyPage slug="privacy" eyebrow="Legal" />,
});
