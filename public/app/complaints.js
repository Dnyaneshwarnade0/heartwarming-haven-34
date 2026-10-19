/* तक्रारी — सर्व विद्यार्थ्यांच्या तक्रारी एका ठिकाणी (जोडा / हटवा) */
(function () {
    'use strict';
    const EN = () => (typeof currentLanguage !== 'undefined' ? currentLanguage : 'mr') === 'en';
    const T = (mr, en) => (EN() ? en : mr);
    const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const toast = (m, t) => (typeof createToast === 'function' ? createToast(m, t || 'success') : console.log(m));
    const students = () => (typeof studentsDatabase !== 'undefined' && Array.isArray(studentsDatabase) ? studentsDatabase : []);
    const nameOf = (s) => (typeof getStudentName === 'function' ? getStudentName(s) : (s && typeof s.name === 'object' ? (EN() ? s.name.en : s.name.mr) : (s && s.name) || ''));
    const saveAll = () => {
        try {
            if (typeof saveDatabase === 'function') saveDatabase();
            else localStorage.setItem('vss_students', JSON.stringify(students()));
        } catch (_) { localStorage.setItem('vss_students', JSON.stringify(students())); }
    };
    const PID = 'panel-complaints';

    function ensure() {
        const host = document.querySelector('.app-main-content') || document.body;
        if (!document.getElementById(PID)) {
            const d = document.createElement('div');
            d.id = PID; d.className = 'content-panel d-none';
            host.appendChild(d);
        }
        const nav = document.querySelector('.sidebar-menu');
        if (nav && !document.getElementById('menu-complaints')) {
            const a = document.createElement('a');
            a.href = '#'; a.id = 'menu-complaints'; a.className = 'menu-item';
            a.setAttribute('data-target', PID);
            a.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> <span data-mr="तक्रारी" data-en="Complaints">' + T('तक्रारी', 'Complaints') + '</span>';
            a.addEventListener('click', (e) => {
                e.preventDefault();
                if (typeof switchPanel === 'function') switchPanel(PID);
                render();
            });
            nav.appendChild(a);
        }
        fillAttendance();
    }

    /* १४ ऑक्टोबर २०२६ पर्यंत हजेरी भरा (रविवार वगळून, फक्त रिकाम्या दिवसांसाठी) */
    const ATT_FLAG = 'vss_att_fill_oct14_v1';
    function fillAttendance() {
        const list = students();
        if (!list.length || localStorage.getItem(ATT_FLAG) === '1') return;
        let holidays = {};
        try { holidays = JSON.parse(localStorage.getItem('vss_holidays') || '{}') || {}; } catch (_) { }
        const start = new Date(2026, 5, 1), end = new Date(2026, 9, 14);
        list.forEach((s) => {
            s.dailyAttendance = s.dailyAttendance || {};
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                if (d.getDay() === 0) continue;
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                if (s.dailyAttendance[key]) continue;
                const rec = { morning: true, evening: true };
                if (!s.notGoingToSchool && !holidays[key]) rec.school = true;
                s.dailyAttendance[key] = rec;
            }
        });
        localStorage.setItem(ATT_FLAG, '1');
        saveAll();
        try { if (window.vssCloudPush) window.vssCloudPush(); } catch (_) { }
    }
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    function fmtDate(v) {
        const m = String(v || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
        return m ? `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}` : String(v || '—');
    }

    function render() {
        const el = document.getElementById(PID);
        if (!el) return;
        const list = students();
        const rows = [];
        list.forEach((s) => (Array.isArray(s.complaints) ? s.complaints : []).forEach((c, i) => rows.push({ s, c, i })));
        rows.sort((a, b) => String(b.c.date || '').localeCompare(String(a.c.date || '')));
        const sorted = [...list].sort((a, b) => Number(a.rollNo || 0) - Number(b.rollNo || 0));
        const today = new Date().toISOString().slice(0, 10);
        el.innerHTML = `
          <div class="sb-head"><div>
            <h2><i class="fa-solid fa-triangle-exclamation"></i> ${T('तक्रारी', 'Complaints')}</h2>
            <p>${T('एकूण तक्रारी', 'Total complaints')}: ${rows.length}</p>
          </div></div>
          <div class="sb-card">
            <div class="sb-grid">
              <div class="form-group"><label>${T('विद्यार्थी', 'Student')}</label>
                <select id="cp-stu" class="form-control">${sorted.map((s) => `<option value="${esc(s.id)}">${esc(s.rollNo)} - ${esc(nameOf(s))}</option>`).join('')}</select></div>
              <div class="form-group"><label>${T('दिनांक', 'Date')}</label><input id="cp-date" type="date" class="form-control" value="${today}"></div>
              <div class="form-group"><label>${T('तक्रार प्रकार', 'Type')}</label><input id="cp-type" class="form-control" placeholder="${T('उदा. सेवा न करणे', 'e.g. Misbehaviour')}"></div>
              <div class="form-group"><label>${T('गंभीरता', 'Severity')}</label>
                <select id="cp-sev" class="form-control"><option>सौम्य</option><option selected>मध्यम</option><option>गंभीर</option></select></div>
              <div class="form-group" style="grid-column:1/-1"><label>${T('तपशील / कारवाई', 'Details / Action')}</label><input id="cp-act" class="form-control"></div>
            </div>
            <button type="button" id="cp-add" class="btn-primary" style="margin-top:10px"><i class="fa-solid fa-plus"></i> ${T('तक्रार जोडा', 'Add Complaint')}</button>
          </div>
          <div class="sb-card" style="margin-top:16px;overflow-x:auto">
            ${rows.length ? `<table class="data-table"><thead><tr>
              <th>${T('दिनांक', 'Date')}</th><th>${T('विद्यार्थी', 'Student')}</th>
              <th>${T('प्रकार', 'Type')}</th><th>${T('गंभीरता', 'Severity')}</th><th>${T('तपशील', 'Details')}</th><th></th></tr></thead>
              <tbody>${rows.map((r) => `<tr>
                <td style="white-space:nowrap">${esc(fmtDate(r.c.date))}</td><td>${esc(nameOf(r.s))}</td>
                <td>${esc(r.c.type)}</td><td>${esc(r.c.severity)}</td><td>${esc(r.c.action || r.c.note || '')}</td>
                <td><button type="button" class="btn-secondary" data-del="${esc(r.s.id)}|${r.i}" title="${T('हटवा', 'Delete')}"><i class="fa-solid fa-trash"></i></button></td>
              </tr>`).join('')}</tbody></table>` : `<p>${T('कोणतीही तक्रार नाही.', 'No complaints.')}</p>`}
          </div>`;

        el.querySelector('#cp-add').onclick = () => {
            const s = list.find((x) => String(x.id) === el.querySelector('#cp-stu').value);
            const type = el.querySelector('#cp-type').value.trim();
            if (!s || !type) { toast(T('विद्यार्थी व तक्रार प्रकार आवश्यक', 'Student and type required'), 'danger'); return; }
            s.complaints = Array.isArray(s.complaints) ? s.complaints : [];
            s.complaints.push({ date: el.querySelector('#cp-date').value, type, severity: el.querySelector('#cp-sev').value, action: el.querySelector('#cp-act').value.trim() });
            saveAll(); toast(T('तक्रार जोडली', 'Complaint added')); render();
        };
        el.querySelectorAll('[data-del]').forEach((b) => (b.onclick = () => {
            if (!confirm(T('ही तक्रार हटवायची?', 'Delete this complaint?'))) return;
            const [id, i] = b.getAttribute('data-del').split('|');
            const s = list.find((x) => String(x.id) === id);
            if (s && Array.isArray(s.complaints)) { s.complaints.splice(Number(i), 1); saveAll(); toast(T('तक्रार हटवली', 'Complaint deleted')); render(); }
        }));
    }

    function boot() { ensure(); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
    setInterval(boot, 1500);
    window.vssRenderComplaints = render;
})();
