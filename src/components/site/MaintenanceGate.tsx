import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Skull, Wrench } from "lucide-react";

export function MaintenanceGate({ children }: { children: ReactNode }) {
  const { isAdmin } = useAuth();
  const [maintenance, setMaintenance] = useState(false);
  const [siteName, setSiteName] = useState("BloodMC");
  const [msg, setMsg] = useState("We're putting on a fresh coat of red paint. Be back shortly.");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("site_settings").select("*").in("key", ["maintenance_mode", "maintenance_message", "site_name"]);
      const map: Record<string, any> = {};
      (data ?? []).forEach((s: any) => (map[s.key] = s.value));
      setMaintenance(map.maintenance_mode === true || map.maintenance_mode === "true");
      if (map.maintenance_message) setMsg(String(map.maintenance_message));
      if (map.site_name) setSiteName(String(map.site_name));
      setLoaded(true);
    })();
  }, []);

  if (!loaded) return null;
  if (maintenance && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-lg text-center rounded-2xl border border-primary/30 bg-card p-10 shadow-blood">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blood shadow-blood">
            <Wrench className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="mt-6 flex items-center justify-center gap-2 text-blood">
            <Skull className="h-5 w-5" />
            <span className="font-bold tracking-widest">{siteName}</span>
          </div>
          <h1 className="mt-3 text-3xl font-bold">Under Maintenance</h1>
          <p className="mt-3 text-muted-foreground">{msg}</p>
          <p className="mt-6 text-xs text-muted-foreground">Admins can still access the site.</p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
