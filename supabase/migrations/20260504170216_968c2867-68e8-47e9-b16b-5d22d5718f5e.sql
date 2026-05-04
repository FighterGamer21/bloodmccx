
-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  minecraft_username TEXT NOT NULL UNIQUE,
  balance NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users view own profile" ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "users update own basic profile" ON public.profiles FOR UPDATE
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "admins manage profiles" ON public.profiles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger: auto create profile on signup using metadata
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uname TEXT;
BEGIN
  uname := COALESCE(NEW.raw_user_meta_data->>'minecraft_username', split_part(NEW.email, '@', 1));
  INSERT INTO public.profiles (id, minecraft_username) VALUES (NEW.id, uname)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile();

-- COUPONS
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL DEFAULT 'percent', -- 'percent' or 'fixed'
  discount_value NUMERIC NOT NULL DEFAULT 0,
  max_uses INTEGER,
  uses INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  enabled BOOLEAN NOT NULL DEFAULT true,
  applies_to TEXT NOT NULL DEFAULT 'all', -- 'all' | 'rank' | 'tag'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read enabled coupons" ON public.coupons FOR SELECT
  USING (enabled = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage coupons" ON public.coupons FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- PRODUCTS additions
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS discount_percent NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_topup BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS topup_amount NUMERIC NOT NULL DEFAULT 0;

-- ORDERS additions
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS paid_with_balance NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id UUID;

-- updated_at trigger for profiles
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS profiles_touch ON public.profiles;
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
