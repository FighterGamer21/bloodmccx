import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Megaphone, X } from "lucide-react";

export function AnnouncementBar() {
  const [text, setText] = useState("");
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("site_settings").select("value").eq("key", "announcement").maybeSingle();
      const v = data?.value;
      if (typeof v === "string" && v.trim()) setText(v.trim());
    })();
    try { if (sessionStorage.getItem("bmc_ann_closed")) setClosed(true); } catch {}
  }, []);

  if (!text || closed) return null;
  return (
    <div className="bg-blood text-primary-foreground">
      <div className="container mx-auto flex items-center gap-3 px-4 py-2 text-sm">
        <Megaphone className="h-4 w-4 shrink-0" />
        <p className="flex-1 font-medium">{text}</p>
        <button onClick={() => { setClosed(true); try { sessionStorage.setItem("bmc_ann_closed", "1"); } catch {} }} aria-label="Close">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
