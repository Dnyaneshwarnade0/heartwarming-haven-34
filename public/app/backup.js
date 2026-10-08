/* =========================================================
   बॅकअप केंद्र (Backup Centre) — स्वतंत्र स्तर
   आजचा बॅकअप + संपूर्ण बॅकअप
   स्वरूप: सुंदर रिपोर्ट (HTML/PDF), CSV, Excel, पूर्ण JSON
   मूळ स्क्रिप्ट्सना स्पर्श न करता.
   ========================================================= */
(function () {
    'use strict';

    const EN = () => (typeof currentLanguage !== 'undefined' ? currentLanguage : 'mr') === 'en';
    const T = (mr, en) => (EN() ? en : mr);
    const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const toast = (m, t) => (typeof createToast === 'function' ? createToast(m, t || 'success') : console.log(m));
    const students = () => (typeof studentsDatabase !== 'undefined' && Array.isArray(studentsDatabase) ? studentsDatabase : []);
    const nameOf = (s) => (typeof getStudentName === 'function' ? getStudentName(s) : (s && typeof s.name === 'object' ? s.name.mr : (s && s.name) || ''));
    const SCHOOL = 'शांतीब्रह्म गुरुकुलम';

    const pad = (n) => String(n).padStart(2, '0');
    const today = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
    const stamp = () => { const d = new Date(); return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`; };
    const num = (v) => Number(v || 0);
    const ls = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (_) { return d; } };

    let scope = 'today';
    let pickDate = today();

    function validBackup(data) {
        const list = Array.isArray(data) ? data : data && data.students;
        return Array.isArray(list) && list.length > 0 && list.every((s) =>
            s && typeof s === 'object' && typeof s.id === 'string' && s.id.trim() &&
            s.rollNo !== undefined && s.rollNo !== null && s.name &&
            (typeof s.name === 'string' || typeof s.name === 'object'));
    }
    window.vssValidBackup = validBackup;

    /* Accept both the app's export and the supplied full-backup format. */
    function normalizeBackup(data) {
        if (!data || !data.app_state || typeof data.app_state !== 'object') return data;
        const state = data.app_state;
        const read = (value) => {
            if (typeof value === 'string') { try { return JSON.parse(value); } catch (_) { return null; } }
            return value;
        };
        const students = read(state.vss_students);
        if (!Array.isArray(students)) return data;
        const normalized = { students: students };
        ['vss_exams', 'vss_holidays', 'vss_adarsh_week', 'vss_seva', 'vss_tasks'].forEach((key) => {
            const value = read(state[key]);
            if (value !== undefined && value !== null) normalized[key] = JSON.stringify(value);
        });
        return normalized;
    }

    async function restoreFile(file) {
        let data;
        try { data = JSON.parse(await file.text()); }
        catch (_) { toast(T('ही बॅकअप फाईल वाचता आली नाही.', 'This backup file could not be read.'), 'danger'); return; }
        data = normalizeBackup(data);
        if (!validBackup(data)) {
            toast(T('अवैध बॅकअप: विद्यार्थी नोंदी तपासा.', 'Invalid backup: check the student records.'), 'danger');
            return;
        }
        const list = Array.isArray(data) ? data : data.students;
        const keys = ['vss_exams', 'vss_holidays', 'vss_adarsh_week', 'vss_seva', 'vss_tasks'];
        const entries = { vss_students: JSON.stringify(list), vss_imported_backup_v1: '1' };
        try {
            if (!Array.isArray(data)) keys.forEach((key) => {
                if (data[key] === undefined) return;
                if (typeof data[key] !== 'string') throw new Error('Invalid extra field');
                JSON.parse(data[key]);
                entries[key] = data[key];
            });
        } catch (_) {
            toast(T('बॅकअपमधील अतिरिक्त नोंदी अवैध आहेत.', 'Extra records in this backup are invalid.'), 'danger');
            return;
        }
        const commit = () => {
            const before = Object.fromEntries(Object.keys(entries).map((key) => [key, localStorage.getItem(key)]));
            try {
                Object.entries(entries).forEach(([key, value]) => localStorage.setItem(key, value));
                if (window.vssCloud && typeof window.vssCloud.save === 'function') window.vssCloud.save();
                if (typeof window.vssReloadFromStorage === 'function') window.vssReloadFromStorage();
                toast(T('बॅकअप यशस्वीरित्या पुनर्संचयित झाला.', 'Backup restored successfully.'));
                if (typeof switchPanel === 'function') switchPanel('panel-dashboard');
            } catch (_) {
                Object.entries(before).forEach(([key, value]) => {
                    if (value === null) localStorage.removeItem(key);
                    else localStorage.setItem(key, value);
                });
                toast(T('पुनर्संचयित करता आले नाही; जुना डेटा सुरक्षित आहे.', 'Restore failed; your previous data is still available.'), 'danger');
            }
        };
        const question = T(`या बॅकअपमधील ${list.length} विद्यार्थी सध्याच्या नोंदींची जागा घेतील. पुढे जायचे?`,
            `This backup contains ${list.length} students and will replace current records. Continue?`);
        if (typeof window.vssConfirm === 'function') window.vssConfirm(question, commit);
        else if (window.confirm(question)) commit();
    }

    /* ---------------- data helpers ---------------- */

    const sorted = () => [...students()].sort((a, b) => num(a.rollNo) - num(b.rollNo));

    function allDates() {
        const set = new Set();
        students().forEach((s) => Object.keys(s.dailyAttendance || {}).forEach((d) => set.add(d)));
        return [...set].sort();
    }

    function mark(s, date, sess) {
        const rec = (s.dailyAttendance || {})[date];
        if (!rec || rec[sess] === undefined || rec[sess] === null) return '';
        return rec[sess] ? T('हजर', 'Present') : T('गैरहजर', 'Absent');
    }

    function attPct(s) {
        const rec = s.dailyAttendance || {};
        let tot = 0, present = 0;
        Object.keys(rec).forEach((d) => {
            ['morning', 'evening', 'school'].forEach((k) => {
                if (rec[d] && rec[d][k] !== undefined && rec[d][k] !== null) { tot++; if (rec[d][k]) present++; }
            });
        });
        return tot ? Math.round((present / tot) * 100) : 0;
    }

    function feeOf(s) {
        const f = s.fees || {};
        const total = num(f.total);
        const paid = num(f.paid) || (Array.isArray(f.ledger) ? f.ledger.reduce((a, l) => a + num(l.amount), 0) : 0);
        return { total: total, paid: paid, due: Math.max(0, total - paid) };
    }

    function allTimeStudentReport() {
        const exams = ls('vss_exams', []);
        const awards = ls('vss_adarsh_week', []);
        const yesNo = (value) => value ? T('हजर', 'Present') : T('गैरहजर', 'Absent');
        const table = (headers, rows, empty) => rows.length
            ? `<table><thead><tr>${headers.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>`
            : `<p class="empty">${esc(empty || T('नोंद नाही', 'No records'))}</p>`;
        const pages = sorted().map((student) => {
            const f = feeOf(student);
            const attendance = Object.entries(student.dailyAttendance || {}).sort(([a], [b]) => a.localeCompare(b));
            const marks = exams.map((exam) => {
                const match = String(exam && exam.id || '').match(/^wk-(\d+)$/);
                const entry = match && exam.entries && exam.entries[student.id];
                return entry ? [T('आठवडा ', 'Week ') + match[1], `${entry.marks}/${exam.max || 100}`, exam.date || '—'] : null;
            }).filter(Boolean).sort((a, b) => Number(a[0].match(/\d+/)?.[0]) - Number(b[0].match(/\d+/)?.[0]));
            const fees = ((student.fees || {}).ledger || []).map((payment) => [payment.date || '—', `₹${num(payment.amount).toLocaleString('en-IN')}`, payment.mode || '—', payment.receipt || '—']);
            const issues = (student.complaints || []).map((item) => [item.date || '—', item.type || '—', item.severity || '—', item.action || '—']);
            const remarks = (student.remarks || []).map((item) => [item.date || '—', item.text || item.note || '—']);
            const studentAwards = awards.filter((item) => String(item.studentId || '') === String(student.id) || String(item.rollNo || '') === String(student.rollNo)).map((item) => [item.week || '—', item.note || '—']);
            const attendanceRows = attendance.map(([date, record]) => [date, yesNo(record.morning), yesNo(record.evening), yesNo(record.school)]);
            return `<section class="alltime-student-page first">
                <header><h1>🕉️ ${esc(SCHOOL)}</h1><span>${esc(T('संपूर्ण विद्यार्थी अहवाल', 'All-time student report'))}</span></header>
                <h2>${esc(nameOf(student))}</h2>
                <div class="identity"><span><b>${esc(T('रोल', 'Roll'))}:</b> ${esc(student.rollNo || '—')}</span><span><b>${esc(T('वर्ग', 'Class'))}:</b> ${esc(student.standard || '—')}</span><span><b>${esc(T('फोन', 'Phone'))}:</b> ${esc(student.phone || '—')}</span><span><b>${esc(T('पालक', 'Parent'))}:</b> ${esc(student.parentName || '—')}</span></div>
                <div class="stats"><div><b>${attPct(student)}%</b><span>${esc(T('हजेरी सरासरी', 'Attendance average'))}</span></div><div><b>₹${f.total.toLocaleString('en-IN')}</b><span>${esc(T('एकूण फी', 'Total fee'))}</span></div><div><b>₹${f.paid.toLocaleString('en-IN')}</b><span>${esc(T('भरलेली फी', 'Fee paid'))}</span></div><div><b>₹${f.due.toLocaleString('en-IN')}</b><span>${esc(T('बाकी फी', 'Fee due'))}</span></div></div>
                <h3>${esc(T('साप्ताहिक गुण', 'Weekly marks'))}</h3>${table([T('आठवडा', 'Week'), T('गुण', 'Marks'), T('दिनांक', 'Date')], marks)}
                <h3>${esc(T('फी व्यवहार', 'Fee payments'))}</h3>${table([T('दिनांक', 'Date'), T('रक्कम', 'Amount'), T('प्रकार', 'Mode'), T('पावती', 'Receipt')], fees)}
            </section><section class="alltime-student-page second">
                <header><h1>${esc(nameOf(student))}</h1><span>${esc(T('पृष्ठ २', 'Page 2'))}</span></header>
                <h3>${esc(T('दैनंदिन हजेरी', 'Daily attendance'))}</h3>${table([T('दिनांक', 'Date'), T('सकाळ', 'Morning'), T('संध्याकाळ', 'Evening'), T('शाळा', 'School')], attendanceRows)}
                <h3>${esc(T('तक्रारी / ब्लॅकलिस्ट', 'Complaints / blacklist'))}</h3>${table([T('दिनांक', 'Date'), T('प्रकार', 'Type'), T('तीव्रता', 'Severity'), T('तपशील', 'Detail')], issues)}
                <h3>${esc(T('आदर्श विद्यार्थी', 'Student of the week'))}</h3>${table([T('आठवडा', 'Week'), T('कारण', 'Reason')], studentAwards)}
                <h3>${esc(T('शेरे', 'Remarks'))}</h3>${table([T('दिनांक', 'Date'), T('शेरा', 'Remark')], remarks)}
            </section>`;
        }).join('');
        const html = `<!doctype html><html lang="mr"><head><meta charset="utf-8"><title>${esc(SCHOOL)} — ${esc(label())}</title><style>
*{box-sizing:border-box}body{margin:0;background:#f4f1ea;color:#221c14;font-family:Arial,'Noto Sans Devanagari',sans-serif}.alltime-student-page{width:194mm;min-height:279mm;margin:0 auto;padding:10mm;background:#fff;page-break-after:always;break-after:page}.alltime-student-page header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #9a3428;padding-bottom:4mm}.alltime-student-page h1{margin:0;font-size:20px;color:#7a2f00}.alltime-student-page h2{margin:5mm 0 3mm;font-size:22px}.alltime-student-page h3{margin:4mm 0 2mm;color:#7a2f00;font-size:14px}.identity,.stats{display:grid;grid-template-columns:repeat(2,1fr);gap:2mm 6mm;font-size:12px}.stats{grid-template-columns:repeat(4,1fr);margin:4mm 0}.stats div{background:#fff4dc;border-left:3px solid #d89529;padding:2.5mm}.stats b,.stats span{display:block}.stats b{font-size:15px}.stats span{font-size:10px}table{width:100%;border-collapse:collapse;font-size:10px}th{background:#302c24;color:#fff;text-align:left;padding:2mm}td{padding:1.6mm 2mm;border-bottom:1px solid #ddd}tr:nth-child(even) td{background:#fcfaf6}.empty{font-size:11px;color:#777}@page{size:A4;margin:8mm}@media print{body{background:#fff}.alltime-student-page{margin:0;width:auto;min-height:279mm;box-shadow:none}}</style></head><body>${pages}</body></html>`;
        save(fileBase() + '-student-report.html', html, 'text/html');
    }

    function stats() {
        const list = students();
        const d = scope === 'today' ? pickDate : null;
        let absent = 0, due = 0, dueAmt = 0, comp = 0;
        list.forEach((s) => {
            const f = feeOf(s);
            if (f.due > 0) { due++; dueAmt += f.due; }
            comp += (s.complaints || []).length;
            if (d) {
                const rec = (s.dailyAttendance || {})[d] || {};
                if (rec.morning === false || rec.evening === false || rec.school === false) absent++;
            }
        });
        return { total: list.length, absent: absent, due: due, dueAmt: dueAmt, comp: comp, days: allDates().length };
    }

    /* ---------------- table builders ---------------- */

    /** Returns [{ title, headers, rows }] */
    function sheets() {
        const out = [];
        const list = sorted();

        if (scope === 'today') {
            out.push({
                title: T('आजची हजेरी — ', "Attendance — ") + pickDate,
                headers: [T('रोल', 'Roll'), T('नाव', 'Name'), T('इयत्ता', 'Std'), T('सकाळ', 'Morning'), T('संध्याकाळ', 'Evening'), T('शाळा', 'School')],
                rows: list.map((s) => [s.rollNo || '', nameOf(s), s.standard || '', mark(s, pickDate, 'morning'), mark(s, pickDate, 'evening'), mark(s, pickDate, 'school')]),
            });
            out.push({
                title: T('फी स्थिती', 'Fee status'),
                headers: [T('रोल', 'Roll'), T('नाव', 'Name'), T('एकूण', 'Total'), T('भरले', 'Paid'), T('बाकी', 'Due')],
                rows: list.map((s) => { const f = feeOf(s); return [s.rollNo || '', nameOf(s), f.total, f.paid, f.due]; }),
            });
            const cs = [];
            list.forEach((s) => (s.complaints || []).filter((c) => String(c.date || '') === pickDate)
                .forEach((c) => cs.push([s.rollNo || '', nameOf(s), c.type || '', c.severity || '', c.action || ''])));
            out.push({ title: T('आजच्या तक्रारी', "Today's complaints"), headers: [T('रोल', 'Roll'), T('नाव', 'Name'), T('प्रकार', 'Type'), T('तीव्रता', 'Severity'), T('तपशील', 'Detail')], rows: cs });
            return out;
        }

        /* ---- all time ---- */
        const dates = allDates();
        out.push({
            title: T('विद्यार्थी यादी', 'Student list'),
            headers: [T('रोल', 'Roll'), T('नाव', 'Name'), T('इयत्ता', 'Std'), T('फोन', 'Phone'), T('पालक', 'Parent'), T('हजेरी %', 'Attendance %'), T('फी एकूण', 'Fee total'), T('भरले', 'Paid'), T('बाकी', 'Due'), T('तक्रारी', 'Complaints'), T('काळी यादी', 'Blacklist')],
            rows: sorted().map((s) => { const f = feeOf(s); return [s.rollNo || '', nameOf(s), s.standard || '', s.phone || '', s.parentName || '', attPct(s), f.total, f.paid, f.due, (s.complaints || []).length, s.blacklisted ? T('होय', 'Yes') : '']; }),
        });
        out.push({
            title: T('संपूर्ण हजेरी (सर्व दिवस)', 'Full attendance (all days)'),
            headers: [T('दिनांक', 'Date'), T('रोल', 'Roll'), T('नाव', 'Name'), T('सकाळ', 'Morning'), T('संध्याकाळ', 'Evening'), T('शाळा', 'School')],
            rows: dates.flatMap((d) => sorted().filter((s) => (s.dailyAttendance || {})[d])
                .map((s) => [d, s.rollNo || '', nameOf(s), mark(s, d, 'morning'), mark(s, d, 'evening'), mark(s, d, 'school')])),
        });
        const led = [];
        sorted().forEach((s) => ((s.fees || {}).ledger || []).forEach((l) => led.push([l.date || '', s.rollNo || '', nameOf(s), num(l.amount), l.mode || '', l.receipt || ''])));
        out.push({ title: T('फी व्यवहार', 'Fee transactions'), headers: [T('दिनांक', 'Date'), T('रोल', 'Roll'), T('नाव', 'Name'), T('रक्कम', 'Amount'), T('प्रकार', 'Mode'), T('पावती', 'Receipt')], rows: led });
        const cs = [];
        sorted().forEach((s) => (s.complaints || []).forEach((c) => cs.push([c.date || '', s.rollNo || '', nameOf(s), c.type || '', c.severity || '', c.action || ''])));
        out.push({ title: T('तक्रारी', 'Complaints'), headers: [T('दिनांक', 'Date'), T('रोल', 'Roll'), T('नाव', 'Name'), T('प्रकार', 'Type'), T('तीव्रता', 'Severity'), T('तपशील', 'Detail')], rows: cs });
        const rm = [];
        sorted().forEach((s) => (s.remarks || []).forEach((r) => rm.push([r.date || '', s.rollNo || '', nameOf(s), r.text || r.note || String(r)])));
        out.push({ title: T('शेरे', 'Remarks'), headers: [T('दिनांक', 'Date'), T('रोल', 'Roll'), T('नाव', 'Name'), T('शेरा', 'Remark')], rows: rm });
        const ex = [];
        (ls('vss_exams', []) || []).forEach((e) => {
            const entries = e.entries || {};
            sorted().forEach((s) => { const en = entries[s.id]; if (en) ex.push([e.date || '', e.name || '', e.subject || '', s.rollNo || '', nameOf(s), en.marks ?? '', e.max ?? '', en.remark || '']); });
        });
        out.push({ title: T('परीक्षा गुण', 'Exam marks'), headers: [T('दिनांक', 'Date'), T('परीक्षा', 'Exam'), T('विषय', 'Subject'), T('रोल', 'Roll'), T('नाव', 'Name'), T('गुण', 'Marks'), T('एकूण', 'Max'), T('शेरा', 'Remark')], rows: ex });
        const ad = (ls('vss_adarsh_week', []) || []).map((a) => [a.week || '', a.rollNo || '', a.name || '', a.note || '']);
        out.push({ title: T('आदर्श विद्यार्थी', 'Student of the week'), headers: [T('आठवडा', 'Week'), T('रोल', 'Roll'), T('नाव', 'Name'), T('कारण', 'Reason')], rows: ad });
        return out;
    }

    /* ---------------- download helpers ---------------- */

    function save(name, content, mime) {
        const blob = new Blob([content], { type: mime + ';charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = name;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
        toast(T('डाउनलोड सुरू — ', 'Download started — ') + name);
    }

    const label = () => (scope === 'today' ? T('आजचा बॅकअप', "Today's backup") + ' (' + pickDate + ')' : T('संपूर्ण बॅकअप', 'All-time backup'));
    const fileBase = () => (scope === 'today' ? 'backup-' + pickDate : 'backup-all-' + stamp());

    function csv() {
        const q = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
        const parts = [];
        sheets().forEach((sh) => {
            parts.push(q(sh.title));
            parts.push(sh.headers.map(q).join(','));
            if (!sh.rows.length) parts.push(q(T('नोंद नाही', 'No records')));
            sh.rows.forEach((r) => parts.push(r.map(q).join(',')));
            parts.push('');
        });
        save(fileBase() + '.csv', '\uFEFF' + parts.join('\r\n'), 'text/csv');
    }

    function excel() {
        const tbl = sheets().map((sh) => `
      <table border="1" cellspacing="0" cellpadding="4">
        <tr><td colspan="${sh.headers.length}" style="background:#f57c00;color:#fff;font-weight:bold;font-size:14px">${esc(sh.title)}</td></tr>
        <tr>${sh.headers.map((h) => `<th style="background:#ffe0b2">${esc(h)}</th>`).join('')}</tr>
        ${sh.rows.length ? sh.rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')
                : `<tr><td colspan="${sh.headers.length}">${esc(T('नोंद नाही', 'No records'))}</td></tr>`}
      </table><br>`).join('');
        const html = `<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head>
      <body><h2>${esc(SCHOOL)} — ${esc(label())}</h2>${tbl}</body></html>`;
        save(fileBase() + '.xls', '\uFEFF' + html, 'application/vnd.ms-excel');
    }

    function json() {
        const dump = { school: SCHOOL, scope: scope, date: pickDate, exportedAt: new Date().toISOString(), students: students() };
        ['vss_exams', 'vss_holidays', 'vss_adarsh_week', 'vss_lang', 'vss_seva', 'vss_tasks'].forEach((k) => {
            const v = localStorage.getItem(k); if (v !== null) { dump[k] = v; }
        });
        save(fileBase() + '.json', JSON.stringify(dump, null, 2), 'application/json');
    }

    function report() {
        if (scope === 'all') { allTimeStudentReport(); return; }
        const st = stats();
        const cards = [
            [T('एकूण विद्यार्थी', 'Students'), st.total, '#f57c00'],
            scope === 'today' ? [T('आज गैरहजर', 'Absent today'), st.absent, '#c62828'] : [T('हजेरीचे दिवस', 'Attendance days'), st.days, '#c62828'],
            [T('फी बाकी विद्यार्थी', 'Fee pending'), st.due, '#1565c0'],
            ['₹ ' + T('बाकी रक्कम', 'Due amount'), st.dueAmt.toLocaleString('en-IN'), '#2e7d32'],
            [T('एकूण तक्रारी', 'Complaints'), st.comp, '#6a1b9a'],
        ];
        const html = `<!doctype html><html lang="mr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(SCHOOL)} — ${esc(label())}</title>
<style>
*{box-sizing:border-box}
body{margin:0;font-family:'Segoe UI',Noto Sans Devanagari,system-ui,sans-serif;background:#f4f1ea;color:#221c14}
.wrap{max-width:1040px;margin:0 auto;padding:24px}
.hero{background:linear-gradient(135deg,#7a2f00,#f57c00);color:#fff;border-radius:18px;padding:28px;box-shadow:0 12px 30px rgba(122,47,0,.25)}
.hero h1{margin:0;font-size:26px;letter-spacing:.3px}
.hero p{margin:6px 0 0;opacity:.92;font-size:14px}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:14px;margin:22px 0}
.card{background:#fff;border-radius:14px;padding:16px;border-left:6px solid #f57c00;box-shadow:0 6px 16px rgba(0,0,0,.06)}
.card b{display:block;font-size:26px;line-height:1.1}
.card span{font-size:12.5px;opacity:.7}
section{background:#fff;border-radius:16px;padding:18px;margin-bottom:18px;box-shadow:0 6px 16px rgba(0,0,0,.06)}
section h2{margin:0 0 12px;font-size:17px;color:#7a2f00;border-bottom:2px solid #ffe0b2;padding-bottom:8px}
table{width:100%;border-collapse:collapse;font-size:13px}
th{background:#fff3e0;text-align:left;padding:8px;border-bottom:2px solid #ffcc80;white-space:nowrap}
td{padding:7px 8px;border-bottom:1px solid #f0ece4}
tr:nth-child(even) td{background:#fcfaf6}
.empty{padding:10px;font-size:13px;opacity:.6}
footer{text-align:center;font-size:12px;opacity:.6;padding:18px}
@media print{body{background:#fff}.hero{box-shadow:none}section{box-shadow:none;break-inside:avoid}}
</style></head><body><div class="wrap">
<div class="hero"><h1>🕉️ ${esc(SCHOOL)}</h1><p>${esc(label())} · ${esc(T('तयार केले', 'Generated'))}: ${esc(new Date().toLocaleString('en-IN'))}</p></div>
<div class="cards">${cards.map((c) => `<div class="card" style="border-left-color:${c[2]}"><b>${esc(c[1])}</b><span>${esc(c[0])}</span></div>`).join('')}</div>
${sheets().map((sh) => `<section><h2>${esc(sh.title)}</h2>${sh.rows.length
            ? `<table><thead><tr>${sh.headers.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${sh.rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`
            : `<div class="empty">${esc(T('नोंद नाही', 'No records'))}</div>`}</section>`).join('')}
<footer>${esc(SCHOOL)} · ${esc(T('स्वयंचलित बॅकअप अहवाल', 'Automatic backup report'))}</footer>
</div></body></html>`;
        save(fileBase() + '.html', html, 'text/html');
    }

    /* ---------------- panel ---------------- */

    function ensurePanel() {
        const host = document.querySelector('.app-main-content') || document.body;
        if (document.getElementById('panel-backup')) return;
        const d = document.createElement('div');
        d.id = 'panel-backup';
        d.className = 'content-panel d-none';
        host.appendChild(d);
    }

    function addMenu() {
        const nav = document.querySelector('.sidebar-menu');
        if (!nav || document.getElementById('menu-backup')) return;
        const a = document.createElement('a');
        a.href = '#';
        a.id = 'menu-backup';
        a.className = 'menu-item';
        a.setAttribute('data-target', 'panel-backup');
        a.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> <span data-mr="बॅकअप" data-en="Backup">' + T('बॅकअप', 'Backup') + '</span>';
        a.addEventListener('click', (e) => { e.preventDefault(); openPanel(); });
        const anchor = document.getElementById('menu-pwa-install');
        if (anchor) nav.insertBefore(a, anchor); else nav.appendChild(a);
    }

    function openPanel() {
        ensurePanel();
        if (typeof switchPanel === 'function') switchPanel('panel-backup');
        render();
    }
    window.vssOpenBackup = openPanel;

    function render() {
        ensurePanel();
        const el = document.getElementById('panel-backup');
        if (!el) return;
        const st = stats();
        const cards = [
            [T('एकूण विद्यार्थी', 'Students'), st.total],
            scope === 'today' ? [T('आज गैरहजर', 'Absent today'), st.absent] : [T('हजेरीचे दिवस', 'Attendance days'), st.days],
            [T('फी बाकी', 'Fee pending'), st.due],
            ['₹ ' + st.dueAmt.toLocaleString('en-IN'), T('बाकी रक्कम', 'Due amount')],
            [T('तक्रारी', 'Complaints'), st.comp],
        ];
        el.innerHTML = `
      <div class="bk-head">
        <div>
          <h2>💾 ${T('बॅकअप केंद्र', 'Backup Centre')}</h2>
          <p>${T('आजचा किंवा संपूर्ण बॅकअप — सुंदर अहवाल, CSV किंवा Excel मध्ये डाउनलोड करा.', 'Download today’s or all-time backup as a beautiful report, CSV or Excel.')}</p>
        </div>
      </div>

      <div class="bk-card">
        <div class="bk-tabs">
          <button class="bk-tab ${scope === 'today' ? 'bk-on' : ''}" data-scope="today"><i class="fa-solid fa-calendar-day"></i> ${T('आजचा बॅकअप', "Today's backup")}</button>
          <button class="bk-tab ${scope === 'all' ? 'bk-on' : ''}" data-scope="all"><i class="fa-solid fa-box-archive"></i> ${T('संपूर्ण बॅकअप', 'All-time backup')}</button>
          ${scope === 'today' ? `<input type="date" class="bk-date" id="bk-date" value="${esc(pickDate)}">` : ''}
        </div>
        <div class="bk-stats">
          ${cards.map((c) => `<div class="bk-stat"><b>${esc(c[0])}</b><span>${esc(c[1])}</span></div>`).join('')}
        </div>
        <h3>${esc(label())}</h3>
        <p class="bk-sub">${T('खालील पर्यायांपैकी एक निवडा — फाईल लगेच डाउनलोड होईल.', 'Pick one of the options below — the file downloads instantly.')}</p>
        <div class="bk-grid">
          <button class="bk-btn" data-dl="report"><i class="fa-solid fa-file-invoice"></i><span><strong>${T('सुंदर अहवाल', 'Beautiful report')}</strong><small>${T('रंगीत HTML — प्रिंट/PDF साठी', 'Colourful HTML — print/PDF ready')}</small></span></button>
          <button class="bk-btn" data-dl="csv"><i class="fa-solid fa-file-csv"></i><span><strong>CSV</strong><small>${T('कोणत्याही सॉफ्टवेअरमध्ये उघडा', 'Opens anywhere')}</small></span></button>
          <button class="bk-btn" data-dl="excel"><i class="fa-solid fa-file-excel"></i><span><strong>Excel</strong><small>${T('रंगीत शीट — Excel मध्ये उघडा', 'Styled sheet for Excel')}</small></span></button>
          <button class="bk-btn" data-dl="json"><i class="fa-solid fa-database"></i><span><strong>${T('पूर्ण डेटा (JSON)', 'Full data (JSON)')}</strong><small>${T('पुन्हा भरण्यासाठी सुरक्षित प्रत', 'Safe restore copy')}</small></span></button>
        </div>
        <div class="ux-backup-guide">
          <div><h3>${T('१. सुरक्षित बॅकअप डाउनलोड करा', '1. Download a safe backup')}</h3><p>${T('वरील पूर्ण डेटा (JSON) निवडा आणि फाईल सुरक्षित ठेवा.', 'Choose Full data (JSON) above and keep the file safe.')}</p></div>
          <div><h3>${T('२. बॅकअपमधून नोंदी परत आणा', '2. Restore from a backup')}</h3><p>${T('फाईल तपासल्यानंतरच पुष्टी विचारली जाईल. ही कृती सध्याच्या नोंदी बदलते.', 'The file is checked first, then confirmation is required. Restoring replaces current records.')}</p><label for="bk-restore-file">${T('बॅकअप फाईल निवडा', 'Choose backup file')}</label><input id="bk-restore-file" type="file" accept=".json,application/json"></div>
        </div>
        <p class="bk-note">${T('टीप: सुंदर अहवाल उघडून Ctrl+P दाबल्यास PDF तयार होतो. संपूर्ण बॅकअपमध्ये विद्यार्थी, सर्व दिवसांची हजेरी, फी व्यवहार, तक्रारी, शेरे, परीक्षा गुण आणि आदर्श विद्यार्थी यांचा समावेश आहे.', 'Tip: open the beautiful report and press Ctrl+P to save a PDF. The all-time backup includes students, every day of attendance, fee transactions, complaints, remarks, exam marks and student of the week.')}</p>
      </div>`;

        el.querySelectorAll('[data-scope]').forEach((b) => b.onclick = () => { scope = b.dataset.scope; render(); });
        const dt = el.querySelector('#bk-date');
        if (dt) dt.onchange = () => { pickDate = dt.value || today(); render(); };
        el.querySelectorAll('[data-dl]').forEach((b) => b.onclick = () => {
            const k = b.dataset.dl;
            if (k === 'report') report(); else if (k === 'csv') csv(); else if (k === 'excel') excel(); else json();
        });
        el.querySelector('#bk-restore-file')?.addEventListener('change', (event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (file) restoreFile(file);
        });
    }

    function boot() {
        ensurePanel();
        addMenu();
        const obs = new MutationObserver(() => addMenu());
        const nav = document.querySelector('.sidebar-menu');
        if (nav) obs.observe(nav, { childList: true });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 300));
    else setTimeout(boot, 300);
})();
