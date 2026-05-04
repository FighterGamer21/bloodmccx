import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Wallet, Search } from "lucide-react";

export const Route = createFileRoute("/admin/users")({
  component: UsersAdmin,
});

function UsersAdmin() {
  const [users, setUsers] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [edits, setEdits] = useState<Record<string, string>>({});

  const load = async () => {
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setUsers(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const setBalance = async (id: string) => {
    const v = Number(edits[id]);
    if (Number.isNaN(v) || v < 0) return toast.error("Invalid amount");
    const { error } = await supabase.from("profiles").update({ balance: v }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Balance updated"); load(); }
  };

  const addBalance = async (id: string, current: number) => {
    const v = Number(edits[id]);
    if (Number.isNaN(v)) return toast.error("Invalid amount");
    const { error } = await supabase.from("profiles").update({ balance: Number(current) + v }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success(`Added ₹${v}`); setEdits({ ...edits, [id]: "" }); load(); }
  };

  const filtered = q.trim()
    ? users.filter((u) => u.minecraft_username.toLowerCase().includes(q.toLowerCase()))
    : users;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users & Wallets</h1>
        <p className="text-sm text-muted-foreground">Manage user profiles and BloodMC balance.</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by Minecraft username..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
      </div>

      <div className="grid gap-3">
        {filtered.map((u) => (
          <div key={u.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{u.minecraft_username}</p>
                <p className="text-xs text-muted-foreground">Joined {new Date(u.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2 text-blood font-bold">
                <Wallet className="h-4 w-4" /> ₹{Number(u.balance).toLocaleString("en-IN")}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 items-center">
              <Input type="number" placeholder="Amount (₹)" value={edits[u.id] ?? ""} onChange={(e) => setEdits({ ...edits, [u.id]: e.target.value })} className="w-40" />
              <Button size="sm" variant="outline" onClick={() => addBalance(u.id, u.balance)}>+ Add</Button>
              <Button size="sm" variant="outline" onClick={() => setBalance(u.id)}>Set total</Button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">No users</p>}
      </div>
    </div>
  );
}
