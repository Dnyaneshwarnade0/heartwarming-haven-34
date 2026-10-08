import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = (file) => readFile(new URL(file, root), 'utf8');
const [menu, bot, localBot, sync, aiActions, profileHtml, profileJs, cloud] = await Promise.all([
  read('src/lib/telegram-menu.server.ts'),
  read('src/lib/telegram-bot.server.ts'),
  read('public/app/menu-bot.js'),
  read('public/app/telegram.js'),
  read('public/app/ai-actions.js'),
  read('public/app/index.html'),
  read('public/app/index.js'),
  read('public/app/cloud.js'),
]);

for (const label of ['शिवी देणे', 'शाळेत दंगा', 'अभ्यास न करणे', 'सेवा न करणे', 'मोठ्यांना उलट बोलणे', 'उशिरा उठणे']) {
  assert.match(menu, new RegExp(label), `approved discipline choice ${label} must exist`);
}
assert.match(menu, /m:health/, 'Telegram menu must offer Health');
assert.match(menu, /m:visit/, 'Telegram menu must offer Palak visit');
assert.match(menu, /m:leave/, 'Telegram main menu must visibly offer Leave / Gaav');
assert.match(bot, /flow === "health"/, 'Telegram must run a Health flow');
assert.match(bot, /flow === "visit"/, 'Telegram must run a Palak visit flow');
assert.match(bot, /नाते \| कशासाठी आले \| अधिक नोंद/, 'Telegram Palak visit must ask only for relationship, reason, and optional note');
assert.match(bot, /const \[relation, reason, note = ""\] = fields/, 'Telegram Palak visit must not require a visitor name');
assert.match(bot, /if \(!relation \|\| !reason\)/, 'Telegram Palak visit must require relationship and reason');
assert.match(bot, /v\.relation \|\| v\.visitor \|\| ""/, 'Telegram Palak visit history must show relationship when visitor name is intentionally blank');
assert.match(bot, /"medical"/, 'Telegram must queue a health record');
assert.match(bot, /"parent_visit"/, 'Telegram must queue a Palak visit record');
assert.match(bot, /"leave"/, 'Telegram must keep the Leave/Gaav action');
assert.match(bot, /note/, 'Adarsh student flow must preserve a written note');
assert.match(localBot, /parentVisits/, 'software Student Information must show Palak visit history');
const localVisitForm = localBot.match(/st\.step === 'parent-visit'[\s\S]*?else if \(st\.step === 'leave-form'\)/)?.[0] || '';
assert.doesNotMatch(localVisitForm, /mb-visit-visitor/, 'local Palak visit must not ask who came');
assert.match(localBot, /if \(!relation \|\| !reason\)/, 'local Palak visit must require relationship and reason');
for (const label of ['शिवी देणे', 'शाळेत दंगा', 'अभ्यास न करणे', 'सेवा न करणे', 'मोठ्यांना उलट बोलणे', 'उशिरा उठणे']) {
  assert.match(localBot, new RegExp(label), `local complaint screen must directly show ${label}`);
}
assert.match(localBot, /data-complaint-preset/, 'local complaint choices must select a given complaint before student selection');
assert.match(localBot, /COMPLAINT_SEVERITIES/, 'local complaint flow must define Normal, Medium, and Serious categories');
assert.match(localBot, /data-complaint-severity/, 'local complaint flow must ask for a category before the written reason');
assert.match(localBot, /severity:\s*st\.complaintSeverity/, 'local complaint save must persist the chosen category');
assert.match(sync, /parent_visit/, 'software must apply Palak visit actions from bot');
assert.match(sync, /parentVisits/, 'software must send Palak visit history to bot');
assert.match(aiActions, /doctorNotes/, 'local bot health updates must write the profile-visible doctor notes');
assert.match(profileHtml, /prof-progress-parent-visits/, 'Student Progress must contain the Palak visit timeline');
assert.match(profileJs, /function renderParentVisits\(/, 'Student Progress must render Palak visits from student data');
assert.match(profileJs, /visit\.relation \|\| visit\.visitor \|\| '—'/, 'Student Progress must show relationship when visitor name is intentionally blank');
assert.match(cloud, /telegram\.js\?v=9/, 'current Telegram sync script must load without stale cache');
assert.match(cloud, /menu-bot\.js\?v=22/, 'current local bot script must load without stale cache');

console.log('Student care and discipline regression checks passed.');
