/* Weekly marks: 30 fixed weeks, history, and table-based entry. */
(function () {
    'use strict';
    var FLAG = 'vss_weekly_marks_v1';
    var IMPORT_FLAG = 'vss_weekly_marks_import_v4';
    var TOTAL_WEEKS = 30;
    function mondayOffset(weeksAgo) { var d = new Date(); d.setDate(d.getDate() - weeksAgo * 7); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.toISOString().slice(0, 10); }
    function students() { if (Array.isArray(window.studentsDatabase) && window.studentsDatabase.length) return window.studentsDatabase; try { var list = JSON.parse(localStorage.getItem('vss_students') || '[]'); return Array.isArray(list) ? list : []; } catch (_) { return []; } }
    function exams() { try { var list = JSON.parse(localStorage.getItem('vss_exams') || '[]'); return Array.isArray(list) ? list : []; } catch (_) { return []; } }
    function weeklyExam(week) { return exams().find(function (e) { return String(e && e.id) === 'wk-' + week; }) || null; }
    function weekHasMarks(week) { var record = weeklyExam(week); return !!(record && record.entries && Object.keys(record.entries).length); }
    function nextWeek() { for (var week = 1; week <= TOTAL_WEEKS; week++) if (!weekHasMarks(week)) return week; return TOTAL_WEEKS; }
    function saveExam(week, entries) {
        var all = exams().filter(function (e) { return String(e && e.id) !== 'wk-' + week; });
        all.push({ id: 'wk-' + week, kind: 'weekly', name: 'Weekly Marks ' + week, subject: '', date: mondayOffset(Math.max(0, TOTAL_WEEKS - week)), max: 100, savedAt: new Date().toISOString(), entries: entries });
        all.sort(function (a, b) { return Number(String(a.id || '').replace('wk-', '')) - Number(String(b.id || '').replace('wk-', '')); });
        localStorage.setItem('vss_exams', JSON.stringify(all));
        var list = students();
        list.forEach(function (student) { student.examHistory = all.filter(function (e) { return String(e.id || '').indexOf('wk-') === 0; }).map(function (e) { return e.entries && e.entries[student.id] ? Number(e.entries[student.id].marks) : null; }).filter(function (mark) { return mark !== null; }); });
        localStorage.setItem('vss_students', JSON.stringify(list));
        if (typeof window.vssReloadFromStorage === 'function') window.vssReloadFromStorage();
        if (window.vssCloud && typeof window.vssCloud.save === 'function') window.vssCloud.save();
    }
    function importSheetWeeks(force) {
        var data = window.VSS_WEEKLY_MARKS;
        if (!data || (!force && localStorage.getItem(IMPORT_FLAG) === '1') || !students().length) return false;
        var list = students();
        // Clear all previous weekly exams so new data completely replaces them
        var all = exams().filter(function (exam) { return !/^wk-/.test(String(exam && exam.id || '')); });
        for (var week = 1; week <= 10; week++) {
            var entries = {};
            list.forEach(function (student) {
                var mark = data[student.rollNo] && data[student.rollNo][week - 1];
                if (mark !== null && mark !== undefined && mark !== '') entries[student.id] = { marks: Number(mark), remark: '' };
            });
            all.push({ id: 'wk-' + week, kind: 'weekly', name: 'साप्ताहिक परीक्षा ' + week, subject: '', date: new Date(Date.UTC(2026, 6, 20 + (week - 1) * 7)).toISOString().slice(0, 10), max: 100, savedAt: new Date().toISOString(), entries: entries });
        }
        all.sort(function (a, b) { return Number(String(a.id || '').replace('wk-', '')) - Number(String(b.id || '').replace('wk-', '')); });
        localStorage.setItem('vss_exams', JSON.stringify(all));
        list.forEach(function (student) {
            var roll = Number(student.rollNo);
            if (data[roll]) {
                student.weeklyMarks = data[roll].slice();
            }
            student.examHistory = all.filter(function (exam) { return String(exam.id || '').indexOf('wk-') === 0; }).map(function (exam) { return exam.entries && exam.entries[student.id] ? Number(exam.entries[student.id].marks) : null; }).filter(function (mark) { return mark !== null; });
        });
        localStorage.setItem('vss_students', JSON.stringify(list));
        localStorage.setItem(IMPORT_FLAG, '1');
        if (typeof window.vssReloadFromStorage === 'function') window.vssReloadFromStorage();
        if (window.vssCloud && typeof window.vssCloud.save === 'function') window.vssCloud.save();
        return true;
    }
    function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]; }); }
    function mountStyle() {
        if (document.getElementById('weekly-marks-style')) return;
        var style = document.createElement('style'); style.id = 'weekly-marks-style';
        style.textContent = '.wm-modal{position:fixed;inset:0;z-index:11000;background:rgba(30,28,24,.52);padding:16px;overflow:auto}.wm-card{max-width:760px;margin:24px auto;background:#fffdf8;border-radius:14px;padding:18px;color:#27251f}.wm-head{display:flex;align-items:center;justify-content:space-between;gap:10px}.wm-head h3{margin:0;font-family:IBM Plex Sans,sans-serif}.wm-close{border:0;background:transparent;font-size:26px;cursor:pointer}.wm-actions,.wm-weeks{display:flex;gap:8px;flex-wrap:wrap;margin:16px 0}.wm-btn,.wm-week{border:1px solid #cdbd9b;background:#fff;padding:9px 12px;border-radius:8px;font-weight:700;cursor:pointer}.wm-btn.primary,.wm-week.active{background:#9a3428;color:#fff;border-color:#9a3428}.wm-week.done{background:#eee4cc}.wm-note{padding:10px 12px;background:#f5efe2;border-radius:8px}.wm-table-wrap{overflow:auto}.wm-table{width:100%;border-collapse:collapse}.wm-table th,.wm-table td{padding:10px;border-bottom:1px solid #e2d8c5;text-align:left}.wm-input{width:76px;padding:8px;border:1px solid #bcae92;border-radius:6px;font:inherit}@media(max-width:600px){.wm-modal{padding:8px}.wm-card{margin:0;padding:14px}.wm-table th,.wm-table td{padding:8px;font-size:13px}}'; document.head.appendChild(style);
    }
    function closeModal() { document.getElementById('weekly-marks-modal')?.remove(); }
    function renderWeekButtons(container, selected, onPick) { container.innerHTML = ''; for (var week = 1; week <= TOTAL_WEEKS; week++) { var button = document.createElement('button'); button.type = 'button'; button.className = 'wm-week' + (week === selected ? ' active' : '') + (weekHasMarks(week) ? ' done' : ''); button.textContent = 'Week ' + week; button.onclick = (function (value) { return function () { onPick(value); }; })(week); container.appendChild(button); } }
    function showTable(body, week, editable) {
        var record = weeklyExam(week), entries = (record && record.entries) || {};
        body.innerHTML = '<div class="wm-note"><b>Week ' + week + '</b> · marks out of 100</div><div class="wm-table-wrap"><table class="wm-table"><thead><tr><th>Roll</th><th>Student</th><th>Marks / 100</th></tr></thead><tbody></tbody></table></div>';
        var tbody = body.querySelector('tbody');
        students().slice().sort(function (a, b) { return Number(a.rollNo || 0) - Number(b.rollNo || 0); }).forEach(function (student) { var row = document.createElement('tr'), saved = entries[student.id] && entries[student.id].marks, name = (student.name && (student.name.en || student.name.mr)) || student.name || 'Student'; row.innerHTML = '<td>' + esc(student.rollNo || '—') + '</td><td>' + esc(name) + '</td><td>' + (editable ? '<input class="wm-input" data-student="' + esc(student.id) + '" type="number" min="0" max="100" value="' + esc(saved ?? '') + '" placeholder="0-100">' : esc(saved ?? '—')) + '</td>'; tbody.appendChild(row); });
        if (!editable) return;
        var save = document.createElement('button'); save.type = 'button'; save.className = 'wm-btn primary'; save.textContent = 'Save Week ' + week;
        save.onclick = function () { var next = {}, invalid = false; body.querySelectorAll('.wm-input').forEach(function (input) { if (input.value === '') return; var mark = Number(input.value); if (mark < 0 || mark > 100) invalid = true; else next[input.dataset.student] = { marks: mark, remark: '' }; }); if (invalid) return window.alert('Marks 0 se 100 ke beech rakhiye.'); if (!Object.keys(next).length) return window.alert('Kam se kam ek student ka mark enter kijiye.'); saveExam(week, next); window.alert('Week ' + week + ' marks save ho gaye.'); openMarks('view'); };
        body.appendChild(save);
    }
    function openMarks(mode) {
        mountStyle(); closeModal(); var modal = document.createElement('div'); modal.id = 'weekly-marks-modal'; modal.className = 'wm-modal'; modal.innerHTML = '<div class="wm-card"><div class="wm-head"><h3>Weekly Marks · 30 Weeks</h3><button class="wm-close" aria-label="Close">×</button></div><div class="wm-actions"><button class="wm-btn" data-mode="view">View Marks</button><button class="wm-btn primary" data-mode="entry">Enter Marks</button></div><div class="wm-note" data-next-week></div><div class="wm-weeks"></div><div class="wm-body"></div></div>'; document.body.appendChild(modal); modal.querySelector('.wm-close').onclick = closeModal;
        var weeks = modal.querySelector('.wm-weeks'), body = modal.querySelector('.wm-body');
        function show(selectedMode, week) { modal.querySelector('[data-next-week]').textContent = selectedMode === 'entry' ? 'Next Week: ' + nextWeek() : 'Completed weeks dekhne ke liye Week select karein.'; renderWeekButtons(weeks, week, function (picked) { if (selectedMode === 'entry' && weekHasMarks(picked) && !window.confirm('Week ' + picked + ' ke marks already saved hain. Kya aap sach mein badalna chahte hain?')) return; show(selectedMode, picked); }); showTable(body, week, selectedMode === 'entry'); }
        modal.querySelectorAll('[data-mode]').forEach(function (button) { button.onclick = function () { var selectedMode = button.dataset.mode; show(selectedMode, selectedMode === 'entry' ? nextWeek() : 1); }; }); show(mode === 'entry' ? 'entry' : 'view', mode === 'entry' ? nextWeek() : 1);
    }
    function seed() {
        var data = window.VSS_WEEKLY_MARKS; if (!data || !students().length) return false;
        if (exams().some(function (e) { return String(e && e.id || '').indexOf('wk-') === 0; })) { localStorage.setItem(FLAG, '1'); return true; }
        for (var week = 1; week <= 10; week++) { var entries = {}; students().forEach(function (student) { var mark = data[student.rollNo] && data[student.rollNo][week - 1]; if (mark !== null && mark !== undefined && mark !== '') entries[student.id] = { marks: Number(mark), remark: '' }; }); if (Object.keys(entries).length) saveExam(week, entries); }
        localStorage.setItem(FLAG, '1'); return true;
    }
    window.vssOpenMarks = openMarks;
    window.vssImportSheetWeeks = importSheetWeeks;
    importSheetWeeks();

    function boot() {
        document.getElementById('menu-exam')?.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopImmediatePropagation();
            openMarks('entry');
        }, true);
        importSheetWeeks();
        var tries = 0, timer = setInterval(function () {
            tries++;
            if (importSheetWeeks() || tries > 20) clearInterval(timer);
        }, 500);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 900); }); else setTimeout(boot, 900);
})();
