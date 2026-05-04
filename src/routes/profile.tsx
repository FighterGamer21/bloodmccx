import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Wallet, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "My Profile — BloodMC" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, loading, signOut } = useAuth();
  const nav = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => { if (!loading && !user) nav({ to: "/login" }); }, [loading, user, nav]);
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setOrders(data ?? []);
    })();
  }, [user]);

  if (loading || !user || !profile) return <SiteLayout><div className="container py-20 text-center text-muted-foreground">Loading...</div></SiteLayout>;

  return (
    <SiteLayout>
      <PageHeader eyebrow="Account" title={`Welcome, ${profile.minecraft_username}`} subtitle="Manage your orders and BloodMC wallet" />
      <section className="container mx-auto px-4 py-10 max-w-4xl space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-primary/30 bg-blood p-6 text-primary-foreground shadow-blood">
            <div className="flex items-center gap-2 text-sm uppercase tracking-widest opacity-80"><Wallet className="h-4 w-4" /> BloodMC Balance</div>
            <p className="mt-3 text-4xl font-extrabold">₹{Number(profile.balance).toLocaleString("en-IN")}</p>
            <p className="mt-1 text-xs opacity-80">Use at checkout to pay for any product.</p>
            <Link to="/store"><Button size="sm" variant="secondary" className="mt-4">Top up wallet</Button></Link>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-sm uppercase tracking-widest text-muted-foreground">Minecraft Username</p>
            <p className="mt-2 text-2xl font-bold">{profile.minecraft_username}</p>
            <p className="mt-3 text-xs text-muted-foreground">All purchases will be delivered to this account in-game.</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => signOut()}>Sign out</Button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-bold flex items-center gap-2"><ShoppingBag className="h-5 w-5" /> My Orders</h3>
          {orders.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No orders yet. <Link to="/store" className="text-blood underline">Browse the store →</Link></p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {orders.map((o) => (
                <li key={o.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">{o.order_ref}</p>
                    <p className="text-sm">{(Array.isArray(o.items) ? o.items : []).map((i: any) => i.name).join(", ")}</p>
                    <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()} · <span className="uppercase">{o.status}</span></p>
                  </div>
                  <p className="font-bold">{o.currency === "INR" ? "₹" : "$"}{Number(o.total).toFixed(2)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
