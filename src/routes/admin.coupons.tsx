import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, Tag } from "lucide-react";

export const Route = createFileRoute("/admin/coupons")({
  component: CouponsAdmin,
});

const empty: any = {
  id: "", code: "", discount_type: "percent", discount_value: 10,
  max_uses: null, expires_at: "", enabled: true, applies_to: "all",
};

function CouponsAdmin() {
  const [list, setList] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setList(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing.code) return toast.error("Code is required");
    const { id, ...rest } = editing;
    const payload: any = {
      ...rest,
      code: String(rest.code).trim().toUpperCase(),
      discount_value: Number(rest.discount_value) || 0,
      max_uses: rest.max_uses ? Number(rest.max_uses) : null,
      expires_at: rest.expires_at ? new Date(rest.expires_at).toISOString() : null,
    };
    const res = id ? await supabase.from("coupons").update(payload).eq("id", id) : await supabase.from("coupons").insert(payload);
    if (res.error) toast.error(res.error.message); else { toast.success("Saved"); setOpen(false); load(); }
  };
  const del = async (id: string) => {
    if (!confirm("Delete coupon?")) return;
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coupons</h1>
          <p className="text-sm text-muted-foreground">Discount codes for the store checkout.</p>
        </div>
        <Button onClick={() => { setEditing({ ...empty }); setOpen(true); }} className="bg-blood shadow-blood"><Plus className="mr-2 h-4 w-4" />New Coupon</Button>
      </div>

      <div className="grid gap-3">
        {list.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blood/20"><Tag className="h-5 w-5 text-blood" /></div>
              <div>
                <p className="font-mono font-bold tracking-wider">{c.code}</p>
                <p className="text-xs text-muted-foreground">
                  {c.discount_type === "percent" ? `${c.discount_value}% off` : `₹${c.discount_value} off`}
                  {c.max_uses ? ` · ${c.uses}/${c.max_uses} used` : ` · ${c.uses} used`}
                  {c.expires_at && ` · expires ${new Date(c.expires_at).toLocaleDateString()}`}
                  {!c.enabled && " · DISABLED"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="outline" onClick={() => { setEditing({ ...c, expires_at: c.expires_at ? c.expires_at.slice(0, 16) : "" }); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
              <Button size="icon" variant="destructive" onClick={() => del(c.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">No coupons yet</p>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.id ? "Edit Coupon" : "New Coupon"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div><Label>Code</Label><Input value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })} placeholder="BLOOD10" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Type</Label>
                  <Select value={editing.discount_type} onValueChange={(v) => setEditing({ ...editing, discount_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Value</Label><Input type="number" value={editing.discount_value} onChange={(e) => setEditing({ ...editing, discount_value: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Max uses (blank = unlimited)</Label><Input type="number" value={editing.max_uses ?? ""} onChange={(e) => setEditing({ ...editing, max_uses: e.target.value || null })} /></div>
                <div><Label>Expires at</Label><Input type="datetime-local" value={editing.expires_at || ""} onChange={(e) => setEditing({ ...editing, expires_at: e.target.value })} /></div>
              </div>
              <label className="flex items-center gap-2 text-sm"><Switch checked={editing.enabled} onCheckedChange={(v) => setEditing({ ...editing, enabled: v })} />Enabled</label>
              <Button className="w-full bg-blood" onClick={save}>Save</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
