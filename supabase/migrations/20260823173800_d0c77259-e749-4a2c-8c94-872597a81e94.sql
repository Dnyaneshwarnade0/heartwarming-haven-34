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

INSERT INTO public.telegram_invites (code, org_id, role) VALUES
  ('SBADM101', 'e6682d70-52dc-4688-9987-ccbbd38e4b7d', 'admin'),
  ('SBADM102', 'e6682d70-52dc-4688-9987-ccbbd38e4b7d', 'admin'),
  ('SBADM103', 'e6682d70-52dc-4688-9987-ccbbd38e4b7d', 'admin'),
  ('SBADM104', 'e6682d70-52dc-4688-9987-ccbbd38e4b7d', 'admin'),
  ('SBADM105', 'e6682d70-52dc-4688-9987-ccbbd38e4b7d', 'admin'),
  ('SBMGR301', 'e6682d70-52dc-4688-9987-ccbbd38e4b7d', 'manager'),
  ('SBMGR302', 'e6682d70-52dc-4688-9987-ccbbd38e4b7d', 'manager'),
  ('SBMGR303', 'e6682d70-52dc-4688-9987-ccbbd38e4b7d', 'manager'),
  ('SBMGR304', 'e6682d70-52dc-4688-9987-ccbbd38e4b7d', 'manager'),
  ('SBMGR305', 'e6682d70-52dc-4688-9987-ccbbd38e4b7d', 'manager')
ON CONFLICT (code) DO NOTHING;