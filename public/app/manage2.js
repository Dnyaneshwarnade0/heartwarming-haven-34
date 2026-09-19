/* =========================================================
   MANAGE LAYER 2 (सर्वात शेवटी लोड होते)
   1. खऱ्या सूचना (notifications)
   2. डॅशबोर्ड हजेरी % — आजच्या सत्रांवरून
   3. विषय — श्रेणी + गुण (१०० पैकी)
   4. प्रोफाइल फोटो बदला + संपादन icon
   5. हजेरी पुन्हा घेताना इशारा
   6. वापरकर्ते (Admin / Sub-manager) + परवानग्या
   7. लॉगिन लक्षात ठेवा
   8. वरती बॉट icon — स्वतंत्र पान
   ========================================================= */
(function () {
    'use strict';

    const EN = () => (typeof currentLanguage !== 'undefined' ? currentLanguage : 'mr') === 'en';
    const T = (mr, en) => (EN() ? en : mr);
    const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const toast = (m, t) => (typeof createToast === 'function' ? createToast(m, t || 'success') : console.log(m));
    const save = () => { try { if (typeof saveDatabase === 'function') saveDatabase(); } catch (_) { } };
    const students = () => (typeof studentsData !== 'undefined' && Array.isArray(studentsData) ? studentsData : (window.studentsData || []));
    const stu = () => (typeof selectedStudent !== 'undefined' ? selectedStudent : null);
    const todayISO = () => new Date().toISOString().slice(0, 10);
    const nameOf = (s) => (EN() ? (s.nameEn || s.name) : (s.name || s.nameEn)) || '';

    function modal(title, bodyHTML, onSave, saveLabel) {
        const old = document.getElementById('vss-m2-modal');
        if (old) old.remove();
        const w = document.createElement('div');
        w.id = 'vss-m2-modal';
        w.className = 'vss-confirm-overlay';
        w.innerHTML = `
            <div class="vss-confirm-box vss-edit-box">
                <h3>${title}</h3>
                <div class="vss-mg-body">${bodyHTML}</div>
                <div class="vss-confirm-actions">
                    <button type="button" class="btn-secondary" data-no>${T('बंद करा', 'Close')}</button>
                    ${onSave ? `<button type="button" class="btn-primary" data-yes>${saveLabel || T('जतन करा', 'Save')}</button>` : ''}
                </div>
            </div>`;
        document.body.appendChild(w);
        const close = () => w.remove();
        w.querySelector('[data-no]').onclick = close;
        w.addEventListener('click', (e) => { if (e.target === w) close(); });
        const yes = w.querySelector('[data-yes]');
        if (yes) yes.onclick = () => { if (onSave(w) !== false) close(); };
        return w;
    }

    /* =========================================================
       1. खऱ्या सूचना
       ========================================================= */
    function buildNotifs() {
        const list = students();
        const out = [];
        const date = todayISO();

        /* आजची हजेरी घेतली का? */
        ['morning', 'evening', 'school'].forEach((sess) => {
            const done = list.some((s) => {
                const d = s.dailyAttendance && s.dailyAttendance[date];
                return d && Object.prototype.hasOwnProperty.call(d, sess);
            });
            const lbl = { morning: T('सकाळची', 'Morning'), evening: T('संध्याकाळची', 'Evening'), school: T('शाळेची', 'School') }[sess];
            if (!done) {
                out.push({
                    type: 'orange', icon: 'fa-clipboard-user',
                    text: T(`${lbl} हजेरी अद्याप घेतलेली नाही.`, `${lbl} attendance is not taken yet.`),
                    time: T('आज', 'Today')
                });
            }
        });

        /* आज गैरहजर */
        const absent = list.filter((s) => {
            const d = s.dailyAttendance && s.dailyAttendance[date];
            return d && Object.values(d).some((v) => v === false);
        });
        if (absent.length) {
            out.push({
                type: 'red', icon: 'fa-user-xmark',
                text: T(`आज ${absent.length} विद्यार्थी गैरहजर: ${absent.slice(0, 4).map(nameOf).join(', ')}${absent.length > 4 ? '…' : ''}`,
                    `${absent.length} absent today: ${absent.slice(0, 4).map(nameOf).join(', ')}${absent.length > 4 ? '…' : ''}`),
                time: T('आज', 'Today')
            });
        }

        /* थकीत फी */
        const due = list.filter((s) => {
            const f = s.fees || {};
            const paid = (f.ledger || []).reduce((a, p) => a + Number(p.amount || 0), 0);
            return Number(f.total || 0) > 0 && paid < Number(f.total || 0);
        });
        if (due.length) {
            out.push({
                type: 'orange', icon: 'fa-indian-rupee-sign',
                text: T(`${due.length} विद्यार्थ्यांची फी बाकी आहे.`, `${due.length} students have pending fees.`),
                time: T('आज', 'Today')
            });
        }

        /* नव्या तक्रारी (शेवटच्या ७ दिवसांतील) */
        const weekAgo = Date.now() - 7 * 864e5;
        let comp = 0;
        list.forEach((s) => (s.complaints || s.incidents || []).forEach((c) => {
            const t = Date.parse(c.date || c.createdAt || '');
            if (t && t >= weekAgo) comp++;
        }));
        if (comp) {
            out.push({
                type: 'red', icon: 'fa-triangle-exclamation',
                text: T(`या आठवड्यात ${comp} नवीन तक्रारी नोंदल्या.`, `${comp} new complaints this week.`),
                time: T('हा आठवडा', 'This week')
            });
        }

        /* काळी यादी */
        const bl = list.filter((s) => s.blacklisted);
        if (bl.length) {
            out.push({
                type: 'red', icon: 'fa-ban',
                text: T(`काळ्या यादीत ${bl.length} विद्यार्थी आहेत.`, `${bl.length} students are blacklisted.`),
                time: ''
            });
        }

        if (!out.length) {
            out.push({
                type: 'green', icon: 'fa-circle-check',
                text: T('सर्व काही व्यवस्थित आहे — कोणतीही प्रलंबित बाब नाही.', 'All good — nothing pending.'),
                time: T('आज', 'Today')
            });
        }
        return out;
    }

    function installNotifs() {
        window.populateNotificationCenter = function () {
            const list = document.getElementById('notif-list');
            const count = document.getElementById('notif-count');
            if (!list || !count) return;
            const notifs = buildNotifs();
            list.innerHTML = notifs.map((n) => `
                <div class="notif-item">
                    <div class="notif-icon ${n.type}"><i class="fa-solid ${n.icon}"></i></div>
                    <div class="notif-content">
                        <p>${esc(n.text)}</p>
                        <span>${esc(n.time)}</span>
                    </div>
                </div>`).join('');
            count.textContent = String(notifs.length);
            count.classList.remove('d-none');
        };
        try { window.populateNotificationCenter(); } catch (_) { }
    }

    /* =========================================================
       2. डॅशबोर्ड — आजची हजेरी %
       ========================================================= */
    function todayPct() {
        const list = students();
        const date = todayISO();
        let marked = 0, present = 0;
        list.forEach((s) => {
            const d = (s.dailyAttendance || {})[date];
            if (!d) return;
            const vals = Object.values(d).filter((v) => typeof v === 'boolean');
            if (!vals.length) return;
            marked++;
            if (vals.every((v) => v)) present++;
        });
        if (!marked) return null;
        return Math.round((present / marked) * 100);
    }

    function patchDashboard() {
        if (typeof window.renderDashboardMetrics !== 'function' || window.renderDashboardMetrics.__m2) return;
        const orig = window.renderDashboardMetrics;
        const wrapped = function () {
            const r = orig.apply(this, arguments);
            const el = document.getElementById('stat-attendance-rate');
            if (el) {
                const p = todayPct();
                el.textContent = p === null ? T('हजेरी बाकी', 'Not taken') : `${p}%`;
            }
            try { window.populateNotificationCenter(); } catch (_) { }
            return r;
        };
        wrapped.__m2 = 1;
        window.renderDashboardMetrics = wrapped;
        try { wrapped(); } catch (_) { }
    }

    /* =========================================================
       3. विषय — श्रेणी + गुण (१०० पैकी)
       ========================================================= */
    const SUBJECTS = window.VSS_SUBJECTS || [
        { k: 'Kirtan', mr: 'कीर्तन', en: 'Kirtan' },
        { k: 'Gayan', mr: 'गायन', en: 'Gayan' },
        { k: 'Pakhawaj', mr: 'पखवाज', en: 'Pakhawaj' },
        { k: 'Bhagwat', mr: 'भागवत', en: 'Bhagwat' }
    ];
    const GRADES = [
        { v: 'Excellent', mr: 'उत्कृष्ट', en: 'Excellent' },
        { v: 'Good', mr: 'चांगले', en: 'Good' },
        { v: 'Average', mr: 'मध्यम', en: 'Average' },
        { v: 'Weak', mr: 'कमकुवत', en: 'Weak' }
    ];
    const gradeFor = (m) => (m >= 85 ? 'Excellent' : m >= 65 ? 'Good' : m >= 40 ? 'Average' : 'Weak');

    function renderSubjects() {
        const host = document.getElementById('prof-subjects-list');
        if (!host) return;
        const s = stu();
        const map = (s && s.subjects) || {};
        const marks = (s && s.subjectMarks) || {};
        host.innerHTML = SUBJECTS.map((sub) => {
            const g = map[sub.k] || map[sub.en] || '';
            const gl = GRADES.find((x) => x.v === g) || {};
            const m = marks[sub.k];
            return `
                <li>
                    <span class="subject-name">${T(sub.mr, sub.en)}</span>
                    <span class="subject-marks">${typeof m === 'number' ? `${m}/100` : '—'}</span>
                    <span class="subject-badge ${g ? g.toLowerCase() : 'na'}" data-sub2="${sub.k}" role="button" tabindex="0">
                        ${g ? T(gl.mr || g, gl.en || g) : T('श्रेणी द्या', 'Set grade')} <i class="fa-solid fa-pen" style="font-size:.7em;opacity:.6"></i>
                    </span>
                </li>`;
        }).join('');
        host.querySelectorAll('[data-sub2]').forEach((el) => {
            el.onclick = () => openSubject(el.getAttribute('data-sub2'));
        });
    }

    function openSubject(key) {
        const s = stu();
        if (!s) return;
        const sub = SUBJECTS.find((x) => x.k === key) || { mr: key, en: key };
        const curG = (s.subjects || {})[key] || '';
        const curM = (s.subjectMarks || {})[key];
        const body = `
            <label class="vss-mg-label">${T('गुण (१०० पैकी)', 'Marks (out of 100)')}</label>
            <input type="number" min="0" max="100" id="m2-marks" class="vss-mg-input" value="${typeof curM === 'number' ? curM : ''}" placeholder="0 - 100">
            <label class="vss-mg-label">${T('श्रेणी', 'Grade')}</label>
            <div class="vss-mg-choices" id="m2-grades">
                ${GRADES.map((g) => `<button type="button" class="vss-choice ${curG === g.v ? 'on' : ''}" data-g="${g.v}">${T(g.mr, g.en)}</button>`).join('')}
                <button type="button" class="vss-choice" data-g="">${T('काढून टाका', 'Clear')}</button>
            </div>`;
        const w = modal(`${T('विषय', 'Subject')}: ${T(sub.mr, sub.en)}`, body, (box) => {
            const mv = box.querySelector('#m2-marks').value;
            const chosen = box.querySelector('#m2-grades .on');
            s.subjects = s.subjects || {};
            s.subjectMarks = s.subjectMarks || {};
            if (mv === '') delete s.subjectMarks[key];
            else s.subjectMarks[key] = Math.max(0, Math.min(100, Number(mv) || 0));
            const g = chosen ? chosen.getAttribute('data-g') : (mv === '' ? '' : gradeFor(Number(mv) || 0));
            if (g) s.subjects[key] = g; else delete s.subjects[key];
            save();
            renderSubjects();
            try { if (typeof renderAcademicsSVGChart === 'function') renderAcademicsSVGChart(); } catch (_) { }
            toast(T('विषय जतन झाला', 'Subject saved'));
        });
        w.querySelectorAll('#m2-grades [data-g]').forEach((b) => {
            b.onclick = () => {
                w.querySelectorAll('#m2-grades [data-g]').forEach((x) => x.classList.remove('on'));
                if (b.getAttribute('data-g')) b.classList.add('on');
            };
        });
        const inp = w.querySelector('#m2-marks');
        inp.oninput = () => {
            const v = Number(inp.value);
            if (inp.value === '' || isNaN(v)) return;
            const g = gradeFor(Math.max(0, Math.min(100, v)));
            w.querySelectorAll('#m2-grades [data-g]').forEach((x) => x.classList.toggle('on', x.getAttribute('data-g') === g));
        };
    }

    /* =========================================================
       4. प्रोफाइल फोटो बदला
       ========================================================= */
    function wirePhotoEdit() {
        const av = document.getElementById('prof-avatar');
        if (!av || av.dataset.m2) return;
        av.dataset.m2 = '1';
        av.style.position = 'relative';
        av.style.cursor = 'pointer';
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'vss-photo-edit';
        btn.title = T('फोटो बदला', 'Change photo');
        btn.innerHTML = '<i class="fa-solid fa-camera"></i>';
        av.appendChild(btn);

        const file = document.createElement('input');
        file.type = 'file';
        file.accept = 'image/*';
        file.style.display = 'none';
        document.body.appendChild(file);

        btn.onclick = (e) => { e.stopPropagation(); file.click(); };
        file.onchange = () => {
            const f = file.files && file.files[0];
            const s = stu();
            if (!f || !s) return;
            const r = new FileReader();
            r.onload = () => {
                s.photo = r.result;
                save();
                toast(T('फोटो बदलला', 'Photo updated'));
                try { if (typeof renderStudentProfile === 'function') renderStudentProfile(); } catch (_) { }
                try { if (typeof renderStudentTable === 'function') renderStudentTable(); } catch (_) { }
            };
            r.readAsDataURL(f);
            file.value = '';
        };
    }

    /* =========================================================
       5. हजेरी पुन्हा घेताना इशारा
       ========================================================= */
    function attendanceGuard() {
        document.addEventListener('click', (e) => {
            const chip = e.target.closest && e.target.closest('.dt-chip');
            if (!chip || chip.dataset.m2ok === '1') return;
            const sess = chip.getAttribute('data-session');
            const date = (document.getElementById('dt-date') || {}).value || todayISO();
            const done = students().some((s) => {
                const d = s.dailyAttendance && s.dailyAttendance[date];
                return d && Object.prototype.hasOwnProperty.call(d, sess);
            });
            if (!done) return;
            e.preventDefault();
            e.stopPropagation();
            const lbl = { morning: T('सकाळची', 'Morning'), evening: T('संध्याकाळची', 'Evening'), school: T('शाळेची', 'School') }[sess] || sess;
            const msg = T(`${lbl} हजेरी आधीच घेतली आहे. पुन्हा घ्यायची / बदलायची आहे का?`,
                `${lbl} attendance is already taken. Do you want to take it again?`);
            const go = () => { chip.dataset.m2ok = '1'; chip.click(); setTimeout(() => { delete chip.dataset.m2ok; }, 200); };
            if (typeof window.vssConfirm === 'function') window.vssConfirm(msg, go);
            else if (confirm(msg)) go();
        }, true);
    }

    /* =========================================================
       6+7. वापरकर्ते, परवानग्या, लॉगिन लक्षात ठेवा
       ========================================================= */
    const PERMS = [
        { k: 'dashboard', mr: 'डॅशबोर्ड', en: 'Dashboard' },
        { k: 'students', mr: 'विद्यार्थी', en: 'Students' },
        { k: 'attendance', mr: 'हजेरी / आजची कामे', en: 'Attendance / Daily task' },
        { k: 'fees', mr: 'फी', en: 'Fees' },
        { k: 'exam', mr: 'परीक्षा', en: 'Exam' },
        { k: 'reports', mr: 'अहवाल', en: 'Reports' },
        { k: 'settings', mr: 'सेटिंग्ज', en: 'Settings' },
        { k: 'users', mr: 'वापरकर्ते तयार करा', en: 'Manage users' }
    ];

    const readUsers = () => { try { return JSON.parse(localStorage.getItem('vss_users') || '[]'); } catch (_) { return []; } };
    const writeUsers = (u) => localStorage.setItem('vss_users', JSON.stringify(u));

    function syncAccounts() {
        const acc = window.VSS_ACCOUNTS || (window.VSS_ACCOUNTS = {
            ankush: { password: 'Ankush@1232', name: 'Ankush Maharaj Kadam' },
            swapnil: { password: 'Swapnil@1232', name: 'Swapnil Vaidya' }
        });
        acc.ankush = acc.ankush || { password: 'Ankush@1232', name: 'Ankush Maharaj Kadam' };
        acc.swapnil = acc.swapnil || { password: 'Swapnil@1232', name: 'Swapnil Vaidya' };
        readUsers().forEach((u) => {
            acc[String(u.username).toLowerCase()] = { password: u.password, name: u.name, role: u.role, perms: u.perms };
        });
    }

    function usersModal() {
        const draw = () => {
            const users = readUsers();
            const rows = users.length ? users.map((u, i) => `
                <div class="vss-user-row">
                    <div>
                        <b>${esc(u.name)}</b> <span class="vss-user-role">${u.role === 'admin' ? T('ॲडमिन', 'Admin') : T('सब-मॅनेजर', 'Sub-manager')}</span>
                        <div class="vss-user-sub">${esc(u.username)} · ${(u.perms || []).length} ${T('परवानग्या', 'permissions')}</div>
                    </div>
                    <div class="vss-user-acts">
                        <button type="button" data-edit="${i}" title="${T('संपादन', 'Edit')}"><i class="fa-solid fa-pen"></i></button>
                        <button type="button" data-del="${i}" title="${T('हटवा', 'Delete')}"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>`).join('') : `<p class="text-muted">${T('अद्याप कोणताही वापरकर्ता नाही.', 'No users yet.')}</p>`;

            const w = modal(T('👥 वापरकर्ते व परवानग्या', 'Users & permissions'),
                `${rows}<div style="margin-top:12px"><button type="button" class="btn-primary" id="m2-add-user"><i class="fa-solid fa-plus"></i> ${T('नवीन वापरकर्ता', 'New user')}</button></div>`,
                null);
            w.querySelector('#m2-add-user').onclick = () => { w.remove(); userForm(null); };
            w.querySelectorAll('[data-edit]').forEach((b) => (b.onclick = () => { w.remove(); userForm(Number(b.getAttribute('data-edit'))); }));
            w.querySelectorAll('[data-del]').forEach((b) => (b.onclick = () => {
                const i = Number(b.getAttribute('data-del'));
                const go = () => { const list = readUsers(); list.splice(i, 1); writeUsers(list); syncAccounts(); w.remove(); draw(); toast(T('वापरकर्ता हटवला', 'User deleted')); };
                const msg = T('हा वापरकर्ता हटवायचा आहे का?', 'Delete this user?');
                if (typeof window.vssConfirm === 'function') window.vssConfirm(msg, go); else if (confirm(msg)) go();
            }));
        };
        draw();
    }

    function userForm(index) {
        const users = readUsers();
        const u = index === null ? { name: '', username: '', password: '', role: 'manager', perms: ['dashboard'], bio: true } : users[index];
        const body = `
            <label class="vss-mg-label">${T('पूर्ण नाव', 'Full name')}</label>
            <input class="vss-mg-input" id="m2-u-name" value="${esc(u.name)}">
            <label class="vss-mg-label">${T('वापरकर्तानाव', 'Username')}</label>
            <input class="vss-mg-input" id="m2-u-user" value="${esc(u.username)}">
            <label class="vss-mg-label">${T('पासवर्ड', 'Password')}</label>
            <input class="vss-mg-input" id="m2-u-pass" value="${esc(u.password)}">
            <label class="vss-mg-label">${T('भूमिका', 'Role')}</label>
            <div class="vss-mg-choices" id="m2-u-role">
                <button type="button" class="vss-choice ${u.role === 'admin' ? 'on' : ''}" data-r="admin">${T('ॲडमिन', 'Admin')}</button>
                <button type="button" class="vss-choice ${u.role !== 'admin' ? 'on' : ''}" data-r="manager">${T('सब-मॅनेजर', 'Sub-manager')}</button>
            </div>
            <label class="vss-mg-label">${T('परवानग्या', 'Permissions')}</label>
            <div class="vss-perm-grid">
                ${PERMS.map((p) => `<label class="vss-perm"><input type="checkbox" data-p="${p.k}" ${(u.perms || []).includes(p.k) ? 'checked' : ''}> ${T(p.mr, p.en)}</label>`).join('')}
            </div>
            <label class="vss-perm" style="margin-top:8px"><input type="checkbox" id="m2-u-bio" ${u.bio !== false ? 'checked' : ''}> ${T('फिंगरप्रिंट / फेस लॉक वापरू शकतो', 'Can use fingerprint / face lock')}</label>`;

        const w = modal(index === null ? T('नवीन वापरकर्ता', 'New user') : T('वापरकर्ता संपादन', 'Edit user'), body, (box) => {
            const name = box.querySelector('#m2-u-name').value.trim();
            const username = box.querySelector('#m2-u-user').value.trim().toLowerCase();
            const password = box.querySelector('#m2-u-pass').value;
            if (!name || !username || !password) { toast(T('नाव, वापरकर्तानाव व पासवर्ड आवश्यक', 'Name, username and password required'), 'danger'); return false; }
            const role = (box.querySelector('#m2-u-role .on') || {}).getAttribute ? box.querySelector('#m2-u-role .on').getAttribute('data-r') : 'manager';
            const perms = Array.from(box.querySelectorAll('[data-p]')).filter((c) => c.checked).map((c) => c.getAttribute('data-p'));
            const bio = box.querySelector('#m2-u-bio').checked;
            const rec = { name, username, password, role, perms, bio };
            const list = readUsers();
            if (index === null) list.push(rec); else list[index] = rec;
            writeUsers(list);
            syncAccounts();
            toast(T('वापरकर्ता जतन झाला', 'User saved'));
            setTimeout(usersModal, 150);
        });
        w.querySelectorAll('#m2-u-role [data-r]').forEach((b) => (b.onclick = () => {
            w.querySelectorAll('#m2-u-role [data-r]').forEach((x) => x.classList.remove('on'));
            b.classList.add('on');
        }));
    }

    /* परवानग्यांप्रमाणे मेनू लपवा */
    function applyPerms() {
        const cu = (typeof currentUser !== 'undefined' && currentUser) || null;
        if (!cu) return;
        const acc = (window.VSS_ACCOUNTS || {})[cu.username] || {};
        if (!acc.perms || acc.role === 'admin') return;
        const MAP = {
            'panel-dashboard': 'dashboard', 'panel-students': 'students', 'panel-daily-task': 'attendance',
            'panel-fees': 'fees', 'panel-exam': 'exam', 'panel-reports': 'reports', 'panel-settings': 'settings'
        };
        document.querySelectorAll('.nav-item[data-panel]').forEach((el) => {
            const key = MAP[el.getAttribute('data-panel')];
            if (key && !acc.perms.includes(key)) el.style.display = 'none';
        });
    }

    /* लॉगिन लक्षात ठेवा — डीफॉल्ट चालू */
    function rememberLogin() {
        const box = document.getElementById('remember');
        if (box && !box.dataset.m2) { box.dataset.m2 = '1'; box.checked = true; }
        if (typeof window.vssLoginAs === 'function' && !window.vssLoginAs.__m2) {
            const orig = window.vssLoginAs;
            const wrapped = function (uKey, remember) {
                const r = orig.call(this, uKey, remember === undefined ? true : remember);
                try {
                    localStorage.setItem('vss_session_user', JSON.stringify(
                        typeof currentUser !== 'undefined' ? currentUser : { username: uKey }));
                    localStorage.setItem('vss_last_user', uKey);
                } catch (_) { }
                setTimeout(applyPerms, 400);
                return r;
            };
            wrapped.__m2 = 1;
            window.vssLoginAs = wrapped;
        }
    }

    /* =========================================================
       8. वरती बॉट icon (स्वतंत्र पान) + वापरकर्ते बटण
       ========================================================= */
    function headerButtons() {
        const right = document.querySelector('.header-right');
        if (!right || right.dataset.m2) return;
        right.dataset.m2 = '1';

        const bot = document.createElement('button');
        bot.type = 'button';
        bot.className = 'vss-head-btn';
        bot.title = T('बॉट स्वतंत्र पानावर उघडा', 'Open bot in its own page');
        bot.innerHTML = '<i class="fa-solid fa-robot"></i>';
        bot.onclick = () => window.open('bot.html', '_blank', 'noopener');
        right.insertBefore(bot, right.firstChild);

        const usersBtn = document.createElement('button');
        usersBtn.type = 'button';
        usersBtn.className = 'vss-head-btn';
        usersBtn.title = T('वापरकर्ते व परवानग्या', 'Users & permissions');
        usersBtn.innerHTML = '<i class="fa-solid fa-users-gear"></i>';
        usersBtn.onclick = usersModal;
        right.insertBefore(usersBtn, right.firstChild);
    }

    /* ---------------- boot ---------------- */
    function patchProfile() {
        if (typeof window.renderStudentProfile !== 'function' || window.renderStudentProfile.__m2) return;
        const orig = window.renderStudentProfile;
        const wrapped = function () {
            const r = orig.apply(this, arguments);
            setTimeout(() => { wirePhotoEdit(); renderSubjects(); }, 120);
            return r;
        };
        wrapped.__m2 = 1;
        window.renderStudentProfile = wrapped;
    }

    function boot() {
        try {
            syncAccounts();
            installNotifs();
            patchDashboard();
            patchProfile();
            window.renderSubjectsRatings = renderSubjects;
            attendanceGuard();
            rememberLogin();
            headerButtons();
            setInterval(() => { headerButtons(); rememberLogin(); }, 2000);
        } catch (e) { console.error('manage2 boot', e); }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 1400));
    else setTimeout(boot, 1400);
})();
