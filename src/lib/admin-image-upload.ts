import { supabase } from "@/integrations/supabase/client";

const BUCKET = "site-media";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

function safeFileName(name: string) {
  const parts = name.toLowerCase().split(".");
  const ext = parts.length > 1 ? parts.pop() : "png";
  const base = parts.join(".") || "image";
  return `${base.replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "")}.${ext}`;
}

export async function uploadAdminImage(file: File, folder: string) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Please upload a PNG, JPG, WEBP, or GIF image.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be 5 MB or smaller.");
  }

  const cleanFolder = folder.replace(/[^a-z0-9-/_]/gi, "-").replace(/^-+|-+$/g, "") || "uploads";
  const path = `${cleanFolder}/${Date.now()}-${safeFileName(file.name)}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
    contentType: file.type,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  if (!data.publicUrl) throw new Error("Upload succeeded, but no public URL was returned.");
  return data.publicUrl;
}

export function isBillingTypeSchemaCacheError(message: string) {
  return message.includes("billing_type") && message.includes("schema cache");
}
