
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS billing_type TEXT NOT NULL DEFAULT 'monthly'
CHECK (billing_type IN ('monthly', 'lifetime'));

UPDATE public.products
SET billing_type = 'monthly'
WHERE category IN ('rank', 'tag', 'bundle');

UPDATE public.products
SET billing_type = 'lifetime'
WHERE category = 'topup' OR is_topup = true;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'site-media',
  'site-media',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "public read site media" ON storage.objects;
DROP POLICY IF EXISTS "admins upload site media" ON storage.objects;
DROP POLICY IF EXISTS "admins update site media" ON storage.objects;
DROP POLICY IF EXISTS "admins delete site media" ON storage.objects;

CREATE POLICY "public read site media"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-media');

CREATE POLICY "admins upload site media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'site-media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins update site media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'site-media' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'site-media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins delete site media"
ON storage.objects FOR DELETE
USING (bucket_id = 'site-media' AND public.has_role(auth.uid(), 'admin'));
