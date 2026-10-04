/* =========================================================
   आदर्श विद्यार्थी (Student of the Week) + काळी यादी (Blacklist)
   स्वतंत्र स्तर — मूळ स्क्रिप्ट्स जशाच्या तशा राहतात.
   ========================================================= */
(function () {
    'use strict';

    const EN = () => (typeof currentLanguage !== 'undefined' ? currentLanguage : 'mr') === 'en';
    const T = (mr, en) => (EN() ? en : mr);
    const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const toast = (m, t) => (typeof createToast === 'function' ? createToast(m, t || 'success') : console.log(m));
    function confirmStarAction(message, onYes) {
        document.getElementById('vss-star-confirm')?.remove();
        const wrap = document.createElement('div');
        wrap.id = 'vss-star-confirm';
        wrap.className = 'vss-confirm-overlay';
        wrap.innerHTML = `<div class="vss-confirm-box">
            <div class="vss-confirm-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
            <h3>${T('तुम्हाला खात्री आहे का?', 'Are you sure?')}</h3>
            <p>${esc(message)}</p>
            <div class="vss-confirm-actions">
                <button type="button" class="btn-secondary" data-cancel>${T('नाही, रद्द करा', 'Cancel')}</button>
                <button type="button" class="btn-danger-confirm" data-confirm>${T('होय, पुढे जा', 'Yes, continue')}</button>
            </div>
        </div>`;
        document.body.appendChild(wrap);
        wrap.querySelector('[data-cancel]').onclick = () => wrap.remove();
        wrap.addEventListener('click', (event) => { if (event.target === wrap) wrap.remove(); });
        wrap.querySelector('[data-confirm]').onclick = () => { wrap.remove(); onYes(); };
    }
    const ask = confirmStarAction;
    const students = () => (typeof studentsDatabase !== 'undefined' && Array.isArray(studentsDatabase) ? studentsDatabase : []);
    const nameOf = (s) => (typeof getStudentName === 'function' ? getStudentName(s) : (s && typeof s.name === 'object' ? s.name.mr : (s && s.name) || ''));
    const saveAll = () => { try { if (typeof saveDatabase === 'function') saveDatabase(); } catch (_) { } };

    /* ---------- storage ---------- */
    const ADARSH_KEY = 'vss_adarsh_week';
    const SPECIAL_SEED_FLAG = 'vss_special_lists_seeded_v1';
    const getAdarsh = () => { try { return JSON.parse(localStorage.getItem(ADARSH_KEY) || '[]'); } catch (_) { return []; } };
    const setAdarsh = (v) => { localStorage.setItem(ADARSH_KEY, JSON.stringify(v)); try { if (window.vssCloudPush) window.vssCloudPush(); } catch (_) { } };
    let editingAwardWeek = '';
    function awardCount(studentId) { return getAdarsh().filter((entry) => String(entry.id) === String(studentId)).length; }
    function blacklistEvents(student) {
        if (Array.isArray(student.blacklistHistory) && student.blacklistHistory.length) return student.blacklistHistory;
        const legacy = (student.complaints || []).filter((entry) => String(entry.type || '').toLowerCase().includes('blacklist'));
        if (legacy.length) return legacy;
        return student.blacklisted && student.blacklistInfo ? [student.blacklistInfo] : [];
    }
    function blacklistCount(student) { return blacklistEvents(student).length; }
    function isBlack(student) { return student.blacklisted !== false && (student.blacklisted === true || blacklistCount(student) > 0); }
    function awardDate(entry) { return entry.date || entry.week || '—'; }

    function seedInitialRecords() {
        const list = students();
        if (!list.length) return;
        if (localStorage.getItem(SPECIAL_SEED_FLAG) === '1') return;
        if (!getAdarsh().length) {
            const student = list[0];
            setAdarsh([{ week: currentWeekValue(), id: student.id, name: nameOf(student), rollNo: student.rollNo, note: T('उत्कृष्ट प्रगती आणि नियमित उपस्थिती', 'Excellent progress and regular attendance') }]);
        }
        if (!list.some(isBlack)) {
            const student = list[1] || list[0];
            student.blacklisted = true;
            student.blacklistInfo = { reason: T('प्रारंभिक शिस्त निरीक्षण', 'Initial discipline review'), date: today() };
            student.complaints = student.complaints || [];
            student.complaints.push({ type: 'Blacklist', text: student.blacklistInfo.reason, action: student.blacklistInfo.reason, date: student.blacklistInfo.date });
            saveAll();
        }
        localStorage.setItem(SPECIAL_SEED_FLAG, '1');
    }

    function currentWeekValue() {
        const d = new Date();
        const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        const day = t.getUTCDay() || 7;
        t.setUTCDate(t.getUTCDate() + 4 - day);
        const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
        const wk = Math.ceil((((t - y0) / 86400000) + 1) / 7);
        return `${t.getUTCFullYear()}-W${String(wk).padStart(2, '0')}`;
    }

    const today = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

    function pastWeekValue(offset) {
        const d = new Date();
        d.setDate(d.getDate() - offset * 7);
        const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        const day = t.getUTCDay() || 7;
        t.setUTCDate(t.getUTCDate() + 4 - day);
        const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
        const wk = Math.ceil((((t - y0) / 86400000) + 1) / 7);
        return `${t.getUTCFullYear()}-W${String(wk).padStart(2, '0')}`;
    }

    function seedRequestedRepeatRecords() {
        const flag = 'vss_repeat_history_seed_v1';
        if (localStorage.getItem(flag) === '1') return;
        const avadhut = students().find((student) => Number(student.rollNo) === 1);
        const yash = students().find((student) => Number(student.rollNo) === 2);
        let changed = false;
        if (avadhut && awardCount(avadhut.id) < 2) {
            const awards = getAdarsh();
            let offset = 1;
            while (awards.filter((entry) => String(entry.id) === String(avadhut.id)).length < 2) {
                let week = pastWeekValue(offset);
                while (awards.some((entry) => entry.week === week)) week = pastWeekValue(++offset);
                awards.push({ week, date: today(), id: avadhut.id, name: nameOf(avadhut), rollNo: avadhut.rollNo, note: T('नियमित प्रगती आणि उत्तम वर्तन', 'Regular progress and good conduct') });
                offset += 1;
            }
            awards.sort((a, b) => String(a.week).localeCompare(String(b.week)));
            setAdarsh(awards);
            changed = true;
        }
        if (yash && blacklistCount(yash) < 2) {
            const history = blacklistEvents(yash).slice();
            while (history.length < 2) history.push({ reason: T('वारंवार शिस्त निरीक्षण', 'Repeated discipline review'), date: today() });
            const event = history[history.length - 1];
            yash.blacklisted = true;
            yash.blacklistInfo = event;
            yash.blacklistHistory = history;
            yash.complaints = yash.complaints || [];
            yash.complaints.push({ type: 'Blacklist', text: event.reason, action: event.reason, date: event.date });
            changed = true;
        }
        localStorage.setItem(flag, '1');
        if (changed) saveAll();
    }

    /* ---------- telegram ---------- */
    const TG_CODE = () => (localStorage.getItem('vss_tg_code') || '444A1C6D').trim().toUpperCase();
    const BACKEND = (function () {
        const p = window.location ? window.location.protocol : '';
        return p === 'http:' || p === 'https:' ? '' : 'https://admin.shantibrahmagurukulam.com';
    })();

    async function announce(text, audience) {
        try {
            const res = await fetch(BACKEND + '/api/public/telegram/announce', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: TG_CODE(), text, audience: audience || 'admins' }),
            });
            const j = await res.json().catch(() => ({}));
            if (!res.ok || j.error) {
                toast(T('टेलिग्राम पाठवता आले नाही.', 'Could not send to Telegram.'), 'error');
                return;
            }
            if (!j.sent) {
                toast(T('कोणताही टेलिग्राम चॅट जोडलेला नाही.', 'No Telegram chat is linked yet.'), 'warning');
                return;
            }
            toast(T(`टेलिग्रामवर ${j.sent} ठिकाणी पाठवले.`, `Sent to ${j.sent} Telegram chat(s).`));
        } catch (_) {
            toast(T('टेलिग्राम पाठवता आले नाही.', 'Could not send to Telegram.'), 'error');
        }
    }

    /* ---------- panels in DOM ---------- */
    function ensurePanels() {
        const host = document.querySelector('.app-main-content') || document.body;
        ['panel-star-student', 'panel-blacklist'].forEach((id) => {
            if (document.getElementById(id)) return;
            const d = document.createElement('div');
            d.id = id;
            d.className = 'content-panel d-none';
            host.appendChild(d);
        });
    }

    function addMenu() {
        const nav = document.querySelector('.sidebar-menu');
        if (!nav || document.getElementById('menu-star-student')) return;
        const mk = (id, target, icon, mr, en) => {
            const a = document.createElement('a');
            a.href = '#';
            a.id = id;
            a.className = 'menu-item';
            a.setAttribute('data-target', target);
            a.innerHTML = `<i class="fa-solid ${icon}"></i> <span data-mr="${mr}" data-en="${en}">${T(mr, en)}</span><b class="menu-count-badge" aria-label="count">0</b>`;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                if (typeof switchPanel === 'function') switchPanel(target);
                render(target);
            });
            return a;
        };
        const anchor = document.getElementById('menu-pwa-install');
        const star = mk('menu-star-student', 'panel-star-student', 'fa-award', 'आदर्श विद्यार्थी', 'Student of the Week');
        const black = mk('menu-blacklist', 'panel-blacklist', 'fa-user-slash', 'काळी यादी', 'Blacklist');
        if (anchor) { nav.insertBefore(star, anchor); nav.insertBefore(black, anchor); }
        else { nav.appendChild(star); nav.appendChild(black); }
    }

    function updateMenuBadges() {
        const blacklisted = students().filter(isBlack).length;
        const awarded = getAdarsh().length;
        const set = (id, value) => {
            const badge = document.querySelector(`${id} .menu-count-badge`);
            if (badge) { badge.textContent = String(value); badge.hidden = value === 0; }
        };
        set('#menu-star-student', awarded);
        set('#menu-blacklist', blacklisted);
    }

    function relabel() {
        document.querySelectorAll('#menu-star-student span[data-mr], #menu-blacklist span[data-mr]').forEach((sp) => {
            sp.textContent = T(sp.getAttribute('data-mr'), sp.getAttribute('data-en'));
        });
    }

    function render(target) {
        if (target === 'panel-star-student') renderStar();
        if (target === 'panel-blacklist') renderBlack();
    }

    /* ================= आदर्श विद्यार्थी ================= */
    function renderStar() {
        ensurePanels();
        seedInitialRecords();
        updateMenuBadges();
        const el = document.getElementById('panel-star-student');
        if (!el) return;
        const list = [...students()].sort((a, b) => Number(a.rollNo || 0) - Number(b.rollNo || 0));
        const saved = getAdarsh().slice().sort((a, b) => String(a.week).localeCompare(String(b.week)));
        const latest = saved[saved.length - 1];

        el.innerHTML = `
            <div class="sb-head">
                <div>
                    <h2><i class="fa-solid fa-award"></i> ${T('आठवड्याचा आदर्श विद्यार्थी', 'Student of the Week')}</h2>
                    <p>${T('दर आठवड्याला एक विद्यार्थी निवडा आणि टेलिग्रामवर जाहीर करा.', 'Pick one student each week and announce it on Telegram.')}</p>
                </div>
            </div>

            ${latest ? `<div class="sb-hero">
                <div class="sb-medal"><i class="fa-solid fa-medal"></i></div>
                <div>
                    <h3>${esc(latest.name)}</h3>
                    <span>${T('दिनांक', 'Date')} ${esc(awardDate(latest))} · ${T('आठवडा', 'Week')} ${esc(latest.week)}${latest.rollNo ? ` · ${T('हजेरी क्र.', 'Roll')} ${esc(latest.rollNo)}` : ''}${latest.note ? ` · ${esc(latest.note)}` : ''}</span>
                </div>
            </div>` : ''}

            <div class="sb-card">
                <div class="sb-grid">
                    <div class="form-group">
                        <label>${T('आठवडा', 'Week')}</label>
                        <input type="week" id="sb-week" class="form-control" value="${currentWeekValue()}">
                    </div>
                    <div class="form-group">
                        <label>${T('विद्यार्थी', 'Student')}</label>
                        <select id="sb-student" class="form-control">
                            ${list.map((s) => `<option value="${esc(s.id)}">${esc(s.rollNo)} — ${esc(nameOf(s))}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group" style="grid-column:1/-1">
                        <label>${T('कारण / शेरा', 'Reason / Remark')}</label>
                        <input type="text" id="sb-note" class="form-control" placeholder="—">
                    </div>
                </div>
                <div class="sb-actions">
                    <button class="btn-primary" id="sb-save"><i class="fa-solid fa-star"></i> ${T('जतन करा', 'Save')}</button>
                    <button class="btn-secondary" id="sb-send"><i class="fa-brands fa-telegram"></i> ${T('टेलिग्रामवर जाहीर करा', 'Announce on Telegram')}</button>
                </div>
            </div>

            <div class="sb-card">
                <h3 style="margin:0 0 12px;font-size:16px">${T('आतापर्यंतचे आदर्श विद्यार्थी', 'Past winners')}</h3>
                ${saved.length ? `<table class="sb-table"><thead><tr>
                    <th>${T('दिनांक', 'Date')}</th><th>${T('हजेरी क्र.', 'Roll')}</th><th>${T('फोटो', 'Photo')}</th><th>${T('विद्यार्थी', 'Student')}</th><th>${T('वेळा', 'Times')}</th><th>${T('वर्ग', 'Class')}</th><th>${T('कारण / पुरस्कार', 'Reason / Award')}</th><th>${T('स्थिती', 'Status')}</th><th></th>
                </tr></thead><tbody>
                ${saved.slice().reverse().map((a) => {
                    const student = students().find((s) => String(s.id) === String(a.id)) || {};
                    const photo = student.photo ? `<img class="sb-photo" src="${esc(student.photo)}" alt="">` : '<span class="sb-photo sb-photo-empty"><i class="fa-solid fa-user"></i></span>';
                    return `<tr>
                    <td data-label="${T('दिनांक', 'Date')}"><b>${esc(awardDate(a))}</b><small>${T('आठवडा', 'Week')} ${esc(a.week)}</small></td>
                    <td data-label="${T('हजेरी क्र.', 'Roll')}">${esc(a.rollNo || '—')}</td>
                    <td data-label="${T('फोटो', 'Photo')}">${photo}</td>
                    <td class="sb-identity" data-label="${T('विद्यार्थी', 'Student')}"><span class="sb-chip gold"><i class="fa-solid fa-star"></i> ${esc(a.name)}</span></td>
                    <td class="sb-count" data-label="${T('वेळा', 'Times')}"><span class="sb-chip gold" data-award-count>${awardCount(a.id)}×</span></td>
                    <td data-label="${T('वर्ग', 'Class')}">${esc(student.standard || '—')}</td>
                    <td class="sb-reason" data-label="${T('कारण / पुरस्कार', 'Reason / Award')}">${esc(a.note || '—')}</td>
                    <td data-label="${T('स्थिती', 'Status')}"><span class="sb-chip gold">${T('सन्मानित', 'Awarded')}</span></td>
                    <td style="text-align:right"><button class="btn-secondary btn-sm" data-profile="${esc(a.id)}">${T('प्रोफाईल पहा', 'View profile')}</button> <button class="btn-secondary btn-sm" data-edit-award="${esc(a.week)}"><i class="fa-solid fa-pen"></i> ${T('संपादन', 'Edit')}</button> <button class="btn-secondary btn-sm" data-del="${esc(a.week)}" title="${T('हटवा', 'Delete')}"><i class="fa-solid fa-trash"></i></button></td>
                </tr>`; }).join('')}
                </tbody></table>` : `<div class="sb-empty">${T('अद्याप कोणीही निवडलेले नाही.', 'No student selected yet.')}</div>`}
            </div>
        `;

        const pick = () => {
            const week = document.getElementById('sb-week').value || currentWeekValue();
            const stud = students().find((s) => String(s.id) === document.getElementById('sb-student').value);
            const note = document.getElementById('sb-note').value || '';
            return { week, stud, note };
        };

        el.querySelector('#sb-save').onclick = () => {
            const { week, stud, note } = pick();
            if (!stud) { toast(T('विद्यार्थी निवडा.', 'Select a student.'), 'warning'); return; }
            const arr = getAdarsh().filter((a) => a.week !== week && a.week !== editingAwardWeek);
            arr.push({ week, date: today(), id: stud.id, name: nameOf(stud), rollNo: stud.rollNo, note });
            arr.sort((a, b) => String(a.week).localeCompare(String(b.week)));
            setAdarsh(arr);
            editingAwardWeek = '';
            updateMenuBadges();
            toast(T('आदर्श विद्यार्थी जतन झाला!', 'Star student saved!'));
            renderStar();
        };

        el.querySelector('#sb-send').onclick = () => {
            const { week, stud, note } = pick();
            const rec = stud ? { week, name: nameOf(stud), rollNo: stud.rollNo, note } : latest;
            if (!rec) { toast(T('आधी विद्यार्थी निवडा.', 'Select a student first.'), 'warning'); return; }
            const text = `<b>🏅 ${T('आठवड्याचा आदर्श विद्यार्थी', 'Student of the Week')}</b>\n`
                + `${T('आठवडा', 'Week')}: ${rec.week}\n`
                + `${T('विद्यार्थी', 'Student')}: <b>${rec.name}</b>${rec.rollNo ? ` (${T('हजेरी क्र.', 'Roll')} ${rec.rollNo})` : ''}`
                + (rec.note ? `\n${T('कारण', 'Reason')}: ${rec.note}` : '')
                + `\n\n${T('अभिनंदन! 🎉', 'Congratulations! 🎉')}`;
            announce(text, 'all');
        };

        el.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => {
            const wk = b.getAttribute('data-del');
            ask(T(`${wk} ची निवड काढून टाकायची?`, `Remove the pick for ${wk}?`), () => {
                setAdarsh(getAdarsh().filter((a) => a.week !== wk));
                if (editingAwardWeek === wk) editingAwardWeek = '';
                updateMenuBadges();
                renderStar();
            });
        }));
        el.querySelectorAll('[data-edit-award]').forEach((b) => b.addEventListener('click', () => {
            const award = getAdarsh().find((a) => a.week === b.getAttribute('data-edit-award'));
            if (!award) return;
            editingAwardWeek = award.week;
            document.getElementById('sb-week').value = award.week;
            document.getElementById('sb-student').value = String(award.id);
            document.getElementById('sb-note').value = award.note || '';
            document.getElementById('sb-save').innerHTML = `<i class="fa-solid fa-floppy-disk"></i> ${T('बदल जतन करा', 'Save changes')}`;
            document.getElementById('sb-week').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }));
        el.querySelectorAll('[data-profile]').forEach((b) => b.addEventListener('click', () => {
            const student = students().find((s) => String(s.id) === b.getAttribute('data-profile'));
            if (student && typeof window.renderStudentProfile === 'function') window.renderStudentProfile(student.id);
        }));
    }

    /* ================= काळी यादी ================= */
    function renderBlack() {
        ensurePanels();
        seedInitialRecords();
        updateMenuBadges();
        const el = document.getElementById('panel-blacklist');
        if (!el) return;
        const all = [...students()].sort((a, b) => Number(a.rollNo || 0) - Number(b.rollNo || 0));
        const listed = all.filter(isBlack);

        el.innerHTML = `
            <div class="sb-head">
                <div>
                    <h2><i class="fa-solid fa-user-slash"></i> ${T('काळी यादी', 'Blacklist')}</h2>
                    <p>${T('गंभीर तक्रार असलेल्या विद्यार्थ्यांची नोंद इथे ठेवा.', 'Keep a record of students with serious complaints.')}</p>
                </div>
                <div><span class="sb-chip danger"><i class="fa-solid fa-triangle-exclamation"></i> ${listed.length} ${T('विद्यार्थी', 'students')}</span></div>
            </div>

            <div class="sb-card">
                <div class="sb-grid">
                    <div class="form-group">
                        <label>${T('विद्यार्थी', 'Student')}</label>
                        <select id="bl-student" class="form-control">
                            ${all.map((s) => `<option value="${esc(s.id)}">${esc(s.rollNo)} — ${esc(nameOf(s))}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>${T('दिनांक', 'Date')}</label>
                        <input type="date" id="bl-date" class="form-control" value="${today()}">
                    </div>
                    <div class="form-group" style="grid-column:1/-1">
                        <label>${T('कारण', 'Reason')}</label>
                        <input type="text" id="bl-reason" class="form-control" placeholder="${T('उदा. वारंवार गैरहजेरी', 'e.g. repeated absence')}">
                    </div>
                </div>
                <div class="sb-actions">
                    <button class="btn-primary" id="bl-add"><i class="fa-solid fa-ban"></i> ${T('काळ्या यादीत टाका', 'Add to blacklist')}</button>
                    <button class="btn-secondary" id="bl-send"><i class="fa-brands fa-telegram"></i> ${T('यादी टेलिग्रामवर पाठवा', 'Send list on Telegram')}</button>
                </div>
            </div>

            <div class="sb-card">
                ${listed.length ? `<table class="sb-table"><thead><tr>
                    <th>${T('हजेरी क्र.', 'Roll')}</th><th>${T('विद्यार्थी', 'Student')}</th><th>${T('वेळा', 'Times')}</th><th>${T('वर्ग', 'Class')}</th><th>${T('कारण', 'Reason')}</th><th>${T('दिनांक', 'Date')}</th><th></th>
                </tr></thead><tbody>
                ${listed.map((s) => {
                    const events = blacklistEvents(s);
                    const info = events[events.length - 1] || s.blacklistInfo || {};
                    const reason = info.reason || info.text || info.action || '—';
                    return `<tr class="is-blacklisted">
                        <td data-label="${T('हजेरी क्र.', 'Roll')}">${esc(s.rollNo)}</td>
                        <td class="sb-identity" data-label="${T('विद्यार्थी', 'Student')}"><span class="sb-chip danger"><i class="fa-solid fa-user-slash"></i> ${esc(nameOf(s))}</span></td>
                        <td class="sb-count" data-label="${T('वेळा', 'Times')}"><span class="sb-chip danger" data-blacklist-count>${blacklistCount(s)}×</span></td>
                        <td data-label="${T('वर्ग', 'Class')}">${esc(s.standard || '—')}</td>
                        <td class="sb-reason" data-label="${T('कारण', 'Reason')}">${esc(reason)}</td>
                        <td data-label="${T('दिनांक', 'Date')}">${esc(info.date || '—')}</td>
                        <td style="text-align:right"><button class="btn-secondary btn-sm" data-profile="${esc(s.id)}">${T('प्रोफाईल पहा', 'View profile')}</button> <button class="btn-secondary btn-sm" data-free="${esc(s.id)}"><i class="fa-solid fa-rotate-left"></i> ${T('काढा', 'Remove')}</button></td>
                    </tr>`;
                }).join('')}
                </tbody></table>` : `<div class="sb-empty">${T('काळी यादी रिकामी आहे. 👍', 'The blacklist is empty. 👍')}</div>`}
            </div>
        `;

        el.querySelector('#bl-add').onclick = () => {
            const sel = document.getElementById('bl-student');
            const s = students().find((x) => String(x.id) === (sel && sel.value));
            if (!s) { toast(T('विद्यार्थी निवडा.', 'Select a student.'), 'warning'); return; }
            const reason = document.getElementById('bl-reason').value.trim();
            const date = document.getElementById('bl-date').value || today();
            if (!reason) { toast(T('कारण लिहा.', 'Enter a reason.'), 'warning'); return; }
            ask(T(`${nameOf(s)} ला काळ्या यादीत टाकायचे?`, `Add ${nameOf(s)} to the blacklist?`), () => {
                const previousEvents = blacklistEvents(s).slice();
                s.blacklisted = true;
                s.blacklistInfo = { reason, date };
                s.blacklistHistory = previousEvents.concat([{ reason, date }]);
                s.complaints = s.complaints || [];
                s.complaints.push({ type: 'Blacklist', text: reason, action: reason, date });
                saveAll();
                updateMenuBadges();
                toast(T('काळ्या यादीत नोंद झाली.', 'Added to the blacklist.'));
                announce(`<b>⚠️ ${T('काळी यादी — नवीन नोंद', 'Blacklist — new entry')}</b>\n`
                    + `${T('विद्यार्थी', 'Student')}: <b>${nameOf(s)}</b> (${T('हजेरी क्र.', 'Roll')} ${s.rollNo})\n`
                    + `${T('कारण', 'Reason')}: ${reason}\n${T('दिनांक', 'Date')}: ${date}`, 'admins');
                renderBlack();
            });
        };

        el.querySelector('#bl-send').onclick = () => {
            const cur = students().filter(isBlack);
            if (!cur.length) { toast(T('यादी रिकामी आहे.', 'The list is empty.'), 'warning'); return; }
            const text = `<b>⚠️ ${T('काळी यादी', 'Blacklist')} (${cur.length})</b>\n\n`
                + cur.map((s, i) => {
                    const info = s.blacklistInfo || {};
                    return `${i + 1}. ${nameOf(s)} (${s.rollNo})${info.reason ? ` — ${info.reason}` : ''}`;
                }).join('\n');
            announce(text, 'admins');
        };

        el.querySelectorAll('[data-free]').forEach((b) => b.addEventListener('click', () => {
            const s = students().find((x) => String(x.id) === b.getAttribute('data-free'));
            if (!s) return;
            ask(T(`${nameOf(s)} ला काळ्या यादीतून काढायचे?`, `Remove ${nameOf(s)} from the blacklist?`), () => {
                s.blacklisted = false;
                delete s.blacklistInfo;
                saveAll();
                updateMenuBadges();
                toast(T('काळ्या यादीतून काढले.', 'Removed from the blacklist.'));
                renderBlack();
            });
        }));
        el.querySelectorAll('[data-profile]').forEach((b) => b.addEventListener('click', () => {
            const student = students().find((s) => String(s.id) === b.getAttribute('data-profile'));
            if (student && typeof window.renderStudentProfile === 'function') window.renderStudentProfile(student.id);
        }));
    }

    /* ---------- boot ---------- */
    function boot() {
        ensurePanels();
        addMenu();
        seedInitialRecords();
        seedRequestedRepeatRecords();
        updateMenuBadges();
        relabel();
    }

    /* भाषा बदलल्यावर मेन्यूची नावे व उघडे पॅनेल पुन्हा रंगवा */
    let lastLang = typeof currentLanguage !== 'undefined' ? currentLanguage : 'mr';
    setInterval(() => {
        const now = typeof currentLanguage !== 'undefined' ? currentLanguage : 'mr';
        if (now === lastLang) return;
        lastLang = now;
        relabel();
        const p = document.getElementById('panel-star-student');
        const b = document.getElementById('panel-blacklist');
        if (p && !p.classList.contains('d-none')) renderStar();
        else if (b && !b.classList.contains('d-none')) renderBlack();
    }, 800);

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
    setTimeout(boot, 1200);

    window.vssRenderStarStudent = renderStar;
    window.vssRenderBlacklist = renderBlack;
})();
