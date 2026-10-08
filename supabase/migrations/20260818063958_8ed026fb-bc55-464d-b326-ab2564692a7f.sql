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