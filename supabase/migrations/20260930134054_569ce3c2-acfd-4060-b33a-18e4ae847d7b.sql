CREATE TYPE public.org_role AS ENUM ('owner','admin','staff');
CREATE TYPE public.payment_status AS ENUM ('pending','approved','rejected');
CREATE TYPE public.sub_status AS ENUM ('trialing','active','expired');

CREATE FUNCTION public.gen_link_code() RETURNS text
    LANGUAGE sql SET search_path TO 'public' AS $$
  SELECT upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
$$;

CREATE FUNCTION public.touch_updated_at() RETURNS trigger
    LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.organizations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    phone text,
    city text,
    logo_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    link_code text DEFAULT public.gen_link_code()
);
CREATE TABLE public.org_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    org_id uuid NOT NULL,
    user_id uuid NOT NULL,
    full_name text,
    role public.org_role DEFAULT 'staff'::public.org_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE public.platform_admins (
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE public.app_state (
    org_id uuid NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE public.org_snapshots (
    org_id uuid NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE public.bot_actions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    org_id uuid NOT NULL,
    kind text NOT NULL,
    payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    chat_id bigint,
    applied boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE public.bot_attendance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    org_id uuid NOT NULL,
    date date NOT NULL,
    session text NOT NULL,
    absent_rolls integer[] DEFAULT '{}'::integer[] NOT NULL,
    chat_id bigint,
    applied boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE public.bot_sessions (
    chat_id bigint NOT NULL,
    state jsonb DEFAULT '{}'::jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE public.parent_links (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    chat_id bigint NOT NULL,
    org_id uuid NOT NULL,
    student_id text NOT NULL,
    student_name text,
    parent_code text NOT NULL,
    username text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE public.payment_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    org_id uuid NOT NULL,
    submitted_by uuid NOT NULL,
    student_count integer NOT NULL,
    amount integer NOT NULL,
    utr text,
    screenshot_url text,
    status public.payment_status DEFAULT 'pending'::public.payment_status NOT NULL,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    note text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE public.sent_notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    org_id uuid NOT NULL,
    dedupe_key text NOT NULL,
    chat_id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE public.subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    org_id uuid NOT NULL,
    status public.sub_status DEFAULT 'trialing'::public.sub_status NOT NULL,
    trial_ends_at timestamp with time zone DEFAULT (now() + '7 days'::interval) NOT NULL,
    current_period_end timestamp with time zone,
    student_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE public.telegram_failed_updates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    update_id bigint,
    chat_id bigint,
    update_type text,
    stage text NOT NULL,
    error_reason text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE public.telegram_invites (
    code text NOT NULL,
    org_id uuid NOT NULL,
    role text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    permissions jsonb,
    label text,
    created_by bigint,
    used_at timestamp with time zone,
    CONSTRAINT telegram_invites_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'manager'::text, 'sub'::text])))
);
CREATE TABLE public.telegram_links (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    chat_id bigint NOT NULL,
    org_id uuid NOT NULL,
    role public.org_role DEFAULT 'admin'::public.org_role NOT NULL,
    username text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    permissions jsonb
);
CREATE TABLE public.telegram_updates (
    update_id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.app_state ADD CONSTRAINT app_state_pkey PRIMARY KEY (org_id);
ALTER TABLE ONLY public.bot_actions ADD CONSTRAINT bot_actions_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.bot_attendance ADD CONSTRAINT bot_attendance_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.bot_sessions ADD CONSTRAINT bot_sessions_pkey PRIMARY KEY (chat_id);
ALTER TABLE ONLY public.org_members ADD CONSTRAINT org_members_org_id_user_id_key UNIQUE (org_id, user_id);
ALTER TABLE ONLY public.org_members ADD CONSTRAINT org_members_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.org_snapshots ADD CONSTRAINT org_snapshots_pkey PRIMARY KEY (org_id);
ALTER TABLE ONLY public.organizations ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.parent_links ADD CONSTRAINT parent_links_chat_id_student_id_key UNIQUE (chat_id, student_id);
ALTER TABLE ONLY public.parent_links ADD CONSTRAINT parent_links_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.payment_requests ADD CONSTRAINT payment_requests_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.platform_admins ADD CONSTRAINT platform_admins_pkey PRIMARY KEY (user_id);
ALTER TABLE ONLY public.sent_notifications ADD CONSTRAINT sent_notifications_org_id_dedupe_key_chat_id_key UNIQUE (org_id, dedupe_key, chat_id);
ALTER TABLE ONLY public.sent_notifications ADD CONSTRAINT sent_notifications_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.subscriptions ADD CONSTRAINT subscriptions_org_id_key UNIQUE (org_id);
ALTER TABLE ONLY public.subscriptions ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.telegram_failed_updates ADD CONSTRAINT telegram_failed_updates_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.telegram_invites ADD CONSTRAINT telegram_invites_pkey PRIMARY KEY (code);
ALTER TABLE ONLY public.telegram_links ADD CONSTRAINT telegram_links_chat_id_key UNIQUE (chat_id);
ALTER TABLE ONLY public.telegram_links ADD CONSTRAINT telegram_links_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.telegram_updates ADD CONSTRAINT telegram_updates_pkey PRIMARY KEY (update_id);

CREATE INDEX bot_actions_pending_idx ON public.bot_actions USING btree (org_id, applied, created_at);
CREATE INDEX bot_attendance_pending_idx ON public.bot_attendance USING btree (org_id, applied);
CREATE INDEX org_members_user_idx ON public.org_members USING btree (user_id);
CREATE UNIQUE INDEX organizations_link_code_key ON public.organizations USING btree (link_code);
CREATE INDEX parent_links_org_idx ON public.parent_links USING btree (org_id);
CREATE INDEX parent_links_student_idx ON public.parent_links USING btree (org_id, student_id);
CREATE INDEX payment_requests_org_idx ON public.payment_requests USING btree (org_id, created_at DESC);
CREATE INDEX telegram_failed_updates_created_at_idx ON public.telegram_failed_updates USING btree (created_at DESC);

ALTER TABLE ONLY public.app_state ADD CONSTRAINT app_state_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.bot_actions ADD CONSTRAINT bot_actions_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.bot_attendance ADD CONSTRAINT bot_attendance_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.org_members ADD CONSTRAINT org_members_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.org_snapshots ADD CONSTRAINT org_snapshots_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.parent_links ADD CONSTRAINT parent_links_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.payment_requests ADD CONSTRAINT payment_requests_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.sent_notifications ADD CONSTRAINT sent_notifications_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.subscriptions ADD CONSTRAINT subscriptions_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.telegram_invites ADD CONSTRAINT telegram_invites_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.telegram_links ADD CONSTRAINT telegram_links_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

CREATE TRIGGER app_state_touch BEFORE UPDATE ON public.app_state FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER org_snapshots_touch BEFORE UPDATE ON public.org_snapshots FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER organizations_touch BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER subscriptions_touch BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE FUNCTION public.current_org_id(_user_id uuid) RETURNS uuid
    LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT org_id FROM public.org_members WHERE user_id = auth.uid() LIMIT 1;
$$;
CREATE FUNCTION public.has_org_role(_user_id uuid, _org_id uuid, _roles public.org_role[]) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.org_members
    WHERE user_id = auth.uid() AND org_id = _org_id AND role = ANY(_roles)
  );
$$;
CREATE FUNCTION public.is_org_member(_user_id uuid, _org_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.org_members WHERE user_id = auth.uid() AND org_id = _org_id
  );
$$;
CREATE FUNCTION public.is_platform_admin(_user_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid()
  );
$$;
CREATE FUNCTION public.price_for_students(_count integer) RETURNS integer
    LANGUAGE sql IMMUTABLE SET search_path TO 'public' AS $$
  SELECT CASE
    WHEN _count <= 15 THEN 500
    WHEN _count <= 30 THEN 1000
    WHEN _count <= 65 THEN 1500
    ELSE 2000
  END;
$$;

REVOKE ALL ON FUNCTION public.is_platform_admin(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_org_member(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_org_role(uuid, uuid, public.org_role[]) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.current_org_id(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_platform_admin(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_org_member(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_org_role(uuid, uuid, public.org_role[]) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.current_org_id(uuid) TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations TO authenticated;
GRANT ALL ON public.organizations TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.org_members TO authenticated;
GRANT ALL ON public.org_members TO service_role;
GRANT SELECT ON public.platform_admins TO authenticated;
GRANT ALL ON public.platform_admins TO service_role;
GRANT SELECT ON public.app_state TO authenticated;
GRANT ALL ON public.app_state TO service_role;
GRANT SELECT ON public.org_snapshots TO authenticated;
GRANT ALL ON public.org_snapshots TO service_role;
GRANT SELECT ON public.bot_actions TO authenticated;
GRANT ALL ON public.bot_actions TO service_role;
GRANT SELECT ON public.bot_attendance TO authenticated;
GRANT ALL ON public.bot_attendance TO service_role;
GRANT ALL ON public.bot_sessions TO service_role;
GRANT SELECT ON public.parent_links TO authenticated;
GRANT ALL ON public.parent_links TO service_role;
GRANT SELECT, INSERT ON public.payment_requests TO authenticated;
GRANT ALL ON public.payment_requests TO service_role;
GRANT ALL ON public.sent_notifications TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
GRANT SELECT ON public.telegram_failed_updates TO authenticated;
GRANT ALL ON public.telegram_failed_updates TO service_role;
GRANT SELECT ON public.telegram_invites TO authenticated;
GRANT ALL ON public.telegram_invites TO service_role;
GRANT SELECT ON public.telegram_links TO authenticated;
GRANT ALL ON public.telegram_links TO service_role;
GRANT ALL ON public.telegram_updates TO service_role;

ALTER TABLE public.app_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sent_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_failed_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins create payment requests" ON public.payment_requests FOR INSERT TO authenticated WITH CHECK (((submitted_by = auth.uid()) AND public.has_org_role(auth.uid(), org_id, ARRAY['owner'::public.org_role, 'admin'::public.org_role])));
CREATE POLICY "admins manage members" ON public.org_members TO authenticated USING (public.has_org_role(auth.uid(), org_id, ARRAY['owner'::public.org_role, 'admin'::public.org_role])) WITH CHECK (public.has_org_role(auth.uid(), org_id, ARRAY['owner'::public.org_role, 'admin'::public.org_role]));
CREATE POLICY "members read app state" ON public.app_state FOR SELECT TO authenticated USING ((public.is_org_member(auth.uid(), org_id) OR public.is_platform_admin(auth.uid())));
CREATE POLICY "members read bot actions" ON public.bot_actions FOR SELECT TO authenticated USING ((public.is_org_member(auth.uid(), org_id) OR public.is_platform_admin(auth.uid())));
CREATE POLICY "members read bot attendance" ON public.bot_attendance FOR SELECT TO authenticated USING ((public.is_org_member(auth.uid(), org_id) OR public.is_platform_admin(auth.uid())));
CREATE POLICY "members read invites" ON public.telegram_invites FOR SELECT TO authenticated USING ((public.is_org_member(auth.uid(), org_id) OR public.is_platform_admin(auth.uid())));
CREATE POLICY "members read org members" ON public.org_members FOR SELECT TO authenticated USING ((public.is_org_member(auth.uid(), org_id) OR public.is_platform_admin(auth.uid())));
CREATE POLICY "members read own org" ON public.organizations FOR SELECT TO authenticated USING ((public.is_org_member(auth.uid(), id) OR public.is_platform_admin(auth.uid())));
CREATE POLICY "members read parent links" ON public.parent_links FOR SELECT TO authenticated USING ((public.is_org_member(auth.uid(), org_id) OR public.is_platform_admin(auth.uid())));
CREATE POLICY "members read payment requests" ON public.payment_requests FOR SELECT TO authenticated USING ((public.is_org_member(auth.uid(), org_id) OR public.is_platform_admin(auth.uid())));
CREATE POLICY "members read snapshot" ON public.org_snapshots FOR SELECT TO authenticated USING ((public.is_org_member(auth.uid(), org_id) OR public.is_platform_admin(auth.uid())));
CREATE POLICY "members read subscription" ON public.subscriptions FOR SELECT TO authenticated USING ((public.is_org_member(auth.uid(), org_id) OR public.is_platform_admin(auth.uid())));
CREATE POLICY "members read telegram links" ON public.telegram_links FOR SELECT TO authenticated USING ((public.is_org_member(auth.uid(), org_id) OR public.is_platform_admin(auth.uid())));
CREATE POLICY "owners update own org" ON public.organizations FOR UPDATE TO authenticated USING (public.has_org_role(auth.uid(), id, ARRAY['owner'::public.org_role, 'admin'::public.org_role])) WITH CHECK (public.has_org_role(auth.uid(), id, ARRAY['owner'::public.org_role, 'admin'::public.org_role]));
CREATE POLICY "platform admins read failed updates" ON public.telegram_failed_updates FOR SELECT TO authenticated USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "read own platform admin row" ON public.platform_admins FOR SELECT TO authenticated USING ((user_id = auth.uid()));