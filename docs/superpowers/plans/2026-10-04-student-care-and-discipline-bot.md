# Student Care and Discipline Bot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add only the approved discipline, health, Adarsh-note, leave/gaav, and Palak-visit workflows to the software and Telegram bot.

**Architecture:** Reuse the existing student complaint, medical, leave, Adarsh, and Telegram action-sync records. Add a small `parentVisits` record to the student schema, expose it in the software profile, and pass it through the same bot snapshot/action flow.

**Tech Stack:** Browser JavaScript local storage/cloud sync, TypeScript Telegram webhook bot, Node regression checks.

**Spec:** `docs/superpowers/specs/2026-10-04-student-care-and-discipline-bot-design.md`

## Global Constraints

- Implement only the approved scope in the spec; preserve unrelated menus and behaviours.
- One duplicate study complaint label becomes one choice.
- Leave must remain visibly distinct from absent attendance and must not block normal attendance after its end date.
- New and existing records must sync in both directions between software and bot.

## Review Focus

- A blank free-text reason must not create an empty complaint, health, leave, Adarsh, or visitor record.
- An end date before the leave start date must be rejected.
- A student on leave must show leave styling, never absent styling; attendance after the leave range stays normal.
- Existing medical, complaint, leave, and Adarsh entries must remain after a new record is added.
- A bot action must identify the selected student by stable ID/roll and not attach to a same-name student.

### Task 1: Shared discipline choices and software profile records

**Files:**
- Modify: `public/app/menu-bot.js`, `public/app/manage.js`, `public/app/telegram.js`
- Test: `tests/student-care-regression.mjs`

**Interfaces:**
- Consumes: existing student `complaints`, `medical`, `leaves`, and `vss_adarsh_week` records.
- Produces: predefined discipline choices, free-text records, `parentVisits`, and complete browser sync payloads.

- [ ] **Step 1: Write the failing regression checks**

Assert the six distinct complaint labels, health free text, Adarsh custom note, `parentVisits` storage/display, and browser sync fields.

- [ ] **Step 2: Run the check to verify it fails**

Run: `node tests/student-care-regression.mjs`
Expected: FAIL because approved options/visit data are absent.

- [ ] **Step 3: Implement the browser software changes**

Use existing complaint/medical/leave/Adarsh actions; add only Palak-visit add/history controls to the student profile and include all approved records in Telegram sync.

- [ ] **Step 4: Run the regression check to verify it passes**

Run: `node tests/student-care-regression.mjs`
Expected: PASS.

### Task 2: Telegram bot flows and action sync

**Files:**
- Modify: `src/lib/telegram-menu.server.ts`, `src/lib/telegram-bot.server.ts`, `public/app/telegram.js`
- Test: `tests/student-care-regression.mjs`

**Interfaces:**
- Consumes: Task 1 record shapes and sync fields.
- Produces: bot menus, student pickers, custom text capture, queued actions, and student-information views for the approved records.

- [ ] **Step 1: Extend the failing regression checks**

Assert Telegram callbacks and flows for discipline, health, custom Adarsh note, leave/gaav free text, and Palak visit; assert snapshot application uses stable student identity.

- [ ] **Step 2: Run the check to verify it fails**

Run: `node tests/student-care-regression.mjs`
Expected: FAIL because the new bot callbacks/flows are absent.

- [ ] **Step 3: Implement approved Telegram flows**

Add only the required menu actions, record prompts, validation, queued actions, and student-info history output; use the current bot state-machine patterns.

- [ ] **Step 4: Run the regression check to verify it passes**

Run: `node tests/student-care-regression.mjs`
Expected: PASS.

### Task 3: Leave attendance presentation and full verification

**Files:**
- Modify: `public/app/enhance.js`, `public/app/enhance.css` only if existing leave presentation needs the approved distinction
- Test: `tests/student-care-regression.mjs`, `tests/historical-import-regression.mjs`

**Interfaces:**
- Consumes: existing `"leave"` daily-attendance state and Task 2 leave actions.
- Produces: distinct leave styling without changing absence logic.

- [ ] **Step 1: Add the failing leave presentation/validation checks**

Assert leave is labeled and styled separately from absence, and leave range validation rejects reversed dates.

- [ ] **Step 2: Run the check to verify it fails**

Run: `node tests/student-care-regression.mjs`
Expected: FAIL when separate leave presentation/validation is missing.

- [ ] **Step 3: Implement the minimum leave presentation change**

Reuse the existing leave value and existing post-leave attendance logic; do not change general attendance workflows.

- [ ] **Step 4: Run all verification**

Run: `node tests/student-care-regression.mjs; node tests/historical-import-regression.mjs; npm run build`
Expected: all checks and build pass.

## Self-review

- Discipline, Health, Adarsh custom note, Leave/Gaav, and Palak visit each map to a task.
- The only new schema is `parentVisits`; every other workflow reuses established record shapes.
- Empty text, invalid leave dates, leave styling, record preservation, and student identity are explicit test coverage.
- No task changes marks, fees, general attendance, or unrelated menus.
