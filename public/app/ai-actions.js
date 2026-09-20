/* =========================================================
   AI ASSISTANT → APP WRITER
   चॅटबॉट जे सांगतो ते खरोखर ॲपमध्ये सेव्ह करतो
   (तक्रार, शिक्षक नोंद, फी, हजेरी, आदर्श विद्यार्थी ...)
   ========================================================= */
(function () {
    'use strict';

    const EN = () => (typeof currentLanguage !== 'undefined' ? currentLanguage : 'mr') === 'en';
    const t = (mr, en) => (EN() ? en : mr);
    const students = () => (typeof studentsDatabase !== 'undefined' && Array.isArray(studentsDatabase)) ? studentsDatabase : [];
    const nameOf = (s) => (typeof getStudentName === 'function' ? getStudentName(s)
        : (s && typeof s.name === 'object' ? (s.name.mr || s.name.en) : (s && s.name)));
    const toast = (m, ty) => { try { if (typeof createToast === 'function') createToast(m, ty || 'success'); } catch (_) { } };
    const today = () => new Date().toISOString().slice(0, 10);

    function save() {
        try {
            if (typeof saveDatabase === 'function') saveDatabase();
            else localStorage.setItem('vss_students', JSON.stringify(students()));
        } catch (_) { }
        try { if (window.vssCloud && typeof window.vssCloud.save === 'function') window.vssCloud.save(); } catch (_) { }
    }

    function refresh(studentId) {
        ['renderDashboardMetrics', 'renderDashboard', 'renderStudentsList'].forEach((fn) => {
            try { if (typeof window[fn] === 'function') window[fn](); } catch (_) { }
        });
        try {
            const open = document.getElementById('panel-student-profile');
            const visible = open && (open.classList.contains('active') || open.offsetParent !== null);
            if (studentId && visible && typeof window.renderStudentProfile === 'function') {
                window.renderStudentProfile(studentId);
            }
        } catch (_) { }
    }

    /* ---------- विद्यार्थी शोधा (id / क्रमांक / नाव) ---------- */
    const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim().toLowerCase();

    function findStudent(a) {
        const list = students();
        if (!list.length) return null;
        const id = a.studentId || a.id;
        if (id) {
            const byId = list.find((s) => String(s.id) === String(id));
            if (byId) return byId;
        }
        const roll = a.rollNo != null ? a.rollNo : a.roll;
        if (roll != null && String(roll).trim() !== '') {
            const byRoll = list.find((s) => Number(s.rollNo) === Number(roll));
            if (byRoll) return byRoll;
        }
        const nm = norm(a.student || a.name || a.studentName);
        if (nm) {
            const exact = list.filter((s) => norm(nameOf(s)) === nm);
            if (exact.length === 1) return exact[0];
            const part = list.filter((s) => norm(nameOf(s)).indexOf(nm) >= 0);
            if (part.length === 1) return part[0];
        }
        return null;
    }

    /* ---------- क्रिया ---------- */
    const HANDLERS = {
        open_panel: function (a) {
            if (typeof switchPanel === 'function') switchPanel(String(a.value || 'dashboard'));
            return null;
        },

        open_student: function (a) {
            const s = findStudent(a);
            if (!s) return null;
            const botPanel = document.getElementById('panel-bot');
            const inBot = botPanel && (botPanel.classList.contains('active') || !botPanel.classList.contains('d-none'));
            if (inBot && !a.forceRedirect) {
                return null;
            }
            if (typeof window.renderStudentProfile === 'function') {
                window.renderStudentProfile(s.id);
                setTimeout(() => {
                    const pBtn = document.querySelector('#panel-student-profile .profile-tabs-card .profile-tab-btn[data-tab="tab-progress"]');
                    if (pBtn) pBtn.click();
                }, 200);
                return t(nameOf(s) + ' यांचे प्रोफाईल आणि साप्ताहिक गुणांचा आलेख उघडला आहे.', 'Opened profile and weekly marks graph for ' + nameOf(s) + '.');
            }
            return null;
        },

        set_language: function (a) {
            try { localStorage.setItem('vss_lang', a.value === 'en' ? 'en' : 'mr'); } catch (_) { }
            try { if (typeof setLanguage === 'function') setLanguage(a.value === 'en' ? 'en' : 'mr'); } catch (_) { }
            return null;
        },

        add_complaint: function (a) {
            const s = findStudent(a);
            if (!s) return t('विद्यार्थी सापडला नाही.', 'Student not found.');
            const text = String(a.text || a.note || a.action || a.detail || '').trim();
            if (!text && !a.type) return t('तक्रारीचा तपशील मिळाला नाही.', 'No complaint details.');
            s.complaints = s.complaints || [];
            s.complaints.push({
                date: a.date || today(),
                type: String(a.ctype || a.type || t('इतर', 'Other')),
                severity: String(a.severity || ''),
                action: text
            });
            save();
            refresh(s.id);
            return t('तक्रार ' + nameOf(s) + ' यांच्या नोंदीत सेव्ह झाली.',
                'Complaint saved for ' + nameOf(s) + '.');
        },

        add_remark: function (a) {
            const s = findStudent(a);
            if (!s) return t('विद्यार्थी सापडला नाही.', 'Student not found.');
            const text = String(a.text || a.note || a.remark || '').trim();
            if (!text) return t('नोंदीचा मजकूर मिळाला नाही.', 'No remark text.');
            s.remarks = s.remarks || [];
            s.remarks.push({ date: a.date || today(), by: String(a.by || t('शिक्षक', 'Teacher')), text: text });
            save();
            refresh(s.id);
            return t('नोंद सेव्ह झाली — ' + nameOf(s), 'Remark saved for ' + nameOf(s) + '.');
        },

        add_medical: function (a) {
            const s = findStudent(a);
            if (!s) return t('विद्यार्थी सापडला नाही.', 'Student not found.');
            const text = String(a.text || a.note || a.detail || '').trim();
            if (!text) return t('वैद्यकीय तपशील मिळाला नाही.', 'No medical details.');
            s.medical = s.medical || {};
            s.medical.logs = s.medical.logs || [];
            s.medical.logs.push({ date: a.date || today(), note: text });
            save();
            refresh(s.id);
            return t('वैद्यकीय नोंद सेव्ह झाली — ' + nameOf(s), 'Medical note saved for ' + nameOf(s) + '.');
        },

        add_fee: function (a) {
            const s = findStudent(a);
            if (!s) return t('विद्यार्थी सापडला नाही.', 'Student not found.');
            const amt = Number(a.amount) || 0;
            if (amt <= 0) return t('रक्कम मिळाली नाही.', 'No amount given.');
            s.fees = s.fees || { total: 0, paid: 0, ledger: [] };
            s.fees.ledger = s.fees.ledger || [];
            s.fees.ledger.push({
                date: a.date || today(),
                amount: amt,
                mode: String(a.mode || t('रोख', 'Cash')),
                receipt: 'AI-' + Date.now().toString().slice(-6)
            });
            s.fees.paid = (Number(s.fees.paid) || 0) + amt;
            if (s.fees.paidAmount != null) s.fees.paidAmount = (Number(s.fees.paidAmount) || 0) + amt;
            save();
            refresh(s.id);
            return t('₹' + amt + ' फी नोंद झाली — ' + nameOf(s), '₹' + amt + ' fee recorded for ' + nameOf(s) + '.');
        },

        set_adarsh: function (a) {
            const s = findStudent(a);
            if (!s) return t('विद्यार्थी सापडला नाही.', 'Student not found.');
            try {
                let list = [];
                try { list = JSON.parse(localStorage.getItem('vss_adarsh_week') || '[]'); } catch (_) { list = []; }
                if (!Array.isArray(list)) list = [list].filter(Boolean);
                const wk = a.week || today();
                list = list.filter(x => String(x.id || x.studentId) !== String(s.id));
                list.push({
                    week: wk,
                    id: s.id,
                    studentId: s.id,
                    name: nameOf(s),
                    rollNo: s.rollNo,
                    note: String(a.note || a.reason || 'उत्कृष्ट पाठांतर व शिस्त')
                });
                localStorage.setItem('vss_adarsh_week', JSON.stringify(list));
            } catch (_) { }
            save();
            refresh(s.id);
            return t('⭐ ' + nameOf(s) + ' (Roll ' + s.rollNo + ') आदर्श विद्यार्थी म्हणून निवडले!', '⭐ ' + nameOf(s) + ' selected as Star Student!');
        },

        remove_adarsh: function (a) {
            const s = findStudent(a);
            if (!s) return t('विद्यार्थी सापडला नाही.', 'Student not found.');
            try {
                let list = [];
                try { list = JSON.parse(localStorage.getItem('vss_adarsh_week') || '[]'); } catch (_) { list = []; }
                if (Array.isArray(list)) {
                    list = list.filter(x => String(x.id || x.studentId) !== String(s.id));
                    localStorage.setItem('vss_adarsh_week', JSON.stringify(list));
                }
            } catch (_) { }
            save();
            refresh(s.id);
            return t(nameOf(s) + ' आदर्श विद्यार्थी यादीतून काढले.', nameOf(s) + ' removed from star students list.');
        },

        set_blacklist: function (a) {
            const s = findStudent(a);
            if (!s) return t('विद्यार्थी सापडला नाही.', 'Student not found.');
            s.blacklisted = true;
            s.blacklistReason = String(a.reason || a.note || 'शिस्तभंग / गैरवर्तन');
            save();
            refresh(s.id);
            return t('🚫 ' + nameOf(s) + ' (Roll ' + s.rollNo + ') यांना काळ्या यादीत (Blacklist) टाकले आहे.', '🚫 ' + nameOf(s) + ' added to blacklist.');
        },

        remove_blacklist: function (a) {
            const s = findStudent(a);
            if (!s) return t('विद्यार्थी सापडला नाही.', 'Student not found.');
            s.blacklisted = false;
            delete s.blacklistReason;
            save();
            refresh(s.id);
            return t(nameOf(s) + ' यांना काळ्या यादीतून काढले आहे.', nameOf(s) + ' removed from blacklist.');
        },

        mark_all_present: function (a) {
            const session = ['morning', 'evening', 'school'].indexOf(String(a.session)) >= 0 ? String(a.session) : 'morning';
            const date = a.date || today();
            students().forEach((s) => {
                s.dailyAttendance = s.dailyAttendance || {};
                s.dailyAttendance[date] = s.dailyAttendance[date] || {};
                s.dailyAttendance[date][session] = true;
            });
            save();
            refresh(null);
            return t('✅ सर्व विद्यार्थी हजर नोंदवले — ' + date + ' (' + session + ')', 'All students marked present for ' + date + ' (' + session + ').');
        },

        mark_absent: function (a) {
            const session = ['morning', 'evening', 'school'].indexOf(String(a.session)) >= 0 ? String(a.session) : 'morning';
            const date = a.date || today();
            const ids = Array.isArray(a.studentIds) ? a.studentIds.map(String) : (a.studentId ? [String(a.studentId)] : []);
            const rolls = Array.isArray(a.rollNos) ? a.rollNos.map(Number) : (a.rollNo != null ? [Number(a.rollNo)] : []);
            if (!ids.length && !rolls.length) return t('कोणते विद्यार्थी गैरहजर हे कळले नाही.', 'No students given.');
            let n = 0;
            students().forEach((s) => {
                const absent = ids.indexOf(String(s.id)) >= 0 || rolls.indexOf(Number(s.rollNo)) >= 0;
                s.dailyAttendance = s.dailyAttendance || {};
                s.dailyAttendance[date] = s.dailyAttendance[date] || {};
                s.dailyAttendance[date][session] = !absent;
                n++;
            });
            if (!n) return t('हजेरी नोंदवता आली नाही.', 'Could not mark attendance.');
            save();
            refresh(null);
            return t('हजेरी नोंदली — ' + date + ' (' + session + ')', 'Attendance saved for ' + date + ' (' + session + ').');
        }
    };

    /* चुकीने आलेली नावे */
    HANDLERS.complaint = HANDLERS.add_complaint;
    HANDLERS.log_complaint = HANDLERS.add_complaint;
    HANDLERS.remark = HANDLERS.add_remark;
    HANDLERS.fee = HANDLERS.add_fee;
    HANDLERS.attendance = HANDLERS.mark_absent;
    HANDLERS.blacklist = HANDLERS.set_blacklist;
    HANDLERS.unblacklist = HANDLERS.remove_blacklist;
    HANDLERS.adarsh = HANDLERS.set_adarsh;

    window.vssApplyAiAction = function (action) {
        if (!action || typeof action !== 'object') return null;
        // Normalize: Gemini prompt uses "action" key, handlers use "type" key
        if (!action.type && action.action) action.type = action.action;
        // Normalize: Gemini prompt uses "id", handlers use "studentId"
        if (!action.studentId && action.id) action.studentId = action.id;
        // Normalize: Gemini may use "rollNo" or "roll"
        if (!action.rollNo && action.roll) action.rollNo = action.roll;

        const fn = HANDLERS[String(action.type || '').trim()];
        if (!fn) return null;
        try {
            const msg = fn(action);
            if (msg) toast(msg, /सापडला नाही|not found|मिळाल|No |Could not/.test(msg) ? 'error' : 'success');
            return msg;
        } catch (err) {
            console.error('ai action failed', err);
            return t('नोंद सेव्ह करता आली नाही.', 'Could not save the record.');
        }
    };
})();
