# Historical Attendance Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Import the approved attendance, school-status, complaint, and blacklist data without creating false daily attendance records.

**Architecture:** Add a small import module that reads the workbook and merges by roll number into the portal's existing student records. Store monthly totals separately from `dailyAttendance`, add a `notGoingToSchool` boolean, and centralize School-session eligibility so the portal and bot exclude affected students consistently.

**Tech Stack:** JavaScript, TypeScript, Node.js, Vite, openpyxl for source inspection, existing browser localStorage and Telegram snapshot formats.

**Spec:** `docs/superpowers/specs/2026-10-04-historical-attendance-import-design.md`

## Global Constraints

- Merge workbook records only by roll number; stop on unmatched or duplicate roll numbers.
- Import monthly totals as history. Do not create or overwrite `dailyAttendance` records.
- Preserve all existing student data and append complaints.
- Treat Vedant Ubre's September School and Yash Shinde's June Morning/Evening values as unavailable, not absent or zero.
- Correct Atharv Waghmare's September Morning and Evening totals to 26.
- Mark the 15 red-name students as `notGoingToSchool`; exclude only their School session from future absence calculations.
- Preserve the Telegram bot's Morning and Evening attendance flows.

## Review Focus

- A missing historical total must remain unavailable rather than become zero or an absence.
- A red-marked student must be excluded from School prompts but continue to appear in Morning and Evening attendance.
- A black-name student must remain eligible for School attendance.
- A duplicate complaint row must remain a separate history entry rather than being silently collapsed.
- A row that fails to match a unique existing roll number must fail the import before any student record changes.

---

### Task 1: Import parser and validation

**Files:**
- Create: `scripts/import-historical-school-data.mjs`
- Create: `tests/historical-import-regression.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `parseWorkbook(path) -> { monthlyTotals, notGoingRolls, complaints }` and `validateImport(students, payload) -> ValidationResult`.
- Consumes: `vss_students` JSON with `{ id, rollNo, name, dailyAttendance, complaints }`.

- [ ] **Step 1: Write the failing parser tests**

Test that the parser reads 72 student roll numbers, captures all three monthly attendance categories, returns the 15 red Marathi-name rows as `notGoingRolls`, retains 74 complaint rows, and applies Atharv's two September corrections.

- [ ] **Step 2: Run the parser test to verify it fails**

Run: `node tests/historical-import-regression.mjs`

Expected: FAIL because the import module does not exist.

- [ ] **Step 3: Implement `parseWorkbook(path)` and `validateImport(students, payload)` in `scripts/import-historical-school-data.mjs`**

Use the workbook's roll-number column as the key. Return blank source cells as `null`; reject non-blank monthly values outside the valid month range after applying the approved corrections.

- [ ] **Step 4: Add validation tests for the unmatched-roll and missing-value cases**

Assert that a duplicate or unmatched roll prevents any merged output, while Vedant and Yash retain `null` for the approved blank values.

- [ ] **Step 5: Run the import tests to verify they pass**

Run: `node tests/historical-import-regression.mjs`

Expected: PASS.

### Task 2: Merge the approved historical data

**Files:**
- Modify: `scripts/import-historical-school-data.mjs`
- Modify: `public/app/state-seed.js`
- Test: `tests/historical-import-regression.mjs`

**Interfaces:**
- Consumes: validated `monthlyTotals`, `notGoingRolls`, and `complaints` from Task 1.
- Produces: student records with `historicalAttendance`, `notGoingToSchool`, appended `complaints`, and `blacklisted`.

- [ ] **Step 1: Write the failing merge tests**

Assert that the merge stores monthly totals under `historicalAttendance` without changing `dailyAttendance`; sets exactly 15 `notGoingToSchool` flags; appends 74 complaint entries; and sets `blacklisted` for the five unique affected students.

- [ ] **Step 2: Run the merge test to verify it fails**

Run: `node tests/historical-import-regression.mjs`

Expected: FAIL because no merge function exists.

- [ ] **Step 3: Implement `mergeHistoricalData(students, payload)` in `scripts/import-historical-school-data.mjs`**

Store totals as `historicalAttendance["2026-06"|"2026-07"|"2026-08"|"2026-09"] = { school, evening, morning }`. Append complaints in worksheet order and mark rows with `Blacklist` as both complaint history and `blacklisted: true`.

- [ ] **Step 4: Run the merge test to verify it passes**

Run: `node tests/historical-import-regression.mjs`

Expected: PASS.

- [ ] **Step 5: Run the verified import against the local seeded student state**

Update the seed state only after the validator passes; retain a dated pre-import copy inside `work/` for recovery.

### Task 3: School-session eligibility and visual status

**Files:**
- Modify: `public/app/index.js`
- Modify: `public/app/manage.js`
- Modify: `public/app/menu-bot.js`
- Modify: `public/app/index.css`
- Test: `tests/ui-regression.mjs`

**Interfaces:**
- Consumes: `student.notGoingToSchool: boolean` from Task 2.
- Produces: `isSchoolSessionEligible(student) -> boolean` and a status badge in student list and profile views.

- [ ] **Step 1: Write the failing eligibility tests**

Assert that a not-attending-school student receives the distinct status badge, never appears as School-absent, and still appears in Morning and Evening attendance. Assert that a regular student remains School-eligible.

- [ ] **Step 2: Run the UI regression test to verify it fails**

Run: `node tests/ui-regression.mjs`

Expected: FAIL on the new school-status assertions.

- [ ] **Step 3: Implement `isSchoolSessionEligible(student)` and use it in portal attendance views**

Skip School-only absence labels and denominator contributions for `notGoingToSchool` records. Add a distinct, accessible badge and do not alter historical totals.

- [ ] **Step 4: Update the local bot attendance flow**

When saving or summarizing a School session, exclude not-attending-school students; do not change its Morning or Evening behavior.

- [ ] **Step 5: Run the UI regression test to verify it passes**

Run: `node tests/ui-regression.mjs`

Expected: PASS for the new status tests; document unrelated existing failures if they persist.

### Task 4: Telegram attendance exclusion

**Files:**
- Modify: `src/lib/telegram-attendance.server.ts`
- Modify: `src/lib/telegram-bot.server.ts`
- Test: `tests/bot-menu-regression.mjs`

**Interfaces:**
- Consumes: `notGoingToSchool?: boolean` in Telegram snapshot students.
- Produces: School-session pickers and summaries that omit ineligible students only.

- [ ] **Step 1: Write the failing Telegram eligibility test**

Assert that a School attendance picker omits a red-marked student while Morning and Evening pickers include that same student.

- [ ] **Step 2: Run the Telegram test to verify it fails**

Run: `node tests/bot-menu-regression.mjs`

Expected: FAIL on the new session-specific eligibility assertion.

- [ ] **Step 3: Implement the shared session eligibility filter in the Telegram flow**

Filter only `school` picker and summary populations using `student.notGoingToSchool`; preserve all other bot menu and attendance behavior.

- [ ] **Step 4: Run the Telegram test to verify it passes**

Run: `node tests/bot-menu-regression.mjs`

Expected: PASS for the new eligibility test; document unrelated existing failures if they persist.

### Task 5: Final import verification

**Files:**
- Modify: `tests/historical-import-regression.mjs`
- Modify: `public/app/cloud.js`

**Interfaces:**
- Consumes: completed import and UI/bot behavior from Tasks 1–4.
- Produces: cache-busted local assets and verified imported state.

- [ ] **Step 1: Add the end-to-end import assertions**

Assert the final counts: 72 student histories, 15 not-attending-school flags, 74 appended complaint records, and five blacklisted students.

- [ ] **Step 2: Run the import test to verify it passes**

Run: `node tests/historical-import-regression.mjs`

Expected: PASS.

- [ ] **Step 3: Update cache versions for changed client assets**

Increment only the relevant entries in `public/app/cloud.js` so a browser reload loads the new status behavior.

- [ ] **Step 4: Build and smoke-test the local portal**

Run: `npm run build`

Expected: production build succeeds; inspect the local portal and spot-check Atharv, Vedant, Yash, one not-attending-school student, and one blacklisted student.
