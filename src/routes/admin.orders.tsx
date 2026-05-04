import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Download } from "lucide-react";

export const Route = createFileRoute("/admin/orders")({
  component: OrdersAdmin,
});

const STATUSES = ["pending", "verifying", "completed", "rejected", "refunded"];

function OrdersAdmin() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const update = async (id: string, patch: any) => {
    const { error } = await supabase.from("orders").update(patch).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Updated"); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this order?")) return;
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  };

  const exportCSV = () => {
    const rows = [["ref", "player", "email", "currency", "total", "status", "created", "items"]];
    orders.forEach((o) => rows.push([o.order_ref, o.minecraft_username, o.email ?? "", o.currency, o.total, o.status, o.created_at, JSON.stringify(o.items)]));
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `bloodmc-orders-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground">Verify payments and deliver ranks.</p>
        </div>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportCSV}><Download className="mr-2 h-4 w-4" />CSV</Button>
        </div>
      </div>

      {loading ? <p className="text-muted-foreground">Loading...</p> : (
        <div className="space-y-3">
          {filtered.map((o) => (
            <div key={o.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-muted-foreground">{o.order_ref}</p>
                  <p className="font-semibold text-lg">{o.minecraft_username}</p>
                  <p className="text-xs text-muted-foreground">{o.email || "no email"} · {new Date(o.created_at).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">{o.currency === "INR" ? "₹" : "$"}{Number(o.total).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{o.currency}</p>
                </div>
              </div>
              <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase text-muted-foreground mb-1">Items</p>
                  <ul className="space-y-1">
                    {(Array.isArray(o.items) ? o.items : []).map((it: any, i: number) => (
                      <li key={i} className="text-sm">• {it.name} × {it.quantity}</li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2 items-center">
                    <span className="text-xs uppercase text-muted-foreground">Status</span>
                    <Select value={o.status} onValueChange={(v) => update(o.id, { status: v })}>
                      <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <Textarea defaultValue={o.admin_notes ?? ""} placeholder="Admin notes" onBlur={(e) => e.target.value !== (o.admin_notes ?? "") && update(o.id, { admin_notes: e.target.value })} />
                  <Button size="sm" variant="destructive" onClick={() => remove(o.id)}>Delete</Button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">No orders</p>}
        </div>
      )}
    </div>
  );
}