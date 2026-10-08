# शांतिब्रह्म गुरुकुलम् — VSS Portal (पूरा सॉफ़्टवेयर एक्सपोर्ट)

Is zip me poora software hai: frontend app, backend code, Telegram bot, database ka
structure aur poora data. Isse kisi dusre Lovable project me daalkar wahi software
bilkul waise hi chalaya ja sakta hai.

## Andar kya hai

- `public/app/` — school app ki poori UI (students, hazeri, fees, calendar, chatbot)
- `src/` — backend code (server routes, Telegram bot, AI chat endpoint)
- `supabase/migrations/` — database banane ki saari migration files
- `database-backup/schema.sql` — database ka poora structure (tables, rules, functions)
- `database-backup/data.sql` — database ka poora data (INSERT statements)
- `package.json`, `vite.config.ts`, etc. — project settings

## Naye Lovable project me kaise laayein

1. Naya Lovable project banayein aur is zip ke saare files upload karein.
2. Lovable Cloud (backend) enable karwayein.
3. `supabase/migrations/` ki migrations chalayein — isse database ban jayega.
   (Ya phir `database-backup/schema.sql` chala dein.)
4. Purana data laane ke liye `database-backup/data.sql` chala dein.
5. Neeche di gayi keys naye project me set karein (values aapko khud daalni hongi —
   security ke liye zip me koi key nahi hai):
   - `TELEGRAM_BOT_TOKEN` — BotFather se mila bot token
   - `LOVABLE_API_KEY` — naye project me apne aap aata hai
   - `LOVABLE_CRON_SECRET` — koi bhi lamba random text
6. Telegram webhook dobara register karein: naye project ka URL +
   `/api/public/telegram/setup`.
7. App me jodne wala code (link code) database ki `organizations` table me hota hai —
   wahi code Telegram me `/link <code>` ke saath bhejna hota hai.

## Dhyan rakhein

- `.env` aur koi bhi secret file is zip me jaan-boojhkar nahi daali gayi hai.
- `node_modules` bhi nahi hai — naye project me dependencies apne aap install ho jati hain.
- Publish karne ke baad hi live URL chalega.
