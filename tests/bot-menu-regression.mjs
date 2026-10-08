import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = (file) => readFile(new URL(file, root), 'utf8');
const [localBot, telegramMenu, telegramBot, attendanceMenu, cloudLoader, indexHtml, enhanceJs, enhanceCss, menuBotCss] = await Promise.all([
  read('public/app/menu-bot.js'),
  read('src/lib/telegram-menu.server.ts'),
  read('src/lib/telegram-bot.server.ts'),
  read('src/lib/telegram-attendance.server.ts'),
  read('public/app/cloud.js'),
  read('public/app/index.html'),
  read('public/app/enhance.js'),
  read('public/app/enhance.css'),
  read('public/app/menu-bot.css'),
]);

const localActionBlock = localBot.match(/const ACTIONS = \(\) => \[([\s\S]*?)\n    \];/);
assert.ok(localActionBlock, 'local AI Bot must expose its main action list');
const localKeys = [...localActionBlock[1].matchAll(/k: '([^']+)'/g)].map((match) => match[1]);
assert.deepEqual(
  localKeys,
  ['attendance', 'absence-reason', 'info', 'complaints', 'medical', 'adarsh', 'parent-visit', 'leave', 'backup', 'fees', 'marks', 'admission'],
  'local AI Bot must show the approved actions including health, parent visits, and leave',
);
assert.match(localBot, /st\.action === 'attendance' \? 'absent'/, 'local attendance action must start the attendance workflow');
assert.match(localBot, /st\.action === 'fees' \? 'fees'/, 'local fee and receipt action must open its choices');
assert.match(localBot, /b\.dataset\.act === 'marks'/, 'local marks action must be handled');
assert.match(localBot, /vssOpenMarks\('entry'\)/, 'local marks action must open direct weekly mark entry');
assert.match(localBot, /b\.dataset\.act === 'admission'/, 'local admission action must be handled');

const telegramMenuBlock = telegramMenu.match(/export function mainMenu[\s\S]*?\n}\n\nexport function homeRow/);
assert.ok(telegramMenuBlock, 'Telegram main menu must be defined');
const telegramCallbacks = [...telegramMenuBlock[0].matchAll(/callback_data: "([^"]+)"/g)].map((match) => match[1]);
assert.deepEqual(
  telegramCallbacks.slice(0, 11),
  ['m:att', 'm:stu', 'm:health', 'm:visit', 'm:leave', 'm:complaints', 'm:star', 'm:backup', 'm:fees', 'm:exam', 'm:adm'],
  'Telegram must show the approved actions including health, parent visits, and leave in the approved order',
);
assert.match(telegramMenuBlock[0], /Complaints \/ Blacklist/, 'Telegram must clearly combine complaints and blacklist');
assert.match(telegramMenuBlock[0], /Fee \/ Receipt/, 'Telegram must clearly combine fee and receipt');
assert.match(telegramBot, /data === "m:complaints"/, 'Telegram must route the combined complaint menu');
assert.match(telegramBot, /data === "m:fees"/, 'Telegram must route the combined fee menu');
assert.doesNotMatch(telegramMenu, /SEVA_TASKS|sevaKb|m:task|दैनंदिन सेवा/, 'Telegram must not expose the retired Daily tasks workflow');
assert.doesNotMatch(telegramBot, /sevaText|SEVA_TASKS|m:task|flow: "seva"|queueAction\([^\n]*"seva"/, 'Telegram bot must not route or persist Daily tasks');
assert.match(attendanceMenu, /att:summary/, 'Telegram attendance must offer a non-mutating Attendance Summary action');
assert.match(attendanceMenu, /attendanceSummaryText/, 'Telegram attendance must calculate session-wise present, absent, and total counts');
assert.match(telegramBot, /action === "summary"/, 'Telegram must route Attendance Summary without creating a queue entry');
assert.match(telegramBot, /si:view:/, 'Telegram Student Information must ask for confirmation before opening student details');
assert.match(telegramBot, /flow: "stuconfirm"/, 'Telegram Student Information must retain the selected student until confirmation');
assert.match(localBot, /Attendance Summary/, 'local AI Bot must offer Attendance Summary beside Morning, Evening, and School');
assert.match(localBot, /hasExistingAttendance/, 'local AI Bot must detect attendance already recorded for a session');
assert.match(localBot, /Confirm retake/, 'local AI Bot must ask before replacing same-day attendance');
assert.match(localBot, /step === 'info-confirm'/, 'local Student Information must confirm before showing a student card');
assert.doesNotMatch(localBot, /st\.step === 'info'\) \{\s*html \+= bubble\(infoHtml\(\)/, 'local Student Information must not open an all-student summary');
assert.match(localBot, /Single student complaint/, 'local complaints must offer an explicitly single-student route');
assert.match(localBot, /Multiple students complaint/, 'local complaints must offer a multi-student route');
assert.match(localBot, /data-csel/, 'local multiple-complaint selection must use toggles rather than a single picker');
assert.match(localBot, /Preview & save/, 'local complaint text must be previewed before saving');
assert.match(localBot, /Fee received/, 'local fee menu must clearly distinguish received fees');
assert.match(localBot, /Make receipt/, 'local fee menu must clearly distinguish receipt generation');
assert.match(localBot, /class="mb-stack"/, 'local AI Bot home actions must use the ordered vertical menu container');
assert.match(menuBotCss, /\.mb-stack[\s\S]*grid-template-columns:\s*1fr/, 'local AI Bot menu must render one option per row');
assert.match(localBot, /function parseBotCommand\(/, 'local AI Bot must parse simple typed commands without an API');
assert.match(localBot, /Mujhe samajh nahi aaya/, 'unknown typed command must direct the user back to the menu');
assert.match(localBot, /inputForm\.style\.display = st\.step === 'home' \? 'flex' : 'none'/, 'local AI Bot must show a typing box on its home menu');
assert.match(indexHtml, /menu-bot\.css\?v=2/, 'local preview must load the current bot menu stylesheet');
assert.match(indexHtml, /class="bot-avatar-logo" src="logo\.png"/, 'bot header must use the same logo as the application');
assert.match(menuBotCss, /#bot-panel-title\s*\{[\s\S]*color:\s*#fff/, 'bot title must stay readable on the blue header');
assert.match(enhanceJs, /btn\.style\.height/, 'password eye button must preserve its height while changing visibility');
assert.match(enhanceCss, /\.pw-eye-btn\s*\{[\s\S]*box-sizing:\s*border-box/, 'password eye button must use a stable border box');
assert.match(enhanceJs, /const scrollY = window\.scrollY/, 'password visibility toggle must remember the current page scroll position');
assert.match(enhanceJs, /window\.scrollTo\(0, scrollY\)/, 'password visibility toggle must restore the page scroll position');
assert.match(localBot, /Weekly marks/, 'Student Information details must list weekly marks');
assert.match(localBot, /Complaint history/, 'Student Information details must show complaint entries');
assert.match(localBot, /Blacklist status/, 'Student Information details must show blacklist status');
assert.match(localBot, /Fee ledger/, 'Student Information details must show fee records');
assert.match(localBot, /const attendancePercent = total/, 'Student Information must calculate attendance average');
assert.match(localBot, /const awardCount = adarsh/, 'Student Information must calculate student-of-the-week count');
assert.match(localBot, /const awardReasons =/, 'Student Information must include student-of-the-week reasons');
assert.match(localBot, /absence-reason/, 'bot Attendance must offer a school absence reason workflow');
assert.match(localBot, /absenceReasons/, 'bot school absence reason must be permanently stored per student');
assert.match(cloudLoader, /menu-bot\.js\?v=22/, 'local preview must load the current AI Bot menu without stale cache');
assert.match(cloudLoader, /enhance\.js\?v=28/, 'local preview must load the current enhancement script without stale cache');
assert.match(indexHtml, /cloud\.js\?v=53/, 'local preview must load the updated script loader without stale cache');

console.log('Bot menu regression checks passed.');
