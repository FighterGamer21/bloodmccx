import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { useCart, formatPrice } from "@/lib/cart";
import { Trash2, ShoppingCart, Crown, Tag as TagIcon } from "lucide-react";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart — BloodMC" }] }),
  component: CartPage,
});

function CartPage() {
  const { items, remove, total, currency, setCurrency, symbol } = useCart();
  return (
    <SiteLayout>
      <PageHeader eyebrow="Cart" title="Your Cart" />
      <section className="container mx-auto px-4 py-10 max-w-4xl">
        {items.length === 0 ? (
          <div className="rounded-xl border border-border/60 bg-card/40 py-16 text-center">
            <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Your cart is empty.</p>
            <Link to="/store"><Button className="mt-4">Browse Store</Button></Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              {items.map((it) => {
                const Icon = it.category === "rank" ? Crown : TagIcon;
                return (
                  <div key={it.id} className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg" style={{ background: `linear-gradient(135deg, ${it.color || "#dc2626"}, oklch(0.18 0.05 25))` }}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">{it.category}</p>
                      <h3 className="font-bold">{it.name}</h3>
                      {!it.is_topup && <p className="text-xs text-muted-foreground">{it.billing_type === "lifetime" ? "Lifetime - one-time" : "Monthly plan"}</p>}
                    </div>
                    <p className="font-bold">{formatPrice(currency === "INR" ? it.price_inr : it.price_usd, currency)}</p>
                    <Button variant="ghost" size="icon" onClick={() => remove(it.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                );
              })}
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-6 h-fit">
              <h3 className="font-bold text-lg">Order Summary</h3>
              <div className="mt-4 flex rounded-md border border-border overflow-hidden">
                <Button size="sm" variant={currency === "INR" ? "default" : "ghost"} onClick={() => setCurrency("INR")} className="flex-1 rounded-none">INR ₹</Button>
                <Button size="sm" variant={currency === "USD" ? "default" : "ghost"} onClick={() => setCurrency("USD")} className="flex-1 rounded-none">USD $</Button>
              </div>
              <div className="mt-4 flex justify-between text-base font-bold pt-3 border-t border-border"><span>Total</span><span className="text-blood">{symbol}{currency === "INR" ? total.toLocaleString("en-IN") : total.toFixed(2)}</span></div>
              <Link to="/checkout"><Button className="w-full mt-5 bg-blood shadow-blood">Proceed to Checkout</Button></Link>
            </div>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
