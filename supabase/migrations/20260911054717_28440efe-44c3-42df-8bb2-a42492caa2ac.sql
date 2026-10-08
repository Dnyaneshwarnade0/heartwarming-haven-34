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