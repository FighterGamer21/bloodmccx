import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart, effectivePrice } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tag as TagIcon, Wallet } from "lucide-react";
import { useSiteSettings } from "@/lib/site-settings";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — BloodMC" }] }),
  component: CheckoutPage,
});

const schema = z.object({
  username: z.string().trim().min(3).max(16).regex(/^[A-Za-z0-9_]+$/),
});
const genRef = () => "BMC-" + Math.random().toString(36).slice(2, 7).toUpperCase() + "-" + Date.now().toString(36).slice(-4).toUpperCase();

function CheckoutPage() {
  const { items, currency, setCurrency, subtotal, symbol, clear } = useCart();
  const { user, profile, refresh } = useAuth();
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<any | null>(null);
  const [useBalance, setUseBalance] = useState(true);
  const { settings } = useSiteSettings();
  const nav = useNavigate();

  useEffect(() => { if (profile?.minecraft_username) setUsername(profile.minecraft_username); }, [profile]);

  const discount = (() => {
    if (!coupon) return 0;
    if (coupon.discount_type === "percent") return subtotal * (Number(coupon.discount_value) / 100);
    return Math.min(Number(coupon.discount_value), subtotal);
  })();
  const afterCoupon = Math.max(0, subtotal - discount);
  const balance = currency === "INR" ? Number(profile?.balance ?? 0) : 0;
  const fromBalance = useBalance && user ? Math.min(balance, afterCoupon) : 0;
  const toPay = Math.max(0, afterCoupon - fromBalance);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    const { data, error } = await supabase.from("coupons").select("*").eq("code", couponCode.trim().toUpperCase()).eq("enabled", true).maybeSingle();
    if (error || !data) { toast.error("Invalid coupon"); setCoupon(null); return; }
    if (data.expires_at && new Date(data.expires_at) < new Date()) { toast.error("Coupon expired"); return; }
    if (data.max_uses && data.uses >= data.max_uses) { toast.error("Coupon usage limit reached"); return; }
    setCoupon(data);
    toast.success(`Coupon "${data.code}" applied!`);
  };

  const submit = async () => {
    const parsed = schema.safeParse({ username });
    if (!parsed.success) return toast.error("Invalid Minecraft username");
    if (items.length === 0) return toast.error("Cart is empty");
    if (!user) { toast.error("Please login to place an order"); nav({ to: "/login" }); return; }
    setSubmitting(true);
    const order_ref = genRef();
    const orderItems = items.map((i) => ({
      id: i.id, name: i.name, slug: i.slug, category: i.category,
      price: effectivePrice(i as any, currency),
    }));
    const { error } = await supabase.from("orders").insert({
      order_ref,
      user_id: user.id,
      minecraft_username: username,
      email: user.email || null,
      currency,
      total: toPay,
      items: orderItems,
      status: toPay === 0 && fromBalance > 0 ? "paid" : "pending",
      coupon_code: coupon?.code ?? null,
      discount_amount: discount,
      paid_with_balance: fromBalance,
    });
    if (error) { setSubmitting(false); toast.error(error.message); return; }

    if (fromBalance > 0 && profile) {
      await supabase.from("profiles").update({ balance: Number(profile.balance) - fromBalance }).eq("id", user.id);
      await refresh();
    }
    if (coupon) {
      await supabase.from("coupons").update({ uses: (coupon.uses || 0) + 1 }).eq("id", coupon.id);
    }

    setSubmitting(false);
    clear();
    nav({ to: "/order-success", search: { ref: order_ref } });
  };

  return (
    <SiteLayout>
      <PageHeader eyebrow="Checkout" title="Complete your order" />
      <section className="container mx-auto px-4 py-10 max-w-5xl">
        {items.length === 0 ? (
          <div className="rounded-xl border border-border/60 bg-card/40 py-16 text-center text-muted-foreground">
            Your cart is empty. <Link to="/store" className="text-blood underline">Browse the store</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-border/60 bg-card p-6 space-y-4">
              {!user && (
                <div className="rounded-lg border border-primary/30 bg-primary/10 p-4 text-sm">
                  <p className="font-bold text-blood">Login required</p>
                  <p className="mt-1 text-muted-foreground">You need an account to place orders. <Link to="/login" className="font-bold text-blood underline">Login or sign up →</Link></p>
                </div>
              )}
              <div>
                <Label htmlFor="username">Minecraft Username *</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Notch" maxLength={16} />
                <p className="mt-1 text-xs text-muted-foreground">Perks will be delivered to this account.</p>
              </div>

              <div>
                <Label>Currency</Label>
                <div className="mt-1 flex rounded-md border border-border overflow-hidden">
                  <Button type="button" size="sm" variant={currency === "INR" ? "default" : "ghost"} onClick={() => setCurrency("INR")} className="flex-1 rounded-none">INR ₹</Button>
                  <Button type="button" size="sm" variant={currency === "USD" ? "default" : "ghost"} onClick={() => setCurrency("USD")} className="flex-1 rounded-none">USD $</Button>
                </div>
              </div>

              <div>
                <Label>Coupon code</Label>
                <div className="mt-1 flex gap-2">
                  <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="e.g. BLOOD10" />
                  <Button type="button" variant="outline" onClick={applyCoupon}><TagIcon className="h-4 w-4 mr-1" />Apply</Button>
                </div>
                {coupon && <p className="mt-1 text-xs text-green-500">✓ {coupon.code} — {coupon.discount_type === "percent" ? `${coupon.discount_value}% off` : `${symbol}${coupon.discount_value} off`}</p>}
              </div>

              {user && currency === "INR" && balance > 0 && (
                <label className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 cursor-pointer">
                  <input type="checkbox" checked={useBalance} onChange={(e) => setUseBalance(e.target.checked)} className="mt-1" />
                  <div className="flex-1">
                    <p className="font-bold flex items-center gap-2"><Wallet className="h-4 w-4 text-blood" /> Use BloodMC Balance</p>
                    <p className="text-xs text-muted-foreground mt-1">You have ₹{balance.toLocaleString("en-IN")} available. Will use ₹{fromBalance.toLocaleString("en-IN")}.</p>
                  </div>
                </label>
              )}

              {currency === "INR" && toPay > 0 ? (
                <div className="rounded-lg border border-primary/30 bg-primary/10 p-4 text-sm">
                  <p className="font-bold text-blood">UPI Payment</p>
                  <p className="mt-1">Pay <b>₹{toPay.toLocaleString("en-IN")}</b> to:</p>
                  <p className="mt-1 font-mono text-base">{settings.upi_id}</p>
                  <p className="mt-2 text-xs text-muted-foreground">After payment, open a Discord ticket with your Order ID.</p>
                </div>
              ) : currency === "USD" && toPay > 0 ? (
                <div className="rounded-lg border border-border bg-card/60 p-4 text-sm text-muted-foreground">For USD payments, contact us on Discord after creating the order.</div>
              ) : (
                <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm">
                  <p className="font-bold text-green-500">Fully covered by your wallet ✨</p>
                  <p className="mt-1 text-muted-foreground">No payment needed. Order will go straight to verification.</p>
                </div>
              )}
              <Button onClick={submit} disabled={submitting || !user} className="w-full bg-blood shadow-blood">
                {submitting ? "Creating order..." : !user ? "Login to place order" : "Place Order"}
              </Button>
            </div>

            <div className="rounded-xl border border-border/60 bg-card p-6 h-fit">
              <h3 className="font-bold text-lg">Order Summary</h3>
              <ul className="mt-4 space-y-3">
                {items.map((it) => (
                  <li key={it.id} className="flex justify-between text-sm">
                    <span><span className="text-muted-foreground uppercase text-[10px] mr-2">{it.category}</span>{it.name}</span>
                    <span>{symbol}{effectivePrice(it as any, currency).toFixed(currency === "INR" ? 0 : 2)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-border space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{symbol}{subtotal.toFixed(currency === "INR" ? 0 : 2)}</span></div>
                {discount > 0 && <div className="flex justify-between text-green-500"><span>Coupon</span><span>-{symbol}{discount.toFixed(currency === "INR" ? 0 : 2)}</span></div>}
                {fromBalance > 0 && <div className="flex justify-between text-blood"><span>Wallet balance</span><span>-{symbol}{fromBalance.toFixed(currency === "INR" ? 0 : 2)}</span></div>}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-border"><span>To Pay</span><span className="text-blood">{symbol}{toPay.toFixed(currency === "INR" ? 0 : 2)}</span></div>
              </div>
            </div>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
