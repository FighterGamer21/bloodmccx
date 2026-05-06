import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/products")({
  component: ProductsAdmin,
});

const empty: any = {
  id: "",
  name: "",
  slug: "",
  category: "rank",
  short_description: "",
  description: "",
  price_inr: 0,
  price_usd: 0,
  discount_percent: 0,
  billing_type: "monthly",
  perks: [] as string[],
  color: "#dc2626",
  image_url: "",
  enabled: true,
  featured: false,
  popular: false,
  sort_order: 0,
  is_topup: false,
  topup_amount: 0,
};

function ProductsAdmin() {
  const [products, setProducts] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("products").select("*").order("category").order("sort_order");
    setProducts(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing({ ...empty });
    setOpen(true);
  };

  const openEdit = (p: any) => {
    setEditing({
      ...p,
      billing_type: p.billing_type || "monthly",
      perks: Array.isArray(p.perks) ? p.perks : [],
    });
    setOpen(true);
  };

  const save = async () => {
    if (!editing.name || !editing.slug) return toast.error("Name & slug required");
    const { id, created_at, updated_at, ...rest } = editing;
    const payload = {
      ...rest,
      price_inr: Number(rest.price_inr) || 0,
      price_usd: Number(rest.price_usd) || 0,
      discount_percent: Number(rest.discount_percent) || 0,
      billing_type: rest.is_topup ? "lifetime" : (rest.billing_type === "lifetime" ? "lifetime" : "monthly"),
      sort_order: Number(rest.sort_order) || 0,
      topup_amount: Number(rest.topup_amount) || 0,
    };
    const res = id
      ? await supabase.from("products").update(payload).eq("id", id)
      : await supabase.from("products").insert(payload);
    if (res.error) toast.error(res.error.message);
    else { toast.success("Saved"); setOpen(false); load(); }
  };

  const del = async (id: string) => {
    if (!confirm("Delete product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">Ranks, tags, bundles & wallet top-up packs.</p>
        </div>
        <Button onClick={openNew} className="bg-blood shadow-blood"><Plus className="mr-2 h-4 w-4" />New</Button>
      </div>

      <div className="grid gap-3">
        {products.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              {p.image_url ? (
                <img src={p.image_url} alt={p.name} className="h-12 w-12 rounded-md object-cover" />
              ) : (
                <div className="h-12 w-12 rounded-md" style={{ background: p.color || "#dc2626" }} />
              )}
              <div>
                <p className="font-semibold">{p.name} <span className="text-xs text-muted-foreground">/{p.slug}</span></p>
                <p className="text-xs text-muted-foreground uppercase">
                  {p.category} - INR {p.price_inr} - ${p.price_usd}
                  {p.discount_percent > 0 && <span className="text-blood ml-2">-{p.discount_percent}%</span>}
                  <span className="ml-2">{p.billing_type === "lifetime" ? "- lifetime" : "- monthly"}</span>
                  {!p.enabled && " - hidden"}
                  {p.is_topup && " - topup"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="outline" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
              <Button size="icon" variant="destructive" onClick={() => del(p.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit Product" : "New Product"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Name</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
                <div><Label>Slug</Label><Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Category</Label>
                  <Select value={editing.category} onValueChange={(v) => setEditing({ ...editing, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rank">Rank</SelectItem>
                      <SelectItem value="tag">Tag</SelectItem>
                      <SelectItem value="bundle">Bundle</SelectItem>
                      <SelectItem value="topup">Wallet Top-up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Color</Label><Input type="color" value={editing.color || "#dc2626"} onChange={(e) => setEditing({ ...editing, color: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Price INR</Label><Input type="number" value={editing.price_inr} onChange={(e) => setEditing({ ...editing, price_inr: e.target.value })} /></div>
                <div><Label>Price USD</Label><Input type="number" step="0.01" value={editing.price_usd} onChange={(e) => setEditing({ ...editing, price_usd: e.target.value })} /></div>
                <div><Label>Discount %</Label><Input type="number" min="0" max="90" value={editing.discount_percent || 0} onChange={(e) => setEditing({ ...editing, discount_percent: e.target.value })} /></div>
              </div>
              {!editing.is_topup && (
                <div>
                  <Label>Plan Type</Label>
                  <div className="mt-2 grid grid-cols-2 overflow-hidden rounded-md border border-border">
                    <button
                      type="button"
                      onClick={() => setEditing({ ...editing, billing_type: "monthly" })}
                      className={`px-3 py-2 text-sm font-semibold transition ${editing.billing_type !== "lifetime" ? "bg-blood text-primary-foreground shadow-blood" : "bg-card text-muted-foreground hover:text-foreground"}`}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing({ ...editing, billing_type: "lifetime" })}
                      className={`px-3 py-2 text-sm font-semibold transition ${editing.billing_type === "lifetime" ? "bg-blood text-primary-foreground shadow-blood" : "bg-card text-muted-foreground hover:text-foreground"}`}
                    >
                      Lifetime
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Default is monthly. Switch to lifetime only for one-time permanent plans.</p>
                </div>
              )}
              <div><Label>Image URL (recommended 800x600)</Label><Input value={editing.image_url || ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} placeholder="https://..." /></div>
              {editing.image_url && <img src={editing.image_url} alt="" className="h-32 w-full object-cover rounded-md border border-border" />}
              <div><Label>Short description</Label><Input value={editing.short_description || ""} onChange={(e) => setEditing({ ...editing, short_description: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea rows={3} value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
              <div><Label>Perks (one per line)</Label><Textarea rows={5} value={(editing.perks || []).join("\n")} onChange={(e) => setEditing({ ...editing, perks: e.target.value.split("\n").filter(Boolean) })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Sort order</Label><Input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: e.target.value })} /></div>
                {editing.is_topup && <div><Label>Top-up amount INR</Label><Input type="number" value={editing.topup_amount} onChange={(e) => setEditing({ ...editing, topup_amount: e.target.value })} /></div>}
              </div>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 text-sm"><Switch checked={editing.enabled} onCheckedChange={(v) => setEditing({ ...editing, enabled: v })} />Enabled</label>
                <label className="flex items-center gap-2 text-sm"><Switch checked={editing.featured} onCheckedChange={(v) => setEditing({ ...editing, featured: v })} />Featured</label>
                <label className="flex items-center gap-2 text-sm"><Switch checked={editing.popular} onCheckedChange={(v) => setEditing({ ...editing, popular: v })} />Popular</label>
                <label className="flex items-center gap-2 text-sm"><Switch checked={!!editing.is_topup} onCheckedChange={(v) => setEditing({ ...editing, is_topup: v, category: v ? "topup" : editing.category, billing_type: v ? "lifetime" : editing.billing_type })} />Wallet top-up pack</label>
              </div>
              <Button className="w-full bg-blood" onClick={save}>Save</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
