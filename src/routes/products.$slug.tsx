import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { effectivePrice, formatPrice, useCart } from "@/lib/cart";
import { Check, Plus, ChevronLeft, Crown, Tag as TagIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/products/$slug")({ component: ProductPage });

function ProductPage() {
  const { slug } = Route.useParams();
  const { add, items, currency, setCurrency } = useCart();
  const { data: p, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => (await supabase.from("products").select("*").eq("slug", slug).maybeSingle()).data,
  });
  if (isLoading) return <SiteLayout><div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Loading...</div></SiteLayout>;
  if (!p) return <SiteLayout><div className="container mx-auto px-4 py-20 text-center"><h1 className="text-3xl font-bold">Product not found</h1><Link to="/store" className="text-blood mt-4 inline-block">Back to store</Link></div></SiteLayout>;
  const inCart = items.some((i) => i.id === p.id);
  const Icon = p.category === "rank" ? Crown : TagIcon;
  const perks: string[] = Array.isArray(p.perks) ? (p.perks as string[]) : [];
  const planLabel = p.billing_type === "lifetime" ? "Lifetime - one-time" : "Monthly plan";
  const price = effectivePrice(p as any, currency);
  return (
    <SiteLayout>
      <section className="container mx-auto px-4 py-10">
        <Link to="/store" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"><ChevronLeft className="h-4 w-4" /> Back to store</Link>
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="relative overflow-hidden rounded-2xl shadow-blood h-80 lg:h-full min-h-[300px]" style={{ background: `linear-gradient(135deg, ${p.color || "#dc2626"} 0%, oklch(0.18 0.05 25) 100%)` }}>
            <Icon className="absolute right-8 top-8 h-32 w-32 text-white/20" />
            <div className="absolute bottom-8 left-8">
              <p className="text-sm font-bold uppercase tracking-widest text-white/80">{p.category}</p>
              <h1 className="mt-1 text-6xl font-extrabold text-white tracking-wider">{p.name}</h1>
            </div>
          </div>
          <div>
            {p.short_description && <p className="text-lg text-muted-foreground">{p.short_description}</p>}
            {p.description && <p className="mt-3 text-sm text-muted-foreground">{p.description}</p>}
            <div className="mt-6 flex items-end gap-4">
              <div>
                <p className="text-5xl font-bold text-blood">{formatPrice(price, currency)}</p>
                <p className="mt-1 text-sm font-semibold text-muted-foreground">{planLabel}</p>
              </div>
              <div className="flex rounded-md border border-border overflow-hidden mb-1">
                <Button size="sm" variant={currency === "INR" ? "default" : "ghost"} onClick={() => setCurrency("INR")} className="rounded-none">INR</Button>
                <Button size="sm" variant={currency === "USD" ? "default" : "ghost"} onClick={() => setCurrency("USD")} className="rounded-none">USD</Button>
              </div>
            </div>
            <Button size="lg" className="mt-6 w-full bg-blood shadow-blood" disabled={inCart} onClick={() => { add(p as any); toast.success(`${p.name} added to cart`); }}>
              {inCart ? <><Check className="mr-2 h-4 w-4" /> Already in Cart</> : <><Plus className="mr-2 h-4 w-4" /> Add to Cart</>}
            </Button>
            {perks.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-bold uppercase tracking-widest text-blood">Includes</h3>
                <ul className="mt-3 space-y-2">
                  {perks.map((perk, i) => (
                    <li key={i} className="flex items-start gap-3 rounded-lg border border-border/60 bg-card/40 p-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-blood" /><span className="text-sm">{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
