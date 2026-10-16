CREATE TABLE IF NOT EXISTS public.app_state (
  org_id uuid PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.app_state TO service_role;
GRANT ALL ON public.organizations TO service_role;
ALTER TABLE public.app_state ENABLE ROW LEVEL SECURITY;
INSERT INTO public.organizations (name, link_code) VALUES ('शांतीब्रह्म गुरुकुलम', '444A1C6D') ON CONFLICT (link_code) DO NOTHING;