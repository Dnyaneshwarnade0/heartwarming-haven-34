/* =========================================================
   MANAGE LAYER 3
   1. रजा / गावी गेला  — हजेरीतून वगळा
   2. विद्यार्थीनिहाय विषय निवड व संपादन
   ========================================================= */
(function () {
    'use strict';

    const EN = () => (typeof currentLanguage !== 'undefined' ? currentLanguage : 'mr') === 'en';
    const T = (mr, en) => (EN() ? en : mr);
    const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const toast = (m, t) => (typeof createToast === 'function' ? createToast(m, t || 'success') : console.log(m));
    const save = () => { try { if (typeof saveDatabase === 'function') saveDatabase(); } catch (_) { } };
    const ask = (m, ok) => { if (typeof window.vssConfirm === 'function') window.vssConfirm(m, ok); else if (confirm(m)) ok(); };
    const students = () => (typeof studentsData !== 'undefined' && Array.isArray(studentsData) ? studentsData : (window.studentsData || window.studentsDatabase || []));
    const stu = () => (typeof selectedStudent !== 'undefined' && selectedStudent) ? selectedStudent
        : (typeof activeStudentData !== 'undefined' ? activeStudentData : null);
    const todayISO = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    const nameOf = (s) => (typeof getStudentName === 'function' ? getStudentName(s) : (s && typeof s.name === 'object' ? (s.name.mr || s.name.en) : (s && s.name))) || '';
    const uid = () => 'lv' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

    function modal(title, bodyHTML, onSave, saveLabel) {
        const old = document.getElementById('vss-m3-modal');
        if (old) old.remove();
        const w = document.createElement('div');
        w.id = 'vss-m3-modal';
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
       1. रजा / गावी गेला
       ========================================================= */
    const REASONS = [
        { v: 'गावी', mr: '🏠 गावी गेला', en: '🏠 Went home / village' },
        { v: 'आजारी', mr: '🤒 आजारी', en: '🤒 Sick' },
        { v: 'कार्यक्रम', mr: '🎪 कार्यक्रम / दिंडी', en: '🎪 Event / Dindi' },
        { v: 'इतर', mr: '➖ इतर', en: '➖ Other' }
    ];
    const reasonLabel = (v) => { const r = REASONS.find((x) => x.v === v); return r ? T(r.mr, r.en) : (v || T('रजा', 'Leave')); };

    function leavesOf(s) { return Array.isArray(s && s.leaves) ? s.leaves : []; }

    function leaveOn(s, iso) {
        const d = String(iso || todayISO());
        return leavesOf(s).find((l) => String(l.from || '') <= d && d <= String(l.to || l.from || '')) || null;
    }
    const isOnLeave = (s, iso) => !!leaveOn(s, iso);

    window.VSS_LEAVE = { isOnLeave, leaveOn, leavesOf };

    function addLeaveModal(s, presetFrom) {
        if (!s) return;
        const from = presetFrom || todayISO();
        const body = `
            <label class="vss-mg-label">${T('कोणापासून', 'From')}</label>
            <input type="date" class="vss-mg-input" id="m3-from" value="${from}">
            <label class="vss-mg-label">${T('कोणापर्यंत', 'To')}</label>
            <input type="date" class="vss-mg-input" id="m3-to" value="${from}">
            <div class="vss-mg-choices" id="m3-quick">
                <button type="button" class="vss-choice" data-d="0">${T('फक्त आज', 'Today only')}</button>
                <button type="button" class="vss-choice" data-d="2">${T('३ दिवस', '3 days')}</button>
                <button type="button" class="vss-choice" data-d="6">${T('७ दिवस', '7 days')}</button>
                <button type="button" class="vss-choice" data-d="14">${T('१५ दिवस', '15 days')}</button>
            </div>
            <label class="vss-mg-label">${T('कारण', 'Reason')}</label>
            <div class="vss-mg-choices" id="m3-reason">
                ${REASONS.map((r, i) => `<button type="button" class="vss-choice ${i === 0 ? 'on' : ''}" data-r="${r.v}">${T(r.mr, r.en)}</button>`).join('')}
            </div>
            <label class="vss-mg-label">${T('टीप (ऐच्छिक)', 'Note (optional)')}</label>
            <input class="vss-mg-input" id="m3-note" placeholder="${T('उदा. लग्नासाठी गावी', 'e.g. family function')}">`;

        const w = modal(`${T('🏠 रजा नोंदवा', '🏠 Add leave')} — ${esc(nameOf(s))}`, body, (box) => {
            const f = box.querySelector('#m3-from').value || todayISO();
            let t = box.querySelector('#m3-to').value || f;
            if (t < f) t = f;
            const r = box.querySelector('#m3-reason .on');
            s.leaves = leavesOf(s).slice();
            s.leaves.push({
                id: uid(), from: f, to: t,
                reason: r ? r.getAttribute('data-r') : 'गावी',
                note: box.querySelector('#m3-note').value.trim(),
                at: new Date().toISOString()
            });
            clearAttendanceForLeave(s, f, t);
            save();
            toast(T('रजा नोंदवली — या दिवसांची हजेरी मोजली जाणार नाही.', 'Leave saved — these days are excluded from attendance.'));
            refreshAll();
        });

        w.querySelectorAll('#m3-quick [data-d]').forEach((b) => {
            b.onclick = () => {
                const f = w.querySelector('#m3-from').value || todayISO();
                const d = new Date(f + 'T00:00:00');
                d.setDate(d.getDate() + Number(b.getAttribute('data-d')));
                w.querySelector('#m3-to').value = d.toISOString().slice(0, 10);
            };
        });
        w.querySelectorAll('#m3-reason [data-r]').forEach((b) => {
            b.onclick = () => {
                w.querySelectorAll('#m3-reason [data-r]').forEach((x) => x.classList.remove('on'));
                b.classList.add('on');
            };
        });
    }

    /* रजेच्या दिवसांतील जुनी हजेरी नोंद 'leave' करा */
    function clearAttendanceForLeave(s, from, to) {
        s.dailyAttendance = s.dailyAttendance || {};
        Object.keys(s.dailyAttendance).forEach((d) => {
            if (d < from || d > to) return;
            const rec = s.dailyAttendance[d] || {};
            Object.keys(rec).forEach((k) => { rec[k] = 'leave'; });
        });
    }

    function leaveListModal(s) {
        if (!s) return;
        const draw = () => {
            const rows = leavesOf(s).slice().sort((a, b) => String(b.from).localeCompare(String(a.from)));
            const html = rows.length ? rows.map((l) => `
                <div class="vss-user-row">
                    <div>
                        <b>${esc(l.from)} → ${esc(l.to || l.from)}</b>
                        <div class="vss-user-sub">${esc(reasonLabel(l.reason))}${l.note ? ' · ' + esc(l.note) : ''}</div>
                    </div>
                    <div class="vss-user-acts">
                        <button type="button" data-del="${esc(l.id)}" title="${T('रजा रद्द करा', 'Cancel leave')}"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>`).join('') : `<p class="text-muted">${T('अद्याप रजा नोंद नाही.', 'No leave records yet.')}</p>`;

            const w = modal(`${T('🏠 रजा — गावी गेला', '🏠 Leave records')} — ${esc(nameOf(s))}`,
                `${html}<div style="margin-top:12px"><button type="button" class="btn-primary" id="m3-add-leave"><i class="fa-solid fa-plus"></i> ${T('नवीन रजा', 'New leave')}</button></div>`,
                null);
            w.querySelector('#m3-add-leave').onclick = () => { w.remove(); addLeaveModal(s); };
            w.querySelectorAll('[data-del]').forEach((b) => (b.onclick = () => {
                ask(T('ही रजा रद्द करायची का?', 'Cancel this leave?'), () => {
                    s.leaves = leavesOf(s).filter((x) => String(x.id) !== b.getAttribute('data-del'));
                    save();
                    w.remove();
                    refreshAll();
                    draw();
                    toast(T('रजा रद्द झाली', 'Leave cancelled'));
                });
            }));
        };
        draw();
    }

    window.vssOpenLeave = leaveListModal;

    function refreshAll() {
        try { if (typeof renderDashboardMetrics === 'function') renderDashboardMetrics(); } catch (_) { }
        try { if (typeof renderStudentTable === 'function') renderStudentTable(); } catch (_) { }
        try { if (typeof renderAttendanceGrid === 'function') renderAttendanceGrid(); } catch (_) { }
        decorateAttendance();
    }

    /* ---------- हजेरी पॅनेल: रजेवरील विद्यार्थी वेगळे ---------- */
    function decorateAttendance() {
        const table = document.querySelector('.dt-att-table');
        if (!table) return;
        const date = (document.getElementById('dt-date') || {}).value || todayISO();
        const list = students();
        table.querySelectorAll('tbody tr').forEach((row) => {
            const box = row.querySelector('.dt-att-check');
            if (!box) return;
            const s = list.find((x) => String(x.id) === box.getAttribute('data-id'));
            if (!s) return;
            const lv = leaveOn(s, date);
            const nameCell = row.children[1];

            row.querySelectorAll('.m3-leave-tag, .m3-leave-btn').forEach((n) => n.remove());
            row.classList.toggle('m3-on-leave', !!lv);
            box.disabled = !!lv;
            if (lv) box.checked = false;

            if (nameCell) {
                if (lv) {
                    const tag = document.createElement('span');
                    tag.className = 'm3-leave-tag';
                    tag.textContent = `🏠 ${T('रजा', 'Leave')} · ${reasonLabel(lv.reason)}`;
                    nameCell.appendChild(tag);
                }
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'm3-leave-btn';
                btn.title = T('रजा नोंदवा / रद्द करा', 'Add / cancel leave');
                btn.innerHTML = '🏠';
                btn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); leaveListModal(s); };
                nameCell.appendChild(btn);
            }
        });
    }

    /* जतन झाल्यावर रजेच्या नोंदी 'leave' करा */
    function normalizeAfterSave() {
        const date = (document.getElementById('dt-date') || {}).value || todayISO();
        let changed = false;
        students().forEach((s) => {
            if (!leaveOn(s, date)) return;
            const rec = (s.dailyAttendance || {})[date];
            if (!rec) return;
            Object.keys(rec).forEach((k) => {
                if (rec[k] !== 'leave') { rec[k] = 'leave'; changed = true; }
            });
        });
        if (changed) save();
        decorateAttendance();
    }

    /* ---------- कॅलेंडरवर रजेचे दिवस ---------- */
    function patchCalendar() {
        if (typeof window.renderAttendanceGrid !== 'function' || window.renderAttendanceGrid.__m3) return;
        const orig = window.renderAttendanceGrid;
        const wrapped = function () {
            const r = orig.apply(this, arguments);
            try { markLeaveCells(); } catch (_) { }
            return r;
        };
        wrapped.__m3 = 1;
        window.renderAttendanceGrid = wrapped;
    }

    function markLeaveCells() {
        const cal = document.getElementById('attendance-calendar');
        const s = stu();
        if (!cal || !s) return;
        const navB = document.querySelector('#vss-cal-nav b');
        const label = navB ? navB.textContent.trim() : '';
        const mn = ['जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'];
        const me = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        let year = new Date().getFullYear(), month = new Date().getMonth();
        if (label) {
            const parts = label.split(/\s+/);
            const i = Math.max(mn.indexOf(parts[0]), me.indexOf(parts[0]));
            if (i >= 0) month = i;
            const y = Number(parts[parts.length - 1]);
            if (y > 1900) year = y;
        }
        cal.querySelectorAll('.calendar-day-cell').forEach((cell) => {
            const num = cell.querySelector('.cal-day-num');
            if (!num) return;
            const day = Number(num.textContent);
            if (!day) return;
            const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const lv = leaveOn(s, key);
            cell.classList.toggle('m3-leave-day', !!lv);
            if (lv) cell.title = `${key} — ${T('रजा', 'Leave')} (${reasonLabel(lv.reason)})`;
        });
        const sum = document.getElementById('vss-cal-summary');
        if (sum && !sum.querySelector('.m3-leg')) {
            const leg = sum.querySelector('.vss-cal-legend');
            if (leg) {
                const sp = document.createElement('span');
                sp.className = 'm3-leg';
                sp.innerHTML = `<i class="cal-dot m3"></i> ${T('रजा', 'Leave')}`;
                leg.appendChild(sp);
            }
        }
    }

    /* =========================================================
       2. विद्यार्थीनिहाय विषय
       ========================================================= */
    const BASE_SUBJECTS = window.VSS_SUBJECTS || [
        { k: 'Kirtan', mr: 'कीर्तन', en: 'Kirtan' },
        { k: 'Gayan', mr: 'गायन', en: 'Gayan' },
        { k: 'Pakhawaj', mr: 'पखवाज', en: 'Pakhawaj' },
        { k: 'Bhagwat', mr: 'भागवत', en: 'Bhagwat' }
    ];
    const EXTRA_SUBJECTS = [
        { k: 'Harmonium', mr: 'हार्मोनियम', en: 'Harmonium' },
        { k: 'Tabla', mr: 'तबला', en: 'Tabla' },
        { k: 'Sanskrit', mr: 'संस्कृत', en: 'Sanskrit' },
        { k: 'Pathantar', mr: 'पाठांतर', en: 'Pathantar' },
        { k: 'Marathi', mr: 'मराठी', en: 'Marathi' },
        { k: 'Maths', mr: 'गणित', en: 'Maths' },
        { k: 'English', mr: 'इंग्रजी', en: 'English' },
        { k: 'Science', mr: 'विज्ञान', en: 'Science' }
    ];
    const GRADES = [
        { v: 'Excellent', mr: 'उत्कृष्ट', en: 'Excellent' },
        { v: 'Good', mr: 'चांगले', en: 'Good' },
        { v: 'Average', mr: 'मध्यम', en: 'Average' },
        { v: 'Weak', mr: 'कमकुवत', en: 'Weak' }
    ];
    const gradeFor = (m) => (m >= 85 ? 'Excellent' : m >= 65 ? 'Good' : m >= 40 ? 'Average' : 'Weak');

    const readDefaults = () => {
        try {
            const v = JSON.parse(localStorage.getItem('vss_default_subjects') || 'null');
            return Array.isArray(v) && v.length ? v : null;
        } catch (_) { return null; }
    };

    const catalog = () => {
        const all = BASE_SUBJECTS.concat(EXTRA_SUBJECTS);
        students().forEach((s) => (s.subjectList || []).forEach((sub) => {
            if (!all.some((x) => x.k === sub.k)) all.push(sub);
        }));
        return all;
    };

    function subjectsOf(s) {
        if (s && Array.isArray(s.subjectList) && s.subjectList.length) return s.subjectList;
        return readDefaults() || BASE_SUBJECTS;
    }
    window.VSS_SUBJECT_LIST = subjectsOf;

    function renderSubjects() {
        const host = document.getElementById('prof-subjects-list');
        if (!host) return;
        const s = stu();
        const map = (s && s.subjects) || {};
        const marks = (s && s.subjectMarks) || {};
        const list = subjectsOf(s);
        host.innerHTML = list.map((sub) => {
            const g = map[sub.k] || map[sub.en] || '';
            const gl = GRADES.find((x) => x.v === g) || {};
            const m = marks[sub.k];
            return `
                <li>
                    <span class="subject-name">${T(sub.mr, sub.en)}</span>
                    <span class="subject-marks">${typeof m === 'number' ? `${m}/100` : '—'}</span>
                    <span class="subject-badge ${g ? g.toLowerCase() : 'na'}" data-sub3="${esc(sub.k)}" role="button" tabindex="0">
                        ${g ? T(gl.mr || g, gl.en || g) : T('श्रेणी द्या', 'Set grade')} <i class="fa-solid fa-pen" style="font-size:.7em;opacity:.6"></i>
                    </span>
                </li>`;
        }).join('');
        host.querySelectorAll('[data-sub3]').forEach((el) => {
            el.onclick = () => openSubject(el.getAttribute('data-sub3'));
        });
        injectProfileTools();
    }
    window.renderSubjectsRatings = renderSubjects;

    function openSubject(key) {
        const s = stu();
        if (!s) return;
        const sub = subjectsOf(s).find((x) => x.k === key) || { mr: key, en: key };
        const curG = (s.subjects || {})[key] || '';
        const curM = (s.subjectMarks || {})[key];
        const body = `
            <label class="vss-mg-label">${T('गुण (१०० पैकी)', 'Marks (out of 100)')}</label>
            <input type="number" min="0" max="100" id="m3-marks" class="vss-mg-input" value="${typeof curM === 'number' ? curM : ''}" placeholder="0 - 100">
            <label class="vss-mg-label">${T('श्रेणी', 'Grade')}</label>
            <div class="vss-mg-choices" id="m3-grades">
                ${GRADES.map((g) => `<button type="button" class="vss-choice ${curG === g.v ? 'on' : ''}" data-g="${g.v}">${T(g.mr, g.en)}</button>`).join('')}
                <button type="button" class="vss-choice" data-g="">${T('काढून टाका', 'Clear')}</button>
            </div>`;
        const w = modal(`${T('विषय', 'Subject')}: ${T(sub.mr, sub.en)}`, body, (box) => {
            const mv = box.querySelector('#m3-marks').value;
            const chosen = box.querySelector('#m3-grades .on');
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
        w.querySelectorAll('#m3-grades [data-g]').forEach((b) => {
            b.onclick = () => {
                w.querySelectorAll('#m3-grades [data-g]').forEach((x) => x.classList.remove('on'));
                if (b.getAttribute('data-g')) b.classList.add('on');
            };
        });
        const inp = w.querySelector('#m3-marks');
        inp.oninput = () => {
            const v = Number(inp.value);
            if (inp.value === '' || isNaN(v)) return;
            const g = gradeFor(Math.max(0, Math.min(100, v)));
            w.querySelectorAll('#m3-grades [data-g]').forEach((x) => x.classList.toggle('on', x.getAttribute('data-g') === g));
        };
    }

    function subjectPicker(s) {
        if (!s) return;
        const cur = subjectsOf(s);
        const all = catalog();
        const body = `
            <p class="text-muted">${T('या विद्यार्थ्याचे विषय निवडा — निवडलेलेच विषय कामगिरी व परीक्षेत दिसतील.', 'Choose this student\u2019s subjects — only these appear in performance and exams.')}</p>
            <div class="vss-perm-grid" id="m3-sub-grid">
                ${all.map((sub) => `<label class="vss-perm"><input type="checkbox" data-k="${esc(sub.k)}" data-mr="${esc(sub.mr)}" data-en="${esc(sub.en)}" ${cur.some((x) => x.k === sub.k) ? 'checked' : ''}> ${T(sub.mr, sub.en)}</label>`).join('')}
            </div>
            <label class="vss-mg-label">${T('➕ नवीन विषय लिहा', 'Add a new subject')}</label>
            <input class="vss-mg-input" id="m3-new-sub" placeholder="${T('उदा. वारकरी संगीत', 'e.g. Warkari music')}">
            <label class="vss-perm" style="margin-top:8px"><input type="checkbox" id="m3-set-default"> ${T('हीच यादी नवीन प्रवेशांसाठी मूलभूत ठेवा', 'Make this the default list for new admissions')}</label>`;

        modal(`${T('📚 विषय बदला', '📚 Edit subjects')} — ${esc(nameOf(s))}`, body, (box) => {
            const picked = [];
            box.querySelectorAll('#m3-sub-grid input[type=checkbox]').forEach((c) => {
                if (c.checked) picked.push({ k: c.getAttribute('data-k'), mr: c.getAttribute('data-mr'), en: c.getAttribute('data-en') });
            });
            const extra = box.querySelector('#m3-new-sub').value.trim();
            if (extra) picked.push({ k: extra.replace(/\s+/g, '_'), mr: extra, en: extra });
            if (!picked.length) { toast(T('किमान एक विषय निवडा', 'Pick at least one subject'), 'error'); return false; }
            s.subjectList = picked;
            if (box.querySelector('#m3-set-default').checked) {
                localStorage.setItem('vss_default_subjects', JSON.stringify(picked));
            }
            save();
            renderSubjects();
            toast(T('विषय यादी जतन झाली', 'Subject list saved'));
        });
    }
    window.vssEditSubjects = subjectPicker;

    /* ---------- प्रोफाइलवर बटणे ---------- */
    function injectProfileTools() {
        const host = document.getElementById('prof-subjects-list');
        if (!host || !host.parentNode) return;
        let bar = document.getElementById('m3-prof-tools');
        if (!bar) {
            bar = document.createElement('div');
            bar.id = 'm3-prof-tools';
            bar.className = 'm3-tools';
            host.parentNode.insertBefore(bar, host);
        }
        const s = stu();
        const lv = s ? leaveOn(s, todayISO()) : null;
        bar.innerHTML = `
            <button type="button" class="m3-tool" id="m3-t-sub"><i class="fa-solid fa-book"></i> ${T('विषय बदला', 'Edit subjects')}</button>
            <button type="button" class="m3-tool ${lv ? 'on' : ''}" id="m3-t-leave">🏠 ${lv ? T('रजेवर आहे', 'On leave') : T('रजा / गावी', 'Leave')}</button>`;
        bar.querySelector('#m3-t-sub').onclick = () => subjectPicker(stu());
        bar.querySelector('#m3-t-leave').onclick = () => leaveListModal(stu());
    }

    /* =========================================================
       boot
       ========================================================= */
    function boot() {
        patchCalendar();
        decorateAttendance();
        injectProfileTools();
        renderSubjects();
    }

    document.addEventListener('vss:data-changed', () => { normalizeAfterSave(); });
    document.addEventListener('click', (e) => {
        if (e.target.closest && (e.target.closest('.dt-chip') || e.target.closest('#dt-date'))) {
            setTimeout(decorateAttendance, 120);
        }
    }, true);
    document.addEventListener('change', (e) => {
        if (e.target && e.target.id === 'dt-date') setTimeout(decorateAttendance, 120);
    }, true);

    const mo = new MutationObserver(() => {
        clearTimeout(mo._t);
        mo._t = setTimeout(() => { patchCalendar(); decorateAttendance(); injectProfileTools(); }, 150);
    });

    function start() {
        boot();
        mo.observe(document.body, { childList: true, subtree: true });
        setInterval(() => { patchCalendar(); }, 2000);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(start, 600));
    else setTimeout(start, 600);
})();
