import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

export const Route = createFileRoute("/support")({
  head: () => ({ meta: [{ title: "Support — BloodMC" }] }),
  component: SupportPage,
});

function SupportPage() {
  const { data: page } = useQuery({
    queryKey: ["policy", "support"],
    queryFn: async () => (await supabase.from("policy_pages").select("*").eq("slug", "support").maybeSingle()).data,
  });
  return (
    <SiteLayout>
      <PageHeader eyebrow="Support" title={page?.title || "Get Help"} />
      <section className="container mx-auto px-4 py-10 max-w-3xl">
        <p className="whitespace-pre-line text-muted-foreground">{page?.content}</p>
        <div className="mt-8 rounded-xl border border-primary/30 bg-blood p-8 text-center">
          <h3 className="text-2xl font-bold text-primary-foreground">Need help right now?</h3>
          <p className="mt-2 text-primary-foreground/90">Open a Discord ticket and our team responds ASAP.</p>
          <a href="https://discord.gg/kUZjRQsxtm" target="_blank" rel="noreferrer"><Button size="lg" variant="secondary" className="mt-4"><MessageSquare className="mr-2 h-4 w-4" /> Join Discord</Button></a>
        </div>
      </section>
    </SiteLayout>
  );
}
