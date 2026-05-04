import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/faqs")({
  component: FaqsAdmin,
});

function FaqsAdmin() {
  const [faqs, setFaqs] = useState<any[]>([]);

  const load = async () => {
    const { data } = await supabase.from("faqs").select("*").order("sort_order");
    setFaqs(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    const { error } = await supabase.from("faqs").insert({ question: "New question", answer: "Answer here", sort_order: faqs.length });
    if (error) toast.error(error.message); else load();
  };
  const update = async (id: string, patch: any) => {
    const { error } = await supabase.from("faqs").update(patch).eq("id", id);
    if (error) toast.error(error.message);
  };
  const del = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from("faqs").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold">FAQs</h1><p className="text-sm text-muted-foreground">Customer questions.</p></div>
        <Button onClick={add} className="bg-blood"><Plus className="mr-2 h-4 w-4" />Add</Button>
      </div>
      <div className="space-y-3">
        {faqs.map((f) => (
          <div key={f.id} className="rounded-xl border border-border bg-card p-4 space-y-2">
            <Input defaultValue={f.question} onBlur={(e) => e.target.value !== f.question && update(f.id, { question: e.target.value })} className="font-semibold" />
            <Textarea defaultValue={f.answer} onBlur={(e) => e.target.value !== f.answer && update(f.id, { answer: e.target.value })} />
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 text-sm"><Switch checked={f.visible} onCheckedChange={(v) => { update(f.id, { visible: v }); load(); }} />Visible</label>
              <Button size="sm" variant="destructive" onClick={() => del(f.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
        {faqs.length === 0 && <p className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">No FAQs yet</p>}
      </div>
    </div>
  );
}