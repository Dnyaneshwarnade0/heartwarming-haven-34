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