-- Customers
CREATE TABLE IF NOT EXISTS public.app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  email text,
  phone text,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  last_active_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_users TO authenticated;
GRANT ALL ON public.app_users TO service_role;
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage app_users" ON public.app_users FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- License upgrades
ALTER TABLE public.licenses
  ADD COLUMN IF NOT EXISTS key_hash text,
  ADD COLUMN IF NOT EXISTS key_prefix text,
  ADD COLUMN IF NOT EXISTS max_devices integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS current_devices integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS revoked_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_validation timestamptz,
  ADD COLUMN IF NOT EXISTS app_user_id uuid REFERENCES public.app_users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS duration_days integer;

ALTER TABLE public.licenses ALTER COLUMN wa_number DROP NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS licenses_key_hash_idx ON public.licenses(key_hash) WHERE key_hash IS NOT NULL;

-- Map legacy plans
UPDATE public.licenses SET plan = 'starter' WHERE plan = 'monthly';
UPDATE public.licenses SET plan = 'pro' WHERE plan = 'yearly';

-- Devices
CREATE TABLE IF NOT EXISTS public.license_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id bigint NOT NULL REFERENCES public.licenses(id) ON DELETE CASCADE,
  device_id text NOT NULL,
  label text,
  wa_number text,
  first_seen timestamptz NOT NULL DEFAULT now(),
  last_seen timestamptz NOT NULL DEFAULT now(),
  UNIQUE (license_id, device_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.license_devices TO authenticated;
GRANT ALL ON public.license_devices TO service_role;
ALTER TABLE public.license_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage devices" ON public.license_devices FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));