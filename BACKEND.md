# Backend / Database माहिती

## 1. डेटाबेस कुठे आहे?
संपूर्ण डेटा **Lovable Cloud (Postgres डेटाबेस)** मध्ये saved आहे — browser मध्ये नाही.
App मधून आणि Telegram बॉटमधून केलेले बदल एकाच डेटाबेसमध्ये जातात.

### मुख्य टेबल्स
| Table | काय साठवते |
|---|---|
| `organizations` | संस्था (गुरुकुल), link code, logo, city |
| `org_members` | कोणता user कोणत्या संस्थेत, त्याची भूमिका (owner/admin/staff) |
| `app_state` | संपूर्ण अ‍ॅप डेटा JSON — विद्यार्थी, हजेरी, फी, तक्रारी, परीक्षा, रजा |
| `org_snapshots` | बॉटसाठी वाचनयोग्य snapshot (photos, documents सह) |
| `bot_actions` | Telegram वरून झालेले बदल (complaint, fee, medical, leave…) |
| `bot_attendance` | बॉटवरून घेतलेली हजेरी (session + absent roll numbers) |
| `bot_sessions` | बॉट चॅटची चालू स्थिती |
| `telegram_links` | जोडलेले Telegram chat + role + permissions |
| `telegram_invites` | Admin/Manager invite कोड (SBADM101‑105, SBMGR301‑305) |
| `telegram_updates` | duplicate update टाळण्यासाठी |
| `parent_links` | पालकांचे Telegram खाते ↔ विद्यार्थी |
| `sent_notifications` | notification दोनदा जाऊ नये म्हणून |
| `payment_requests`, `subscriptions`, `platform_admins` | SaaS billing/plan |

सर्व टेबलवर **RLS (Row Level Security)** चालू आहे — दुसऱ्या संस्थेचा डेटा दिसत नाही.

## 2. Backend कोड कुठे आहे?
Separate server नाही — सर्व backend याच repo मध्ये आहे:
- `src/routes/api/public/telegram/*.ts` — बॉट webhook, sync, pull, photo, daily report
- `src/routes/api/public/ai-chat.ts` — AI असिस्टंट proxy
- `src/routes/api/public/app/state.ts` — अ‍ॅप डेटा save/load
- `src/lib/telegram-*.server.ts` — बॉटची सर्व logic
- `supabase/migrations/` — डेटाबेसचे सर्व SQL

## 3. Git / GitHub
कोड Lovable च्या private Git repo मध्ये आहे (project id `95d0e9e2-a138-406d-bf6e-087d09e4ef05`).
GitHub वर हवे असल्यास Lovable editor → **GitHub → Connect** करून repo push करता येईल.

## 4. Zip चालवायचे असेल तर
```sh
npm i
npm run dev
```
`.env` फाइल zip मध्ये **नाही** (secrets). लागणारे variables:
`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`,
आणि server साठी `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `TELEGRAM_BOT_TOKEN`, `LOVABLE_API_KEY`.
