--
-- PostgreSQL database dump
--

\restrict MdlTLxRaFwHXGKlBuileVOA8d3ruVqhDdbB6cw3MJFzaYgu2Oe1xgub8B8T5yKl

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'SQL_ASCII';
SET standard_conforming_strings = off;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET escape_string_warning = off;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: org_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.org_role AS ENUM (
    'owner',
    'admin',
    'staff'
);


--
-- Name: payment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);


--
-- Name: sub_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.sub_status AS ENUM (
    'trialing',
    'active',
    'expired'
);


--
-- Name: current_org_id(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.current_org_id(_user_id uuid) RETURNS uuid
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT org_id FROM public.org_members WHERE user_id = auth.uid() LIMIT 1;
$$;


--
-- Name: gen_link_code(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.gen_link_code() RETURNS text
    LANGUAGE sql
    SET search_path TO 'public'
    AS $$
  SELECT upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
$$;


--
-- Name: has_org_role(uuid, uuid, public.org_role[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_org_role(_user_id uuid, _org_id uuid, _roles public.org_role[]) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.org_members
    WHERE user_id = auth.uid() AND org_id = _org_id AND role = ANY(_roles)
  );
$$;


--
-- Name: is_org_member(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_org_member(_user_id uuid, _org_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.org_members WHERE user_id = auth.uid() AND org_id = _org_id
  );
$$;


--
-- Name: is_platform_admin(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_platform_admin(_user_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid()
  );
$$;


--
-- Name: price_for_students(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.price_for_students(_count integer) RETURNS integer
    LANGUAGE sql IMMUTABLE
    SET search_path TO 'public'
    AS $$
  SELECT CASE
    WHEN _count <= 15 THEN 500
    WHEN _count <= 30 THEN 1000
    WHEN _count <= 65 THEN 1500
    ELSE 2000
  END;
$$;


--
-- Name: touch_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.touch_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: app_state; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_state (
    org_id uuid NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: bot_actions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bot_actions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    org_id uuid NOT NULL,
    kind text NOT NULL,
    payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    chat_id bigint,
    applied boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: bot_attendance; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: bot_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bot_sessions (
    chat_id bigint NOT NULL,
    state jsonb DEFAULT '{}'::jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: org_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.org_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    org_id uuid NOT NULL,
    user_id uuid NOT NULL,
    full_name text,
    role public.org_role DEFAULT 'staff'::public.org_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: org_snapshots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.org_snapshots (
    org_id uuid NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: organizations; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: parent_links; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: payment_requests; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: platform_admins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.platform_admins (
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: sent_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sent_notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    org_id uuid NOT NULL,
    dedupe_key text NOT NULL,
    chat_id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: telegram_failed_updates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.telegram_failed_updates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    update_id bigint,
    chat_id bigint,
    update_type text,
    stage text NOT NULL,
    error_reason text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: telegram_invites; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: telegram_links; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.telegram_links (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    chat_id bigint NOT NULL,
    org_id uuid NOT NULL,
    role public.org_role DEFAULT 'admin'::public.org_role NOT NULL,
    username text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    permissions jsonb
);


--
-- Name: telegram_updates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.telegram_updates (
    update_id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: app_state app_state_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_state
    ADD CONSTRAINT app_state_pkey PRIMARY KEY (org_id);


--
-- Name: bot_actions bot_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bot_actions
    ADD CONSTRAINT bot_actions_pkey PRIMARY KEY (id);


--
-- Name: bot_attendance bot_attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bot_attendance
    ADD CONSTRAINT bot_attendance_pkey PRIMARY KEY (id);


--
-- Name: bot_sessions bot_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bot_sessions
    ADD CONSTRAINT bot_sessions_pkey PRIMARY KEY (chat_id);


--
-- Name: org_members org_members_org_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.org_members
    ADD CONSTRAINT org_members_org_id_user_id_key UNIQUE (org_id, user_id);


--
-- Name: org_members org_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.org_members
    ADD CONSTRAINT org_members_pkey PRIMARY KEY (id);


--
-- Name: org_snapshots org_snapshots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.org_snapshots
    ADD CONSTRAINT org_snapshots_pkey PRIMARY KEY (org_id);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: parent_links parent_links_chat_id_student_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parent_links
    ADD CONSTRAINT parent_links_chat_id_student_id_key UNIQUE (chat_id, student_id);


--
-- Name: parent_links parent_links_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parent_links
    ADD CONSTRAINT parent_links_pkey PRIMARY KEY (id);


--
-- Name: payment_requests payment_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_requests
    ADD CONSTRAINT payment_requests_pkey PRIMARY KEY (id);


--
-- Name: platform_admins platform_admins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_admins
    ADD CONSTRAINT platform_admins_pkey PRIMARY KEY (user_id);


--
-- Name: sent_notifications sent_notifications_org_id_dedupe_key_chat_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sent_notifications
    ADD CONSTRAINT sent_notifications_org_id_dedupe_key_chat_id_key UNIQUE (org_id, dedupe_key, chat_id);


--
-- Name: sent_notifications sent_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sent_notifications
    ADD CONSTRAINT sent_notifications_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_org_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_org_id_key UNIQUE (org_id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: telegram_failed_updates telegram_failed_updates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.telegram_failed_updates
    ADD CONSTRAINT telegram_failed_updates_pkey PRIMARY KEY (id);


--
-- Name: telegram_invites telegram_invites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.telegram_invites
    ADD CONSTRAINT telegram_invites_pkey PRIMARY KEY (code);


--
-- Name: telegram_links telegram_links_chat_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.telegram_links
    ADD CONSTRAINT telegram_links_chat_id_key UNIQUE (chat_id);


--
-- Name: telegram_links telegram_links_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.telegram_links
    ADD CONSTRAINT telegram_links_pkey PRIMARY KEY (id);


--
-- Name: telegram_updates telegram_updates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.telegram_updates
    ADD CONSTRAINT telegram_updates_pkey PRIMARY KEY (update_id);


--
-- Name: bot_actions_pending_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX bot_actions_pending_idx ON public.bot_actions USING btree (org_id, applied, created_at);


--
-- Name: bot_attendance_pending_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX bot_attendance_pending_idx ON public.bot_attendance USING btree (org_id, applied);


--
-- Name: org_members_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX org_members_user_idx ON public.org_members USING btree (user_id);


--
-- Name: organizations_link_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX organizations_link_code_key ON public.organizations USING btree (link_code);


--
-- Name: parent_links_org_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX parent_links_org_idx ON public.parent_links USING btree (org_id);


--
-- Name: parent_links_student_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX parent_links_student_idx ON public.parent_links USING btree (org_id, student_id);


--
-- Name: payment_requests_org_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payment_requests_org_idx ON public.payment_requests USING btree (org_id, created_at DESC);


--
-- Name: telegram_failed_updates_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX telegram_failed_updates_created_at_idx ON public.telegram_failed_updates USING btree (created_at DESC);


--
-- Name: app_state app_state_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER app_state_touch BEFORE UPDATE ON public.app_state FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: org_snapshots org_snapshots_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER org_snapshots_touch BEFORE UPDATE ON public.org_snapshots FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: organizations organizations_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER organizations_touch BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: subscriptions subscriptions_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER subscriptions_touch BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: app_state app_state_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_state
    ADD CONSTRAINT app_state_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: bot_actions bot_actions_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bot_actions
    ADD CONSTRAINT bot_actions_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: bot_attendance bot_attendance_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bot_attendance
    ADD CONSTRAINT bot_attendance_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: org_members org_members_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.org_members
    ADD CONSTRAINT org_members_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: org_snapshots org_snapshots_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.org_snapshots
    ADD CONSTRAINT org_snapshots_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: parent_links parent_links_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parent_links
    ADD CONSTRAINT parent_links_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: payment_requests payment_requests_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_requests
    ADD CONSTRAINT payment_requests_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: sent_notifications sent_notifications_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sent_notifications
    ADD CONSTRAINT sent_notifications_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: telegram_invites telegram_invites_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.telegram_invites
    ADD CONSTRAINT telegram_invites_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: telegram_links telegram_links_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.telegram_links
    ADD CONSTRAINT telegram_links_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: payment_requests admins create payment requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admins create payment requests" ON public.payment_requests FOR INSERT TO authenticated WITH CHECK (((submitted_by = auth.uid()) AND public.has_org_role(auth.uid(), org_id, ARRAY['owner'::public.org_role, 'admin'::public.org_role])));


--
-- Name: org_members admins manage members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admins manage members" ON public.org_members TO authenticated USING (public.has_org_role(auth.uid(), org_id, ARRAY['owner'::public.org_role, 'admin'::public.org_role])) WITH CHECK (public.has_org_role(auth.uid(), org_id, ARRAY['owner'::public.org_role, 'admin'::public.org_role]));


--
-- Name: app_state; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.app_state ENABLE ROW LEVEL SECURITY;

--
-- Name: bot_actions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bot_actions ENABLE ROW LEVEL SECURITY;

--
-- Name: bot_attendance; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bot_attendance ENABLE ROW LEVEL SECURITY;

--
-- Name: bot_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bot_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: app_state members read app state; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "members read app state" ON public.app_state FOR SELECT TO authenticated USING ((public.is_org_member(auth.uid(), org_id) OR public.is_platform_admin(auth.uid())));


--
-- Name: bot_actions members read bot actions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "members read bot actions" ON public.bot_actions FOR SELECT TO authenticated USING ((public.is_org_member(auth.uid(), org_id) OR public.is_platform_admin(auth.uid())));


--
-- Name: bot_attendance members read bot attendance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "members read bot attendance" ON public.bot_attendance FOR SELECT TO authenticated USING ((public.is_org_member(auth.uid(), org_id) OR public.is_platform_admin(auth.uid())));


--
-- Name: telegram_invites members read invites; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "members read invites" ON public.telegram_invites FOR SELECT TO authenticated USING ((public.is_org_member(auth.uid(), org_id) OR public.is_platform_admin(auth.uid())));


--
-- Name: org_members members read org members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "members read org members" ON public.org_members FOR SELECT TO authenticated USING ((public.is_org_member(auth.uid(), org_id) OR public.is_platform_admin(auth.uid())));


--
-- Name: organizations members read own org; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "members read own org" ON public.organizations FOR SELECT TO authenticated USING ((public.is_org_member(auth.uid(), id) OR public.is_platform_admin(auth.uid())));


--
-- Name: parent_links members read parent links; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "members read parent links" ON public.parent_links FOR SELECT TO authenticated USING ((public.is_org_member(auth.uid(), org_id) OR public.is_platform_admin(auth.uid())));


--
-- Name: payment_requests members read payment requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "members read payment requests" ON public.payment_requests FOR SELECT TO authenticated USING ((public.is_org_member(auth.uid(), org_id) OR public.is_platform_admin(auth.uid())));


--
-- Name: org_snapshots members read snapshot; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "members read snapshot" ON public.org_snapshots FOR SELECT TO authenticated USING ((public.is_org_member(auth.uid(), org_id) OR public.is_platform_admin(auth.uid())));


--
-- Name: subscriptions members read subscription; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "members read subscription" ON public.subscriptions FOR SELECT TO authenticated USING ((public.is_org_member(auth.uid(), org_id) OR public.is_platform_admin(auth.uid())));


--
-- Name: telegram_links members read telegram links; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "members read telegram links" ON public.telegram_links FOR SELECT TO authenticated USING ((public.is_org_member(auth.uid(), org_id) OR public.is_platform_admin(auth.uid())));


--
-- Name: org_members; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

--
-- Name: org_snapshots; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.org_snapshots ENABLE ROW LEVEL SECURITY;

--
-- Name: organizations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

--
-- Name: organizations owners update own org; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "owners update own org" ON public.organizations FOR UPDATE TO authenticated USING (public.has_org_role(auth.uid(), id, ARRAY['owner'::public.org_role, 'admin'::public.org_role])) WITH CHECK (public.has_org_role(auth.uid(), id, ARRAY['owner'::public.org_role, 'admin'::public.org_role]));


--
-- Name: parent_links; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.parent_links ENABLE ROW LEVEL SECURITY;

--
-- Name: payment_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: telegram_failed_updates platform admins read failed updates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "platform admins read failed updates" ON public.telegram_failed_updates FOR SELECT TO authenticated USING (public.is_platform_admin(auth.uid()));


--
-- Name: platform_admins; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;

--
-- Name: platform_admins read own platform admin row; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "read own platform admin row" ON public.platform_admins FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- Name: sent_notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sent_notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: subscriptions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: telegram_failed_updates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.telegram_failed_updates ENABLE ROW LEVEL SECURITY;

--
-- Name: telegram_invites; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.telegram_invites ENABLE ROW LEVEL SECURITY;

--
-- Name: telegram_links; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.telegram_links ENABLE ROW LEVEL SECURITY;

--
-- Name: telegram_updates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.telegram_updates ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

\unrestrict MdlTLxRaFwHXGKlBuileVOA8d3ruVqhDdbB6cw3MJFzaYgu2Oe1xgub8B8T5yKl

