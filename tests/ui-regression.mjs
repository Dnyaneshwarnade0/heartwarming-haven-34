import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const app = new URL('../public/app/', import.meta.url);
const read = (file) => readFile(new URL(file, app), 'utf8');
const [workspaceJs, workspaceCss, enhanceCss, enhanceJs, starJs, starCss, html, indexJs, indexCss, cloudJs, manageJs, manage2Js, uxJs, backupJs, resetDemoJs, weeklyMarksJs] = await Promise.all([
  read('workspace-redesign.js'),
  read('workspace-redesign.css'),
  read('enhance.css'),
  read('enhance.js'),
  read('star-blacklist.js'),
  read('star-blacklist.css'),
  read('index.html'),
  read('index.js'),
  read('index.css'),
  read('cloud.js'),
  read('manage.js'),
  read('manage2.js'),
  read('ux-upgrade.js'),
  read('backup.js'),
  read('reset-demo-updates.js'),
  read('weekly-marks.js'),
]);

assert.doesNotMatch(workspaceJs, /workspace-rail/, 'workspace rail must not be created');
assert.doesNotMatch(workspaceCss, /padding-right:\s*322px/, 'desktop layout must not reserve rail space');
assert.doesNotMatch(workspaceCss, /\.workspace-rail\s*\{/, 'workspace rail styling must be removed');
assert.doesNotMatch(indexJs, /Default open panel\s*\n\s*switchPanel\('panel-students'\)/, 'dashboard must be the startup panel');

assert.doesNotMatch(enhanceCss, /\.stats-grid \.stat-card:first-child h3,\s*\.stats-grid \.stat-card:first-child p\s*\{\s*color:\s*#fff/, 'first KPI text must not be white');
assert.doesNotMatch(enhanceJs, /injectDailyTaskNav\(\);/, 'portal must not initialize the retired Daily tasks panel');
assert.match(enhanceCss + workspaceCss, /stat-card:first-child[\s\S]{0,300}(var\(--workspace-ink\)|#2[0-9a-f]{5})/i, 'first KPI needs dark text');
assert.match(enhanceCss + workspaceCss, /stat-card:first-child[\s\S]{0,500}(#(?:f59e0b|d97706|f97316)|amber|orange)/i, 'first KPI needs amber/orange icon treatment');
assert.match(workspaceCss, /\.stats-grid \.stat-card:first-child h3,[\s\S]*?color:\s*var\(--workspace-ink\)\s*!important/, 'final stylesheet must override the archival theme with dark KPI text');
assert.match(workspaceCss, /#students-table tbody tr\.student-row\s*\{[\s\S]{0,700}border-left:\s*4px solid var\(--workspace-rust\)/, 'mobile student cards must have a bold branded accent');
assert.match(workspaceCss, /#students-table \.btn-table-action\.view\s*\{[\s\S]{0,500}background:\s*var\(--workspace-rust\)/, 'student details action must use a clear primary treatment');
assert.match(enhanceCss, /\.admin-dropdown\s*\{[\s\S]{0,180}position:\s*fixed/, 'admin menu must be fixed to the viewport so it cannot open outside the screen');
assert.match(enhanceCss, /max-height:\s*calc\(100dvh\s*-\s*76px\)/, 'admin menu must fit within the visible mobile screen');
assert.match(enhanceJs, /document\.body\.appendChild\(dd\)/, 'admin menu must be mounted at the page layer so dashboard cards cannot cover it');
assert.match(enhanceJs, /function askConfirm[\s\S]*?window\.vssConfirm = askConfirm;\s*\n\s*function guardDestructiveActions/, 'the shared delete confirmation must exist before any edit/delete action is used');

assert.match(starJs, /function updateMenuBadges\(/, 'sidebar counters must be updated by a dedicated function');
assert.match(starJs, /menu-count-badge/, 'sidebar menu badge markup is required');
assert.match(starJs, /seedInitialRecords\(/, 'empty collections must receive guarded initial records');
assert.match(starJs, /SPECIAL_SEED_FLAG/, 'special-list demo seeding must be permanently guarded');
assert.match(starJs, /localStorage\.getItem\(SPECIAL_SEED_FLAG\) === '1'/, 'deleted last special-list record must not be re-seeded');
assert.match(starJs, /localStorage\.setItem\(SPECIAL_SEED_FLAG, '1'\)/, 'special-list seed guard must be recorded after first load');
assert.match(starJs, /sb-photo/, 'award list must include a student photo column');
assert.match(starJs, /function awardCount\(/, 'student-of-the-week list must count repeat awards per student');
assert.match(starJs, /function confirmStarAction\(/, 'Adarsh Vidyarthi delete must have its own reliable confirmation');
assert.match(starJs, /id = 'vss-star-confirm'/, 'Adarsh Vidyarthi delete must show an in-app confirmation');
assert.match(starJs, /const AWARD_WEEK_OPTIONS = Array\.from\(\{ length: 30 \}/, 'Adarsh Vidyarthi must offer exactly Week 1 through Week 30');
assert.match(starJs, /<select id="sb-week" class="form-control">/, 'Adarsh Vidyarthi must use a week selector instead of a calendar picker');
assert.doesNotMatch(starJs, /<input type="week" id="sb-week"/, 'Adarsh Vidyarthi must not show a calendar week picker');
assert.match(starJs, /function blacklistEvents\(/, 'blacklist list must preserve and count repeat entries');
assert.match(starJs, /data-award-count/, 'award history must visibly show the repeat award count');
assert.match(starJs, /data-edit-award/, 'each Adarsh Vidyarthi history row must offer Edit');
assert.match(starJs, /querySelectorAll\('\[data-edit-award\]'\)/, 'Adarsh Vidyarthi Edit must have a click handler');
assert.match(starJs, /awardWeekNumber\(award\.week\) === 999 \? '1' : String\(award\.week\)/, 'Adarsh Vidyarthi Edit must load the saved week when it is within Week 1–30');
assert.match(starJs, /document\.getElementById\('sb-note'\)\.value = award\.note/, 'Adarsh Vidyarthi Edit must load the saved reason');
assert.match(starJs, /data-blacklist-count/, 'blacklist history must visibly show the repeat blacklist count');
assert.match(starJs, /function seedRequestedRepeatRecords\(/, 'requested repeat records must be seeded once');
assert.match(starJs, /awardCount\(avadhut\.id\) < 2/, 'Avadhut must be seeded to two student-of-the-week awards');
assert.match(starJs, /blacklistCount\(yash\) < 2/, 'Yash must be seeded to two blacklist entries');
assert.match(starCss, /\.sb-table td::before[\s\S]{0,150}attr\(data-label\)/, 'mobile special lists must show labelled card fields');
assert.match(starCss, /\.sb-identity \.sb-chip[\s\S]{0,220}font-size:\s*15px/, 'special-list student names must have stronger typography');
assert.match(starCss, /\.sb-count \.sb-chip[\s\S]{0,220}font-weight:\s*800/, 'special-list repeat counts must be visually prominent');

assert.match(html, /fa-heart-pulse/, 'Health tab must use the health icon');
assert.match(html, /Health/, 'Health tab must be labelled as health');
assert.match(html, /id="prof-status-indicators"/, 'Progress tab must show special-status indicators');
assert.match(html, /id="prof-progress-complaints"/, 'Progress tab must contain complaint history');
assert.match(html, /id="prof-achievements-list"/, 'Progress tab must contain achievements');
assert.match(html, /id="progress-achievements-card"/, 'Achievements must be its own Progress card');
assert.match(html, /id="progress-blacklist-complaints-card"/, 'Blacklist and complaints must be their own Progress card');
assert.match(html, /id="prof-progress-absence-reasons"/, 'Progress Report must show school absence reasons');
assert.match(indexJs, /function renderAbsenceReasons\(/, 'student profile must render saved school absence reasons');
assert.doesNotMatch(html, /Student Status & Achievements/, 'combined status and achievements heading must be removed');
assert.doesNotMatch(html, /id="prof-remarks-timeline"/, 'remarks timeline must be removed');
assert.doesNotMatch(html, /id="prof-complaints-list"/, 'Health tab must not contain complaint history');
const progressMarkup = html.match(/<div id="tab-progress"[\s\S]*?<div id="tab-complaints"/)[0];
const healthMarkup = html.match(/<div id="tab-complaints"[\s\S]*?<!-- TAB 3: FEES REPORT -->/)[0];
assert.match(progressMarkup, /btn-add-complaint/, 'Progress tab must retain the incident action');
assert.doesNotMatch(healthMarkup, /btn-add-complaint/, 'Health tab must not contain incident controls');
assert.match(indexJs, /prof-progress-complaints/, 'profile renderer must target the Progress complaint list');
assert.match(indexJs, /tab-progress/, 'complaint deep links must target Progress');
assert.match(indexJs, /stat-total-students'\)\.textContent\s*=\s*studentsDatabase\.length/, 'first dashboard KPI must always show the complete student total');
assert.match(cloudJs, /workspace-redesign\.js\?v=2/, 'workspace script cache version must be updated');
assert.match(cloudJs, /star-blacklist\.js\?v=10/, 'special-list script cache version must be updated');
assert.match(cloudJs, /reset-demo-updates\.js\?v=2/, 'the first-run cleanup must remove demo attendance and conduct records');
assert.match(resetDemoJs, /vss_demo_updates_pending_sync/, 'the cleanup must flag its changes for permanent cloud save');
assert.match(weeklyMarksJs, /TOTAL_WEEKS\s*=\s*30/, 'marks workflow must support all 30 weeks');
assert.match(weeklyMarksJs, /View Marks/, 'marks menu must offer a read-only history view');
assert.match(weeklyMarksJs, /Enter Marks/, 'marks menu must offer table-based mark entry');
assert.match(weeklyMarksJs, /Next Week/, 'marks menu must identify the next unfilled week');
assert.match(weeklyMarksJs, /confirm\(/, 'overwriting an already filled week must require confirmation');
assert.match(weeklyMarksJs, /menu-exam[\s\S]{0,220}openMarks\('entry'\)/, 'Marks menu must open direct entry for the next week');
assert.match(weeklyMarksJs, /IMPORT_FLAG/, 'imported Week 1–10 marks must run only once');
assert.match(weeklyMarksJs, /function importSheetWeeks\(/, 'weekly marks must import the supplied Week 1–10 data');
assert.match(weeklyMarksJs, /week <= 10/, 'weekly mark import must retain all ten supplied weeks');
assert.match(manageJs, /function weeklyMarks\(/, 'active Progress Report chart must read saved weekly-mark records');
assert.match(manageJs, /wk-\(\\d\+\)/, 'active Progress Report chart must retain each saved week number');
assert.match(html, /Weekly Marks Graph/, 'Progress Report chart must identify weekly marks');
assert.match(manageJs, /W\$\{point\.week/, 'Progress Report graph points must display their week number');
assert.match(manageJs, /linearGradient/, 'Progress Report graph must use the modern gradient style');
assert.match(indexJs, /renderFeesTab\(\);\s*window\.print\(\);/, 'Print Report must refresh the current fee data before printing');
assert.match(indexCss, /#tab-fees\s*\{[\s\S]{0,120}display:\s*block\s*!important/, 'Print Report must include the fee section');
assert.match(indexCss, /#card-add-payment\s*\{[\s\S]{0,120}display:\s*none\s*!important/, 'Print Report must hide the fee entry form');
assert.match(backupJs, /function allTimeStudentReport\(/, 'All-time backup must generate a per-student printable report');
assert.match(backupJs, /alltime-student-page/, 'All-time report must have fixed two-page student sections');
assert.match(backupJs, /page-break-after:\s*always/, 'each student report must end before the next student begins');
assert.match(cloudJs, /index\.js\?v=29/, 'current profile script must load without stale cache');
assert.match(cloudJs, /enhance\.js\?v=28/, 'current attendance enhancement script must load without stale cache');
assert.match(cloudJs, /vss_special_lists_seeded_v1/, 'special-list seed guard must persist with app data');
assert.match(cloudJs, /manage\.js\?v=6/, 'weekly marks graph must load the current management script');
assert.match(cloudJs, /weekly-marks\.js\?v=7/, 'week import must load without stale cache');
assert.match(cloudJs, /backup\.js\?v=6/, 'all-time backup report must load without stale cache');
assert.match(cloudJs, /manage2\.js\?v=5/, 'updated side-menu shortcuts must load the current management script');
assert.match(html, /cloud\.js\?v=53/, 'cloud loader cache version must be updated');
assert.match(html, /star-blacklist\.css\?v=5/, 'special-list card styles must load without stale cache');
assert.match(html, /workspace-redesign\.css\?v=4/, 'workspace stylesheet cache version must be updated');

assert.match(html, /id="menu-users-permissions"/, 'Users & permissions must be available in the sidebar menu');
assert.match(manage2Js, /menu-users-permissions/, 'Users & permissions menu must open the existing permission dialog');
assert.doesNotMatch(html, /id="menu-open-bot"/, 'duplicate Open Bot sidebar option must be removed');
assert.doesNotMatch(manage2Js, /menu-open-bot/, 'duplicate Open Bot interaction must be removed');
assert.doesNotMatch(html, /id="filter-class"/, 'student screen must not show the All Classes filter');
assert.doesNotMatch(html, /id="filter-section"/, 'student screen must not show the All Sections filter');
assert.doesNotMatch(html, /id="btn-sort"/, 'student screen must not show A-Z sorting');
assert.doesNotMatch(html, /id="btn-mark-attendance"/, 'student screen must not show attendance action');
assert.doesNotMatch(html, /id="btn-export-excel"/, 'student screen must not show Excel export');
assert.doesNotMatch(html, /id="ux-reset-filters"/, 'student screen must keep only the add-student action');
assert.match(indexJs, /document\.getElementById\('filter-class'\)\?\.value \|\| ''/, 'student list must work without the removed class filter');
assert.doesNotMatch(manage2Js, /right\.insertBefore\(bot, right\.firstChild\)/, 'bot shortcut must not remain in the header');
assert.doesNotMatch(manage2Js, /right\.insertBefore\(usersBtn, right\.firstChild\)/, 'permission shortcut must not remain in the header');

assert.match(cloudJs, /ux-upgrade\.js\?v=6/, 'UX layer must load after existing features');
assert.match(html, /ux-upgrade\.css\?v=3/, 'Fee flow styles must load without stale cache');
assert.match(html, /id="ux-dashboard-actions"/, 'dashboard must offer clear quick actions');
assert.match(html, /id="ux-action-add-student"/, 'dashboard must offer Add Student');
assert.match(html, /id="ux-action-attendance"/, 'dashboard must offer attendance');
assert.match(html, /id="ux-action-fee"/, 'dashboard must offer fee entry');
assert.match(html, /id="ux-student-results"/, 'student directory must show match count');
assert.doesNotMatch(html, /id="ux-reset-filters"/, 'student screen must keep only the add-student action');
assert.match(html, /id="menu-fees"/, 'Records menu must link staff to the fee workflow');
assert.match(uxJs, /function openFeeFlow\(\)/, 'Fees menu must open a dedicated two-step fee flow');
assert.match(uxJs, /Fee received/, 'Fees flow must offer a Fee received option');
assert.match(uxJs, /View fee/, 'Fees flow must offer a View fee option');
assert.match(uxJs, /renderStudentProfile\(studentId\)/, 'Fees flow must open the selected student profile');
assert.match(html, /id="menu-exam"/, 'Records menu must link staff to exam records');
assert.doesNotMatch(html, /id="menu-reports"/, 'Reports must not appear in the menu');
assert.match(html, /id="menu-settings"/, 'Administration menu must include settings');
assert.match(indexJs, /if \(!panel\) return;\s*switchPanel\(panel\)/, 'modal-only sidebar items must not blank the current panel');

const uxWindow = {};
vm.runInNewContext(uxJs, { window: uxWindow, document: { readyState: 'loading', addEventListener() {} } });
const canOpen = uxWindow.vssUxCanOpen;
assert.equal(typeof canOpen, 'function', 'UX layer must expose a testable permission decision');
const manager = { username: 'helper', role: 'manager' };
const accounts = { helper: { role: 'manager', perms: ['dashboard', 'students'] } };
assert.equal(canOpen('panel-students', manager, accounts), true, 'student permission opens directory');
assert.equal(canOpen('panel-daily-task', manager, accounts), false, 'missing attendance permission blocks daily task');
assert.equal(canOpen('menu-users-permissions', manager, accounts), false, 'manager cannot open user permissions');
assert.equal(canOpen('panel-backup', manager, accounts), false, 'manager cannot restore a backup');
assert.equal(canOpen('panel-dashboard', manager, accounts), true, 'dashboard stays available');
assert.equal(canOpen('panel-backup', { role: 'admin' }, {}), true, 'administrator can reach backup');
assert.match(indexJs, /role:\s*account\.role === 'manager' \? 'manager' : 'admin'/, 'login must preserve sub-manager role');
assert.match(indexJs, /currentUser\.role === 'manager'\s*\?/, 'sub-manager badge must not call the user a teacher');
assert.match(indexJs, /currentActivePanel === 'panel-admin-profile'/, 'settings panel must have its own page title');
assert.match(indexJs, /menuItem\?\.querySelector\('span'\)\?\.textContent/, 'dynamic pages must use their menu label as page title');

const backupWindow = {};
vm.runInNewContext(backupJs, { window: backupWindow, document: { readyState: 'loading', addEventListener() {} }, localStorage: { getItem() { return null; } } });
assert.equal(typeof backupWindow.vssValidBackup, 'function', 'restore must validate the complete backup before changing data');
assert.equal(backupWindow.vssValidBackup({ students: [{ id: 's1', rollNo: 1, name: 'A' }] }), true, 'valid backup can be restored');
assert.match(backupJs, /app_state/, 'restore must support the supplied full-backup format');
assert.match(backupJs, /window\.vssCloud\s*&&\s*typeof window\.vssCloud\.save === 'function'/, 'restoring a backup must immediately sync it so cloud refresh cannot overwrite imported attendance');
assert.match(backupJs, /vss_imported_backup_v1/, 'restoring a backup must mark imported records as protected from demo cleanup');
assert.match(resetDemoJs, /vss_imported_backup_v1/, 'demo cleanup must not erase attendance from an imported backup');
assert.match(cloudJs, /backup\.js\?v=6/, 'restored backup logic must load without stale cache');
assert.equal(backupWindow.vssValidBackup({ students: [] }), false, 'empty backup cannot replace current students');
assert.equal(backupWindow.vssValidBackup({ students: [{ id: 's1', name: 'A' }] }), false, 'malformed student cannot be restored');
assert.match(backupJs, /id="bk-restore-file"/, 'backup page must offer a guided restore control');
assert.match(html, /class="ux-form-section"/, 'student form needs visible section headings');
assert.match(html, /id="ux-required-help"/, 'student form needs required-field guidance');

console.log('UI regression checks passed.');
