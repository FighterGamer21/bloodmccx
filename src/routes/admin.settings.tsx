import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { loadSiteSettings, notifySettingsUpdated, type SiteSettings } from "@/lib/site-settings";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsAdmin,
});

const KEYS = [
  "site_name", "tagline", "site_logo_url",
  "hero_image_url",
  "server_ip", "server_version",
  "discord_url", "youtube_url", "instagram_url",
  "upi_id", "upi_name",
  "support_email",
  "announcement",
  "maintenance_mode", "maintenance_message",
];

function SettingsAdmin() {
  const [values, setValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const settings = await loadSiteSettings();
      const map: Record<string, any> = {};
      KEYS.forEach((k) => { map[k] = (settings as SiteSettings)[k as keyof SiteSettings] ?? (k === "maintenance_mode" ? false : ""); });
      setValues(map);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const save = async (event?: FormEvent) => {
    event?.preventDefault();
    setSaving(true);
    const rows = KEYS.map((k) => ({
      key: k,
      value: k === "maintenance_mode" ? !!values[k] : values[k] ?? "",
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase.from("site_settings").upsert(rows, { onConflict: "key" });
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Settings saved");
      notifySettingsUpdated();
      await load();
    }
  };

  const set = (k: string, v: any) => setValues((current) => ({ ...current, [k]: v }));

  if (loading) return <div className="text-sm text-muted-foreground">Loading settings...</div>;

  return (
    <form onSubmit={save} className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Configure site, logo, server, payments, socials & maintenance mode.</p>
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="font-bold">Branding</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label>Site Name</Label><Input value={values.site_name || ""} onChange={(e) => set("site_name", e.target.value)} /></div>
          <div><Label>Tagline</Label><Input value={values.tagline || ""} onChange={(e) => set("tagline", e.target.value)} /></div>
        </div>
        <div>
          <Label>Server Logo URL</Label>
          <Input value={values.site_logo_url || ""} onChange={(e) => set("site_logo_url", e.target.value)} placeholder="https://.../logo.png" />
          {values.site_logo_url && <img src={values.site_logo_url} alt="logo" className="mt-2 h-16 w-16 rounded-md border border-border object-cover" />}
        </div>
        <div>
          <Label>Homepage Hero Image URL</Label>
          <Input value={values.hero_image_url || ""} onChange={(e) => set("hero_image_url", e.target.value)} placeholder="https://.../hero-background.png" />
          <p className="mt-1 text-xs text-muted-foreground">Optional image shown behind the homepage hero. Leave empty to use the default animated grid.</p>
          {values.hero_image_url && <img src={values.hero_image_url} alt="hero preview" className="mt-2 h-28 w-full rounded-md border border-border object-cover" />}
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="font-bold">Server & Socials</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label>Server IP</Label><Input value={values.server_ip || ""} onChange={(e) => set("server_ip", e.target.value)} /></div>
          <div><Label>Server Version</Label><Input value={values.server_version || ""} onChange={(e) => set("server_version", e.target.value)} /></div>
          <div><Label>Discord URL</Label><Input value={values.discord_url || ""} onChange={(e) => set("discord_url", e.target.value)} /></div>
          <div><Label>YouTube URL</Label><Input value={values.youtube_url || ""} onChange={(e) => set("youtube_url", e.target.value)} /></div>
          <div><Label>Instagram URL</Label><Input value={values.instagram_url || ""} onChange={(e) => set("instagram_url", e.target.value)} /></div>
          <div><Label>Support Email</Label><Input value={values.support_email || ""} onChange={(e) => set("support_email", e.target.value)} /></div>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="font-bold">Payments</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label>UPI ID</Label><Input value={values.upi_id || ""} onChange={(e) => set("upi_id", e.target.value)} /></div>
          <div><Label>UPI Name</Label><Input value={values.upi_name || ""} onChange={(e) => set("upi_name", e.target.value)} /></div>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="font-bold">Announcement Banner</h2>
        <Textarea rows={2} value={values.announcement || ""} onChange={(e) => set("announcement", e.target.value)} placeholder="e.g. Holiday sale 25% off all ranks until Dec 31!" />
        <p className="text-xs text-muted-foreground">Leave empty to hide the banner. Shows at the top of every page.</p>
      </div>

      <div className="space-y-4 rounded-xl border border-primary/40 bg-blood/5 p-5">
        <h2 className="font-bold text-blood">Maintenance Mode</h2>
        <label className="flex items-center gap-3">
          <Switch checked={!!values.maintenance_mode} onCheckedChange={(v) => set("maintenance_mode", v)} />
          <span>Enable maintenance mode (hides the entire site, except for admins)</span>
        </label>
        <div>
          <Label>Maintenance message</Label>
          <Textarea rows={3} value={values.maintenance_message || ""} onChange={(e) => set("maintenance_message", e.target.value)} placeholder="We're putting on a fresh coat of red paint. Be back shortly." />
        </div>
      </div>

      <Button type="submit" className="bg-blood shadow-blood w-full sm:w-auto" disabled={saving}>
        {saving ? "Saving..." : "Save All Settings"}
      </Button>
    </form>
  );
}
