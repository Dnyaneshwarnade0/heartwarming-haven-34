import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const read = (file) => readFile(new URL(file, root), 'utf8');

const [dataSource, stateSeed, weeklyUi, telegramClient, telegramBot] = await Promise.all([
  read('public/app/weekly-marks-data.js'),
  read('public/app/state-seed.js'),
  read('public/app/weekly-marks.js'),
  read('public/app/telegram.js'),
  read('src/lib/telegram-bot.server.ts'),
]);

const sourceContext = { window: {} };
vm.runInNewContext(dataSource, sourceContext);
const marks = sourceContext.window.VSS_WEEKLY_MARKS;
assert.equal(Object.keys(marks).length, 72, 'marks source must include every student roll');
assert.equal(marks['1'].length, 10, 'marks source must include Week 1 through Week 10');
assert.equal(marks['1'][9], 63, 'Avadhut Week 10 mark must come from the Excel sheet');
assert.equal(marks['72'][9], null, 'blank Week 10 marks must stay blank');

const seedContext = { window: {} };
vm.runInNewContext(stateSeed, seedContext);
const exams = JSON.parse(seedContext.window.VSS_STATE_SEED.vss_exams);
const week10 = exams.find((exam) => exam.id === 'wk-10');
assert.ok(week10, 'initial app data must include Week 10');
assert.equal(week10.entries['stud-101'].marks, 63, 'Week 10 must be saved for Avadhut in the initial app data');
assert.equal(week10.entries['stud-172'], undefined, 'blank Week 10 marks must not create a fake result');

assert.match(weeklyUi, /for \(var week = 1; week <= 10; week\+\+\)/, 'existing browsers must receive all imported weeks');
assert.doesNotMatch(weeklyUi, /resetWeeksTenAndEleven\(\)/, 'Week 10 must never be silently removed');
assert.match(telegramClient, /weekly\.concat\(other\.slice\(0, 5\)\)/, 'Telegram sync must keep all weekly marks');
assert.match(telegramBot, /Weekly Marks|साप्ताहिक\\s\*परीक्षा/, 'Telegram must recognize imported weekly mark records');
assert.match(telegramBot, /सर्व \$\{wm\.length\}/, 'Student Information card must state that all weekly marks are shown');

console.log('Weekly marks import regression checks passed.');
