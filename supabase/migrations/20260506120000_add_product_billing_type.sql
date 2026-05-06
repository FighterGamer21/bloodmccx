ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS billing_type TEXT NOT NULL DEFAULT 'monthly'
CHECK (billing_type IN ('monthly', 'lifetime'));

UPDATE public.products
SET billing_type = 'monthly'
WHERE category IN ('rank', 'tag', 'bundle') AND (billing_type IS NULL OR billing_type = 'lifetime');

UPDATE public.products
SET billing_type = 'lifetime'
WHERE category = 'topup' OR is_topup = true;
