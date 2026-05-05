import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { ProductCard } from "@/components/site/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/lib/cart";
import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { LoadingScreen } from "@/components/site/LoadingScreen";

export const Route = createFileRoute("/store")({
  head: () => ({ meta: [{ title: "Store — BloodMC" }, { name: "description", content: "Browse all BloodMC ranks and tags." }] }),
  component: StorePage,
});

function StorePage() {
  const { currency, setCurrency } = useCart();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [sort, setSort] = useState("popular");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("enabled", true).order("sort_order");
      return data || [];
    },
  });

  const filtered = useMemo(() => {
    let list = [...products];
    if (cat === "ranks") list = list.filter((p: any) => p.category === "rank");
    else if (cat === "tags") list = list.filter((p: any) => p.category === "tag");
    else if (cat === "featured") list = list.filter((p: any) => p.featured);
    else if (cat === "popular") list = list.filter((p: any) => p.popular);
    if (q.trim()) {
      const k = q.toLowerCase();
      list = list.filter((p: any) => p.name.toLowerCase().includes(k));
    }
    if (sort === "price-asc") list.sort((a: any, b: any) => Number(a.price_inr) - Number(b.price_inr));
    else if (sort === "price-desc") list.sort((a: any, b: any) => Number(b.price_inr) - Number(a.price_inr));
    else if (sort === "name") list.sort((a: any, b: any) => a.name.localeCompare(b.name));
    return list;
  }, [products, q, cat, sort]);

  if (isLoading) return <LoadingScreen label="Loading store" />;

  return (
    <SiteLayout>
      <PageHeader eyebrow="Store" title="All Products" subtitle="Browse every rank and tag available on the BloodMC network." />
      <section className="container mx-auto px-4 py-10">
        <div className="mb-6 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products..." className="pl-9" />
          </div>
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="ranks">Ranks</SelectItem>
              <SelectItem value="tags">Tags</SelectItem>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="popular">Popular</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Sort: Popular</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="name">Name (A–Z)</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex rounded-md border border-border overflow-hidden">
            <Button size="sm" variant={currency === "INR" ? "default" : "ghost"} onClick={() => setCurrency("INR")} className="rounded-none">INR ₹</Button>
            <Button size="sm" variant={currency === "USD" ? "default" : "ghost"} onClick={() => setCurrency("USD")} className="rounded-none">USD $</Button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-border/60 bg-card/40 py-16 text-center text-muted-foreground">No products found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((p: any) => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
