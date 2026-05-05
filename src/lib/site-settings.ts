import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const SETTINGS_UPDATED_EVENT = "bloodmc:settings-updated";

export const defaultSiteSettings = {
  site_name: "BloodMC",
  tagline: "The official BloodMC network store. Premium ranks, tags & elite BedWars perks.",
  site_logo_url: "",
  hero_image_url: "",
  server_ip: "play.bloodmc.net",
  server_version: "",
  discord_url: "https://discord.gg/kUZjRQsxtm",
  youtube_url: "https://www.youtube.com/@ShadowRoni",
  instagram_url: "",
  upi_id: "shadowroni@ybl",
  upi_name: "BloodMC",
  support_email: "",
  announcement: "",
  maintenance_mode: false,
  maintenance_message: "We're putting on a fresh coat of red paint. Be back shortly.",
};

export type SiteSettings = typeof defaultSiteSettings;

function flattenSettings(rows: Array<{ key: string; value: any }>) {
  const settings: SiteSettings = { ...defaultSiteSettings };

  for (const row of rows) {
    const value = row.value;
    if (row.key in settings) {
      (settings as any)[row.key] = value;
      continue;
    }

    // Older seed data used grouped JSON settings. Keep reading those so admin edits
    // work on both fresh and already-deployed databases.
    if (row.key === "branding" && value && typeof value === "object") {
      settings.site_name = value.site_name || settings.site_name;
      settings.tagline = value.tagline || settings.tagline;
      settings.site_logo_url = value.logo_url || value.site_logo_url || settings.site_logo_url;
    }
    if (row.key === "server" && value && typeof value === "object") {
      settings.server_ip = value.ip || value.server_ip || settings.server_ip;
      settings.discord_url = value.discord || value.discord_url || settings.discord_url;
      settings.youtube_url = value.youtube || value.youtube_url || settings.youtube_url;
      settings.instagram_url = value.instagram || value.instagram_url || settings.instagram_url;
    }
    if (row.key === "payment" && value && typeof value === "object") {
      settings.upi_id = value.upi_id || settings.upi_id;
      settings.upi_name = value.upi_name || settings.upi_name;
    }
    if (row.key === "hero" && value && typeof value === "object") {
      settings.hero_image_url = value.background_url || value.hero_image_url || settings.hero_image_url;
    }
    if (row.key === "maintenance" && value && typeof value === "object") {
      settings.maintenance_mode = value.enabled === true || value.enabled === "true";
      settings.maintenance_message = value.message || settings.maintenance_message;
    }
  }

  return settings;
}

export async function loadSiteSettings() {
  const { data, error } = await supabase.from("site_settings").select("key,value");
  if (error) throw error;
  return flattenSettings((data ?? []) as any);
}

export function notifySettingsUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SETTINGS_UPDATED_EVENT));
  }
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const next = await loadSiteSettings();
        if (alive) setSettings(next);
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    window.addEventListener(SETTINGS_UPDATED_EVENT, load);
    return () => {
      alive = false;
      window.removeEventListener(SETTINGS_UPDATED_EVENT, load);
    };
  }, []);

  return { settings, loading };
}
