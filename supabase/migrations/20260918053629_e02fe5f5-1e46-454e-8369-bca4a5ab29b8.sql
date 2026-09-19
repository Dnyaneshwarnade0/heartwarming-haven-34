ALTER TABLE public.telegram_links ADD COLUMN IF NOT EXISTS permissions jsonb;

CREATE TABLE public.telegram_invites (
  code text PRIMARY KEY,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'manager')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.telegram_invites TO authenticated;
GRANT ALL ON public.telegram_invites TO service_role;

ALTER TABLE public.telegram_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members read invites" ON public.telegram_invites
  FOR SELECT TO authenticated
  USING (is_org_member(auth.uid(), org_id) OR is_platform_admin(auth.uid()));

INSERT INTO public.telegram_invites (code, org_id, role)
SELECT code, (SELECT id FROM public.organizations LIMIT 1), role
FROM (VALUES
  ('SBADM101', 'admin'),
  ('SBADM102', 'admin'),
  ('SBADM103', 'admin'),
  ('SBADM104', 'admin'),
  ('SBADM105', 'admin'),
  ('SBMGR301', 'manager'),
  ('SBMGR302', 'manager'),
  ('SBMGR303', 'manager'),
  ('SBMGR304', 'manager'),
  ('SBMGR305', 'manager')
) AS t(code, role)
WHERE EXISTS (SELECT 1 FROM public.organizations)
ON CONFLICT (code) DO NOTHING;