import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingBag, Package, IndianRupee, Clock } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const [stats, setStats] = useState({ orders: 0, pending: 0, products: 0, revenue: 0 });
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [{ data: orders }, { count: products }] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("products").select("id", { count: "exact", head: true }),
      ]);
      const ordersList = orders ?? [];
      const revenue = ordersList.filter((o) => o.status === "completed").reduce((s, o) => s + Number(o.total), 0);
      setStats({
        orders: ordersList.length,
        pending: ordersList.filter((o) => o.status === "pending").length,
        products: products ?? 0,
        revenue,
      });
      setRecent(ordersList.slice(0, 6));
    })();
  }, []);

  const cards = [
    { label: "Total Orders", value: stats.orders, icon: ShoppingBag },
    { label: "Pending", value: stats.pending, icon: Clock },
    { label: "Products", value: stats.products, icon: Package },
    { label: "Revenue", value: `₹${stats.revenue.toFixed(0)}`, icon: IndianRupee },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Overview of your BloodMC store.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{c.label}</p>
              <c.icon className="h-4 w-4 text-blood" />
            </div>
            <p className="mt-3 text-2xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-3 font-semibold">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground">
              <tr><th className="py-2">Ref</th><th>Player</th><th>Total</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {recent.map((o) => (
                <tr key={o.id} className="border-t border-border">
                  <td className="py-2 font-mono text-xs">{o.order_ref}</td>
                  <td>{o.minecraft_username}</td>
                  <td>{o.currency === "INR" ? "₹" : "$"}{Number(o.total).toFixed(2)}</td>
                  <td><span className="rounded-full bg-secondary px-2 py-0.5 text-xs">{o.status}</span></td>
                  <td className="text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {recent.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">No orders yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}