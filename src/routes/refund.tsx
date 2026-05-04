import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/site/PolicyPage";
export const Route = createFileRoute("/refund")({
  head: () => ({ meta: [{ title: "refund — BloodMC" }] }),
  component: () => <PolicyPage slug="refund" eyebrow="Legal" />,
});
