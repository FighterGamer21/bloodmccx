import { Link } from "@tanstack/react-router";
import { Crown, Tag as TagIcon, Plus, Check, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart, formatPrice, effectivePrice, type CartItem } from "@/lib/cart";
import { toast } from "sonner";

export function ProductCard({ p }: { p: CartItem & { short_description?: string | null; perks?: string[]; featured?: boolean; popular?: boolean; discount_percent?: number; image_url?: string | null; is_topup?: boolean } }) {
  const { add, items, currency } = useCart();
  const inCart = items.some((i) => i.id === p.id);
  const Icon = p.is_topup ? Wallet : p.category === "rank" ? Crown : TagIcon;
  const discount = Number(p.discount_percent || 0);
  const base = currency === "INR" ? Number(p.price_inr) : Number(p.price_usd);
  const eff = effectivePrice(p as any, currency);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-card transition-all hover:border-primary/50 hover:shadow-blood">
      <div className="relative h-40 overflow-hidden" style={{ background: `linear-gradient(135deg, ${p.color || "#dc2626"} 0%, oklch(0.2 0.05 25) 100%)` }}>
        {p.image_url ? (
          <img src={p.image_url} alt={p.name} className="absolute inset-0 h-full w-full object-cover opacity-90" loading="lazy" />
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)]" />
            <Icon className="absolute right-4 top-4 h-16 w-16 text-white/20" />
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-4">
          <p className="text-xs font-medium uppercase tracking-widest text-white/80">{p.is_topup ? "Wallet" : p.category}</p>
          <h3 className="text-2xl font-extrabold text-white tracking-wider drop-shadow">{p.name}</h3>
        </div>
        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-blood px-2.5 py-1 text-[10px] font-extrabold uppercase text-primary-foreground shadow-blood">-{discount}% OFF</span>
        )}
        {p.popular && (
          <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase text-white backdrop-blur">Popular</span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        {p.short_description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{p.short_description}</p>
        )}
        {p.perks && p.perks.length > 0 && (
          <ul className="mt-3 space-y-1.5 text-sm">
            {p.perks.slice(0, 3).map((perk, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blood" />
                <span className="text-muted-foreground line-clamp-1">{perk}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold">{formatPrice(eff, currency)}</p>
              {discount > 0 && <p className="text-sm text-muted-foreground line-through">{formatPrice(base, currency)}</p>}
            </div>
            <p className="text-xs text-muted-foreground">{p.is_topup ? `Adds ₹${p.topup_amount} balance` : "Lifetime · One-time"}</p>
          </div>
          {!p.is_topup && (
            <Link to="/products/$slug" params={{ slug: p.slug }}>
              <Button variant="ghost" size="sm">View</Button>
            </Link>
          )}
        </div>
        <Button className="mt-3 w-full" disabled={inCart} onClick={() => { add(p); toast.success(`${p.name} added to cart`); }}>
          {inCart ? <><Check className="mr-1 h-4 w-4" /> In Cart</> : <><Plus className="mr-1 h-4 w-4" /> Add to Cart</>}
        </Button>
      </div>
    </div>
  );
}
