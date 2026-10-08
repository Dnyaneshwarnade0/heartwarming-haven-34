/* =========================================================
   MENU BOT — बिना AI / API वाला पर्याय-आधारित सहाय्यक
   बटन दबाओ → विद्यार्थी चुनो → पर्याय चुनो → सॉफ़्टवेयर में सेव
   ========================================================= */
(function () {
    'use strict';

    const EN = () => (typeof currentLanguage !== 'undefined' ? currentLanguage : 'mr') === 'en';
    const T = (mr, en) => (EN() ? en : mr);
    const students = () => (typeof studentsDatabase !== 'undefined' && Array.isArray(studentsDatabase)) ? studentsDatabase : [];
    const nameOf = (s) => (typeof getStudentName === 'function' ? getStudentName(s)
        : (s && typeof s.name === 'object' ? (s.name.mr || s.name.en) : (s && s.name) || ''));
    const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const today = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    const toast = (m, ty) => { try { if (typeof createToast === 'function') createToast(m, ty || 'success'); } catch (_) { } };
    const saveAll = () => {
        try { localStorage.setItem('vss_students', JSON.stringify(students())); } catch (_) { }
        try { if (typeof saveDatabase === 'function') saveDatabase(); } catch (_) { }
        try { if (window.vssCloudPush) window.vssCloudPush(); else if (window.vssCloud && window.vssCloud.save) window.vssCloud.save(); } catch (_) { }
    };
    const apply = (a) => (typeof window.vssApplyAiAction === 'function' ? window.vssApplyAiAction(a) : null);
    const schoolEligible = (s) => typeof window.vssIsSchoolEligible === 'function' ? window.vssIsSchoolEligible(s) : !s.notGoingToSchool;

    function hasExistingAttendance(session) {
        const d = today();
        return students().some((s) => (session !== 'school' || schoolEligible(s)) && typeof ((s.dailyAttendance || {})[d] || {})[session] === 'boolean');
    }

    function attendanceSummary() {
        const d = today();
        return ['morning', 'evening', 'school'].map((session) => {
            const records = students().filter((s) => session !== 'school' || schoolEligible(s)).map((s) => ((s.dailyAttendance || {})[d] || {})[session]).filter((v) => typeof v === 'boolean');
            const present = records.filter(Boolean).length;
            const label = { morning: T('सकाळ', 'Morning'), evening: T('संध्याकाळ', 'Evening'), school: T('शाळा', 'School') }[session];
            return `${label}: <b>${present}</b> ${T('हजर', 'present')} • <b>${records.length - present}</b> ${T('गैरहजर', 'absent')} • <b>${records.length}</b> ${T('एकूण', 'total')}`;
        }).join('<br>');
    }

    function weekValue() {
        const d = new Date();
        const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        const day = t.getUTCDay() || 7;
        t.setUTCDate(t.getUTCDate() + 4 - day);
        const y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
        const w = Math.ceil(((t - y) / 86400000 + 1) / 7);
        return t.getUTCFullYear() + '-W' + String(w).padStart(2, '0');
    }

    /* ---------- पर्याय (options) ---------- */
    const OPT = {
        complaint: () => [T('गृहपाठ केला नाही', 'Homework not done'), T('उशिरा आला', 'Came late'), T('भांडण', 'Fight'),
            T('गैरवर्तन', 'Misbehaviour'), T('गणवेश नाही', 'No uniform'), T('वर्गात लक्ष नाही', 'Not attentive')],
        remark: () => [T('उत्तम प्रगती', 'Excellent progress'), T('चांगले वर्तन', 'Good behaviour'), T('अभ्यासात सुधारणा हवी', 'Needs study improvement'),
            T('नियमित उपस्थित', 'Regular attendance'), T('पाठांतर छान', 'Good memorisation')],
        medical: () => [T('ताप', 'Fever'), T('सर्दी-खोकला', 'Cold & cough'), T('पोटदुखी', 'Stomach ache'),
            T('डोकेदुखी', 'Headache'), T('जखम', 'Injury')],
        fee: () => [100, 500, 1000, 2000, 5000],
        adarsh: () => [T('शिस्त', 'Discipline'), T('अभ्यास', 'Studies'), T('सेवा', 'Service'),
            T('पाठांतर', 'Memorisation'), T('नेतृत्व', 'Leadership')],
        black: () => [T('वारंवार गैरवर्तन', 'Repeated misbehaviour'), T('चोरी', 'Theft'), T('हिंसा', 'Violence'),
            T('नियमभंग', 'Rule violation'), T('फी थकबाकी', 'Fee default')]
    };

    const COMPLAINT_OPTIONS = () => [
        T('शिवी देणे', 'Using abusive language'), T('शाळेत दंगा', 'Disrupting school'),
        T('अभ्यास न करणे', 'Not studying'), T('सेवा न करणे', 'Not doing seva'),
        T('मोठ्यांना उलट बोलणे', 'Talking back to elders'), T('उशिरा उठणे', 'Waking up late')
    ];

    const COMPLAINT_SEVERITIES = () => [
        T('सामान्य / Normal', 'Normal'), T('मध्यम / Medium', 'Medium'), T('गंभीर / Serious', 'Serious')
    ];

    const ACTIONS = () => [
        { k: 'attendance', icon: '📋', label: T('हजेरी', 'Attendance') },
        { k: 'absence-reason', icon: '🏫', label: T('शाळा गैरहजेरीचे कारण', 'School absence reason') },
        { k: 'info', icon: '👦', label: T('विद्यार्थी माहिती', 'Student information') },
        { k: 'complaints', icon: '⚠️', label: T('तक्रार / काळी यादी', 'Complaints / Blacklist') },
        { k: 'medical', icon: '🩺', label: T('आरोग्य नोंद', 'Health record') },
        { k: 'adarsh', icon: '⭐', label: T('आदर्श विद्यार्थी', 'Student of the week / Adarsh Vidyarthi') },
        { k: 'parent-visit', icon: '👨‍👩‍👦', label: T('पालक भेट', 'Palak visit') },
        { k: 'leave', icon: '🏠', label: T('रजा / गाव', 'Leave / village') },
        { k: 'backup', icon: '💾', label: T('बॅकअप', 'Backup') },
        { k: 'fees', icon: '🧾', label: T('फी / पावती', 'Fee / Receipt') },
        { k: 'marks', icon: '📝', label: T('गुण', 'Marks') },
        { k: 'admission', icon: '🎓', label: T('नवीन प्रवेश', 'Admission') }
    ];

    /* ---------- state ---------- */
    let st = { step: 'home', action: null, student: null, search: '', absentIds: [], session: 'morning', pendingSession: '', msg: '', complaintMode: '', complaintKind: 'complaint', complaintType: '', complaintSeverity: '', selectedIds: [], complaintText: '' };
    const reset = (msg) => { st = { step: 'home', action: null, student: null, search: '', absentIds: [], session: 'morning', pendingSession: '', msg: msg || '', complaintMode: '', complaintKind: 'complaint', complaintType: '', complaintSeverity: '', selectedIds: [], complaintText: '' }; render(); };

    function bubble(html) { return `<div class="bot-msg-row bot"><div class="bot-msg-bubble">${html}</div></div>`; }
    function btn(label, attr, extra) { return `<button type="button" class="btn-bot-chip mb-opt ${extra || ''}" ${attr}>${label}</button>`; }

    function studentPicker() {
        const q = st.search.toLowerCase();
        const list = students().filter((s) => (st.action !== 'absence-reason' || schoolEligible(s)) && (!q || String(nameOf(s)).toLowerCase().includes(q) || String(s.rollNo) === q))
            .sort((a, b) => (Number(a.rollNo) || 0) - (Number(b.rollNo) || 0)).slice(0, 60);
        return `<input id="mb-search" class="mb-search" placeholder="${T('नाव / क्रमांक शोधा', 'Search name / roll')}" value="${esc(st.search)}">
            <div class="mb-grid">${list.map((s) => btn(`${esc(s.rollNo || '')}. ${esc(nameOf(s))}`, `data-stu="${esc(s.id)}"`)).join('') || T('विद्यार्थी नाहीत', 'No students')}</div>`;
    }

    function complaintPicker() {
        const q = st.search.toLowerCase();
        const list = students().filter((s) => !q || String(nameOf(s)).toLowerCase().includes(q) || String(s.rollNo) === q)
            .sort((a, b) => (Number(a.rollNo) || 0) - (Number(b.rollNo) || 0)).slice(0, 60);
        return `<input id="mb-search" class="mb-search" placeholder="${T('नाव / क्रमांक शोधा', 'Search name / roll')}" value="${esc(st.search)}">
            <div class="mb-grid">${list.map((s) => btn(`${st.selectedIds.includes(String(s.id)) ? '✓ ' : ''}${esc(s.rollNo || '')}. ${esc(nameOf(s))}`, `data-csel="${esc(s.id)}"`, st.selectedIds.includes(String(s.id)) ? 'mb-on' : '')).join('') || T('विद्यार्थी नाहीत', 'No students')}</div>`;
    }

    function selectedComplaintStudents() {
        return students().filter((s) => st.selectedIds.includes(String(s.id)));
    }

    function saveComplaint() {
        const selected = selectedComplaintStudents();
        if (!selected.length || !st.complaintText.trim()) return;
        let saved = 0;
        selected.forEach((s) => {
            if (st.complaintKind === 'blacklist') {
                s.blacklisted = true;
                s.blacklistInfo = { reason: st.complaintText.trim(), date: today() };
                const oldBlacklist = Array.isArray(s.blacklistHistory) ? s.blacklistHistory : (s.complaints || []).filter((entry) => String(entry.type || '').toLowerCase().includes('blacklist'));
                s.blacklistHistory = oldBlacklist.concat([{ reason: st.complaintText.trim(), date: today() }]);
                s.complaints = s.complaints || [];
                s.complaints.push({ date: today(), type: 'Blacklist', severity: 'high', action: st.complaintText.trim() });
                saveAll(); saved += 1;
            } else if (apply({ type: 'add_complaint', studentId: s.id, ctype: st.complaintType || T('शिस्त', 'Discipline'), severity: st.complaintSeverity, text: st.complaintText.trim() })) {
                saved += 1;
            }
        });
        reset(`✅ ${saved} ${T('विद्यार्थ्यांसाठी तक्रार जतन झाली.', 'student complaint(s) saved.')}`);
    }

    function parseBotCommand(text) {
        const raw = String(text || '').trim();
        const q = raw.toLowerCase();
        
        // General intents without roll number
        if (/^(हजेरी|attendance|हजेरी सारांश)$/i.test(q)) return { intent: 'general_attendance' };
        if (/^(माहिती|summary|info|आजची माहिती)$/i.test(q)) return { intent: 'general_info' };
        if (/^(तक्रार|complaint|काळी यादी|blacklist)$/i.test(q)) return { intent: 'general_complaints' };
        if (/^(फी|fee|फी बाकी)$/i.test(q)) return { intent: 'general_fees' };
        if (/^(आदर्श|adarsh|आदर्श विद्यार्थी)$/i.test(q)) return { intent: 'general_adarsh' };
        if (/^(बॅकअप|backup)$/i.test(q)) return { intent: 'general_backup' };

        const roll = (q.match(/(?:roll\s*)?(\d{1,5})/) || [])[1];
        if (!roll) return null;
        if (/detail|information|info|माहिती/.test(q)) return { intent: 'info', roll: roll };
        const session = /evening|संध्याकाळ/.test(q) ? 'evening' : /school|शाळा/.test(q) ? 'school' : /morning|सकाळ/.test(q) ? 'morning' : '';
        if (session && /attendance|हजेरी|present|absent|हजर|गैरहजर/.test(q)) return { intent: 'attendance', roll: roll, session: session, status: /absent|गैरहजर/.test(q) ? 'absent' : 'present' };
        const amount = Number((q.match(/(?:fee|फी)\s*(\d+)/) || [])[1]);
        if (amount > 0 && /fee|फी|receive|भर/.test(q)) return { intent: 'fee', roll: roll, amount: amount };
        if (/complaint|तक्रार/.test(q)) return { intent: 'complaint', roll: roll, note: raw.replace(/^.*?(?:complaint|तक्रार)\s*/i, '').trim() };
        return null;
    }

    function runTypedCommand(text) {
        const cmd = parseBotCommand(text);
        if (!cmd) {
            reset(T('❓ समजले नाही. कृपया मेनूमधून पर्याय निवडा.', '❓ Did not understand. Please choose an option from the menu.'));
            return;
        }

        // Handle general queries
        if (cmd.intent === 'general_attendance') { st.action = 'attendance'; st.step = 'attendance-summary'; render(); return; }
        if (cmd.intent === 'general_info') { st.msg = ''; st.step = 'home'; render(); const list = document.getElementById('bot-messages-list'); if (list) list.innerHTML = bubble(infoHtml()) + list.innerHTML; return; }
        if (cmd.intent === 'general_complaints') { st.action = 'complaints'; st.step = 'complaints'; render(); return; }
        if (cmd.intent === 'general_fees') { st.action = 'fees'; st.step = 'fees'; render(); return; }
        if (cmd.intent === 'general_adarsh') { st.action = 'adarsh'; st.step = 'student'; render(); return; }
        if (cmd.intent === 'general_backup') {
            if (typeof window.vssOpenBackup === 'function') window.vssOpenBackup();
            reset(T('💾 बॅकअप केंद्र उघडले आहे.', '💾 Backup Centre opened.'));
            return;
        }

        const s = students().find((x) => String(x.rollNo) === String(cmd.roll));
        if (!s) { reset(T('❓ विद्यार्थी क्रमांक सापडला नाही.', '❓ Student roll not found.')); return; }
        st.student = s; st.search = '';
        if (cmd.intent === 'info') { st.action = 'info'; st.step = 'info-confirm'; render(); return; }
        if (cmd.intent === 'attendance') {
            if (cmd.session === 'school' && !schoolEligible(s)) { reset(T('या विद्यार्थ्यासाठी शाळेची हजेरी आवश्यक नाही.', 'School attendance is not required for this student.')); return; }
            st.action = 'attendance'; st.session = cmd.session; st.absentIds = cmd.status === 'absent' ? [String(s.id)] : [];
            st.step = hasExistingAttendance(cmd.session) ? 'retake' : 'absent'; render(); return;
        }
        if (cmd.intent === 'fee') { st.action = 'fee'; st.typedAmount = cmd.amount; st.step = 'choice'; render(); return; }
        st.action = 'complaint'; st.complaintMode = 'single'; st.selectedIds = [String(s.id)]; st.complaintText = cmd.note || ''; st.step = 'complaint-severity'; render();
    }

    function infoHtml() {
        const list = students();
        const d = today();
        const absent = list.filter((s) => s.dailyAttendance && s.dailyAttendance[d] && s.dailyAttendance[d].morning === false);
        const due = list.filter((s) => { const f = s.fees || {}; return (Number(f.total) || 0) - (Number(f.paid) || 0) > 0; });
        const black = list.filter((s) => s.blacklisted);
        let adarsh = [];
        try { const a = JSON.parse(localStorage.getItem('vss_adarsh_week') || '[]'); adarsh = Array.isArray(a) ? a : []; } catch (_) { }
        const last = adarsh[adarsh.length - 1];
        return `<b>📊 ${T('आजची माहिती', "Today's summary")} (${d})</b><br>
            👥 ${T('एकूण विद्यार्थी', 'Total students')}: <b>${list.length}</b><br>
            ❌ ${T('आज सकाळी गैरहजर', 'Absent this morning')}: <b>${absent.length}</b> ${absent.slice(0, 15).map((s) => esc(nameOf(s))).join(', ')}<br>
            💰 ${T('फी बाकी', 'Fees pending')}: <b>${due.length}</b><br>
            ⭐ ${T('आदर्श विद्यार्थी', 'Student of the week')}: <b>${last ? esc(last.name) + ' (' + esc(last.week) + ')' : '—'}</b><br>
            🚫 ${T('काळी यादी', 'Blacklist')}: <b>${black.length}</b> ${black.map((s) => esc(nameOf(s))).join(', ')}`;
    }

    function studentInfoHtml(s) {
        const fees = s.fees || {};
        const attendance = s.dailyAttendance || {};
        const total = Object.values(attendance).reduce((n, day) => n + Object.values(day || {}).filter((v) => typeof v === 'boolean').length, 0);
        const present = Object.values(attendance).reduce((n, day) => n + Object.values(day || {}).filter((v) => v === true).length, 0);
        const attendancePercent = total ? Math.round((present / total) * 100) : 0;
        let adarsh = [];
        try { const savedAdarsh = JSON.parse(localStorage.getItem('vss_adarsh_week') || '[]'); adarsh = Array.isArray(savedAdarsh) ? savedAdarsh : []; } catch (_) { }
        const awardCount = adarsh.filter((entry) => String(entry.id) === String(s.id)).length;
        const awardReasons = adarsh.filter((entry) => String(entry.id) === String(s.id)).map((entry) => `${entry.date || entry.week || '—'}: ${entry.note || '—'}`);
        let weekly = [];
        try {
            const exams = JSON.parse(localStorage.getItem('vss_exams') || '[]');
            weekly = (Array.isArray(exams) ? exams : []).filter((e) => e && e.kind === 'weekly' && e.entries && e.entries[s.id])
                .map((e) => ({ label: e.name || 'Week', marks: e.entries[s.id].marks, max: e.max || 100 }));
        } catch (_) { }
        const complaints = Array.isArray(s.complaints) ? s.complaints : [];
        const ledger = Array.isArray(fees.ledger) ? fees.ledger : (Array.isArray(fees.payments) ? fees.payments : []);
        const weeklyText = weekly.length ? weekly.map((w) => `${esc(w.label)}: <b>${esc(w.marks)}/${esc(w.max)}</b>`).join('<br>') : T('अद्याप साप्ताहिक गुण नाहीत', 'No weekly marks recorded');
        const complaintText = complaints.length ? complaints.map((c) => `${esc(c.date || '—')}: ${esc(c.action || c.text || c.type || '—')}`).join('<br>') : T('तक्रार नाही', 'No complaints recorded');
        const blacklistText = s.blacklisted ? `🚫 <b>${T('ब्लॅकलिस्टमध्ये आहे', 'Blacklisted')}</b>${s.blacklistInfo?.reason ? ': ' + esc(s.blacklistInfo.reason) : ''}` : `✅ ${T('ब्लॅकलिस्टमध्ये नाही', 'Not blacklisted')}`;
        const ledgerText = ledger.length ? ledger.map((p) => `${esc(p.date || '—')}: ₹${esc(p.amount || 0)}${p.receipt || p.receiptNo ? ' • ' + esc(p.receipt || p.receiptNo) : ''}`).join('<br>') : T('फी पावती नोंद नाही', 'No fee receipt entries');
        const visits = Array.isArray(s.parentVisits) ? s.parentVisits : [];
        const visitText = visits.length ? visits.slice().reverse().map((v) => `${esc(v.date || '—')}: <b>${esc(v.relation || v.visitor || '—')}</b>${v.visitor && v.relation ? ' (' + esc(v.visitor) + ')' : ''} — ${esc(v.reason || '—')}${v.note ? ' • ' + esc(v.note) : ''}`).join('<br>') : T('पालक भेट नोंद नाही', 'No parent visit recorded');
        return `<b>👦 ${esc(nameOf(s))}</b><br>
            ${T('रोल नंबर', 'Roll no.')}: <b>${esc(s.rollNo || '—')}</b><br>
            ${T('इयत्ता', 'Class')}: ${esc(s.standard || '—')}<br>
            ${T('पालक', 'Parent')}: ${esc(s.parentName || '—')}<br>
            ${T('मोबाईल', 'Mobile')}: ${esc(s.phone || '—')}<br>
            ${T('हजेरी', 'Attendance')}: ${present}/${total || 0} (${attendancePercent}%)<br>
            ${T('आदर्श विद्यार्थी', 'Student of the week')}: <b>${awardCount}×</b><br>
            ${awardReasons.length ? `${T('आदर्श विद्यार्थी कारणे', 'Student of the week reasons')}: ${awardReasons.map(esc).join(' • ')}<br>` : ''}
            ${T('फी', 'Fees')}: ${T('भरले', 'Paid')} ₹${Number(fees.paid || 0)} • ${T('एकूण', 'Total')} ₹${Number(fees.total || 0)}<br>
            <hr><b>📝 ${T('साप्ताहिक गुण', 'Weekly marks')}</b><br>${weeklyText}
            <hr><b>⚠️ ${T('तक्रार इतिहास', 'Complaint history')}</b><br>${complaintText}
            <hr><b>🚫 ${T('ब्लॅकलिस्ट स्थिती', 'Blacklist status')}</b><br>${blacklistText}
            <hr><b>🧾 ${T('फी पावत्या', 'Fee ledger')}</b><br>${ledgerText}
            <hr><b>👨‍👩‍👦 ${T('पालक भेटी', 'Parent visits')}</b><br>${visitText}`;
    }

    function saveChoice(val) {
        const s = st.student;
        let msg = null;
        switch (st.action) {
            case 'complaint': msg = apply({ type: 'add_complaint', studentId: s.id, ctype: T('शिस्त', 'Discipline'), text: val }); break;
            case 'remark': msg = apply({ type: 'add_remark', studentId: s.id, text: val }); break;
            case 'medical': msg = apply({ type: 'add_medical', studentId: s.id, text: val }); break;
            case 'fee': msg = apply({ type: 'add_fee', studentId: s.id, amount: Number(val), mode: T('रोख', 'Cash') }); break;
            case 'adarsh': {
                const wk = weekValue();
                let arr = [];
                try { const a = JSON.parse(localStorage.getItem('vss_adarsh_week') || '[]'); arr = Array.isArray(a) ? a : []; } catch (_) { }
                arr = arr.filter((a) => a.week !== wk);
                arr.push({ week: wk, id: s.id, name: nameOf(s), rollNo: s.rollNo, note: val });
                arr.sort((a, b) => String(a.week).localeCompare(String(b.week)));
                localStorage.setItem('vss_adarsh_week', JSON.stringify(arr));
                saveAll();
                msg = T('⭐ आदर्श विद्यार्थी: ', '⭐ Student of the week: ') + nameOf(s) + ' (' + wk + ')';
                break;
            }
            case 'black':
                s.blacklisted = true;
                s.blacklistInfo = { reason: val, date: today() };
                s.complaints = s.complaints || [];
                s.complaints.push({ date: today(), type: 'Blacklist', severity: 'high', action: val });
                saveAll();
                msg = T('🚫 काळ्या यादीत नोंद: ', '🚫 Blacklisted: ') + nameOf(s);
                break;
        }
        if (msg) toast(msg);
        reset('✅ ' + (msg || T('सेव्ह झाले', 'Saved')));
    }

    function render() {
        const list = document.getElementById('bot-messages-list');
        const chips = document.getElementById('bot-quick-chips');
        if (!list) return;
        const inputForm = document.getElementById('bot-input-form');
        if (inputForm) inputForm.style.display = st.step === 'home' ? 'flex' : 'none';
        const keyButton = document.getElementById('btn-bot-key');
        if (keyButton) keyButton.style.display = 'none';
        const title = document.getElementById('bot-panel-title');
        if (title) title.textContent = T('गुरुकुल सहाय्यक', 'Gurukul Assistant');
        const sub = document.getElementById('bot-panel-subtitle');
        if (sub) sub.textContent = T('पर्याय निवडा — माहिती थेट सॉफ्टवेअरमध्ये जाईल', 'Pick an option — it saves straight into the software');
        if (chips) chips.innerHTML = '';

        let html = st.msg ? bubble(esc(st.msg)) : '';
        const back = btn('⬅ ' + T('मागे', 'Back'), 'data-home="1"', 'mb-back');
        const act = ACTIONS().find((a) => a.k === st.action)
            || { icon: '⚙️', label: T('नोंद', 'Record') };

        if (st.step === 'home') {
            html += bubble(`<b>🙏 ${T('राम कृष्ण हरी! काय करायचे?', 'Welcome! What do you want to do?')}</b>
                <div class="mb-stack">${ACTIONS().map((a) => btn(a.icon + ' ' + a.label, `data-act="${a.k}"`)).join('')}</div>`);
        } else if (st.step === 'complaints') {
            html += bubble(`<b>⚠️ ${T('तक्रार / काळी यादी', 'Complaints / Blacklist')}</b>
                <p>${T('तक्रारीचा प्रकार निवडा', 'Choose complaint type')}</p>
                <div class="mb-grid">${COMPLAINT_OPTIONS().map((o) => btn(esc(o), `data-complaint-preset="${esc(o)}"`)).join('')}</div>
                <div class="mb-grid">${btn('⚠️ ' + T('एक विद्यार्थ्याची तक्रार', 'Single student complaint'), 'data-complaint-mode="single"')}
                ${btn('👥 ' + T('अनेक विद्यार्थ्यांची तक्रार', 'Multiple students complaint'), 'data-complaint-mode="multiple"')}
                ${btn('✍️ ' + T('स्वतःची तक्रार लिहा', 'Write your own complaint'), 'data-complaint-mode="single"')}
                ${btn('🚫 ' + T('काळ्या यादीत नोंदवा', 'Add to blacklist'), 'data-complaint-mode="single" data-complaint-kind="blacklist"')}
                ${back}</div>`);
        } else if (st.step === 'fees') {
            html += bubble(`<b>🧾 ${T('फी / पावती', 'Fee / Receipt')}</b>
                <div class="mb-grid">${btn('💰 ' + T('फी भरली', 'Fee received'), 'data-fee-mode="fee"')}
                ${btn('🧾 ' + T('पावती तयार करा', 'Make receipt'), 'data-fee-mode="receipt"')}
                ${back}</div>`);
        } else if (st.step === 'attendance-summary') {
            html += bubble(`<b>📊 ${T('हजेरी सारांश', 'Attendance Summary')}</b><br>${attendanceSummary()}<div class="mb-grid">${back}</div>`);
        } else if (st.step === 'retake') {
            html += bubble(`<b>⚠️ ${T('ही हजेरी आधीच घेतली आहे.', 'This attendance has already been recorded.')}</b><br>
                ${T('तुम्हाला ती पुन्हा घ्यायची आहे का?', 'Do you want to take it again?')}
                <div class="mb-grid">${btn('✅ ' + T('होय, पुन्हा घ्या', 'Confirm retake'), 'data-retake="yes"', 'mb-primary')}${back}</div>`);
        } else if (st.step === 'info-confirm') {
            html += bubble(`<b>${T('तुम्हाला या विद्यार्थ्याची माहिती पाहायची आहे का?', 'Do you want to view this student\'s details?')}</b><br>${esc(nameOf(st.student))} (${T('रोल', 'Roll')} ${esc(st.student.rollNo || '—')})
                <div class="mb-grid">${btn('👁️ ' + T('माहिती पहा', 'View details'), 'data-view-info="1"', 'mb-primary')}${back}</div>`);
        } else if (st.step === 'info-details') {
            html += bubble(studentInfoHtml(st.student) + `<div class="mb-grid">${back}</div>`);
        } else if (st.step === 'absent') {
            const q = st.search.toLowerCase();
            const all = students().filter((s) => (st.session !== 'school' || schoolEligible(s)) && (!q || String(nameOf(s)).toLowerCase().includes(q) || String(s.rollNo) === q))
                .sort((a, b) => (Number(a.rollNo) || 0) - (Number(b.rollNo) || 0));
            html += bubble(`<b>❌ ${T('सत्र निवडा आणि गैरहजर विद्यार्थ्यांवर टिचकी मारा', 'Pick session, then tap absent students')}</b>
                <div class="mb-grid">${[['morning', T('सकाळ', 'Morning')], ['evening', T('संध्याकाळ', 'Evening')], ['school', T('शाळा', 'School')], ['summary', T('हजेरी सारांश', 'Attendance Summary')]]
                    .map(([v, l]) => btn(l, `data-sess="${v}"`, st.session === v ? 'mb-on' : '')).join('')}</div>
                <input id="mb-search" class="mb-search" placeholder="${T('शोधा', 'Search')}" value="${esc(st.search)}">
                <div class="mb-grid">${all.map((s) => btn(`${esc(s.rollNo || '')}. ${esc(nameOf(s))}`, `data-abs="${esc(s.id)}"`, st.absentIds.includes(String(s.id)) ? 'mb-on' : '')).join('')}</div>
                <div class="mb-grid">${back}${btn('✅ ' + T('हजेरी सेव्ह करा', 'Save attendance') + ' (' + st.absentIds.length + ' ' + T('गैरहजर', 'absent') + ')', 'data-saveabs="1"', 'mb-primary')}</div>`);
        } else if (st.step === 'absence-reason') {
            html += bubble(`<b>📝 ${T('शाळा गैरहजेरीचे कारण', 'School absence reason')}</b><br>${esc(nameOf(st.student))}<br>
                <input id="mb-absence-date" class="mb-search" type="date" value="${today()}">
                <textarea id="mb-absence-reason" class="mb-search" rows="4" placeholder="${T('कारण लिहा', 'Write the reason')}"></textarea>
                <div class="mb-grid">${back}${btn('✅ ' + T('सेव्ह करा', 'Save'), 'data-save-absence-reason="1"', 'mb-primary')}</div>`);
        } else if (st.step === 'student') {
            html += bubble(`<b>${act.icon} ${act.label} — ${T('विद्यार्थी निवडा', 'Choose student')}</b>${studentPicker()}<div class="mb-grid">${back}</div>`);
        } else if (st.step === 'complaint-select') {
            html += bubble(`<b>👥 ${T('विद्यार्थी निवडा', 'Select students')}</b><br>${T('एक किंवा अधिक विद्यार्थी निवडा, नंतर पुढे जा.', 'Choose one or more students, then continue.')}${complaintPicker()}<div class="mb-grid">${back}${btn('➡️ ' + T('पुढे जा', 'Continue') + ' (' + st.selectedIds.length + ')', 'data-complaint-continue="1"', 'mb-primary')}</div>`);
        } else if (st.step === 'complaint-severity') {
            const names = selectedComplaintStudents().map(nameOf).join(', ');
            html += bubble(`<b>⚠️ ${T('तक्रारीची श्रेणी निवडा', 'Choose complaint category')}</b><br>${esc(names)}<div class="mb-grid">${COMPLAINT_SEVERITIES().map((level) => btn(esc(level), `data-complaint-severity="${esc(level)}"`)).join('')}</div><div class="mb-grid">${back}</div>`);
        } else if (st.step === 'complaint-text') {
            const names = selectedComplaintStudents().map(nameOf).join(', ');
            html += bubble(`<b>✍️ ${T('तक्रार लिहा', 'Write complaint')}</b><br>${esc(names)}<br><textarea id="mb-complaint-text" class="mb-search" rows="4" placeholder="${T('तक्रारीचा तपशील लिहा', 'Write complaint details')}">${esc(st.complaintText)}</textarea><div class="mb-grid">${back}${btn('👁️ ' + T('तपासा व सेव्ह करा', 'Preview & save'), 'data-complaint-preview="1"', 'mb-primary')}</div>`);
        } else if (st.step === 'complaint-preview') {
            const names = selectedComplaintStudents().map(nameOf).join(', ');
            const severity = st.complaintKind === 'blacklist' ? T('गंभीर / Serious', 'Serious') : st.complaintSeverity;
            html += bubble(`<b>🔎 ${T('तक्रार तपासणी', 'Complaint preview')}</b><br>${T('विद्यार्थी', 'Students')}: ${esc(names)}<br>${T('श्रेणी', 'Category')}: ${esc(severity)}<br>${T('तक्रार', 'Complaint')}: ${esc(st.complaintText)}<div class="mb-grid">${btn('✖️ ' + T('रद्द करा', 'Cancel'), 'data-home="1"')}${btn('✅ ' + T('सेव्ह करा', 'Save'), 'data-complaint-save="1"', 'mb-primary')}</div>`);
        } else if (st.step === 'choice') {
            const opts = OPT[st.action]();
            html += bubble(`<b>${act.icon} ${esc(nameOf(st.student))} — ${T('पर्याय निवडा', 'Choose option')}</b>
                <div class="mb-grid">${opts.map((o) => btn(st.action === 'fee' ? '₹' + o : esc(o), `data-val="${esc(o)}"`)).join('')}${(st.action === 'medical' || st.action === 'adarsh') ? btn('✍️ ' + T('स्वतः लिहा', 'Write your own'), 'data-custom-choice="1"') : ''}</div>
                <div class="mb-grid">${back}</div>`);
        } else if (st.step === 'custom-choice') {
            html += bubble(`<b>✍️ ${act.label} — ${esc(nameOf(st.student))}</b><br><textarea id="mb-custom-choice" class="mb-search" rows="4" placeholder="${T('नोंद लिहा', 'Write note')}"></textarea><div class="mb-grid">${back}${btn('✅ ' + T('सेव्ह करा', 'Save'), 'data-save-custom-choice="1"', 'mb-primary')}</div>`);
        } else if (st.step === 'parent-visit') {
            html += bubble(`<b>👨‍👩‍👦 ${esc(nameOf(st.student))} — ${T('पालक भेट नोंदवा', 'Record parent visit')}</b><br><input id="mb-visit-relation" class="mb-search" placeholder="${T('नाते *', 'Relationship *')}"><input id="mb-visit-reason" class="mb-search" placeholder="${T('कशासाठी आले? *', 'Reason *')}"><textarea id="mb-visit-note" class="mb-search" rows="3" placeholder="${T('अधिक नोंद (ऐच्छिक)', 'Extra note (optional)')}"></textarea><div class="mb-grid">${back}${btn('✅ ' + T('सेव्ह करा', 'Save'), 'data-save-visit="1"', 'mb-primary')}</div>`);
        } else if (st.step === 'leave-form') {
            html += bubble(`<b>🏠 ${esc(nameOf(st.student))} — ${T('रजा / गाव नोंदवा', 'Record leave / village visit')}</b><br><input id="mb-leave-from" class="mb-search" type="date" value="${today()}"><input id="mb-leave-to" class="mb-search" type="date" value="${today()}"><textarea id="mb-leave-reason" class="mb-search" rows="3" placeholder="${T('गाव/रजेचे कारण लिहा', 'Write village / leave reason')}"></textarea><div class="mb-grid">${back}${btn('✅ ' + T('सेव्ह करा', 'Save'), 'data-save-leave="1"', 'mb-primary')}</div>`);
        }
        list.innerHTML = html;
        bind(list);
        if (inputForm) inputForm.onsubmit = (event) => {
            event.preventDefault();
            const input = document.getElementById('bot-input-text');
            const text = input ? input.value : '';
            if (input) input.value = '';
            runTypedCommand(text);
        };
    }

    function bind(root) {
        root.querySelectorAll('[data-home]').forEach((b) => b.onclick = () => reset());
        root.querySelectorAll('[data-act]').forEach((b) => b.onclick = () => {
            if (b.dataset.act === 'backup') {
                if (typeof window.vssOpenBackup === 'function') {
                    window.vssOpenBackup();
                    const p = document.getElementById('bot-panel') || document.querySelector('.bot-panel');
                    if (p) p.classList.remove('open', 'active', 'show');
                    reset(T('💾 बॅकअप केंद्र उघडले आहे.', '💾 Backup Centre opened.'));
                } else {
                    reset(T('बॅकअप केंद्र सापडले नाही.', 'Backup Centre not found.'));
                }
                return;
            }
            if (b.dataset.act === 'admission') {
                if (typeof switchPanel === 'function') switchPanel('panel-students');
                if (typeof window.vssOpenAdmission === 'function' && window.vssOpenAdmission()) {
                    reset(T('🎓 प्रवेश फॉर्म उघडला आहे.', '🎓 Admission form opened.'));
                } else {
                    reset(T('प्रवेश फॉर्म उघडता आला नाही. पुन्हा प्रयत्न करा.', 'Admission form could not be opened. Please try again.'));
                }
                return;
            }
            if (b.dataset.act === 'marks') {
                if (typeof window.vssOpenMarks === 'function') window.vssOpenMarks('entry');
                else if (typeof switchPanel === 'function') switchPanel('panel-students');
                reset(T('📝 गुण उघडले आहेत.', '📝 Marks are open.'));
                return;
            }
            st.action = b.dataset.act; st.msg = ''; st.search = '';
            st.step = st.action === 'attendance' ? 'absent' : st.action === 'complaints' ? 'complaints' : st.action === 'fees' ? 'fees' : 'student';
            render();
        });
        root.querySelectorAll('[data-complaint-mode]').forEach((b) => b.onclick = () => {
            st.action = 'complaint';
            st.complaintMode = b.dataset.complaintMode;
            st.complaintKind = b.dataset.complaintKind || 'complaint';
            st.complaintType = ''; st.complaintSeverity = ''; st.selectedIds = []; st.complaintText = ''; st.search = '';
            st.step = st.complaintMode === 'multiple' ? 'complaint-select' : 'student';
            render();
        });
        root.querySelectorAll('[data-complaint-preset]').forEach((b) => b.onclick = () => {
            st.action = 'complaint'; st.complaintMode = 'single'; st.complaintKind = 'complaint';
            st.complaintType = b.dataset.complaintPreset || ''; st.complaintSeverity = ''; st.complaintText = st.complaintType;
            st.selectedIds = []; st.search = ''; st.step = 'student'; render();
        });
        root.querySelectorAll('[data-fee-mode]').forEach((b) => b.onclick = () => {
            if (b.dataset.feeMode === 'receipt') {
                if (typeof switchPanel === 'function') switchPanel('panel-daily-task');
                setTimeout(() => document.querySelector('[data-dt="receipt"]')?.click(), 0);
                reset(T('🧾 पावती केंद्र उघडले आहे.', '🧾 Receipt centre opened.'));
                return;
            }
            st.action = 'fee'; st.step = 'student'; st.search = ''; render();
        });
        root.querySelectorAll('[data-stu]').forEach((b) => b.onclick = () => {
            st.student = students().find((s) => String(s.id) === b.dataset.stu);
            if (st.action === 'complaint') {
                st.selectedIds = [String(st.student.id)];
                st.step = st.complaintKind === 'blacklist' ? 'complaint-text' : 'complaint-severity';
            } else if (st.action === 'absence-reason') {
                st.step = 'absence-reason';
            } else if (st.action === 'parent-visit') {
                st.step = 'parent-visit';
            } else if (st.action === 'leave') {
                st.step = 'leave-form';
            } else {
                st.step = st.action === 'info' ? 'info-confirm' : 'choice';
            }
            render();
        });
        root.querySelectorAll('[data-csel]').forEach((b) => b.onclick = () => {
            const id = b.dataset.csel;
            const i = st.selectedIds.indexOf(id);
            if (i >= 0) st.selectedIds.splice(i, 1); else st.selectedIds.push(id);
            render();
        });
        root.querySelectorAll('[data-complaint-continue]').forEach((b) => b.onclick = () => {
            if (!st.selectedIds.length) { toast(T('किमान एक विद्यार्थी निवडा.', 'Select at least one student.'), 'error'); return; }
            st.step = st.complaintKind === 'blacklist' ? 'complaint-text' : 'complaint-severity'; render();
        });
        root.querySelectorAll('[data-complaint-severity]').forEach((b) => b.onclick = () => {
            st.complaintSeverity = b.dataset.complaintSeverity || '';
            st.step = 'complaint-text'; render();
        });
        root.querySelectorAll('[data-complaint-preview]').forEach((b) => b.onclick = () => {
            st.complaintText = String(root.querySelector('#mb-complaint-text')?.value || '').trim();
            if (!st.complaintText) { toast(T('तक्रार लिहा.', 'Write the complaint first.'), 'error'); return; }
            st.step = 'complaint-preview'; render();
        });
        root.querySelectorAll('[data-complaint-save]').forEach((b) => b.onclick = () => saveComplaint());
        root.querySelectorAll('[data-view-info]').forEach((b) => b.onclick = () => { st.step = 'info-details'; render(); });
        root.querySelectorAll('[data-val]').forEach((b) => b.onclick = () => saveChoice(b.dataset.val));
        root.querySelectorAll('[data-custom-choice]').forEach((b) => b.onclick = () => { st.step = 'custom-choice'; render(); });
        root.querySelectorAll('[data-save-custom-choice]').forEach((b) => b.onclick = () => {
            const text = String(root.querySelector('#mb-custom-choice')?.value || '').trim();
            if (!text) { toast(T('नोंद लिहा.', 'Write a note.'), 'error'); return; }
            saveChoice(text);
        });
        root.querySelectorAll('[data-save-visit]').forEach((b) => b.onclick = () => {
            const relation = String(root.querySelector('#mb-visit-relation')?.value || '').trim();
            const reason = String(root.querySelector('#mb-visit-reason')?.value || '').trim();
            const note = String(root.querySelector('#mb-visit-note')?.value || '').trim();
            if (!relation || !reason) { toast(T('नाते व कारण लिहा.', 'Enter relationship and reason.'), 'error'); return; }
            const student = st.student;
            student.parentVisits = Array.isArray(student.parentVisits) ? student.parentVisits : [];
            student.parentVisits.push({ date: today(), visitor: '', relation, reason, note });
            saveAll();
            reset('✅ ' + T('पालक भेट नोंदवली.', 'Parent visit saved.'));
        });
        root.querySelectorAll('[data-save-leave]').forEach((b) => b.onclick = () => {
            const from = String(root.querySelector('#mb-leave-from')?.value || '');
            const to = String(root.querySelector('#mb-leave-to')?.value || from);
            const reason = String(root.querySelector('#mb-leave-reason')?.value || '').trim();
            if (!from || !to || to < from || !reason) { toast(T('तारीख व कारण योग्य लिहा.', 'Enter valid dates and reason.'), 'error'); return; }
            const student = st.student;
            student.leaves = Array.isArray(student.leaves) ? student.leaves : [];
            student.leaves.push({ id: 'bot-' + Date.now(), from, to, reason, note: reason });
            student.dailyAttendance = student.dailyAttendance || {};
            for (let d = new Date(from + 'T00:00:00'); d <= new Date(to + 'T00:00:00'); d.setDate(d.getDate() + 1)) {
                const date = d.toISOString().slice(0, 10);
                student.dailyAttendance[date] = student.dailyAttendance[date] || {};
                ['morning', 'evening', 'school'].forEach((session) => { if (student.dailyAttendance[date][session] == null) student.dailyAttendance[date][session] = 'leave'; });
            }
            saveAll();
            reset('✅ ' + T('रजा नोंदवली. ही अनुपस्थिती म्हणून मोजली जाणार नाही.', 'Leave saved. It will not count as absent.'));
        });
        root.querySelectorAll('[data-sess]').forEach((b) => b.onclick = () => {
            const session = b.dataset.sess;
            if (session === 'summary') { st.step = 'attendance-summary'; render(); return; }
            if (hasExistingAttendance(session)) { st.pendingSession = session; st.step = 'retake'; render(); return; }
            st.session = session; render();
        });
        root.querySelectorAll('[data-retake]').forEach((b) => b.onclick = () => { st.session = st.pendingSession; st.pendingSession = ''; st.step = 'absent'; render(); });
        root.querySelectorAll('[data-abs]').forEach((b) => b.onclick = () => {
            const id = b.dataset.abs; const i = st.absentIds.indexOf(id);
            if (i >= 0) st.absentIds.splice(i, 1); else st.absentIds.push(id);
            b.classList.toggle('mb-on');
            const sv = root.querySelector('[data-saveabs]');
            if (sv) sv.textContent = '✅ ' + T('हजेरी सेव्ह करा', 'Save attendance') + ' (' + st.absentIds.length + ' ' + T('गैरहजर', 'absent') + ')';
        });
        root.querySelectorAll('[data-saveabs]').forEach((b) => b.onclick = () => {
            const ids = st.session === 'school' ? st.absentIds.filter((id) => schoolEligible(students().find((s) => String(s.id) === id))) : st.absentIds.slice();
            const msg = apply({ type: 'mark_absent', session: st.session, date: today(), studentIds: ids });
            if (msg) toast(msg);
            reset('✅ ' + (msg || ''));
        });
        root.querySelectorAll('[data-save-absence-reason]').forEach((b) => b.onclick = () => {
            const reason = String(root.querySelector('#mb-absence-reason')?.value || '').trim();
            const date = String(root.querySelector('#mb-absence-date')?.value || today());
            if (!reason) { toast(T('कारण लिहा.', 'Write the reason.'), 'error'); return; }
            const student = st.student;
            student.absenceReasons = Array.isArray(student.absenceReasons) ? student.absenceReasons : [];
            student.absenceReasons.push({ date, reason });
            student.dailyAttendance = student.dailyAttendance || {};
            student.dailyAttendance[date] = student.dailyAttendance[date] || {};
            student.dailyAttendance[date].school = false;
            saveAll();
            reset('✅ ' + T('शाळा गैरहजेरीचे कारण सेव्ह झाले.', 'School absence reason saved.'));
        });
        const s = root.querySelector('#mb-search');
        if (s) s.oninput = () => {
            st.search = s.value;
            const pos = s.selectionStart;
            render();
            const n = document.getElementById('mb-search');
            if (n) { n.focus(); n.setSelectionRange(pos, pos); }
        };
    }

    window.vssRenderBotChat = function () { render(); };
    const boot = () => setTimeout(render, 400);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
