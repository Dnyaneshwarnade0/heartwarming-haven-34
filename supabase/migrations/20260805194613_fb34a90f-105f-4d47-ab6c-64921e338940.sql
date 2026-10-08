ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS link_code text;

CREATE OR REPLACE FUNCTION public.gen_link_code()
RETURNS text
LANGUAGE sql
VOLATILE
SET search_path = public
AS $$
  SELECT upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
$$;

UPDATE public.organizations SET link_code = public.gen_link_code() WHERE link_code IS NULL;

ALTER TABLE public.organizations ALTER COLUMN link_code SET DEFAULT public.gen_link_code();
CREATE UNIQUE INDEX IF NOT EXISTS organizations_link_code_key ON public.organizations (link_code);

CREATE TABLE IF NOT EXISTS public.telegram_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id bigint NOT NULL UNIQUE,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role public.org_role NOT NULL DEFAULT 'admin',
  username text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.telegram_links TO authenticated;
GRANT ALL ON public.telegram_links TO service_role;
ALTER TABLE public.telegram_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members read telegram links"
ON public.telegram_links FOR SELECT TO authenticated
USING (public.is_org_member(auth.uid(), org_id) OR public.is_platform_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.telegram_updates (
  update_id bigint PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.telegram_updates TO service_role;
ALTER TABLE public.telegram_updates ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.org_snapshots (
  org_id uuid PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.org_snapshots TO authenticated;
GRANT ALL ON public.org_snapshots TO service_role;
ALTER TABLE public.org_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members read snapshot"
ON public.org_snapshots FOR SELECT TO authenticated
USING (public.is_org_member(auth.uid(), org_id) OR public.is_platform_admin(auth.uid()));

CREATE TRIGGER org_snapshots_touch
BEFORE UPDATE ON public.org_snapshots
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.organizations (name, city)
SELECT 'शांतीब्रह्म गुरुकुलम', 'Maharashtra'
WHERE NOT EXISTS (SELECT 1 FROM public.organizations);