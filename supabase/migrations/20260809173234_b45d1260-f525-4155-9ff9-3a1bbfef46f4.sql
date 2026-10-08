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