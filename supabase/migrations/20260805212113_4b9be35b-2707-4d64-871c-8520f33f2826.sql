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