import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { ProductCard } from "@/components/site/ProductCard";

export const Route = createFileRoute("/ranks")({
  head: () => ({ meta: [{ title: "Ranks — BloodMC" }, { name: "description", content: "All BloodMC premium ranks." }] }),
  component: () => {
    const { data = [] } = useQuery({
      queryKey: ["ranks"],
      queryFn: async () => {
        const { data } = await supabase.from("products").select("*").eq("category", "rank").eq("enabled", true).order("sort_order");
        return data || [];
      },
    });
    return (
      <SiteLayout>
        <PageHeader eyebrow="Ranks" title="Premium Ranks" subtitle="Six tiers of perks built for BedWars dominance." />
        <section className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.map((p: any) => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>
      </SiteLayout>
    );
  },
});