CREATE TYPE public.org_role AS ENUM ('owner','admin','staff');
CREATE TYPE public.sub_status AS ENUM ('trialing','active','expired');
CREATE TYPE public.payment_status AS ENUM ('pending','approved','rejected');

CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  city text,
  logo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.org_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  full_name text,
  role public.org_role NOT NULL DEFAULT 'staff',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, user_id)
);
CREATE INDEX org_members_user_idx ON public.org_members(user_id);

CREATE TABLE public.platform_admins (
  user_id uuid PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL UNIQUE REFERENCES public.organizations(id) ON DELETE CASCADE,
  status public.sub_status NOT NULL DEFAULT 'trialing',
  trial_ends_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  current_period_end timestamptz,
  student_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.payment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  submitted_by uuid NOT NULL,
  student_count int NOT NULL,
  amount int NOT NULL,
  utr text,
  screenshot_url text,
  status public.payment_status NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX payment_requests_org_idx ON public.payment_requests(org_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations TO authenticated;
GRANT ALL ON public.organizations TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.org_members TO authenticated;
GRANT ALL ON public.org_members TO service_role;
GRANT SELECT ON public.platform_admins TO authenticated;
GRANT ALL ON public.platform_admins TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
GRANT SELECT, INSERT ON public.payment_requests TO authenticated;
GRANT ALL ON public.payment_requests TO service_role;

CREATE OR REPLACE FUNCTION public.price_for_students(_count int)
RETURNS int LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE
    WHEN _count <= 15 THEN 500
    WHEN _count <= 30 THEN 1000
    WHEN _count <= 65 THEN 1500
    ELSE 2000
  END;
$$;

CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = _user_id);
$$;

CREATE OR REPLACE FUNCTION public.current_org_id(_user_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT org_id FROM public.org_members WHERE user_id = _user_id LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.has_org_role(_user_id uuid, _org_id uuid, _roles public.org_role[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.org_members
    WHERE user_id = _user_id AND org_id = _org_id AND role = ANY(_roles)
  );
$$;

CREATE OR REPLACE FUNCTION public.is_org_member(_user_id uuid, _org_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.org_members WHERE user_id = _user_id AND org_id = _org_id
  );
$$;

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members read own org" ON public.organizations FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), id) OR public.is_platform_admin(auth.uid()));
CREATE POLICY "owners update own org" ON public.organizations FOR UPDATE TO authenticated
  USING (public.has_org_role(auth.uid(), id, ARRAY['owner','admin']::public.org_role[]));

CREATE POLICY "members read org members" ON public.org_members FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), org_id) OR public.is_platform_admin(auth.uid()));
CREATE POLICY "admins manage members" ON public.org_members FOR ALL TO authenticated
  USING (public.has_org_role(auth.uid(), org_id, ARRAY['owner','admin']::public.org_role[]))
  WITH CHECK (public.has_org_role(auth.uid(), org_id, ARRAY['owner','admin']::public.org_role[]));

CREATE POLICY "read own platform admin row" ON public.platform_admins FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "members read subscription" ON public.subscriptions FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), org_id) OR public.is_platform_admin(auth.uid()));

CREATE POLICY "members read payment requests" ON public.payment_requests FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), org_id) OR public.is_platform_admin(auth.uid()));
CREATE POLICY "admins create payment requests" ON public.payment_requests FOR INSERT TO authenticated
  WITH CHECK (
    submitted_by = auth.uid()
    AND public.has_org_role(auth.uid(), org_id, ARRAY['owner','admin']::public.org_role[])
  );

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER organizations_touch BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER subscriptions_touch BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

REVOKE ALL ON FUNCTION public.is_platform_admin(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_org_member(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_org_role(uuid, uuid, public.org_role[]) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.current_org_id(uuid) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.is_platform_admin(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_org_member(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_org_role(uuid, uuid, public.org_role[]) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.current_org_id(uuid) TO service_role;

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

INSERT INTO public.organizations (id, name, city)
SELECT 'e6682d70-52dc-4688-9987-ccbbd38e4b7d'::uuid, 'शांतीब्रह्म गुरुकुलम', 'Maharashtra'
WHERE NOT EXISTS (SELECT 1 FROM public.organizations);

CREATE TABLE public.parent_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id bigint NOT NULL,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  student_id text NOT NULL,
  student_name text,
  parent_code text NOT NULL,
  username text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (chat_id, student_id)
);

CREATE INDEX parent_links_org_idx ON public.parent_links (org_id);
CREATE INDEX parent_links_student_idx ON public.parent_links (org_id, student_id);

GRANT SELECT ON public.parent_links TO authenticated;
GRANT ALL ON public.parent_links TO service_role;

ALTER TABLE public.parent_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members read parent links"
ON public.parent_links FOR SELECT TO authenticated
USING (is_org_member(auth.uid(), org_id) OR is_platform_admin(auth.uid()));

CREATE TABLE public.sent_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  dedupe_key text NOT NULL,
  chat_id bigint NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, dedupe_key, chat_id)
);

GRANT ALL ON public.sent_notifications TO service_role;

ALTER TABLE public.sent_notifications ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.bot_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  date date NOT NULL,
  session text NOT NULL,
  absent_rolls integer[] NOT NULL DEFAULT '{}',
  chat_id bigint,
  applied boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.bot_attendance TO service_role;
ALTER TABLE public.bot_attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read bot attendance" ON public.bot_attendance
  FOR SELECT TO authenticated
  USING (is_org_member(auth.uid(), org_id) OR is_platform_admin(auth.uid()));
GRANT SELECT ON public.bot_attendance TO authenticated;
CREATE INDEX bot_attendance_pending_idx ON public.bot_attendance (org_id, applied);

CREATE TABLE public.bot_sessions (
  chat_id bigint PRIMARY KEY,
  state jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.bot_sessions TO service_role;
ALTER TABLE public.bot_sessions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.app_state (
  org_id uuid PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.app_state TO service_role;
ALTER TABLE public.app_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read app state" ON public.app_state FOR SELECT TO authenticated
USING (public.is_org_member(auth.uid(), org_id) OR public.is_platform_admin(auth.uid()));
GRANT SELECT ON public.app_state TO authenticated;
CREATE TRIGGER app_state_touch BEFORE UPDATE ON public.app_state FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.bot_actions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  kind text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  chat_id bigint,
  applied boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.bot_actions TO service_role;
GRANT SELECT ON public.bot_actions TO authenticated;

ALTER TABLE public.bot_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members read bot actions"
ON public.bot_actions FOR SELECT TO authenticated
USING (is_org_member(auth.uid(), org_id) OR is_platform_admin(auth.uid()));

CREATE INDEX bot_actions_pending_idx ON public.bot_actions (org_id, applied, created_at);

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

CREATE OR REPLACE FUNCTION public.is_org_member(_user_id uuid, _org_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.org_members WHERE user_id = auth.uid() AND org_id = _org_id
  );
$$;

CREATE OR REPLACE FUNCTION public.has_org_role(_user_id uuid, _org_id uuid, _roles org_role[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.org_members
    WHERE user_id = auth.uid() AND org_id = _org_id AND role = ANY(_roles)
  );
$$;

CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.current_org_id(_user_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT org_id FROM public.org_members WHERE user_id = auth.uid() LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.is_org_member(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_org_role(uuid, uuid, org_role[]) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_platform_admin(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.current_org_id(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.gen_link_code() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.is_org_member(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_org_role(uuid, uuid, org_role[]) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_platform_admin(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.current_org_id(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.gen_link_code() TO service_role;

ALTER TABLE public.telegram_invites
  ADD COLUMN IF NOT EXISTS permissions jsonb,
  ADD COLUMN IF NOT EXISTS label text,
  ADD COLUMN IF NOT EXISTS created_by bigint,
  ADD COLUMN IF NOT EXISTS used_at timestamptz;

ALTER TABLE public.telegram_invites DROP CONSTRAINT IF EXISTS telegram_invites_role_check;
ALTER TABLE public.telegram_invites
  ADD CONSTRAINT telegram_invites_role_check CHECK (role IN ('admin','manager','sub'));

CREATE TABLE IF NOT EXISTS public.telegram_failed_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  update_id bigint,
  chat_id bigint,
  update_type text,
  stage text NOT NULL,
  error_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.telegram_failed_updates TO service_role;

ALTER TABLE public.telegram_failed_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "platform admins read failed updates"
ON public.telegram_failed_updates
FOR SELECT
TO authenticated
USING (public.is_platform_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS telegram_failed_updates_created_at_idx
ON public.telegram_failed_updates (created_at DESC);