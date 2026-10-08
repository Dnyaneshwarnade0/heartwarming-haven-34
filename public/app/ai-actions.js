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
    const today = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

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
            const date = a.date || today();
            s.medical.logs.push({ date: date, note: text });
            const line = date + ' — ' + text;
            s.medical.doctorNotes = s.medical.doctorNotes ? s.medical.doctorNotes + '\n' + line : line;
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
                let arr = [];
                try { arr = JSON.parse(localStorage.getItem('vss_adarsh_week') || '[]'); } catch (_) { arr = []; }
                if (!Array.isArray(arr)) arr = [];
                const wk = String(a.week || '11');
                arr = arr.filter((x) => !(String(x.week) === wk && String(x.id || x.studentId) === String(s.id)));
                arr.push({ week: wk, id: s.id, studentId: s.id, name: nameOf(s), rollNo: s.rollNo, note: String(a.note || '') });
                localStorage.setItem('vss_adarsh_week', JSON.stringify(arr));
            } catch (_) { }
            save();
            refresh(s.id);
            return t('आदर्श विद्यार्थी: ' + nameOf(s), 'Star student: ' + nameOf(s));
        },

        mark_absent: function (a) {
            const session = ['morning', 'evening', 'school'].indexOf(String(a.session)) >= 0 ? String(a.session) : 'morning';
            const date = a.date || today();
            const ids = Array.isArray(a.studentIds) ? a.studentIds.map(String) : [];
            const rolls = Array.isArray(a.rollNos) ? a.rollNos.map(Number) : [];
            if (!ids.length && !rolls.length) return t('कोणते विद्यार्थी गैरहजर हे कळले नाही.', 'No students given.');
            let n = 0;
            students().forEach((s) => {
                if (session === 'school' && s.notGoingToSchool) return;
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

    window.vssApplyAiAction = function (action) {
        if (!action || typeof action !== 'object') return null;
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
