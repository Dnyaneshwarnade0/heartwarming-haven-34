/* =========================================================
   MANAGE LAYER (loads last)
   1. हजेरी संपादन (calendar cell → popup)
   2. विषय: कीर्तन, गायन, पखवाज, भागवत  (rating संपादन)
   3. तक्रार — संपादन व हटवा (popup)
   4. काळी यादी (Blacklist)
   5. फी — नवीन नोंद + संपादन popup
   6. कागदपत्रे — खरे download + बदला
   7. परीक्षा निकाल — आठवडा / महिना आलेख (०‑पासून)
   8. प्रोफाइल संपादन बटण सर्वत्र
   ========================================================= */
(function () {
    'use strict';

    const EN = () => (typeof currentLanguage !== 'undefined' ? currentLanguage : 'mr') === 'en';
    const T = (mr, en) => (EN() ? en : mr);
    const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const toast = (m, t) => (typeof createToast === 'function' ? createToast(m, t || 'success') : console.log(m));
    const save = () => { try { if (typeof saveDatabase === 'function') saveDatabase(); } catch (_) { } };
    const ask = (m, ok) => { if (typeof window.vssConfirm === 'function') window.vssConfirm(m, ok); else if (confirm(m)) ok(); };
    const stu = () => (typeof selectedStudent !== 'undefined' ? selectedStudent : null);
    const refreshProfile = () => {
        if (typeof resolveProfileData === 'function') resolveProfileData();
        if (typeof renderDashboardMetrics === 'function') renderDashboardMetrics();
    };

    /* ---------------- generic modal ---------------- */
    function modal(title, bodyHTML, onSave, saveLabel) {
        const old = document.getElementById('vss-mg-modal');
        if (old) old.remove();
        const w = document.createElement('div');
        w.id = 'vss-mg-modal';
        w.className = 'vss-confirm-overlay';
        w.innerHTML = `
            <div class="vss-confirm-box vss-edit-box">
                <h3>${title}</h3>
                <div class="vss-mg-body">${bodyHTML}</div>
                <div class="vss-confirm-actions">
                    <button type="button" class="btn-secondary" data-no>${T('रद्द करा', 'Cancel')}</button>
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
       1. हजेरी संपादन
       ========================================================= */
    const SESSIONS = [
        { k: 'morning', mr: 'सकाळ', en: 'Morning' },
        { k: 'evening', mr: 'संध्याकाळ', en: 'Evening' },
        { k: 'school', mr: 'शाळा', en: 'School' }
    ];

    function openAttendanceEditor(key) {
        const s = stu();
        if (!s) return;
        s.dailyAttendance = s.dailyAttendance || {};
        const rec = s.dailyAttendance[key] || {};
        const rows = SESSIONS.map((se) => {
            const has = Object.prototype.hasOwnProperty.call(rec, se.k);
            const v = !has ? '' : (rec[se.k] ? 'p' : 'a');
            return `
                <div class="vss-mg-row">
                    <span>${T(se.mr, se.en)}</span>
                    <div class="vss-seg" data-k="${se.k}">
                        <button type="button" data-v="p" class="${v === 'p' ? 'on ok' : ''}">${T('हजर', 'Present')}</button>
                        <button type="button" data-v="a" class="${v === 'a' ? 'on no' : ''}">${T('गैरहजर', 'Absent')}</button>
                        <button type="button" data-v="" class="${v === '' ? 'on' : ''}">${T('नोंद नाही', 'No record')}</button>
                    </div>
                </div>`;
        }).join('');

        const w = modal(`${T('हजेरी बदला', 'Edit attendance')} — ${key}`, rows, (box) => {
            const out = {};
            box.querySelectorAll('.vss-seg').forEach((seg) => {
                const on = seg.querySelector('.on');
                const v = on ? on.getAttribute('data-v') : '';
                if (v === 'p') out[seg.getAttribute('data-k')] = true;
                else if (v === 'a') out[seg.getAttribute('data-k')] = false;
            });
            if (Object.keys(out).length) s.dailyAttendance[key] = out;
            else delete s.dailyAttendance[key];
            save();
            refreshProfile();
            if (typeof renderAttendanceGrid === 'function') renderAttendanceGrid();
            setTimeout(wireCalendarCells, 60);
            toast(T('हजेरी अद्ययावत झाली', 'Attendance updated'));
        });

        w.querySelectorAll('.vss-seg button').forEach((b) => {
            b.onclick = () => {
                b.parentElement.querySelectorAll('button').forEach((x) => (x.className = ''));
                b.className = 'on' + (b.getAttribute('data-v') === 'p' ? ' ok' : b.getAttribute('data-v') === 'a' ? ' no' : '');
            };
        });
    }

    function wireCalendarCells() {
        const cal = document.getElementById('attendance-calendar');
        if (!cal) return;
        const navB = document.querySelector('#vss-cal-nav b');
        const label = navB ? navB.textContent.trim() : '';
        let year = new Date().getFullYear(), month = new Date().getMonth();
        const mn = ['जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'];
        const me = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        if (label) {
            const parts = label.split(/\s+/);
            const idx = Math.max(mn.indexOf(parts[0]), me.indexOf(parts[0]));
            if (idx >= 0) month = idx;
            const y = parseInt(parts[1], 10);
            if (y) year = y;
        }
        [...cal.children].forEach((cell) => {
            if (!cell.classList.contains('calendar-day-cell') || cell.classList.contains('empty')) return;
            if (cell.dataset.mgWired) return;
            cell.dataset.mgWired = '1';
            cell.classList.add('vss-editable');
            const numEl = cell.querySelector('.cal-day-num');
            const day = parseInt((numEl ? numEl.textContent : cell.textContent) || '0', 10);
            if (!day) return;
            const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            cell.addEventListener('click', () => openAttendanceEditor(key));
        });
    }

    function patchCalendar() {
        if (typeof window.renderAttendanceGrid !== 'function' || window.renderAttendanceGrid.__mg) return;
        const orig = window.renderAttendanceGrid;
        const wrapped = function () {
            orig.apply(this, arguments);
            setTimeout(wireCalendarCells, 30);
        };
        wrapped.__mg = 1;
        window.renderAttendanceGrid = wrapped;
    }

    /* =========================================================
       2. विषय — कीर्तन / गायन / पखवाज / भागवत
       ========================================================= */
    const SUBJECTS = [
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
    window.VSS_SUBJECTS = SUBJECTS;

    function installSubjects() {
        window.renderSubjectsRatings = function () {
            const list = document.getElementById('prof-subjects-list');
            if (!list) return;
            const s = stu();
            const map = (s && s.subjects) || {};
            list.innerHTML = SUBJECTS.map((sub) => {
                const g = map[sub.k] || map[sub.en] || '';
                const gl = (GRADES.find((x) => x.v === g) || {});
                return `
                    <li>
                        <span class="subject-name">${T(sub.mr, sub.en)}</span>
                        <span class="subject-badge ${g ? g.toLowerCase() : 'na'}" data-sub="${sub.k}" role="button" tabindex="0">
                            ${g ? T(gl.mr || g, gl.en || g) : T('श्रेणी द्या', 'Set grade')} <i class="fa-solid fa-pen" style="font-size:.7em;opacity:.6"></i>
                        </span>
                    </li>`;
            }).join('');
            list.querySelectorAll('[data-sub]').forEach((el) => {
                el.onclick = () => openSubjectPicker(el.getAttribute('data-sub'));
            });
        };
    }

    function openSubjectPicker(key) {
        const s = stu();
        if (!s) return;
        const sub = SUBJECTS.find((x) => x.k === key);
        const cur = (s.subjects || {})[key] || '';
        const body = `<div class="vss-mg-choices">${GRADES.map((g) => `
            <button type="button" class="vss-choice ${cur === g.v ? 'on' : ''}" data-g="${g.v}">${T(g.mr, g.en)}</button>`).join('')}
            <button type="button" class="vss-choice" data-g="">${T('काढून टाका', 'Clear')}</button></div>`;
        const w = modal(`${T('विषय', 'Subject')}: ${T(sub.mr, sub.en)}`, body, null);
        w.querySelectorAll('[data-g]').forEach((b) => {
            b.onclick = () => {
                s.subjects = s.subjects || {};
                const g = b.getAttribute('data-g');
                if (g) s.subjects[key] = g; else delete s.subjects[key];
                save();
                refreshProfile();
                window.renderSubjectsRatings();
                w.remove();
                toast(T('श्रेणी जतन झाली', 'Grade saved'));
            };
        });
    }

    /* =========================================================
       3+4. तक्रार / काळी यादी
       ========================================================= */
    const COMPLAINT_TYPES = [
        { v: 'Late Wakeup', mr: 'उशिरा उठणे', en: 'Late wakeup' },
        { v: 'Abusive Language', mr: 'शिवी देणे', en: 'Abusive language' },
        { v: 'School', mr: 'शाळा', en: 'School' },
        { v: 'School Bus', mr: 'शाळेची बस', en: 'School bus' },
        { v: 'Swadhyay Not Noted', mr: 'स्वाध्याय न नोंदवणे', en: 'Swadhyay not noted' },
        { v: 'Talking Back', mr: 'उलट फिरून बोलणे', en: 'Talking back' },
        { v: 'Notification', mr: 'सूचना', en: 'Notification' },
        { v: 'Homework Incomplete', mr: 'गृहपाठ अपूर्ण', en: 'Homework incomplete' },
        { v: 'Disciplinary Issue', mr: 'शिस्तभंग', en: 'Disciplinary issue' },
        { v: 'Health Report', mr: 'आरोग्य अहवाल', en: 'Health report' },
        { v: 'Blacklist', mr: 'काळी यादी', en: 'Blacklist' }
    ];
    const typeLabel = (v) => { const t = COMPLAINT_TYPES.find((x) => x.v === v); return t ? T(t.mr, t.en) : v; };

    function complaintForm(c) {
        return `
            <div class="form-group"><label>${T('दिनांक', 'Date')}</label>
                <input class="form-control" type="date" data-f="date" value="${esc(c.date || new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10))}"></div>
            <div class="form-group"><label>${T('प्रकार', 'Type')}</label>
                <select class="form-control" data-f="type">${COMPLAINT_TYPES.map((t) => `<option value="${t.v}" ${c.type === t.v ? 'selected' : ''}>${T(t.mr, t.en)}</option>`).join('')}</select></div>
            <div class="form-group"><label>${T('तपशील / केलेली कारवाई', 'Details / action taken')}</label>
                <textarea class="form-control" rows="3" data-f="action">${esc(c.action || '')}</textarea></div>`;
    }

    function readForm(box) {
        const o = {};
        box.querySelectorAll('[data-f]').forEach((i) => (o[i.getAttribute('data-f')] = i.value.trim()));
        return o;
    }

    function afterComplaintChange() {
        save();
        refreshProfile();
        if (typeof renderIncidentLogs === 'function') renderIncidentLogs();
        setTimeout(wireComplaintRows, 60);
        renderBlacklistBadge();
    }

    window.vssEditComplaint = function (idx) {
        const s = stu();
        if (!s || !s.complaints || !s.complaints[idx]) return;
        const c = s.complaints[idx];
        modal(T('तक्रार संपादित करा', 'Edit complaint'), complaintForm(c), (box) => {
            const v = readForm(box);
            c.date = v.date; c.type = v.type; c.action = v.action;
            if (v.type === 'Blacklist') s.blacklisted = true;
            afterComplaintChange();
            toast(T('तक्रार अद्ययावत झाली', 'Complaint updated'));
        });
    };

    window.vssDeleteComplaint = function (idx) {
        const s = stu();
        if (!s || !s.complaints) return;
        ask(T('ही नोंद कायमची हटवायची का?', 'Delete this record permanently?'), () => {
            s.complaints.splice(idx, 1);
            if (!s.complaints.some((c) => c.type === 'Blacklist')) s.blacklisted = false;
            afterComplaintChange();
            toast(T('नोंद हटवली', 'Record deleted'), 'danger');
        });
    };

    window.vssAddComplaint = function (preset) {
        const s = stu();
        if (!s) return;
        modal(preset === 'Blacklist' ? T('काळ्या यादीत टाका', 'Add to blacklist') : T('नवीन तक्रार', 'New complaint'),
            complaintForm({ type: preset || 'Late Wakeup' }), (box) => {
                const v = readForm(box);
                s.complaints = s.complaints || [];
                s.complaints.push({ date: v.date, type: v.type, action: v.action });
                if (v.type === 'Blacklist') s.blacklisted = true;
                afterComplaintChange();
                toast(T('नोंद जतन झाली', 'Record saved'));
            });
    };

    function wireComplaintRows() {
        const list = document.getElementById('prof-complaints-list');
        if (!list) return;
        [...list.children].forEach((el, idx) => {
            if (!el.classList.contains('timeline-item')) return;
            if (el.querySelector('.vss-row-acts')) return;
            const bar = document.createElement('div');
            bar.className = 'vss-row-acts';
            bar.innerHTML = `
                <button type="button" class="vss-mini-btn"><i class="fa-solid fa-pen"></i> ${T('संपादन', 'Edit')}</button>
                <button type="button" class="vss-mini-btn danger"><i class="fa-solid fa-trash"></i> ${T('हटवा', 'Delete')}</button>`;
            bar.children[0].onclick = () => window.vssEditComplaint(idx);
            bar.children[1].onclick = () => window.vssDeleteComplaint(idx);
            el.appendChild(bar);
        });
    }

    function patchIncidents() {
        if (typeof window.renderIncidentLogs !== 'function' || window.renderIncidentLogs.__mg) return;
        const orig = window.renderIncidentLogs;
        const wrapped = function () {
            orig.apply(this, arguments);
            setTimeout(wireComplaintRows, 20);
        };
        wrapped.__mg = 1;
        window.renderIncidentLogs = wrapped;
    }

    function injectComplaintButtons() {
        const host = document.getElementById('prof-complaints-list');
        if (!host || !host.parentElement) return;
        if (document.getElementById('vss-comp-actions')) return;
        const bar = document.createElement('div');
        bar.id = 'vss-comp-actions';
        bar.className = 'vss-btn-bar';
        bar.innerHTML = `
            <button type="button" class="btn-primary btn-sm" id="vss-comp-add"><i class="fa-solid fa-plus"></i> ${T('तक्रार नोंदवा', 'Add complaint')}</button>
            <button type="button" class="btn-danger btn-sm" id="vss-comp-black"><i class="fa-solid fa-ban"></i> ${T('काळी यादी', 'Blacklist')}</button>`;
        host.parentElement.insertBefore(bar, host);
        bar.querySelector('#vss-comp-add').onclick = () => window.vssAddComplaint();
        bar.querySelector('#vss-comp-black').onclick = () => window.vssAddComplaint('Blacklist');
    }

    function renderBlacklistBadge() {
        const s = stu();
        const nameEl = document.getElementById('prof-name');
        if (!nameEl) return;
        const old = document.getElementById('vss-black-badge');
        if (old) old.remove();
        const isBlack = s && (s.blacklisted || (s.complaints || []).some((c) => c.type === 'Blacklist'));
        if (!isBlack) return;
        const b = document.createElement('span');
        b.id = 'vss-black-badge';
        b.className = 'vss-black-badge';
        b.innerHTML = `<i class="fa-solid fa-ban"></i> ${T('काळी यादी', 'Blacklisted')}`;
        nameEl.appendChild(b);
    }

    /* =========================================================
       5. फी — नवीन नोंद + संपादन popup
       ========================================================= */
    const MODES = ['Cash', 'UPI', 'Cheque', 'Bank Transfer'];
    function feeForm(l) {
        return `
            <div class="form-group"><label>${T('तारीख', 'Date')}</label>
                <input class="form-control" type="date" data-f="date" value="${esc(l.date || new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10))}"></div>
            <div class="form-group"><label>${T('रक्कम (₹)', 'Amount (₹)')}</label>
                <input class="form-control" type="number" min="0" data-f="amount" value="${esc(l.amount || '')}"></div>
            <div class="form-group"><label>${T('भरण्याची पद्धत', 'Payment mode')}</label>
                <select class="form-control" data-f="mode">${MODES.map((m) => `<option ${l.mode === m ? 'selected' : ''}>${m}</option>`).join('')}</select></div>
            <div class="form-group"><label>${T('पावती क्रमांक', 'Receipt no.')}</label>
                <input class="form-control" data-f="receipt" value="${esc(l.receipt || '')}"></div>`;
    }

    function afterFeeChange() {
        save();
        refreshProfile();
        if (typeof renderFeesTab === 'function') renderFeesTab();
        setTimeout(wireFeeRows, 60);
    }

    window.editPaymentEntry = function (idx) {
        const s = stu();
        if (!s || !s.fees || !s.fees.ledger || !s.fees.ledger[idx]) return;
        const l = s.fees.ledger[idx];
        modal(T('फी नोंद संपादित करा', 'Edit fee entry'), feeForm(l), (box) => {
            const v = readForm(box);
            const amt = Number(v.amount) || 0;
            const diff = amt - Number(l.amount || 0);
            l.date = v.date; l.amount = amt; l.mode = v.mode; l.receipt = v.receipt;
            s.fees.paid = Math.max(0, Number(s.fees.paid || 0) + diff);
            afterFeeChange();
            toast(T('फी नोंद अद्ययावत झाली', 'Fee entry updated'));
        });
    };

    window.vssDeletePayment = function (idx) {
        const s = stu();
        if (!s || !s.fees || !s.fees.ledger || !s.fees.ledger[idx]) return;
        const l = s.fees.ledger[idx];
        ask(T(`₹${l.amount} ची नोंद हटवायची का?`, `Delete payment of ₹${l.amount}?`), () => {
            s.fees.ledger.splice(idx, 1);
            s.fees.paid = Math.max(0, Number(s.fees.paid || 0) - Number(l.amount || 0));
            afterFeeChange();
            toast(T('नोंद हटवली', 'Payment deleted'), 'danger');
        });
    };

    window.vssAddPayment = function () {
        const s = stu();
        if (!s) return;
        s.fees = s.fees || { total: 0, paid: 0, ledger: [] };
        const rc = 'REC-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-5);
        modal(T('नवीन फी नोंद', 'New fee entry'), feeForm({ receipt: rc }), (box) => {
            const v = readForm(box);
            const amt = Number(v.amount) || 0;
            if (amt <= 0) { toast(T('रक्कम भरा', 'Enter an amount'), 'danger'); return false; }
            s.fees.ledger = s.fees.ledger || [];
            s.fees.ledger.push({ date: v.date, amount: amt, mode: v.mode, receipt: v.receipt });
            s.fees.paid = Number(s.fees.paid || 0) + amt;
            afterFeeChange();
            toast(T('फी नोंद जतन झाली', 'Fee entry saved'));
        });
    };

    function wireFeeRows() {
        const tbody = document.getElementById('payment-ledger-body');
        if (!tbody) return;
        [...tbody.querySelectorAll('tr')].forEach((tr, idx) => {
            const cell = tr.lastElementChild;
            if (!cell) return;
            const dup = cell.querySelector('[data-vss-del]');
            if (dup) dup.remove();
            if (cell.querySelector('[data-mg-del]')) return;
            if (!tr.querySelector('code')) return;
            const b = document.createElement('button');
            b.className = 'btn-table-action delete';
            b.style.marginLeft = '6px';
            b.setAttribute('data-mg-del', '1');
            b.title = T('हटवा', 'Delete');
            b.innerHTML = '<i class="fa-solid fa-trash"></i>';
            b.onclick = () => window.vssDeletePayment(idx);
            cell.appendChild(b);
        });
        const host = tbody.closest('.content-card') || tbody.closest('div');
        if (host && !document.getElementById('vss-fee-add')) {
            const bar = document.createElement('div');
            bar.className = 'vss-btn-bar';
            bar.innerHTML = `<button type="button" class="btn-primary btn-sm" id="vss-fee-add"><i class="fa-solid fa-plus"></i> ${T('नवीन फी नोंद', 'New fee entry')}</button>`;
            host.appendChild(bar);
            bar.querySelector('#vss-fee-add').onclick = () => window.vssAddPayment();
        }
    }

    function patchFees() {
        if (typeof window.renderFeesTab !== 'function' || window.renderFeesTab.__mg) return;
        const orig = window.renderFeesTab;
        const wrapped = function () {
            orig.apply(this, arguments);
            setTimeout(wireFeeRows, 20);
        };
        wrapped.__mg = 1;
        window.renderFeesTab = wrapped;
    }

    /* =========================================================
       6. कागदपत्रे — खरा download + बदला
       ========================================================= */
    function readFileAsDataURL(file) {
        return new Promise((res) => {
            const fr = new FileReader();
            fr.onload = () => res(fr.result);
            fr.onerror = () => res(null);
            fr.readAsDataURL(file);
        });
    }

    window.triggerDocUpload = function (docName) {
        const s = stu();
        if (!s) return;
        const inp = document.createElement('input');
        inp.type = 'file';
        inp.accept = 'image/*,application/pdf';
        inp.onchange = async () => {
            const f = inp.files && inp.files[0];
            if (!f) return;
            if (f.size > 4 * 1024 * 1024) { toast(T('फाईल ४ MB पेक्षा लहान असावी', 'File must be under 4 MB'), 'danger'); return; }
            const data = await readFileAsDataURL(f);
            s.documents = (s.documents || []).filter((d) => d.name !== docName);
            s.documents.push({
                name: docName,
                status: 'Uploaded',
                size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
                type: f.type.includes('pdf') ? 'PDF' : 'Image',
                fileName: f.name,
                data: data || ''
            });
            save();
            refreshProfile();
            if (typeof renderDocumentsGrid === 'function') renderDocumentsGrid();
            toast(T('कागदपत्र जतन झाले', 'Document saved'));
        };
        inp.click();
    };

    window.simulateDocDownload = function (e, docName) {
        if (e && e.preventDefault) e.preventDefault();
        const s = stu();
        const d = ((s && s.documents) || []).find((x) => x.name === docName);
        if (!d || !d.data) {
            toast(T('या कागदपत्राची फाईल जतन केलेली नाही — कृपया पुन्हा अपलोड करा.', 'No file stored for this document — please upload again.'), 'danger');
            return;
        }
        const a = document.createElement('a');
        a.href = d.data;
        a.download = d.fileName || (docName.replace(/\s+/g, '_') + (d.type === 'PDF' ? '.pdf' : '.jpg'));
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast(T('डाउनलोड सुरू झाले', 'Download started'));
    };

    function wireDocCards() {
        const grid = document.getElementById('prof-documents-grid');
        if (!grid) return;
        [...grid.children].forEach((card) => {
            if (!card.classList.contains('active') || card.querySelector('[data-mg-edit]')) return;
            const dl = card.querySelector('a[onclick]');
            const nameMatch = dl && /simulateDocDownload\(event,\s*'([^']+)'/.exec(dl.getAttribute('onclick') || '');
            if (!nameMatch) return;
            const docName = nameMatch[1];
            const b = document.createElement('button');
            b.className = 'btn-secondary btn-sm w-full mt-2';
            b.setAttribute('data-mg-edit', '1');
            b.innerHTML = `<i class="fa-solid fa-rotate"></i> ${T('बदला', 'Replace')}`;
            b.onclick = () => window.triggerDocUpload(docName);
            card.appendChild(b);
        });
    }

    function patchDocs() {
        if (typeof window.renderDocumentsGrid !== 'function' || window.renderDocumentsGrid.__mg) return;
        const orig = window.renderDocumentsGrid;
        const wrapped = function () {
            orig.apply(this, arguments);
            setTimeout(wireDocCards, 20);
        };
        wrapped.__mg = 1;
        window.renderDocumentsGrid = wrapped;
    }

    /* =========================================================
       7. परीक्षा निकाल — आठवडा / महिना आलेख
       ========================================================= */
    let chartMode = 'week';

    const loadExams = () => { try { return JSON.parse(localStorage.getItem('vss_exams') || '[]'); } catch (_) { return []; } };

    function weekKey(d) {
        const dt = new Date(d + 'T00:00:00');
        if (isNaN(dt)) return null;
        const t = new Date(dt);
        t.setDate(t.getDate() - ((t.getDay() + 6) % 7)); // सोमवार
        return t.toISOString().slice(0, 10);
    }

    function weeklyMarks(sid) {
        return loadExams().map((ex) => {
            const match = String(ex && ex.id || '').match(/^wk-(\d+)$/);
            const entry = match && ex.entries && ex.entries[sid];
            if (!entry || entry.marks === '' || entry.marks === null || entry.marks === undefined) return null;
            const max = Number(ex.max) || 100;
            return { week: Number(match[1]), date: ex.date || '', pct: Math.max(0, Math.min(100, Math.round((Number(entry.marks) / max) * 100))) };
        }).filter(Boolean).sort((a, b) => a.week - b.week);
    }

    function buckets(sid) {
        const rows = weeklyMarks(sid);
        if (chartMode === 'week') return rows;
        const map = new Map();
        rows.forEach((r) => {
            const k = (r.date || '').slice(0, 7);
            if (!k) return;
            const cur = map.get(k) || { sum: 0, n: 0 };
            cur.sum += r.pct; cur.n++;
            map.set(k, cur);
        });
        return [...map.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([k, v]) => ({ k, pct: Math.round(v.sum / v.n) }));
    }

    function lastSlots(n) {
        const out = [];
        const now = new Date();
        for (let i = n - 1; i >= 0; i--) {
            if (chartMode === 'week') {
                const d = new Date(now);
                d.setDate(d.getDate() - i * 7);
                d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
                out.push(d.toISOString().slice(0, 10));
            } else {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                out.push(d.toISOString().slice(0, 7));
            }
        }
        return out;
    }

    function slotLabel(point, i) {
        if (chartMode === 'week') return `W${point.week || i + 1}`;
        const k = typeof point === 'string' ? point : point.k;
        const mn = ['जाने', 'फेब्रु', 'मार्च', 'एप्रि', 'मे', 'जून', 'जुलै', 'ऑग', 'सप्टें', 'ऑक्टो', 'नोव्हें', 'डिसें'];
        const me = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const m = parseInt(k.slice(5, 7), 10) - 1;
        return T(mn[m] || k, me[m] || k);
    }

    function drawExamChart() {
        const host = document.querySelector('#tab-progress .svg-chart-container');
        if (!host) return;
        const s = stu();
        const data = s ? buckets(s.id) : [];
        let pts;
        if (data.length) {
            pts = data.map((point, i) => ({ ...point, label: slotLabel(point, i), has: true }));
        } else {
            const take = chartMode === 'week' ? 10 : 6;
            pts = lastSlots(take).map((k, i) => ({ k, label: slotLabel(k, i), pct: 0, has: false }));
        }

        const W = 420, H = 220, L = 38, R = 12, TOP = 14, B = 40;
        const x = (i) => L + (i * (W - L - R)) / Math.max(1, pts.length - 1);
        const y = (p) => TOP + (1 - p / 100) * (H - TOP - B);

        const grid = [0, 25, 50, 75, 100].map((g) => `
            <line x1="${L}" y1="${y(g)}" x2="${W - R}" y2="${y(g)}" stroke="${g === 0 ? '#bbb' : '#eee'}" stroke-width="${g === 0 ? 1.5 : 1}"></line>
            <text x="${L - 6}" y="${y(g) + 4}" class="chart-text" text-anchor="end">${g}%</text>`).join('');
        const path = pts.map((p, i) => `${i ? 'L' : 'M'} ${x(i)},${y(p.pct)}`).join(' ');
        const area = pts.length ? `${path} L ${x(pts.length - 1)},${H - B} L ${x(0)},${H - B} Z` : '';
        const nodes = pts.map((p, i) => `
            <circle cx="${x(i)}" cy="${y(p.pct)}" r="${p.has ? 5 : 3.5}" fill="${p.has ? '#fff' : '#ddd'}" stroke="#9d7025" stroke-width="${p.has ? 3 : 2}">
                <title>${p.label}: ${p.has ? p.pct + '%' : T('गुण नाहीत', 'no marks')}</title></circle>
            ${p.has && (pts.length <= 12 || i === pts.length - 1 || p.week % 5 === 0) ? `<text x="${x(i)}" y="${y(p.pct) - 10}" class="chart-text" text-anchor="middle">${p.pct}%</text>` : ''}`).join('');
        const xlabels = pts.map((p, i) => (pts.length <= 12 || i === 0 || i === pts.length - 1 || (p.week && p.week % 5 === 0)) ? `<text x="${x(i)}" y="${H - 18}" class="chart-text" text-anchor="middle">${p.label}</text>` : '').join('');
        const axis = T(chartMode === 'week' ? 'आठवडा →' : 'महिना →', chartMode === 'week' ? 'Week →' : 'Month →');

        host.classList.add('vss-marks-modern');
        host.innerHTML = `
            <div class="vss-chart-tabs">
                <button type="button" data-m="week" class="${chartMode === 'week' ? 'on' : ''}">${T('आठवडा', 'Week')}</button>
                <button type="button" data-m="month" class="${chartMode === 'month' ? 'on' : ''}">${T('महिना', 'Month')}</button>
            </div>
            <svg viewBox="0 0 ${W} ${H}" class="line-chart-svg">
                <defs>
                    <linearGradient id="marksLineGradient" x1="0" x2="1" y1="0" y2="0"><stop stop-color="#8a5b16"/><stop offset="1" stop-color="#d59a2d"/></linearGradient>
                    <linearGradient id="marksAreaGradient" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#d59a2d" stop-opacity=".32"/><stop offset="1" stop-color="#d59a2d" stop-opacity="0"/></linearGradient>
                </defs>
                ${grid}
                <path d="${area}" fill="url(#marksAreaGradient)"></path>
                <path d="${path}" fill="none" stroke="url(#marksLineGradient)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>
                ${nodes}
                ${xlabels}
                <text x="${W - R}" y="${H - 3}" class="chart-text" text-anchor="end">${axis}</text>
                <text x="${L - 30}" y="${TOP + 4}" class="chart-text">%</text>
            </svg>
            <p class="text-sm text-center text-muted mt-2">${data.length ? T('परीक्षा विभागातील गुणांवर आधारित', 'Based on marks from the Exam section')
                : T('अद्याप गुण दिलेले नाहीत — आलेख ० वर आहे.', 'No marks entered yet — the chart stays at 0.')}</p>`;

        const legacy = host.parentElement && host.parentElement.querySelector('[data-key="lbl-average-trend"]');
        if (legacy) legacy.style.display = 'none';

        host.querySelectorAll('[data-m]').forEach((b) => {
            b.onclick = () => { chartMode = b.getAttribute('data-m'); drawExamChart(); };
        });
    }

    function installChart() {
        window.renderAcademicsSVGChart = function () { drawExamChart(); };
    }

    /* =========================================================
       8. प्रोफाइल संपादन बटण
       ========================================================= */
    function patchProfileRender() {
        if (typeof window.renderStudentProfile !== 'function' || window.renderStudentProfile.__mg) return;
        const orig = window.renderStudentProfile;
        const wrapped = function () {
            const r = orig.apply(this, arguments);
            setTimeout(() => {
                wireCalendarCells();
                wireComplaintRows();
                wireFeeRows();
                wireDocCards();
                injectComplaintButtons();
                renderBlacklistBadge();
            }, 60);
            return r;
        };
        wrapped.__mg = 1;
        window.renderStudentProfile = wrapped;
    }

    /* परीक्षा विषय सुचवा — कीर्तन / गायन / पखवाज / भागवत */
    function examSubjectSuggestions() {
        const inp = document.getElementById('ex-subject');
        if (!inp || inp.dataset.mgList) return;
        inp.dataset.mgList = '1';
        const dl = document.createElement('datalist');
        dl.id = 'vss-subject-list';
        dl.innerHTML = SUBJECTS.map((s) => `<option value="${T(s.mr, s.en)}"></option>`).join('');
        inp.parentNode.appendChild(dl);
        inp.setAttribute('list', 'vss-subject-list');
    }

    /* ---------------- boot ---------------- */
    function boot() {
        try {
            patchCalendar();
            installSubjects();
            patchIncidents();
            patchFees();
            patchDocs();
            installChart();
            patchProfileRender();
            setInterval(examSubjectSuggestions, 1500);
        } catch (e) { console.error('manage boot', e); }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 700));
    else setTimeout(boot, 700);
})();
