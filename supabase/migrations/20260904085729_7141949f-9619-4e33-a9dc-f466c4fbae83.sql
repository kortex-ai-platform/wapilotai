CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE TABLE public.licenses (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  wa_number TEXT UNIQUE NOT NULL,
  license_key TEXT UNIQUE,
  plan TEXT NOT NULL DEFAULT 'trial',
  status TEXT NOT NULL DEFAULT 'active',
  user_name TEXT,
  business_name TEXT,
  trial_start TIMESTAMPTZ,
  trial_days INT NOT NULL DEFAULT 3,
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.licenses TO service_role;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.payments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  wa_number TEXT NOT NULL,
  sender_info TEXT,
  trx_id TEXT,
  plan TEXT,
  amount TEXT,
  customer_name TEXT,
  business_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.app_settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read settings" ON public.app_settings FOR SELECT USING (true);

INSERT INTO public.app_settings (key, value) VALUES
  ('bkash_number', '01712345678'),
  ('nagad_number', '01912345678'),
  ('bkash_instruction', 'Send Money করুন এবং TrxID সংরক্ষণ করুন'),
  ('nagad_instruction', 'Send Money করুন এবং TrxID সংরক্ষণ করুন'),
  ('price_monthly', '950'),
  ('price_yearly', '4500'),
  ('price_lifetime', '14500'),
  ('support_whatsapp', '01712345678'),
  ('tutorial_youtube', 'https://youtube.com/'),
  ('website_link', ''),
  ('update_version', '26.0.0'),
  ('update_link', ''),
  ('broadcast_guide', '');

CREATE TABLE public.analytics_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  wa_number TEXT,
  event_type TEXT NOT NULL,
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.analytics_events TO service_role;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;