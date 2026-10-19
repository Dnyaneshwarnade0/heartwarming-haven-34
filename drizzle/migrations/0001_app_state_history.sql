CREATE TABLE public.app_state_history (
  id bigserial PRIMARY KEY,
  code text NOT NULL,
  data jsonb NOT NULL,
  saved_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.app_state_history TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.app_state_history_id_seq TO service_role;
ALTER TABLE public.app_state_history ENABLE ROW LEVEL SECURITY;
CREATE INDEX ON public.app_state_history (code, saved_at DESC);

CREATE OR REPLACE FUNCTION public.snapshot_app_state()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.app_state_history
                 WHERE code = OLD.code AND saved_at > now() - interval '1 hour') THEN
    INSERT INTO public.app_state_history(code, data) VALUES (OLD.code, OLD.data);
  END IF;
  DELETE FROM public.app_state_history
   WHERE code = OLD.code AND saved_at < now() - interval '60 days';
  RETURN NEW;
END $$;

CREATE TRIGGER app_state_snapshot BEFORE UPDATE ON public.app_state
FOR EACH ROW EXECUTE FUNCTION public.snapshot_app_state();