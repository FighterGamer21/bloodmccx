import { useEffect, useState } from "react";
import { Megaphone, X } from "lucide-react";
import { loadSiteSettings, SETTINGS_UPDATED_EVENT } from "@/lib/site-settings";

export function AnnouncementBar() {
  const [text, setText] = useState("");
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const load = async () => {
      const settings = await loadSiteSettings();
      setText(settings.announcement?.trim() || "");
      setClosed(false);
    };
    load();
    window.addEventListener(SETTINGS_UPDATED_EVENT, load);
    try { if (sessionStorage.getItem("bmc_ann_closed")) setClosed(true); } catch {}
    return () => window.removeEventListener(SETTINGS_UPDATED_EVENT, load);
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
