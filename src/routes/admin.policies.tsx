import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/policies")({
  component: PoliciesAdmin,
});

const SLUGS = ["terms", "privacy", "refund", "support"];

function PoliciesAdmin() {
  const [pages, setPages] = useState<Record<string, any>>({});
  const [active, setActive] = useState("terms");

  const load = async () => {
    const { data } = await supabase.from("policy_pages").select("*");
    const map: Record<string, any> = {};
    SLUGS.forEach((s) => { map[s] = (data ?? []).find((p) => p.slug === s) || { slug: s, title: s.toUpperCase(), content: "" }; });
    setPages(map);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    const p = pages[active];
    const { error } = await supabase.from("policy_pages").upsert({ slug: active, title: p.title, content: p.content });
    if (error) toast.error(error.message); else toast.success("Saved");
  };

  const current = pages[active];

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Policies</h1><p className="text-sm text-muted-foreground">Edit legal/support pages.</p></div>
      <div className="flex flex-wrap gap-2">
        {SLUGS.map((s) => (
          <Button key={s} variant={active === s ? "default" : "outline"} size="sm" onClick={() => setActive(s)} className={active === s ? "bg-blood" : ""}>{s}</Button>
        ))}
      </div>
      {current && (
        <div className="space-y-3 rounded-xl border border-border bg-card p-5">
          <div><Label>Title</Label><Input value={current.title} onChange={(e) => setPages({ ...pages, [active]: { ...current, title: e.target.value } })} /></div>
          <div><Label>Content (Markdown)</Label><Textarea rows={20} value={current.content} onChange={(e) => setPages({ ...pages, [active]: { ...current, content: e.target.value } })} /></div>
          <Button className="bg-blood" onClick={save}>Save</Button>
        </div>
      )}
    </div>
  );
}