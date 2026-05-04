import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/site/PolicyPage";
export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "terms — BloodMC" }] }),
  component: () => <PolicyPage slug="terms" eyebrow="Legal" />,
});
