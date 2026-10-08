-- Harden SECURITY DEFINER helpers so signed-in callers can only ask about themselves
CREATE OR REPLACE FUNCTION public.has_org_role(_user_id uuid, _org_id uuid, _roles org_role[])
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.org_members
    WHERE user_id = _user_id AND org_id = _org_id AND role = ANY(_roles)
  ) AND (_user_id = auth.uid() OR auth.uid() IS NULL);
$function$;

CREATE OR REPLACE FUNCTION public.is_org_member(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.org_members WHERE user_id = _user_id AND org_id = _org_id
  ) AND (_user_id = auth.uid() OR auth.uid() IS NULL);
$function$;

CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = _user_id)
    AND (_user_id = auth.uid() OR auth.uid() IS NULL);
$function$;

REVOKE ALL ON FUNCTION public.has_org_role(uuid, uuid, org_role[]) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_org_member(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_platform_admin(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.gen_link_code() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_org_role(uuid, uuid, org_role[]) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_org_member(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_platform_admin(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.gen_link_code() TO service_role;

-- Re-validate updated rows on organizations
DROP POLICY IF EXISTS "owners update own org" ON public.organizations;
CREATE POLICY "owners update own org"
ON public.organizations FOR UPDATE TO authenticated
USING (public.has_org_role(auth.uid(), id, ARRAY['owner'::org_role, 'admin'::org_role]))
WITH CHECK (public.has_org_role(auth.uid(), id, ARRAY['owner'::org_role, 'admin'::org_role]));