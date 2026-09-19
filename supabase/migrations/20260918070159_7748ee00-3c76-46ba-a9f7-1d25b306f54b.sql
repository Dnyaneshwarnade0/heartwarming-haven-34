CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

SELECT cron.unschedule('varkari-daily-backup') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'varkari-daily-backup');

SELECT cron.schedule(
  'varkari-daily-backup',
  '30 16 * * *',
  $$
  SELECT net.http_post(
    url := 'https://project--78d63a01-4190-4c5d-8683-0b4830c63b68.lovable.app/api/public/telegram/daily',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);