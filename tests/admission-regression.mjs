import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = (file) => readFile(new URL(file, root), 'utf8');
const [indexHtml, indexJs, indexCss, localBot, telegramMenu, telegramBot, telegramClient, cloudLoader] = await Promise.all([
  read('public/app/index.html'),
  read('public/app/index.js'),
  read('public/app/index.css'),
  read('public/app/menu-bot.js'),
  read('src/lib/telegram-menu.server.ts'),
  read('src/lib/telegram-bot.server.ts'),
  read('public/app/telegram.js'),
  read('public/app/cloud.js'),
]);

// Break caught: the long admission form can exceed the viewport with no independently scrollable body.
assert.match(indexHtml, /id="form-student-detail" class="admission-form"/, 'admission form must opt into the scrollable modal layout');
assert.match(indexCss, /#form-student-detail\s*\{[\s\S]*min-height:\s*0/, 'admission form must be allowed to shrink within the modal');
assert.match(indexCss, /#form-student-detail \.modal-body\s*\{[\s\S]*overflow-y:\s*auto/, 'admission fields must stay scrollable while Save remains reachable');

// Break caught: the bot reports success even if the underlying Add Student button is unavailable.
assert.match(indexJs, /window\.vssOpenAdmission\s*=\s*openAdmissionForm/, 'software must expose one direct admission opener');
assert.match(localBot, /window\.vssOpenAdmission\(\)/, 'local bot admission must call the direct admission opener');
assert.doesNotMatch(localBot, /setTimeout\(\(\) => document\.getElementById\('btn-add-student'\)\?\.click\(\), 0\)/, 'local bot must not rely on a delayed hidden-button click');

// Break caught: Telegram silently allocates a roll number instead of using the administrator's chosen number.
assert.match(telegramMenu, /\["roll", "रोल नंबर/, 'Telegram admission must ask for a Roll Number');
assert.match(telegramBot, /const roll = Number\(String\(vals\["roll"\]/, 'Telegram admission must parse the entered Roll Number');
assert.match(telegramBot, /rolls\.includes\(roll\)/, 'Telegram admission must reject a duplicate Roll Number');
assert.match(telegramClient, /list\.some\(\(x\) => Number\(x\.rollNo\) === roll\)/, 'software must not create a duplicate student when processing a bot admission');

assert.match(cloudLoader, /index\.js\?v=29/, 'local preview must load the updated admission software code');
assert.match(cloudLoader, /menu-bot\.js\?v=22/, 'local preview must load the updated bot admission handler');
assert.match(cloudLoader, /telegram\.js\?v=9/, 'local preview must load the updated Telegram admission sync');

console.log('Admission regression checks passed.');
