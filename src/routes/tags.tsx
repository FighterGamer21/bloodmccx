import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { ProductCard } from "@/components/site/ProductCard";

export const Route = createFileRoute("/tags")({
  head: () => ({ meta: [{ title: "Tags — BloodMC" }] }),
  component: TagsPage,
});

function TagsPage() {
  const { data = [] } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => (await supabase.from("products").select("*").eq("category", "tag").eq("enabled", true).order("sort_order")).data || [],
  });
  return (
    <SiteLayout>
      <PageHeader eyebrow="Tags" title="Exclusive Chat Tags" subtitle="Stand out in every conversation." />
      <section className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {data.map((p: any) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>
    </SiteLayout>
  );
}
