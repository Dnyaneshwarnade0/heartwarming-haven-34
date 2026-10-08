CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

SELECT cron.unschedule('varkari-daily-backup') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'varkari-daily-backup');

SELECT cron.schedule(
  'varkari-daily-backup',
  '30 16 * * *',
  $$
  SELECT net.http_post(
    url := 'https://project--95d0e9e2-a138-406d-bf6e-087d09e4ef05-dev.lovable.app/api/public/telegram/daily',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);