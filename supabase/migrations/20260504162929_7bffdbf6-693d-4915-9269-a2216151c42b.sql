
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "users view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('rank','tag')),
  price_inr NUMERIC NOT NULL DEFAULT 0,
  price_usd NUMERIC NOT NULL DEFAULT 0,
  short_description TEXT,
  description TEXT,
  perks JSONB NOT NULL DEFAULT '[]'::jsonb,
  color TEXT,
  image_url TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  popular BOOLEAN NOT NULL DEFAULT false,
  enabled BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read enabled products" ON public.products FOR SELECT USING (enabled = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage products" ON public.products FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_ref TEXT UNIQUE NOT NULL,
  minecraft_username TEXT NOT NULL,
  email TEXT,
  currency TEXT NOT NULL CHECK (currency IN ('INR','USD')),
  total NUMERIC NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','verified','delivered','cancelled','refunded')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone create order" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "admins read orders" ON public.orders FOR SELECT USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update orders" ON public.orders FOR UPDATE USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete orders" ON public.orders FOR DELETE USING (public.has_role(auth.uid(),'admin'));

-- Site settings (key-value)
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "admins write settings" ON public.site_settings FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Homepage sections
CREATE TABLE public.homepage_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  title TEXT,
  subtitle TEXT,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  visible BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0
);
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read sections" ON public.homepage_sections FOR SELECT USING (true);
CREATE POLICY "admins write sections" ON public.homepage_sections FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- FAQs
CREATE TABLE public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT true
);
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read faqs" ON public.faqs FOR SELECT USING (visible = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins write faqs" ON public.faqs FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Policy pages
CREATE TABLE public.policy_pages (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.policy_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read policies" ON public.policy_pages FOR SELECT USING (true);
CREATE POLICY "admins write policies" ON public.policy_pages FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Seed products: ranks
INSERT INTO public.products (slug, name, category, price_inr, price_usd, short_description, description, perks, color, featured, popular, sort_order) VALUES
('vip','VIP','rank',299,3.99,'Entry rank with daily perks','Kickstart your BloodMC journey with VIP perks.',
 '["Map Selection: 5 Daily Uses","Join Message: High priority join notification","Auto-GG: Golden GG text & automatic GG","Bed Destroys: Firework, Lightning Strike","Chat Colors: Dark Red, Green","Utility: /rejoin command"]'::jsonb,
 '#dc2626', true, false, 1),
('mvp','MVP','rank',599,7.99,'Step up with MVP perks','All VIP perks plus spectating and more bed destroys.',
 '["Map Selection: 15 Daily Uses","Game Spectating: /spectate in BedWars","Bed Destroys: Tornado, Explosion","Chat Colors: + Blue, Cyan, Purple","Utility: All VIP perks"]'::jsonb,
 '#ef4444', true, true, 2),
('dominator','DOMINATOR','rank',999,12.99,'Dominate with fly mode','Fly during BedWars and unlock more chat colors.',
 '["Map Selection: 30 Daily Uses","Game Fly Mode: /fly in BedWars","Bed Destroys: Hologram, Blizzard","Chat Colors: + Gold, Dark Gray, Red","Utility: All MVP perks"]'::jsonb,
 '#f59e0b', false, true, 3),
('lord','LORD','rank',1499,17.99,'Lordly status with auto-quests','Quests auto-accept on join.',
 '["Map Selection: 60 Daily Uses","Auto-Quests on join","Bed Destroys: Pinata, Bed Bugs","Chat Colors: + Lime, Light Blue, Black","Utility: All Dominator perks"]'::jsonb,
 '#a855f7', false, false, 4),
('god','GOD','rank',1999,23.99,'Godlike with rare bed destroys','Thief and Ghost bed destroys.',
 '["Map Selection: 100 Daily Uses","Bed Destroys: Thief, Ghost","Chat Colors: + Pink, Yellow, Gray","Utility: All Lord perks"]'::jsonb,
 '#06b6d4', true, false, 5),
('goat','GOAT','rank',2999,35.99,'The ultimate BloodMC rank','Unlimited maps, private games, rainbow chat.',
 '["Map Selection: Unlimited","Private Games: create & manage","Bed Destroys: Random, Pig Missile, Squid Missile","Chat Colors: + Aqua, White, Rainbow","Utility: All God perks"]'::jsonb,
 '#fbbf24', true, true, 6);

-- Seed products: tags
INSERT INTO public.products (slug, name, category, price_inr, price_usd, short_description, perks, color, featured, popular, sort_order) VALUES
('bloodking','BloodKing','tag',849,9.99,'Reign supreme with the BloodKing tag','["Exclusive [BloodKing] chat tag","Premium color styling","Lifetime access"]'::jsonb,'#dc2626',true,true,10),
('reaper','Reaper','tag',699,7.99,'Strike fear with the Reaper tag','["Exclusive [Reaper] chat tag","Premium color styling","Lifetime access"]'::jsonb,'#7f1d1d',false,true,11),
('warlord','Warlord','tag',699,7.99,'Lead with the Warlord tag','["Exclusive [Warlord] chat tag","Premium color styling","Lifetime access"]'::jsonb,'#b91c1c',false,false,12),
('shadow','Shadow','tag',419,4.99,'Stealthy Shadow tag','["Exclusive [Shadow] chat tag","Premium color styling","Lifetime access"]'::jsonb,'#1f2937',false,false,13),
('phantom','Phantom','tag',419,4.99,'Mystical Phantom tag','["Exclusive [Phantom] chat tag","Premium color styling","Lifetime access"]'::jsonb,'#374151',false,false,14),
('deity','Deity','tag',849,9.99,'Divine Deity tag','["Exclusive [Deity] chat tag","Premium color styling","Lifetime access"]'::jsonb,'#fbbf24',true,false,15),
('overlord','Overlord','tag',699,7.99,'Commanding Overlord tag','["Exclusive [Overlord] chat tag","Premium color styling","Lifetime access"]'::jsonb,'#a855f7',false,false,16),
('eternal','Eternal','tag',849,9.99,'Timeless Eternal tag','["Exclusive [Eternal] chat tag","Premium color styling","Lifetime access"]'::jsonb,'#06b6d4',true,false,17);

-- Seed site settings
INSERT INTO public.site_settings (key, value) VALUES
('branding','{"site_name":"BloodMC Store","tagline":"The Official BloodMC Network Store","logo_url":"","favicon_url":""}'::jsonb),
('server','{"ip":"play.bloodmc.net","discord":"https://discord.gg/kUZjRQsxtm","youtube":"https://www.youtube.com/@ShadowRoni"}'::jsonb),
('payment','{"upi_id":"shadowroni@ybl","inr_to_usd_rate":83.0}'::jsonb),
('hero','{"title":"Dominate the BloodMC Network","subtitle":"Premium ranks, exclusive tags & elite BedWars perks. Join thousands of players.","cta_primary":"Browse Store","cta_secondary":"Join Discord","background_url":""}'::jsonb),
('maintenance','{"enabled":false,"message":"We are upgrading the network. Be back soon!"}'::jsonb);

-- Seed FAQs
INSERT INTO public.faqs (question, answer, sort_order) VALUES
('How do I receive my rank or tag after purchase?','After completing payment via UPI, open a Discord ticket at our Discord server with your order reference ID and Minecraft username. An admin will deliver your purchase within 24 hours.',1),
('What payment methods are accepted?','We accept UPI (Indian Rupees) using shadowroni@ybl. For USD, please contact support on Discord for alternate methods.',2),
('Are purchases permanent?','Yes — all ranks and tags are lifetime purchases on the BloodMC network.',3),
('Can I get a refund?','Refunds are subject to our refund policy. Read the Refund Policy page for details.',4),
('Is BloodMC affiliated with Mojang?','No. BloodMC is not affiliated with Mojang AB. Minecraft is a trademark of Mojang AB.',5);

-- Seed policy pages
INSERT INTO public.policy_pages (slug, title, content) VALUES
('terms','Terms of Service','By purchasing from BloodMC Store, you agree to abide by our network rules. All purchases are tied to your Minecraft account and are non-transferable. We reserve the right to revoke purchases for rule violations such as cheating, exploiting, or abusive behavior. Prices and perks may change without notice.'),
('refund','Refund Policy','All sales are considered final once the rank or tag is delivered to your Minecraft account. Refunds may be granted within 24 hours of purchase if the item has not been delivered, or if a technical issue prevents delivery. Refunds are not available for accounts banned for rule violations. To request a refund, open a Discord ticket with your order reference.'),
('privacy','Privacy Policy','We collect your Minecraft username, email (optional), and payment reference solely to deliver your purchase and provide support. We do not sell or share your data with third parties. Order data is retained for record-keeping and dispute resolution.'),
('support','Support','Need help with an order, delivery, or technical issue? Join our Discord server and open a support ticket with your order reference ID. Our team typically responds within a few hours.');

-- Trigger to auto-create profile/role: assign first user as admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- If no admin exists, make this user admin
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
