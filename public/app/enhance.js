/* =========================================================
   ENHANCEMENTS LAYER (loads after index.js)
   - New credentials (ankush)
   - Marathi by default
   - Admin dropdown menu in header (profile + settings + logout)
   - Fresh (empty) student directory + roll-number sorting
   - Daily Task: 3-session attendance + fee receipt (print / download / WhatsApp)
   ========================================================= */
(function () {
    'use strict';

    const T = {
        mr: {
            dailyTask: 'दैनंदिन कामे', attendance: 'दैनंदिन हजेरी', receipt: 'फी पावती',
            morning: 'सकाळ', evening: 'संध्याकाळ', school: 'शाळा',
            date: 'दिनांक', roll: 'हजेरी क्र.', name: 'विद्यार्थ्याचे नाव', present: 'हजर',
            save: 'हजेरी जतन करा', allPresent: 'सर्व हजर', allAbsent: 'सर्व गैरहजर',
            noStudents: 'अद्याप विद्यार्थी नाहीत. कृपया Excel मधून आयात करा.',
            selectStudent: 'विद्यार्थी निवडा', amount: 'रक्कम (₹)', mode: 'भरण्याची पद्धत',
            note: 'टीप', generate: 'पावती तयार करा', print: 'प्रिंट', download: 'डाउनलोड',
            whatsapp: 'पालकांना WhatsApp करा', saved: 'हजेरी जतन झाली!',
            profile: 'प्रोफाइल एडिट करा', settings: 'सेटिंग्ज', logout: 'लॉगआउट',
            language: 'भाषा', receiptTitle: 'फी पावती', receiptNo: 'पावती क्र.',
            paid: 'भरलेली रक्कम', due: 'बाकी', total: 'एकूण फी', parent: 'पालक',
            needStudent: 'कृपया विद्यार्थी निवडा', needAmount: 'कृपया रक्कम टाका'
        },
        en: {
            dailyTask: 'Daily Task', attendance: 'Daily Attendance', receipt: 'Fee Receipt',
            morning: 'Morning', evening: 'Evening', school: 'School',
            date: 'Date', roll: 'Roll No', name: 'Student Name', present: 'Present',
            save: 'Save Attendance', allPresent: 'All Present', allAbsent: 'All Absent',
            noStudents: 'No students yet. Please import from Excel.',
            selectStudent: 'Select Student', amount: 'Amount (₹)', mode: 'Payment Mode',
            note: 'Note', generate: 'Generate Receipt', print: 'Print', download: 'Download',
            whatsapp: 'Send to Parent (WhatsApp)', saved: 'Attendance saved!',
            profile: 'Edit Profile', settings: 'Settings', logout: 'Logout',
            language: 'Language', receiptTitle: 'Fee Receipt', receiptNo: 'Receipt No.',
            paid: 'Amount Paid', due: 'Balance Due', total: 'Total Fees', parent: 'Parent',
            needStudent: 'Please select a student', needAmount: 'Please enter an amount'
        }
    };
    const L = (k) => (T[(typeof currentLanguage !== 'undefined' ? currentLanguage : 'mr')] || T.mr)[k] || T.en[k];

    const CREDENTIALS = {
        ankush: { password: 'Ankush@1232', name: 'Ankush Maharaj Kadam', role: 'admin' },
        swapnil: { password: 'Swapnil@1232', name: 'Swapnil Vaidya', role: 'admin' }
    };

    /* ---------- 1. Ensure student data is intact ---------- */
    if (typeof studentsDatabase !== 'undefined' && (!studentsDatabase || studentsDatabase.length === 0)) {
        try {
            const raw = localStorage.getItem('vss_students');
            const arr = JSON.parse(raw || '[]');
            if (Array.isArray(arr) && arr.length > 0) {
                studentsDatabase = arr;
            } else if (typeof initialMockStudents !== 'undefined' && initialMockStudents.length > 0) {
                studentsDatabase = initialMockStudents;
                localStorage.setItem('vss_students', JSON.stringify(initialMockStudents));
            }
        } catch (_) { }
    }

    /* ---------- helpers ---------- */
    const esc = (s) => (typeof escapeHTML === 'function' ? escapeHTML(String(s ?? '')) : String(s ?? ''));
    const students = () => (typeof studentsDatabase !== 'undefined' && Array.isArray(studentsDatabase)) ? studentsDatabase : [];
    const nameOf = (s) => (typeof getStudentName === 'function' ? getStudentName(s) : (typeof s.name === 'object' ? s.name.mr : s.name));
    const toast = (m, t) => (typeof createToast === 'function' ? createToast(m, t || 'success') : console.log(m));
    const todayISO = () => new Date().toISOString().slice(0, 10);
    const persist = () => localStorage.setItem('vss_students', JSON.stringify(students()));

    /* ---------- 2. Login helpers: password eye + no stale lockout ---------- */
    function setupLoginHelpers() {
        sessionStorage.removeItem('vss_login_attempts');
        sessionStorage.removeItem('vss_login_locked_until');

        document.querySelectorAll('input[type="password"]').forEach((input) => {
            if (input.dataset.eyeReady) return;
            input.dataset.eyeReady = '1';
            const holder = input.parentElement;
            if (!holder) return;
            if (getComputedStyle(holder).position === 'static') holder.style.position = 'relative';
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'pw-eye-btn';
            btn.setAttribute('aria-label', 'Show password');
            btn.innerHTML = '<i class="fa-regular fa-eye"></i>';
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const show = input.type === 'password';
                input.type = show ? 'text' : 'password';
                btn.innerHTML = show ? '<i class="fa-regular fa-eye-slash"></i>' : '<i class="fa-regular fa-eye"></i>';
            });
            holder.appendChild(btn);
        });

        const uname = document.getElementById('username');
        if (uname) uname.setAttribute('autocapitalize', 'none');

        const hint = document.querySelector('.login-hint, #login-demo-hint');
        if (hint) hint.textContent = 'Ankush / Ankush@1232 | Swapnil / Swapnil@1232';
    }

    /* ---------- 2b. Confirm dialog before destructive actions ---------- */
    function askConfirm(message, onYes, opts) {
        const o = opts || {};
        const en = currentLanguage === 'en';
        const old = document.getElementById('vss-confirm');
        if (old) old.remove();
        const wrap = document.createElement('div');
        wrap.id = 'vss-confirm';
        wrap.className = 'vss-confirm-overlay';
        wrap.innerHTML = `
            <div class="vss-confirm-box">
                <div class="vss-confirm-icon ${o.danger === false ? 'is-info' : ''}"><i class="fa-solid ${o.danger === false ? 'fa-circle-question' : 'fa-triangle-exclamation'}"></i></div>
                <h3>${o.title || (en ? 'Are you sure?' : 'तुम्हाला खात्री आहे का?')}</h3>
                <p>${esc(message)}</p>
                <div class="vss-confirm-actions">
                    <button class="btn-secondary" data-no>${en ? 'Cancel' : 'नाही, रद्द करा'}</button>
                    <button class="${o.danger === false ? 'btn-primary' : 'btn-danger-confirm'}" data-yes>${o.confirmLabel || (en ? 'Yes, delete' : 'होय, हटवा')}</button>
                </div>
            </div>`;
        document.body.appendChild(wrap);
        wrap.querySelector('[data-no]').onclick = () => wrap.remove();
        wrap.addEventListener('click', (e) => { if (e.target === wrap) wrap.remove(); });
        wrap.querySelector('[data-yes]').onclick = () => { wrap.remove(); onYes(); };
    }


    function guardDestructiveActions() {
        // Replace native confirm() with the styled warning dialog
        const nativeConfirm = window.confirm;
        window.confirm = function (msg) {
            // native confirm cannot be async-wrapped safely; keep it but styled fallback
            return nativeConfirm.call(window, msg);
        };

        // Student delete: intercept before index.js handler runs
        document.querySelectorAll('#btn-delete-student').forEach((btn) => {
            btn.addEventListener('click', function (e) {
                if (btn.dataset.confirmed === '1') { btn.dataset.confirmed = ''; return; }
                e.preventDefault();
                e.stopImmediatePropagation();
                const who = (typeof selectedStudent !== 'undefined' && selectedStudent) ? nameOf(selectedStudent) : '';
                askConfirm(currentLanguage === 'en'
                    ? `This will permanently delete ${who}'s record. This cannot be undone.`
                    : `${who} यांचा संपूर्ण रेकॉर्ड कायमचा हटवला जाईल. ही कृती परत करता येणार नाही.`,
                    () => { btn.dataset.confirmed = '1'; btn.click(); });
            }, true);
        });

        // Restore backup replaces all data
        const restore = document.getElementById('file-restore-upload');
        if (restore) {
            restore.addEventListener('change', function (e) {
                if (restore.dataset.confirmed === '1') { restore.dataset.confirmed = ''; return; }
                e.preventDefault();
                e.stopImmediatePropagation();
                askConfirm(currentLanguage === 'en'
                    ? 'Restoring will replace ALL current student data with the backup file.'
                    : 'बॅकअप पुनर्संचयित केल्यास सध्याचा सर्व विद्यार्थी डेटा बदलला जाईल.',
                    () => { restore.dataset.confirmed = '1'; restore.dispatchEvent(new Event('change')); });
            }, true);
        }
    }

    /* ---------- 3. Marathi by default ---------- */
    function applyDefaultLanguage() {
        const saved = localStorage.getItem('vss_lang') || 'mr';
        localStorage.setItem('vss_lang', saved);
        if (typeof setLanguage === 'function') setLanguage(saved);
        ['#lang-en', '#lang-mr'].forEach((sel) => {
            document.querySelectorAll(sel).forEach((b) =>
                b.addEventListener('click', () => localStorage.setItem('vss_lang', sel === '#lang-en' ? 'en' : 'mr')));
        });
    }

    /* ---------- 4. Admin dropdown ---------- */
    function buildAdminDropdown() {
        const host = document.querySelector('.header-user');
        if (!host || host.querySelector('.admin-dropdown')) return;

        const dd = document.createElement('div');
        dd.className = 'admin-dropdown d-none';
        dd.id = 'admin-dropdown';
        dd.innerHTML = `
            <div class="admin-dd-head">
                <div class="admin-dd-avatar" id="admin-dd-avatar">AD</div>
                <div>
                    <h5 id="admin-dd-name">Admin</h5>
                    <p id="admin-dd-role">Administrator</p>
                </div>
            </div>
            <button class="admin-dd-item" data-act="profile"><i class="fa-solid fa-user-pen"></i><span>${L('profile')}</span></button>
            <button class="admin-dd-item" data-act="settings"><i class="fa-solid fa-gear"></i><span>${L('settings')}</span></button>
            <div class="admin-dd-sep"></div>
            <div class="admin-dd-lang">
                <button class="lang-en-btn" data-lang="en">EN</button>
                <button class="lang-mr-btn" data-lang="mr">मराठी</button>
            </div>
            <div class="admin-dd-sep"></div>
            <button class="admin-dd-item danger" data-act="logout"><i class="fa-solid fa-arrow-right-from-bracket"></i><span>${L('logout')}</span></button>
        `;
        host.appendChild(dd);

        document.getElementById('header-user-avatar')?.addEventListener('click', (e) => {
            e.stopPropagation();
            syncDropdownIdentity();
            dd.classList.toggle('d-none');
        });
        document.addEventListener('click', () => dd.classList.add('d-none'));
        dd.addEventListener('click', (e) => e.stopPropagation());

        dd.querySelectorAll('.admin-dd-lang button').forEach((b) => {
            b.addEventListener('click', () => {
                const lang = b.getAttribute('data-lang');
                localStorage.setItem('vss_lang', lang);
                if (typeof setLanguage === 'function') setLanguage(lang);
                refreshDropdownLabels();
                const oldCard = document.getElementById('excel-tools-card');
                if (oldCard) oldCard.remove();
                buildExcelTools();
            });
        });

        dd.querySelectorAll('.admin-dd-item').forEach((btn) => {
            btn.addEventListener('click', () => {
                const act = btn.getAttribute('data-act');
                dd.classList.add('d-none');
                if (act === 'logout') { document.getElementById('btn-logout')?.click(); return; }
                if (typeof loadAdminProfileData === 'function') loadAdminProfileData();
                if (typeof switchPanel === 'function') switchPanel('panel-admin-profile');
                if (act === 'settings') {
                    const tabs = document.querySelectorAll('#admin-settings-tabs .profile-tab-btn');
                    if (tabs.length > 1) tabs[1].click();
                }
            });
        });
    }

    function refreshDropdownLabels() {
        const dd = document.getElementById('admin-dropdown');
        if (!dd) return;
        dd.querySelector('[data-act="profile"] span').textContent = L('profile');
        dd.querySelector('[data-act="settings"] span').textContent = L('settings');
        dd.querySelector('[data-act="logout"] span').textContent = L('logout');
        dd.querySelectorAll('.admin-dd-lang button').forEach((b) =>
            b.classList.toggle('active', b.getAttribute('data-lang') === currentLanguage));
        const dtLabel = document.querySelector('#menu-daily-task span');
        if (dtLabel) dtLabel.textContent = L('dailyTask');
    }

    function syncDropdownIdentity() {
        const av = document.getElementById('admin-dd-avatar');
        const nm = document.getElementById('admin-dd-name');
        const src = document.getElementById('header-user-avatar');
        if (av && src) av.innerHTML = src.innerHTML;
        if (nm && typeof currentUser !== 'undefined' && currentUser) nm.textContent = currentUser.name;
        refreshDropdownLabels();
    }

    /* ---------- 5. Roll-number ordering in directory ---------- */
    function applyRollSorting() {
        if (typeof renderStudentTable !== 'function') return;
        const original = renderStudentTable;
        window.renderStudentTable = function () {
            original.apply(this, arguments);
            const tbody = document.getElementById('students-table-body');
            if (!tbody) return;
            const rows = Array.from(tbody.children);
            rows.sort((a, b) => {
                const getRoll = (el) => parseInt(el.getAttribute('data-roll') || el.querySelector('.avatar-roll-number')?.textContent || el.children[0]?.textContent || '0', 10);
                const ra = getRoll(a);
                const rb = getRoll(b);
                return (sortDirection === 'desc') ? rb - ra : ra - rb;
            });
            rows.forEach((r) => tbody.appendChild(r));
        };
        renderStudentTable = window.renderStudentTable;
    }

    /* ---------- 6. Daily Task panel ---------- */
    let dtTab = 'attendance';
    let dtSession = 'morning';

    function injectDailyTaskNav() {
        const menu = document.querySelector('.sidebar-menu');
        if (!menu || document.getElementById('menu-daily-task')) return;
        const a = document.createElement('a');
        a.href = '#';
        a.id = 'menu-daily-task';
        a.className = 'menu-item';
        a.setAttribute('data-target', 'panel-daily-task');
        a.innerHTML = `<i class="fa-solid fa-list-check"></i> <span>${L('dailyTask')}</span>`;
        const after = menu.querySelector('.menu-item[data-target="panel-students"]');
        after ? after.insertAdjacentElement('afterend', a) : menu.appendChild(a);
        a.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof switchPanel === 'function') switchPanel('panel-daily-task');
            const t = document.getElementById('page-title');
            if (t) t.textContent = L('dailyTask');
            renderDailyTaskPanel();
        });

        const main = document.querySelector('.app-main-content');
        if (main && !document.getElementById('panel-daily-task')) {
            const panel = document.createElement('div');
            panel.id = 'panel-daily-task';
            panel.className = 'content-panel d-none';
            main.appendChild(panel);
        }
    }

    function renderDailyTaskPanel() {
        const panel = document.getElementById('panel-daily-task');
        if (!panel) return;
        const adarshLbl = currentLanguage === 'en' ? 'Star Student of the Week' : 'आदर्श विद्यार्थी (आठवडा)';
        panel.innerHTML = `
            <div class="dt-tabs">
                <button class="dt-tab ${dtTab === 'attendance' ? 'active' : ''}" data-dt="attendance"><i class="fa-solid fa-calendar-check"></i> ${L('attendance')}</button>
                <button class="dt-tab ${dtTab === 'receipt' ? 'active' : ''}" data-dt="receipt"><i class="fa-solid fa-receipt"></i> ${L('receipt')}</button>
                <button class="dt-tab ${dtTab === 'adarsh' ? 'active' : ''}" data-dt="adarsh"><i class="fa-solid fa-star"></i> ${adarshLbl}</button>
            </div>
            <div class="content-card"><div class="card-body" id="dt-body"></div></div>
        `;
        panel.querySelectorAll('.dt-tab').forEach((b) => b.addEventListener('click', () => {
            dtTab = b.getAttribute('data-dt');
            renderDailyTaskPanel();
        }));
        if (dtTab === 'attendance') renderAttendanceTask();
        else if (dtTab === 'receipt') renderReceiptTask();
        else renderAdarshTask();
    }

    /* ---------- 6b. Adarsh Vidyarthi (star student of the week) ---------- */
    const ADARSH_KEY = 'vss_adarsh_week';
    const getAdarsh = () => { try { return JSON.parse(localStorage.getItem(ADARSH_KEY) || '[]'); } catch (_) { return []; } };
    const setAdarsh = (v) => localStorage.setItem(ADARSH_KEY, JSON.stringify(v));
    function currentWeekValue() {
        const d = new Date();
        const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        const day = t.getUTCDay() || 7;
        t.setUTCDate(t.getUTCDate() + 4 - day);
        const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
        const wk = Math.ceil((((t - y0) / 86400000) + 1) / 7);
        return `${t.getUTCFullYear()}-W${String(wk).padStart(2, '0')}`;
    }

    function renderAdarshTask() {
        const body = document.getElementById('dt-body');
        const en = currentLanguage === 'en';
        const list = [...students()].sort((a, b) => Number(a.rollNo || 0) - Number(b.rollNo || 0));
        const saved = getAdarsh();
        if (!list.length) { body.innerHTML = `<div class="dt-empty">${L('noStudents')}</div>`; return; }

        body.innerHTML = `
            <div class="dt-receipt-grid">
                <div class="form-group">
                    <label>${en ? 'Week' : 'आठवडा'}</label>
                    <input type="week" id="ad-week" class="form-control" value="${currentWeekValue()}">
                </div>
                <div class="form-group">
                    <label>${en ? 'Student' : 'विद्यार्थी'}</label>
                    <select id="ad-student" class="form-control">
                        ${list.map((s) => `<option value="${esc(s.id)}">${esc(s.rollNo)} — ${esc(nameOf(s))}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group" style="grid-column:1/-1">
                    <label>${en ? 'Reason / Remark' : 'कारण / शेरा'}</label>
                    <input type="text" id="ad-note" class="form-control" placeholder="—">
                </div>
            </div>
            <div class="dt-actions">
                <button class="btn-primary" id="ad-save"><i class="fa-solid fa-star"></i> ${en ? 'Save Star Student' : 'आदर्श विद्यार्थी जतन करा'}</button>
            </div>
            <h4 style="margin:22px 0 10px">${en ? 'Selected so far' : 'आतापर्यंत निवडलेले'}</h4>
            ${saved.length ? `<table class="dt-att-table"><tbody>
                ${saved.slice().reverse().map((a) => `<tr>
                    <td><b>${esc(a.week)}</b></td>
                    <td>${esc(a.name)}${a.note ? ` <small style="opacity:.6">— ${esc(a.note)}</small>` : ''}</td>
                    <td style="text-align:right"><button class="btn-secondary btn-sm" data-del="${esc(a.week)}"><i class="fa-solid fa-trash"></i></button></td>
                </tr>`).join('')}
            </tbody></table>` : `<div class="dt-empty">${en ? 'No star student selected yet.' : 'अद्याप कोणीही निवडलेले नाही.'}</div>`}
        `;

        document.getElementById('ad-save').onclick = () => {
            const week = document.getElementById('ad-week').value || currentWeekValue();
            const stud = students().find((s) => String(s.id) === document.getElementById('ad-student').value);
            if (!stud) { toast(L('needStudent'), 'warning'); return; }
            const arr = getAdarsh().filter((a) => a.week !== week);
            arr.push({ week, id: stud.id, name: nameOf(stud), rollNo: stud.rollNo, note: document.getElementById('ad-note').value || '' });
            arr.sort((a, b) => a.week.localeCompare(b.week));
            setAdarsh(arr);
            toast(en ? 'Star student saved!' : 'आदर्श विद्यार्थी जतन झाला!');
            renderAdarshTask();
        };
        body.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => {
            const wk = b.getAttribute('data-del');
            askConfirm(en ? `Remove star student for ${wk}?` : `${wk} साठी निवड काढून टाकायची?`, () => {
                setAdarsh(getAdarsh().filter((a) => a.week !== wk));
                renderAdarshTask();
            });
        }));
    }

    function renderAttendanceTask() {
        const body = document.getElementById('dt-body');
        const en = currentLanguage === 'en';
        const list = students();
        const date = document.getElementById('dt-date')?.value || todayISO();
        body.innerHTML = `
            <div class="dt-toolbar">
                <label>${L('date')}</label>
                <input type="date" id="dt-date" value="${date}">
                <div class="dt-session-chips">
                    ${['morning', 'evening', 'school'].map((s) =>
                        `<button class="dt-chip ${dtSession === s ? 'active' : ''}" data-session="${s}">${L(s)}</button>`).join('')}
                </div>
            </div>
            <p class="dt-att-note">${en
                ? 'Tick ONLY the students who are ABSENT — everyone else is saved as present automatically.'
                : 'फक्त गैरहजर विद्यार्थ्यांना टिक करा — बाकी सर्व आपोआप हजर होतील.'}</p>
            <div id="dt-att-wrap"></div>
        `;
        body.querySelectorAll('.dt-chip').forEach((c) => c.addEventListener('click', () => {
            dtSession = c.getAttribute('data-session');
            renderAttendanceTask();
        }));
        document.getElementById('dt-date').addEventListener('change', renderAttendanceTask);

        const wrap = document.getElementById('dt-att-wrap');
        if (!list.length) { wrap.innerHTML = `<div class="dt-empty">${L('noStudents')}</div>`; return; }

        const sorted = [...list].sort((a, b) => Number(a.rollNo || 0) - Number(b.rollNo || 0));
        const absentLbl = en ? 'Absent' : 'गैरहजर';
        const alreadySaved = sorted.some((s) => {
            const day = s.dailyAttendance && s.dailyAttendance[date];
            return day && Object.prototype.hasOwnProperty.call(day, dtSession);
        });
        wrap.innerHTML = `
            ${alreadySaved ? `<div class="dt-saved-banner"><i class="fa-solid fa-circle-check"></i> ${en
                ? 'This attendance is already saved — you can change it and save again.'
                : 'ही हजेरी आधीच जतन केली आहे — बदलून पुन्हा जतन करू शकता.'}</div>` : ''}
            <div class="dt-att-tools">
                <input type="search" id="dt-att-search" class="dt-att-search" placeholder="${en ? 'Search name or roll…' : 'नाव किंवा हजेरी क्र. शोधा…'}">
                <div class="dt-att-counter" id="dt-att-counter"></div>
            </div>
            <div class="dt-att-scroll">
            <table class="dt-att-table">
                <thead><tr><th>${L('roll')}</th><th>${L('name')}</th><th style="text-align:right">${absentLbl}</th></tr></thead>
                <tbody>
                ${sorted.map((s) => {
                    const day = s.dailyAttendance && s.dailyAttendance[date];
                    const marked = day && Object.prototype.hasOwnProperty.call(day, dtSession);
                    const isAbsent = marked && !day[dtSession];
                    return `<tr class="dt-att-row ${isAbsent ? 'is-absent' : ''}" data-search="${esc((s.rollNo || '') + ' ' + nameOf(s)).toLowerCase()}">
                        <td><b>${esc(s.rollNo)}</b></td>
                        <td>${esc(nameOf(s))}</td>
                        <td style="text-align:right"><input type="checkbox" class="dt-att-check" data-id="${esc(s.id)}" ${isAbsent ? 'checked' : ''}></td>
                    </tr>`;
                }).join('')}
                </tbody>
            </table>
            </div>
            <div class="dt-actions">
                <button class="btn-secondary" id="dt-all-present">${L('allPresent')}</button>
                <button class="btn-secondary" id="dt-all-absent">${L('allAbsent')}</button>
                <button class="btn-primary" id="dt-save-att"><i class="fa-solid fa-floppy-disk"></i> ${L('save')}</button>
            </div>
        `;
        const boxes = () => wrap.querySelectorAll('.dt-att-check');
        const syncCounter = () => {
            let absent = 0;
            boxes().forEach((b) => {
                const row = b.closest('tr');
                if (row) row.classList.toggle('is-absent', b.checked);
                if (b.checked) absent++;
            });
            const total = sorted.length;
            const c = document.getElementById('dt-att-counter');
            if (c) {
                c.innerHTML = `<span class="pill-present">${en ? 'Present' : 'हजर'} ${total - absent}</span>
                    <span class="pill-absent">${absentLbl} ${absent}</span>
                    <span class="pill-total">${en ? 'Total' : 'एकूण'} ${total}</span>`;
            }
        };
        boxes().forEach((b) => b.addEventListener('change', syncCounter));
        syncCounter();

        const search = document.getElementById('dt-att-search');
        if (search) search.addEventListener('input', () => {
            const q = search.value.trim().toLowerCase();
            wrap.querySelectorAll('.dt-att-row').forEach((r) => {
                r.style.display = !q || (r.getAttribute('data-search') || '').includes(q) ? '' : 'none';
            });
        });

        document.getElementById('dt-all-present').onclick = () => { boxes().forEach((b) => (b.checked = false)); syncCounter(); };
        document.getElementById('dt-all-absent').onclick = () => { boxes().forEach((b) => (b.checked = true)); syncCounter(); };
        document.getElementById('dt-save-att').onclick = () => {
            const absentees = [];
            boxes().forEach((b) => { if (b.checked) absentees.push(b.getAttribute('data-id')); });
            const rolls = absentees.map((id) => {
                const s = list.find((x) => String(x.id) === id);
                return s ? s.rollNo : '';
            }).filter(Boolean).join(', ');
            const msg = en
                ? `${absentees.length} absent${rolls ? ` (roll ${rolls})` : ''}. Remaining ${sorted.length - absentees.length} will be saved present. Save?`
                : `${absentees.length} विद्यार्थी गैरहजर${rolls ? ` (हजेरी क्र. ${rolls})` : ''}. उरलेले ${sorted.length - absentees.length} हजर म्हणून जतन होतील. जतन करायचे?`;
            askConfirm(msg, () => {
                boxes().forEach((b) => {
                    const stud = list.find((s) => String(s.id) === b.getAttribute('data-id'));
                    if (!stud) return;
                    stud.dailyAttendance = stud.dailyAttendance || {};
                    stud.dailyAttendance[date] = stud.dailyAttendance[date] || {};
                    stud.dailyAttendance[date][dtSession] = !b.checked;
                });
                persist();
                toast(`${L('saved')} (${absentLbl}: ${absentees.length})`);
                refreshEverywhere();
                renderAttendanceTask();
            }, { confirmLabel: en ? 'Yes, save' : 'होय, जतन करा', danger: false });
        };
    }

    /* refresh every view that shows attendance / counts */
    function refreshEverywhere() {
        try { if (typeof renderDashboardMetrics === 'function') renderDashboardMetrics(); } catch (_) { }
        try { if (typeof renderStudentTable === 'function') renderStudentTable(); } catch (_) { }
        try {
            const prof = document.getElementById('attendance-calendar');
            if (prof && typeof renderAttendanceGrid === 'function' && typeof activeStudentData !== 'undefined' && activeStudentData) {
                renderAttendanceGrid();
            }
        } catch (_) { }
        document.dispatchEvent(new CustomEvent('vss:data-changed'));
    }
    window.vssRefreshEverywhere = refreshEverywhere;



    /* ---------- 7. Fee receipt ---------- */
    function renderReceiptTask() {
        const body = document.getElementById('dt-body');
        const list = [...students()].sort((a, b) => Number(a.rollNo || 0) - Number(b.rollNo || 0));
        if (!list.length) { body.innerHTML = `<div class="dt-empty">${L('noStudents')}</div>`; return; }

        body.innerHTML = `
            <div class="dt-receipt-grid">
                <div class="form-group">
                    <label>${L('selectStudent')}</label>
                    <select id="rc-student" class="form-control">
                        ${list.map((s) => `<option value="${esc(s.id)}">${esc(s.rollNo)} — ${esc(nameOf(s))}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>${L('amount')}</label>
                    <input type="number" min="1" id="rc-amount" class="form-control" placeholder="0">
                </div>
                <div class="form-group">
                    <label>${L('date')}</label>
                    <input type="date" id="rc-date" class="form-control" value="${todayISO()}">
                </div>
                <div class="form-group">
                    <label>${L('mode')}</label>
                    <select id="rc-mode" class="form-control">
                        <option value="Cash">Cash / रोख</option>
                        <option value="UPI">UPI</option>
                        <option value="Cheque">Cheque / धनादेश</option>
                        <option value="Bank">Bank Transfer</option>
                    </select>
                </div>
                <div class="form-group" style="grid-column:1/-1">
                    <label>${L('note')}</label>
                    <input type="text" id="rc-note" class="form-control" placeholder="—">
                </div>
            </div>
            <div class="dt-actions">
                <button class="btn-primary" id="rc-print"><i class="fa-solid fa-print"></i> ${L('print')}</button>
                <button class="btn-secondary" id="rc-download"><i class="fa-solid fa-download"></i> ${L('download')}</button>
                <button class="btn-secondary" id="rc-whatsapp" style="border-color:#25D366;color:#128C7E"><i class="fa-brands fa-whatsapp"></i> ${L('whatsapp')}</button>
            </div>
        `;

        const collect = () => {
            const stud = students().find((s) => String(s.id) === document.getElementById('rc-student').value);
            const amount = Number(document.getElementById('rc-amount').value || 0);
            if (!stud) { toast(L('needStudent'), 'warning'); return null; }
            if (!amount) { toast(L('needAmount'), 'warning'); return null; }
            return {
                stud, amount,
                date: document.getElementById('rc-date').value || todayISO(),
                mode: document.getElementById('rc-mode').value,
                note: document.getElementById('rc-note').value || '',
                no: 'R' + Date.now().toString().slice(-8)
            };
        };

        const recordPayment = (d) => {
            d.stud.fees = d.stud.fees || { total: 0, paid: 0, payments: [] };
            d.stud.fees.paid = Number(d.stud.fees.paid || 0) + d.amount;
            d.stud.fees.payments = d.stud.fees.payments || [];
            d.stud.fees.payments.push({ date: d.date, amount: d.amount, mode: d.mode, note: d.note, receiptNo: d.no });
            persist();
            if (typeof renderDashboardMetrics === 'function') renderDashboardMetrics();
            if (typeof renderStudentTable === 'function') renderStudentTable();
        };

        document.getElementById('rc-print').onclick = () => {
            const d = collect(); if (!d) return;
            recordPayment(d);
            const w = window.open('', '_blank');
            w.document.write(receiptHTML(d));
            w.document.close();
            w.focus();
            setTimeout(() => w.print(), 400);
        };

        document.getElementById('rc-download').onclick = () => {
            const d = collect(); if (!d) return;
            recordPayment(d);
            const blob = new Blob([receiptHTML(d)], { type: 'text/html;charset=utf-8' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `Receipt-${d.no}-${nameOf(d.stud)}.html`;
            a.click();
            URL.revokeObjectURL(a.href);
        };

        document.getElementById('rc-whatsapp').onclick = () => {
            const d = collect(); if (!d) return;
            recordPayment(d);
            const total = Number(d.stud.fees?.total || 0);
            const due = Math.max(total - Number(d.stud.fees?.paid || 0), 0);
            const msg = `*वारकरी संस्था — ${L('receiptTitle')}*\n` +
                `${L('receiptNo')}: ${d.no}\n${L('date')}: ${d.date}\n` +
                `${L('name')}: ${nameOf(d.stud)} (${L('roll')} ${d.stud.rollNo})\n` +
                `${L('paid')}: ₹${d.amount.toLocaleString('en-IN')} (${d.mode})\n` +
                `${L('due')}: ₹${due.toLocaleString('en-IN')}\n${d.note ? d.note + '\n' : ''}` +
                `धन्यवाद 🙏`;
            const phone = String(d.stud.phone || '').replace(/\D/g, '');
            const wa = phone ? `https://wa.me/91${phone.slice(-10)}?text=` : 'https://wa.me/?text=';
            window.open(wa + encodeURIComponent(msg), '_blank');
        };
    }

    function receiptHTML(d) {
        const total = Number(d.stud.fees?.total || 0);
        const paid = Number(d.stud.fees?.paid || 0);
        const due = Math.max(total - paid, 0);
        return `<!DOCTYPE html><html lang="mr"><head><meta charset="utf-8">
<title>${L('receiptTitle')} ${d.no}</title>
<style>
body{font-family:'Noto Sans Devanagari',Arial,sans-serif;padding:32px;color:#222}
.box{max-width:720px;margin:auto;border:2px solid #ff7b00;border-radius:14px;padding:28px}
h1{margin:0;font-size:1.4rem;color:#ff7b00;text-align:center}
h2{margin:4px 0 22px;font-size:1rem;text-align:center;font-weight:500}
table{width:100%;border-collapse:collapse;margin-top:14px}
td{padding:10px 8px;border-bottom:1px solid #eee;font-size:.95rem}
td:last-child{text-align:right;font-weight:600}
.f{margin-top:26px;display:flex;justify-content:space-between;font-size:.85rem;color:#666}
@media print{body{padding:0}}
</style></head><body><div class="box">
<h1>वारकरी संस्था / Varkari Sanstha</h1>
<h2>${L('receiptTitle')}</h2>
<table>
<tr><td>${L('receiptNo')}</td><td>${d.no}</td></tr>
<tr><td>${L('date')}</td><td>${d.date}</td></tr>
<tr><td>${L('name')}</td><td>${esc(nameOf(d.stud))}</td></tr>
<tr><td>${L('roll')}</td><td>${esc(d.stud.rollNo)}</td></tr>
<tr><td>${L('parent')}</td><td>${esc(d.stud.parentName || '—')}</td></tr>
<tr><td>${L('paid')}</td><td>₹${d.amount.toLocaleString('en-IN')} (${esc(d.mode)})</td></tr>
<tr><td>${L('total')}</td><td>₹${total.toLocaleString('en-IN')}</td></tr>
<tr><td>${L('due')}</td><td>₹${due.toLocaleString('en-IN')}</td></tr>
${d.note ? `<tr><td>${L('note')}</td><td>${esc(d.note)}</td></tr>` : ''}
</table>
<div class="f"><span>${L('receiptTitle')} — computer generated</span><span>अधिकृत सही / Signature</span></div>
</div></body></html>`;
    }

    /* ---------- 7b. Keep header/sidebar identity in sync with logged-in user ---------- */
    function patchAdminUI() {
        if (typeof updateAdminUI !== 'function') return;
        const orig = updateAdminUI;
        window.updateAdminUI = function () {
            orig.apply(this, arguments);
            if (typeof currentUser === 'undefined' || !currentUser) return;
            const n = document.getElementById('sidebar-user-name');
            if (n) n.textContent = currentUser.name;
            const ini = currentUser.name.split(' ').map((x) => x[0]).join('').substring(0, 2).toUpperCase();
            ['header-user-avatar', 'sidebar-user-avatar'].forEach((id) => {
                const el = document.getElementById(id);
                if (el && !el.querySelector('img')) el.textContent = ini;
            });
        };
        try { updateAdminUI = window.updateAdminUI; } catch (_) {}
        if (typeof launchApp === 'function') {
            const origLaunch = launchApp;
            window.launchApp = function () {
                origLaunch.apply(this, arguments);
                setTimeout(() => window.updateAdminUI(), 60);
            };
            try { launchApp = window.launchApp; } catch (_) {}
        }
    }

    /* ---------- 7b. Excel import / export ---------- */
    const XL_HEADERS_MR = ['अ. क्र.', 'विद्यार्थ्याचे नाव', 'वर्ग', 'फोन नंबर', 'पालकांचे नाव', 'पत्ता', 'जमा फी', 'बाकी फी', 'एकूण फी'];

    function saveStudents() {
        localStorage.setItem('vss_students', JSON.stringify(studentsDatabase));
        if (typeof renderStudentTable === 'function') renderStudentTable();
        if (typeof renderDashboard === 'function') { try { renderDashboard(); } catch (_) {} }
    }

    function exportExcel() {
        if (typeof XLSX === 'undefined') {
            createToast(currentLanguage === 'en' ? 'Excel library not loaded.' : 'एक्सेल लायब्ररी लोड झाली नाही.', 'danger');
            return;
        }
        const rows = (studentsDatabase || []).map((s, i) => ({
            'अ. क्र.': s.rollNo || i + 1,
            'विद्यार्थ्याचे नाव': (s.name && s.name.mr) || s.name || '',
            'वर्ग': s.standard || '',
            'फोन नंबर': s.phone || '',
            'पालकांचे नाव': s.parentName || '',
            'पत्ता': s.address || '',
            'जमा फी': (s.fees && s.fees.paid) || 0,
            'बाकी फी': Math.max(0, ((s.fees && s.fees.total) || 0) - ((s.fees && s.fees.paid) || 0)),
            'एकूण फी': (s.fees && s.fees.total) || 0
        }));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows, { header: XL_HEADERS_MR }), 'Basic Information');
        const today = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(wb, `विद्यार्थी-यादी-${today}.xlsx`);
        createToast(currentLanguage === 'en' ? 'Excel file downloaded.' : 'एक्सेल फाईल डाउनलोड झाली.', 'success');
    }

    function pick(row, keys) {
        for (const k of keys) {
            const hit = Object.keys(row).find((h) => String(h).trim() === k);
            if (hit !== undefined && row[hit] !== undefined && row[hit] !== null && String(row[hit]).trim() !== '') return row[hit];
        }
        return '';
    }

    function importRows(rows, mode) {
        let added = 0, updated = 0;
        let maxRoll = (studentsDatabase || []).reduce((m, s) => Math.max(m, Number(s.rollNo) || 0), 100);
        if (mode === 'replace') { studentsDatabase = []; maxRoll = 100; }
        rows.forEach((row) => {
            const nameMr = String(pick(row, ['विद्यार्थ्याचे नाव', 'Name', 'name', 'विद्यार्थी'])).trim();
            if (!nameMr) return;
            const std = String(pick(row, ['वर्ग', 'Class', 'Standard'])).replace(/\.0$/, '').trim();
            const phone = String(pick(row, ['फोन नंबर', 'Phone', 'Mobile'])).replace(/\.0$/, '').trim();
            const parent = String(pick(row, ['पालकांचे नाव', 'Parent', 'Parent Name'])).trim();
            const addr = String(pick(row, ['पत्ता', 'Address'])).trim();
            const paid = Number(pick(row, ['जमा फी', 'Paid Fees', 'Paid']) || 0) || 0;
            const total = Number(pick(row, ['एकूण फी', 'Total Fees', 'Total']) || 0) || 0;
            const existing = studentsDatabase.find((s) => ((s.name && s.name.mr) || s.name) === nameMr);
            if (existing) {
                existing.standard = std || existing.standard;
                existing.phone = phone || existing.phone;
                existing.parentName = parent || existing.parentName;
                existing.address = addr || existing.address;
                existing.fees = existing.fees || { total: 0, paid: 0, ledger: [] };
                if (total) existing.fees.total = total;
                if (paid) existing.fees.paid = paid;
                updated++;
            } else {
                const roll = Number(pick(row, ['अ. क्र.', 'Roll No', 'Roll'])) || ++maxRoll;
                maxRoll = Math.max(maxRoll, roll);
                studentsDatabase.push({
                    id: 'stud-' + roll + '-' + Date.now().toString(36),
                    name: { en: nameMr, mr: nameMr },
                    rollNo: roll,
                    standard: std, section: '', phone: phone, parentName: parent, address: addr,
                    emergencyContact: phone,
                    attendance: [], sessionAttendance: {},
                    subjects: { Marathi: '', Hindi: '', English: '', Maths: '', Science: '' },
                    examHistory: [], remarks: [], complaints: [],
                    medical: { bloodGroup: '', allergies: '', illness: '', doctorNotes: '' },
                    fees: { total: total, paid: paid, ledger: [] },
                    documents: []
                });
                added++;
            }
        });
        studentsDatabase.sort((a, b) => (Number(a.rollNo) || 0) - (Number(b.rollNo) || 0));
        saveStudents();
        createToast(currentLanguage === 'en'
            ? `Import complete: ${added} added, ${updated} updated.`
            : `आयात पूर्ण: ${added} नवीन, ${updated} अद्ययावत.`, 'success');
    }

    function handleExcelFile(file, mode) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const wb = XLSX.read(new Uint8Array(ev.target.result), { type: 'array' });
                const sheet = wb.SheetNames.find((n) => /basic/i.test(n)) || wb.SheetNames[0];
                const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheet], { defval: '' });
                if (!rows.length) throw new Error('empty');
                importRows(rows, mode);
            } catch (err) {
                createToast(currentLanguage === 'en' ? 'Could not read this file.' : 'ही फाईल वाचता आली नाही.', 'danger');
            }
        };
        reader.readAsArrayBuffer(file);
    }

    function buildExcelTools() {
        const panel = document.getElementById('panel-import');
        if (!panel || document.getElementById('excel-tools-card')) return;
        const card = document.createElement('div');
        card.className = 'card excel-tools-card';
        card.id = 'excel-tools-card';
        card.innerHTML = `
            <div class="card-header"><h3><i class="fa-solid fa-file-excel"></i> ${currentLanguage === 'en' ? 'Excel Import / Export' : 'एक्सेल आयात / निर्यात'}</h3></div>
            <div class="excel-tools-body">
                <p class="excel-hint">${currentLanguage === 'en'
                    ? 'Upload an .xlsx file with the "Basic Information" sheet, or download the current student list as Excel.'
                    : '"Basic Information" शीट असलेली .xlsx फाईल अपलोड करा, किंवा सध्याची विद्यार्थी यादी एक्सेलमध्ये डाउनलोड करा.'}</p>
                <div class="excel-tools-actions">
                    <button class="btn-excel primary" id="btn-excel-add"><i class="fa-solid fa-file-arrow-up"></i> ${currentLanguage === 'en' ? 'Import Excel (add / update)' : 'एक्सेल आयात (जोडा / अद्ययावत)'}</button>
                    <button class="btn-excel warn" id="btn-excel-replace"><i class="fa-solid fa-rotate"></i> ${currentLanguage === 'en' ? 'Import & replace all' : 'आयात करून सर्व बदला'}</button>
                    <button class="btn-excel ok" id="btn-excel-export"><i class="fa-solid fa-file-arrow-down"></i> ${currentLanguage === 'en' ? 'Export to Excel' : 'एक्सेलमध्ये निर्यात'}</button>
                </div>
                <input type="file" id="excel-file-input" accept=".xlsx,.xls,.csv" hidden>
            </div>`;
        panel.insertBefore(card, panel.children[1] || null);

        const input = card.querySelector('#excel-file-input');
        let mode = 'add';
        input.addEventListener('change', () => {
            const f = input.files && input.files[0];
            input.value = '';
            if (!f) return;
            if (mode === 'replace') {
                askConfirm(currentLanguage === 'en'
                    ? 'All current students will be removed and replaced by this file.'
                    : 'सध्याचे सर्व विद्यार्थी काढून टाकून या फाईलमधील डेटा भरला जाईल.',
                    () => handleExcelFile(f, 'replace'));
            } else {
                handleExcelFile(f, 'add');
            }
        });
        card.querySelector('#btn-excel-add').onclick = () => { mode = 'add'; input.click(); };
        card.querySelector('#btn-excel-replace').onclick = () => { mode = 'replace'; input.click(); };
        card.querySelector('#btn-excel-export').onclick = exportExcel;
    }

    /* ---------- 7c. Edit every student detail from the report page ---------- */
    function injectStudentEditButton() {
        const bar = document.querySelector('#panel-student-profile .profile-action-buttons');
        if (!bar || document.getElementById('btn-edit-student-all')) return;
        const btn = document.createElement('button');
        btn.id = 'btn-edit-student-all';
        btn.className = 'btn-primary';
        btn.innerHTML = `<i class="fa-solid fa-user-pen"></i> <span>${currentLanguage === 'en' ? 'Edit Details' : 'माहिती संपादित करा'}</span>`;
        btn.addEventListener('click', openStudentEditor);
        bar.insertBefore(btn, bar.firstChild);
    }

    function openStudentEditor() {
        if (typeof selectedStudent === 'undefined' || !selectedStudent) return;
        const s = selectedStudent;
        const en = currentLanguage === 'en';
        const F = [
            ['nameMr', en ? 'Name (Marathi)' : 'नाव (मराठी)', (typeof s.name === 'object' ? s.name.mr : s.name) || '', 'text'],
            ['nameEn', en ? 'Name (English)' : 'नाव (इंग्रजी)', (typeof s.name === 'object' ? s.name.en : s.name) || '', 'text'],
            ['rollNo', en ? 'Roll No' : 'हजेरी क्र.', s.rollNo || '', 'number'],
            ['standard', en ? 'Class' : 'वर्ग', s.standard || '', 'text'],
            ['section', en ? 'Section' : 'तुकडी', s.section || '', 'text'],
            ['phone', en ? 'Phone' : 'फोन', s.phone || '', 'text'],
            ['parentName', en ? 'Parent Name' : 'पालकांचे नाव', s.parentName || '', 'text'],
            ['emergencyContact', en ? 'Emergency Contact' : 'आपत्कालीन संपर्क', s.emergencyContact || '', 'text'],
            ['address', en ? 'Address' : 'पत्ता', s.address || '', 'text'],
            ['feeTotal', en ? 'Total Fees (₹)' : 'एकूण फी (₹)', (s.fees && s.fees.total) || 0, 'number'],
            ['feePaid', en ? 'Fees Paid (₹)' : 'भरलेली फी (₹)', (s.fees && s.fees.paid) || 0, 'number'],
            ['bloodGroup', en ? 'Blood Group' : 'रक्तगट', (s.medical && s.medical.bloodGroup) || '', 'text'],
            ['allergies', en ? 'Allergies' : 'ॲलर्जी', (s.medical && s.medical.allergies) || '', 'text']
        ];
        const old = document.getElementById('vss-edit-student');
        if (old) old.remove();
        const wrap = document.createElement('div');
        wrap.id = 'vss-edit-student';
        wrap.className = 'vss-confirm-overlay';
        wrap.innerHTML = `
            <div class="vss-confirm-box vss-edit-box">
                <h3>${en ? 'Edit Student Details' : 'विद्यार्थ्याची माहिती संपादित करा'}</h3>
                <div class="vss-edit-grid">
                    ${F.map(([k, label, val, type]) => `
                        <div class="form-group">
                            <label>${label}</label>
                            <input class="form-control" data-k="${k}" type="${type}" value="${esc(val)}">
                        </div>`).join('')}
                </div>
                <div class="vss-confirm-actions">
                    <button class="btn-secondary" data-no>${en ? 'Cancel' : 'रद्द करा'}</button>
                    <button class="btn-primary" data-save>${en ? 'Save' : 'जतन करा'}</button>
                </div>
            </div>`;
        document.body.appendChild(wrap);
        wrap.querySelector('[data-no]').onclick = () => wrap.remove();
        wrap.addEventListener('click', (e) => { if (e.target === wrap) wrap.remove(); });
        wrap.querySelector('[data-save]').onclick = () => {
            const v = {};
            wrap.querySelectorAll('[data-k]').forEach((i) => (v[i.getAttribute('data-k')] = i.value.trim()));
            s.name = { mr: v.nameMr || v.nameEn, en: v.nameEn || v.nameMr };
            s.rollNo = Number(v.rollNo) || s.rollNo;
            s.standard = v.standard;
            s.section = v.section;
            s.phone = v.phone;
            s.parentName = v.parentName;
            s.emergencyContact = v.emergencyContact;
            s.address = v.address;
            s.fees = s.fees || { total: 0, paid: 0, ledger: [] };
            s.fees.total = Number(v.feeTotal) || 0;
            s.fees.paid = Number(v.feePaid) || 0;
            s.medical = s.medical || {};
            s.medical.bloodGroup = v.bloodGroup;
            s.medical.allergies = v.allergies;
            persist();
            wrap.remove();
            toast(en ? 'Student details updated!' : 'विद्यार्थ्याची माहिती अद्ययावत झाली!');
            if (typeof renderStudentProfile === 'function') renderStudentProfile(s.id);
            if (typeof renderStudentTable === 'function') renderStudentTable();
            if (typeof renderDashboardMetrics === 'function') renderDashboardMetrics();
            setTimeout(injectStudentEditButton, 50);
        };
    }

    /* ---------- 7c. Session-wise attendance calendar in Student Progress ---------- */
    const SESSIONS = ['morning', 'evening', 'school'];
    let calCursor = null;      // Date of the month being shown
    let calStudentId = null;

    function installAttendanceCalendar() {
        window.renderAttendanceGrid = function () {
            const calendar = document.getElementById('attendance-calendar');
            if (!calendar) return;
            const stud = (typeof activeStudentData !== 'undefined' && activeStudentData) ? activeStudentData : null;
            const en = currentLanguage === 'en';
            const daily = (stud && stud.dailyAttendance) || {};

            if (!calCursor || calStudentId !== (stud && stud.id)) {
                calCursor = new Date();
                calStudentId = stud && stud.id;
            }
            const year = calCursor.getFullYear();
            const month = calCursor.getMonth();
            const monthNames = en
                ? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
                : ['जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'];

            /* month navigation bar */
            let nav = document.getElementById('vss-cal-nav');
            if (!nav) {
                nav = document.createElement('div');
                nav.id = 'vss-cal-nav';
                nav.className = 'vss-cal-nav';
                calendar.parentNode.insertBefore(nav, calendar);
            }
            nav.innerHTML = `
                <button type="button" data-nav="-1" aria-label="Previous month"><i class="fa-solid fa-chevron-left"></i></button>
                <b>${monthNames[month]} ${year}</b>
                <button type="button" data-nav="1" aria-label="Next month"><i class="fa-solid fa-chevron-right"></i></button>`;
            nav.querySelectorAll('[data-nav]').forEach((b) => b.addEventListener('click', () => {
                calCursor = new Date(year, month + Number(b.getAttribute('data-nav')), 1);
                window.renderAttendanceGrid();
            }));

            calendar.innerHTML = '';
            const daysHeaders = en
                ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                : ['रवि', 'सोम', 'मंगळ', 'बुध', 'गुरु', 'शुक्र', 'शनी'];
            daysHeaders.forEach((d) => {
                const h = document.createElement('div');
                h.className = 'calendar-day-header';
                h.textContent = d;
                calendar.appendChild(h);
            });

            const padDays = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            for (let i = 0; i < padDays; i++) {
                const p = document.createElement('div');
                p.className = 'calendar-day-cell empty';
                calendar.appendChild(p);
            }

            const tally = { morning: { p: 0, t: 0 }, evening: { p: 0, t: 0 }, school: { p: 0, t: 0 } };
            let absentDays = 0;

            for (let day = 1; day <= daysInMonth; day++) {
                const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const rec = daily[key] || {};
                const cell = document.createElement('div');
                cell.className = 'calendar-day-cell has-dots';

                const num = document.createElement('span');
                num.className = 'cal-day-num';
                num.textContent = day;
                cell.appendChild(num);

                const dots = document.createElement('span');
                dots.className = 'cal-dots';
                let anyMarked = false;
                let anyAbsent = false;
                const tipParts = [];
                let holidays = {};
                try { holidays = JSON.parse(localStorage.getItem('vss_holidays') || '{}') || {}; } catch (_) { holidays = {}; }
                const holidayName = holidays[key];
                if (holidayName) cell.classList.add('is-holiday');
                SESSIONS.forEach((s) => {
                    const dot = document.createElement('i');
                    /* सुट्टीच्या दिवशी शाळा बंद — पिवळा ठिपका, टक्केवारीत मोजू नका */
                    if (holidayName && s === 'school') {
                        dot.className = 'cal-dot off';
                        dots.appendChild(dot);
                        tipParts.push(`${L(s)}: ${en ? 'School closed' : 'शाळा बंद'} (${holidayName})`);
                        return;
                    }
                    const onLeave = rec[s] === 'leave';
                    const marked = Object.prototype.hasOwnProperty.call(rec, s) && !onLeave;
                    const present = !!rec[s] && !onLeave;
                    dot.className = 'cal-dot ' + (onLeave ? 'm3' : marked ? (present ? 'ok' : 'no') : 'na');
                    dots.appendChild(dot);
                    if (marked) {
                        anyMarked = true;
                        tally[s].t++;
                        if (present) tally[s].p++; else anyAbsent = true;
                    }
                    const leaveTxt = holidayName ? (en ? 'Holiday' : 'सुट्टी — ' + holidayName) : (en ? 'Leave' : 'रजा');
                    tipParts.push(`${L(s)}: ${onLeave ? leaveTxt : marked ? (present ? (en ? 'Present' : 'हजर') : (en ? 'Absent' : 'गैरहजर')) : (en ? 'no record' : 'नोंद नाही')}`);
                });

                cell.appendChild(dots);

                if (anyMarked) {
                    cell.classList.add(anyAbsent ? 'has-absent' : 'all-present');
                    if (anyAbsent) absentDays++;
                    cell.title = `${day} ${monthNames[month]} — ${tipParts.join(', ')}`;
                } else if (holidayName) {
                    cell.title = `${day} ${monthNames[month]} — ${en ? 'Holiday' : 'सुट्टी'}: ${holidayName}`;
                }
                calendar.appendChild(cell);
            }

            const totalMarked = SESSIONS.reduce((n, s) => n + tally[s].t, 0);
            const totalPresent = SESSIONS.reduce((n, s) => n + tally[s].p, 0);
            const pct = totalMarked ? Math.round((totalPresent / totalMarked) * 100) : 0;
            const pctEl = document.getElementById('prof-attendance-pct');
            if (pctEl) pctEl.textContent = `${pct}%`;

            let sum = document.getElementById('vss-cal-summary');
            if (!sum) {
                sum = document.createElement('div');
                sum.id = 'vss-cal-summary';
                sum.className = 'vss-cal-summary';
                calendar.parentNode.insertBefore(sum, calendar.nextSibling);
            }
            const sPct = (s) => (tally[s].t ? Math.round((tally[s].p / tally[s].t) * 100) + '%' : '—');
            sum.innerHTML = `
                <div class="vss-cal-legend">
                    <span><i class="cal-dot ok"></i> ${en ? 'Present' : 'हजर'}</span>
                    <span><i class="cal-dot no"></i> ${en ? 'Absent' : 'गैरहजर'}</span>
                    <span><i class="cal-dot na"></i> ${en ? 'No record' : 'नोंद नाही'}</span>
                    <span><i class="cal-dot off"></i> ${en ? 'School closed' : 'शाळा बंद (सुट्टी)'}</span>

                </div>
                <div class="vss-cal-stats">
                    ${SESSIONS.map((s) => `<span>${L(s)} <b>${sPct(s)}</b></span>`).join('')}
                    <span>${en ? 'Absent days' : 'गैरहजर दिवस'} <b>${absentDays}</b></span>
                </div>`;
        };
    }

    /* ---------- 8. Boot ---------- */
    function boot() {
        try {
            window.vssConfirm = askConfirm;
            setupLoginHelpers();
            guardDestructiveActions();
            applyDefaultLanguage();
            buildAdminDropdown();
            applyRollSorting();
            patchAdminUI();
            refreshDropdownLabels();
            buildExcelTools();
            injectStudentEditButton();
            installAttendanceCalendar();

        } catch (err) {
            console.error('enhance boot error', err);
        }
    }


    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 250));
    } else {
        setTimeout(boot, 250);
    }
})();
