ALTER TABLE public.telegram_invites
  ADD COLUMN IF NOT EXISTS permissions jsonb,
  ADD COLUMN IF NOT EXISTS label text,
  ADD COLUMN IF NOT EXISTS created_by bigint,
  ADD COLUMN IF NOT EXISTS used_at timestamptz;

ALTER TABLE public.telegram_invites DROP CONSTRAINT IF EXISTS telegram_invites_role_check;
ALTER TABLE public.telegram_invites
  ADD CONSTRAINT telegram_invites_role_check CHECK (role IN ('admin','manager','sub'));