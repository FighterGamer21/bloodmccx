import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { Skull, Wrench } from "lucide-react";
import { loadSiteSettings, SETTINGS_UPDATED_EVENT } from "@/lib/site-settings";
import { LoadingScreen } from "./LoadingScreen";

export function MaintenanceGate({ children }: { children: ReactNode }) {
  const { isAdmin } = useAuth();
  const [maintenance, setMaintenance] = useState(false);
  const [siteName, setSiteName] = useState("BloodMC");
  const [msg, setMsg] = useState("We're putting on a fresh coat of red paint. Be back shortly.");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const settings = await loadSiteSettings();
      if (!alive) return;
      setMaintenance(settings.maintenance_mode === true || settings.maintenance_mode === "true");
      setMsg(settings.maintenance_message);
      setSiteName(settings.site_name);
      setLoaded(true);
    })();
    const reload = async () => {
      const settings = await loadSiteSettings();
      setMaintenance(settings.maintenance_mode === true || settings.maintenance_mode === "true");
      setMsg(settings.maintenance_message);
      setSiteName(settings.site_name);
    };
    window.addEventListener(SETTINGS_UPDATED_EVENT, reload);
    return () => {
      alive = false;
      window.removeEventListener(SETTINGS_UPDATED_EVENT, reload);
    };
  }, []);

  if (!loaded) return <LoadingScreen />;
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
