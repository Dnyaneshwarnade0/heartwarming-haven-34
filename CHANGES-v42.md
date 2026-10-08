# VSS Portal v42 - changes (on top of v41)

## Fixed (each verified in a headless browser)
1. **Attendance / Fee receipt / Star-student panel was dead.** `enhance.js` boot() never called
   `injectDailyTaskNav()`, so the "Take attendance" button and the whole Daily Task panel did nothing.
   Restored the call. Attendance now opens, saves per session, and flows to profile/dashboard.
2. **Stored XSS.** A student name / parent name / roll no. containing HTML ran script in the
   students list and the weekly-marks modal. Escaped those templates AND added a global filter in
   `cloud.js` (cloud sync, Telegram merges, backup restore) that neutralises `<` `>` and forces safe record ids.
3. **Wrong "today" in India.** The app used the UTC date, so anything done before 05:30 IST was saved
   under yesterday. 21 places now use the local date.
4. Cache versions bumped (cloud.js v51, sw cache v11) so phones/PWA pick up the fixes.
5. README no longer publishes login passwords.

## NOT fixed yet - needs a decision (see chat)
- Login is client-side only with passwords inside index.js; anyone can bypass it.
- Backend `/api/public/*` routes are protected only by a shared org code that ships in public JS
  (DEFAULT_CODE in cloud.js) -> anyone can read/overwrite all student data.
- `/api/public/ai-chat` has no authentication (anyone can spend AI credits).
- CORS is `*` on all public routes.
