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
    const saveAll = () => {
        try {
            if (typeof saveDatabase === 'function') saveDatabase();
            else if (typeof window.saveDatabase === 'function') window.saveDatabase();
            else localStorage.setItem('vss_students', JSON.stringify(students()));
        } catch (_) { }
    };

    /* ---------- storage ---------- */
    const ADARSH_KEY = 'vss_adarsh_week';
    const SPECIAL_SEED_FLAG = 'vss_special_lists_seeded_v1';
    const AWARD_WEEK_OPTIONS = Array.from({ length: 30 }, (_, index) => ({ value: String(index + 1), label: `Week ${index + 1}` }));
    const getAdarsh = () => { try { return JSON.parse(localStorage.getItem(ADARSH_KEY) || '[]'); } catch (_) { return []; } };
    const setAdarsh = (v) => { localStorage.setItem(ADARSH_KEY, JSON.stringify(v)); try { if (window.vssCloudPush) window.vssCloudPush(); } catch (_) { } };
    let editingAwardWeek = '';
    let editingAwardId = '';
    function awardCount(studentId) { return getAdarsh().filter((entry) => String(entry.id) === String(studentId)).length; }
    function awardWeekNumber(value) {
        const week = Number(value);
        return Number.isInteger(week) && week >= 1 && week <= 30 ? week : 999;
    }
    function formatAwardWeek(value) {
        const week = awardWeekNumber(value);
        return week === 999 ? String(value || '—') : `Week ${week}`;
    }
    function sortAwards(awards) {
        return awards.sort((a, b) => awardWeekNumber(a.week) - awardWeekNumber(b.week) || String(a.week).localeCompare(String(b.week)));
    }
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
            setAdarsh([{ week: '1', id: student.id, name: nameOf(student), rollNo: student.rollNo, note: T('उत्कृष्ट प्रगती आणि नियमित उपस्थिती', 'Excellent progress and regular attendance') }]);
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

    const today = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

    function seedRequestedRepeatRecords() {
        const flag = 'vss_repeat_history_seed_v1';
        if (localStorage.getItem(flag) === '1') return;
        const avadhut = students().find((student) => Number(student.rollNo) === 1);
        const yash = students().find((student) => Number(student.rollNo) === 2);
        let changed = false;
        if (avadhut && awardCount(avadhut.id) < 2) {
            const awards = getAdarsh();
            while (awards.filter((entry) => String(entry.id) === String(avadhut.id)).length < 2) {
                const option = AWARD_WEEK_OPTIONS.find((candidate) => !awards.some((entry) => String(entry.week) === candidate.value));
                if (!option) break;
                const week = option.value;
                awards.push({ week, date: today(), id: avadhut.id, name: nameOf(avadhut), rollNo: avadhut.rollNo, note: T('नियमित प्रगती आणि उत्तम वर्तन', 'Regular progress and good conduct') });
            }
            setAdarsh(sortAwards(awards));
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

    const WEEK_11_STUDENTS = [
        { rollNo: 20, nameEn: 'Piyush Jagtap', nameMr: 'पियुष जगताप' },
        { rollNo: 6, nameEn: 'Dnyaneshwar Doifode', nameMr: 'ज्ञानेश्वर डोईफोडे' },
        { rollNo: 46, nameEn: 'Jayesh Khedkar', nameMr: 'जयेश खेडकर' },
        { rollNo: 8, nameEn: 'Rudraksh Powale', nameMr: 'रुद्राक्ष पोवळे' },
        { rollNo: 21, nameEn: 'Dinanath Koli', nameMr: 'दिनानाथ कोळी' },
        { rollNo: 36, nameEn: 'Sandip Waghmare', nameMr: 'संदिप वाघमारे' },
        { rollNo: 14, nameEn: 'Sanket Masule', nameMr: 'संकेत मासुळे' },
        { rollNo: 16, nameEn: 'Ishwar Rahane', nameMr: 'ईश्वर राहणे' },
        { rollNo: 22, nameEn: 'Yash Shinde', nameMr: 'यश शिंदे' },
        { rollNo: 52, nameEn: 'Ayush Bhandare', nameMr: 'आयुष भंडारे' },
        { rollNo: 43, nameEn: 'Malhari Chittapale', nameMr: 'मल्हारी चीत्तापले' },
        { rollNo: 24, nameEn: 'Ram Shingare', nameMr: 'राम शिनगारे' },
        { rollNo: 54, nameEn: 'Anukalp Yewale', nameMr: 'अनुकल्प येवले' },
        { rollNo: 51, nameEn: 'Dnyaneshwar Panchal', nameMr: 'ज्ञानेश्वर पांचाळ' },
        { rollNo: 30, nameEn: 'Vaibhav Kale', nameMr: 'वैभव काळे' },
        { rollNo: 50, nameEn: 'Gangadhar Panchal', nameMr: 'गंगाधर पांचाळ' },
        { rollNo: 45, nameEn: 'Avinash Pawar', nameMr: 'अविनाश पवार' },
        { rollNo: 57, nameEn: 'Hariom Kangule', nameMr: 'हरिओम कानगुळे' }
    ];

    function seedWeek11Students() {
        const list = students();
        if (!list || !list.length) return;
        const awards = getAdarsh();
        let changed = false;

        WEEK_11_STUDENTS.forEach((item) => {
            const student = list.find((s) => Number(s.rollNo) === Number(item.rollNo));
            if (student) {
                const exists = awards.some((a) => String(a.week) === '11' && (String(a.id) === String(student.id) || Number(a.rollNo) === Number(item.rollNo)));
                if (!exists) {
                    awards.push({
                        week: '11',
                        date: today(),
                        id: student.id,
                        name: nameOf(student) || (EN() ? item.nameEn : item.nameMr),
                        rollNo: student.rollNo,
                        note: T('उत्कृष्ट प्रगती आणि नियमित उपस्थिती', 'Excellent progress and regular attendance')
                    });
                    changed = true;
                }
            }
        });

        if (changed) {
            setAdarsh(sortAwards(awards));
        }
    }

    const OFFICIAL_COMPLAINTS_SEED = [
        {"rollNo":1,"id":"stud-101","date":"2026-08-15","type":"🧹 सेवा न करणे","severity":"मध्यम","action":"आश्रमातील सेवा केली नाही / समजावून सांगितले","isBlacklist":false},
        {"rollNo":2,"id":"stud-102","date":"2026-08-15","type":"📏 शिस्तभंग","severity":"मध्यम","action":"वेळापत्रक व नियमांचे पालन केले नाही","isBlacklist":false},
        {"rollNo":2,"id":"stud-102","date":"2026-08-16","type":"🧹 सेवा न करणे","severity":"मध्यम","action":"दैनिक सेवा केली नाही / समज दिली","isBlacklist":false},
        {"rollNo":2,"id":"stud-102","date":"2026-08-19","type":"अभ्यास","severity":"मध्यम","action":"उशिरा आला","isBlacklist":false},
        {"rollNo":3,"id":"stud-103","date":"2026-08-15","type":"🧹 सेवा न करणे","severity":"मध्यम","action":"आश्रमातील सेवा केली नाही / समज दिली","isBlacklist":false},
        {"rollNo":3,"id":"stud-103","date":"2026-08-16","type":"🤬 शिवी देणे","severity":"गंभीर","action":"मुलांना चिडवले व शिवीगाळ केली / सक्त ताकीद दिली","isBlacklist":false},
        {"rollNo":4,"id":"stud-104","date":"2026-08-15","type":"📏 शिस्तभंग","severity":"मध्यम","action":"नियमांचे पालन केले नाही","isBlacklist":false},
        {"rollNo":4,"id":"stud-104","date":"2026-08-16","type":"🧹 सेवा न करणे","severity":"मध्यम","action":"सेवा केली नाही / समज दिली","isBlacklist":false},
        {"rollNo":4,"id":"stud-104","date":"2026-08-17","type":"😠 इतरांना त्रास देणे","severity":"गंभीर","action":"कुणाल लिंगेला चिडवले व त्रास दिला / सक्त समज दिली","isBlacklist":false},
        {"rollNo":4,"id":"stud-104","date":"2026-08-22","type":"😠 इतरांना त्रास देणे","severity":"मध्यम","action":"लहान मुलांना त्रास","isBlacklist":false},
        {"rollNo":4,"id":"stud-104","date":"2026-08-28","type":"⏰ उशिरा उठणे","severity":"मध्यम","action":"काकड आरतीला उशीर","isBlacklist":false},
        {"rollNo":5,"id":"stud-105","date":"2026-08-15","type":"📏 शिस्तभंग","severity":"मध्यम","action":"नियमांचे पालन केले नाही","isBlacklist":false},
        {"rollNo":5,"id":"stud-105","date":"2026-08-16","type":"🧹 सेवा न करणे","severity":"मध्यम","action":"आश्रमातील सेवा केली नाही / समज दिली","isBlacklist":false},
        {"rollNo":6,"id":"stud-106","date":"2026-08-15","type":"🧹 सेवा न करणे","severity":"मध्यम","action":"सेवा केली नाही / समज दिली","isBlacklist":false},
        {"rollNo":7,"id":"stud-107","date":"2026-08-15","type":"🧹 सेवा न करणे","severity":"मध्यम","action":"सेवा केली नाही / समज दिली","isBlacklist":false},
        {"rollNo":8,"id":"stud-108","date":"2026-08-15","type":"🧹 सेवा न करणे","severity":"मध्यम","action":"सेवा केली नाही / समजावून सांगितले","isBlacklist":false},
        {"rollNo":8,"id":"stud-108","date":"2026-08-18","type":"शिस्त","severity":"गंभीर","action":"वर्गात गोंधळ केला","isBlacklist":false},
        {"rollNo":9,"id":"stud-109","date":"2026-08-15","type":"📏 शिस्तभंग","severity":"मध्यम","action":"नियमांचे पालन केले नाही","isBlacklist":false},
        {"rollNo":9,"id":"stud-109","date":"2026-08-16","type":"🧹 सेवा न करणे","severity":"मध्यम","action":"सेवा वेळेवर केली नाही / समज दिली","isBlacklist":false},
        {"rollNo":10,"id":"stud-110","date":"2026-08-15","type":"🧹 सेवा न करणे","severity":"मध्यम","action":"सेवा वेळेवर केली नाही / समजावून सांगितले","isBlacklist":false},
        {"rollNo":10,"id":"stud-110","date":"2026-08-22","type":"🏫 शाळेत मस्ती","severity":"मध्यम","action":"शिक्षकांची तक्रार","isBlacklist":false},
        {"rollNo":11,"id":"stud-111","date":"2026-08-15","type":"📏 शिस्तभंग","severity":"गंभीर","action":"शिस्त मोडली / समज दिली","isBlacklist":false},
        {"rollNo":11,"id":"stud-111","date":"2026-08-16","type":"🧹 सेवा न करणे","severity":"मध्यम","action":"सेवा केली नाही / समजावून सांगितले","isBlacklist":false},
        {"rollNo":11,"id":"stud-111","date":"2026-08-17","type":"🤬 शिवी देणे","severity":"गंभीर","action":"मुलांना चिडवणे व शिवी देणे / सक्त ताकीद दिली","isBlacklist":false},
        {"rollNo":11,"id":"stud-111","date":"2026-08-18","type":"⏰ उशिरा उठणे","severity":"मध्यम","action":"सकाळी उशिरा उठणे / काकड आरतीला उशीर","isBlacklist":false},
        {"rollNo":11,"id":"stud-111","date":"2026-08-22","type":"🏫 शाळेत मस्ती","severity":"गंभीर","action":"शिक्षकांची तक्रार","isBlacklist":false},
        {"rollNo":11,"id":"stud-111","date":"2026-08-28","type":"🏠 वसतिगृह नियमभंग","severity":"गंभीर","action":"रात्री उशिरा जागरण","isBlacklist":false},
        {"rollNo":11,"id":"stud-111","date":"2026-09-02","type":"अस्वच्छता","severity":"गंभीर","action":"इतर कारण","isBlacklist":false},
        {"rollNo":12,"id":"stud-112","date":"2026-08-15","type":"📏 शिस्तभंग","severity":"मध्यम","action":"शिस्त मोडली / समज दिली","isBlacklist":false},
        {"rollNo":12,"id":"stud-112","date":"2026-08-16","type":"🧹 सेवा न करणे","severity":"मध्यम","action":"सेवा केली नाही / समज दिली","isBlacklist":false},
        {"rollNo":16,"id":"stud-116","date":"2026-08-19","type":"शिस्त","severity":"मध्यम","action":"वर्गात गोंधळ केला","isBlacklist":false},
        {"rollNo":16,"id":"stud-116","date":"2026-08-28","type":"😠 इतरांना त्रास देणे","severity":"गंभीर","action":"लहान मुलांना त्रास","isBlacklist":false},
        {"rollNo":17,"id":"stud-117","date":"2026-08-15","type":"🧹 सेवा न करणे","severity":"मध्यम","action":"सेवा केली नाही / समजावून सांगितले","isBlacklist":false},
        {"rollNo":18,"id":"stud-118","date":"2026-08-15","type":"🧹 सेवा न करणे","severity":"मध्यम","action":"सेवा वेळेवर केली नाही / समज दिली","isBlacklist":false},
        {"rollNo":19,"id":"stud-119","date":"2026-08-19","type":"वर्तन","severity":"गंभीर","action":"उशिरा आला","isBlacklist":false},
        {"rollNo":26,"id":"stud-126","date":"2026-08-27","type":"🤬 शिवी देणे","severity":"गंभीर","action":"मोठ्यांना उद्धट बोलला","isBlacklist":false},
        {"rollNo":27,"id":"stud-127","date":"2026-08-15","type":"📏 शिस्तभंग","severity":"मध्यम","action":"शिस्त मोडली / समजावून सांगितले","isBlacklist":false},
        {"rollNo":27,"id":"stud-127","date":"2026-08-31","type":"🤬 शिवी देणे","severity":"मध्यम","action":"मोठ्यांना उद्धट बोलला","isBlacklist":false},
        {"rollNo":28,"id":"stud-128","date":"2026-08-15","type":"📏 शिस्तभंग","severity":"मध्यम","action":"शिस्त मोडली / समज दिली","isBlacklist":false},
        {"rollNo":30,"id":"stud-130","date":"2026-08-15","type":"🤬 शिवी देणे","severity":"गंभीर","action":"इतर मुलांना चिडवणे व शिवी देणे / सक्त ताकीद दिली","isBlacklist":false},
        {"rollNo":35,"id":"stud-135","date":"2026-08-15","type":"📏 शिस्तभंग","severity":"मध्यम","action":"शिस्त मोडली / समज दिली","isBlacklist":false},
        {"rollNo":36,"id":"stud-136","date":"2026-08-15","type":"📏 शिस्तभंग","severity":"मध्यम","action":"शिस्त मोडली / समज दिली","isBlacklist":false},
        {"rollNo":38,"id":"stud-138","date":"2026-08-15","type":"🤬 शिवी देणे","severity":"गंभीर","action":"इतर मुलांना चिडवणे व शिवी देणे / सक्त ताकीद दिली","isBlacklist":false},
        {"rollNo":41,"id":"stud-141","date":"2026-08-15","type":"🧹 सेवा न करणे","severity":"मध्यम","action":"सेवा केली नाही / समजावून सांगितले","isBlacklist":false},
        {"rollNo":42,"id":"stud-142","date":"2026-08-15","type":"📏 शिस्तभंग","severity":"मध्यम","action":"शिस्त मोडली / समजावून सांगितले","isBlacklist":false},
        {"rollNo":46,"id":"stud-146","date":"2026-08-15","type":"📏 शिस्तभंग","severity":"मध्यम","action":"शिस्त मोडली / समज दिली","isBlacklist":false},
        {"rollNo":47,"id":"stud-147","date":"2026-08-15","type":"📏 शिस्तभंग","severity":"मध्यम","action":"शिस्त मोडली / समज दिली","isBlacklist":false},
        {"rollNo":50,"id":"stud-150","date":"2026-08-18","type":"अभ्यास","severity":"मध्यम","action":"गृहपाठ केला नाही","isBlacklist":false},
        {"rollNo":51,"id":"stud-151","date":"2026-08-15","type":"🧹 सेवा न करणे","severity":"मध्यम","action":"सेवा केली नाही / समज दिली","isBlacklist":false},
        {"rollNo":51,"id":"stud-151","date":"2026-08-16","type":"🤬 शिवी देणे","severity":"गंभीर","action":"इतर मुलांना चिडवणे व शिवी देणे / सक्त ताकीद दिली","isBlacklist":false},
        {"rollNo":52,"id":"stud-152","date":"2026-08-15","type":"📏 शिस्तभंग","severity":"मध्यम","action":"शिस्त मोडली / समज दिली","isBlacklist":false},
        {"rollNo":52,"id":"stud-152","date":"2026-08-16","type":"🧹 सेवा न करणे","severity":"मध्यम","action":"सेवा केली नाही / समज दिली","isBlacklist":false},
        {"rollNo":55,"id":"stud-155","date":"2026-08-15","type":"🤬 शिवी देणे","severity":"गंभीर","action":"इतर मुलांना चिडवणे व शिवी देणे / सक्त ताकीद दिली","isBlacklist":false},
        {"rollNo":55,"id":"stud-155","date":"2026-08-16","type":"📏 शिस्तभंग","severity":"मध्यम","action":"मोठ्यांचे न ऐकणे / समजावून सांगितले","isBlacklist":false},
        {"rollNo":58,"id":"stud-158","date":"2026-08-15","type":"📏 शिस्तभंग","severity":"मध्यम","action":"शिस्त मोडली / समज दिली","isBlacklist":false},
        {"rollNo":61,"id":"stud-161","date":"2026-08-15","type":"📏 शिस्तभंग","severity":"मध्यम","action":"शिस्त मोडली / समज दिली","isBlacklist":false},
        {"rollNo":64,"id":"stud-164","date":"2026-08-22","type":"📏 शिस्तभंग","severity":"मध्यम","action":"वेळापत्रक पाळले नाही","isBlacklist":false},
        {"rollNo":64,"id":"stud-164","date":"2026-08-25","type":"📏 शिस्तभंग","severity":"गंभीर","action":"वेळापत्रक पाळले नाही","isBlacklist":false},
        {"rollNo":64,"id":"stud-164","date":"2026-08-31","type":"😠 इतरांना त्रास देणे","severity":"मध्यम","action":"लहान मुलांना त्रास","isBlacklist":false},
        {"rollNo":64,"id":"stud-164","date":"2026-09-03","type":"😠 इतरांना त्रास देणे","severity":"गंभीर","action":"लहान मुलांना त्रास","isBlacklist":false},
        {"rollNo":65,"id":"stud-165","date":"2026-08-22","type":"📱 मोबाईलचा गैरवापर","severity":"गंभीर","action":"मोबाईल वापरताना आढळला","isBlacklist":false},
        {"rollNo":70,"id":"stud-170","date":"2026-08-25","type":"📏 शिस्तभंग","severity":"मध्यम","action":"गणवेश नीट नाही","isBlacklist":false},
        {"rollNo":71,"id":"stud-171","date":"2026-08-28","type":"📏 शिस्तभंग","severity":"गंभीर","action":"वेळापत्रक पाळले नाही","isBlacklist":false},
        {"rollNo":72,"id":"stud-172","date":"2026-08-23","type":"⏰ उशिरा उठणे","severity":"गंभीर","action":"वारंवार उशीर","isBlacklist":false},
        {"rollNo":72,"id":"stud-172","date":"2026-08-23","type":"📏 शिस्तभंग","severity":"गंभीर","action":"वेळापत्रक पाळले नाही","isBlacklist":false},
        {"rollNo":33,"id":"stud-133","date":"2026-10-04","type":"🤬 शिवी देणे","severity":"गंभीर","action":"तुझ्या बापाचा फोन आहे का? आईच्यावर शिव्या देतो.","isBlacklist":false},
        {"rollNo":11,"id":"stud-111","date":"2026-10-04","type":"😠 इतरांना त्रास देणे","severity":"गंभीर","action":"लोकल मुलांना मारतो. शिट्टी वाजवतो वर्गात. मुलींना मारतो. धनश्री हिला मारले. मस्के च्या बरोबर भांडण केले. आईच्या नावाने ओरडतो, गाडीतून डोके बाहेर काढतो.","isBlacklist":false},
        {"rollNo":2,"id":"stud-102","date":"2026-10-04","type":"📏 शिस्तभंग","severity":"गंभीर","action":"गुरुकुलाच्या नियमात राहत नाही,","isBlacklist":true},
        {"rollNo":4,"id":"stud-104","date":"2026-10-04","type":"📏 शिस्तभंग","severity":"गंभीर","action":"गुरुकुलाच्या नियमात राहत नाही,","isBlacklist":true},
        {"rollNo":11,"id":"stud-111","date":"2026-10-04","type":"📏 शिस्तभंग","severity":"गंभीर","action":"गुरुकुलाच्या नियमात राहत नाही,","isBlacklist":true},
        {"rollNo":12,"id":"stud-112","date":"2026-10-04","type":"📏 शिस्तभंग","severity":"गंभीर","action":"गुरुकुलाच्या नियमात राहत नाही,","isBlacklist":true},
        {"rollNo":17,"id":"stud-117","date":"2026-10-04","type":"📏 शिस्तभंग","severity":"गंभीर","action":"गुरुकुलाच्या नियमात राहत नाही,","isBlacklist":true},
        {"rollNo":18,"id":"stud-118","date":"2026-10-04","type":"📏 शिस्तभंग","severity":"गंभीर","action":"गुरुकुलाच्या नियमात राहत नाही,","isBlacklist":true},
        {"rollNo":23,"id":"stud-123","date":"2026-10-04","type":"📏 शिस्तभंग","severity":"गंभीर","action":"गुरुकुलाच्या नियमात राहत नाही,","isBlacklist":true},
        {"rollNo":23,"id":"stud-123","date":"2026-10-04","type":"😠 इतरांना त्रास देणे","severity":"गंभीर","action":"मुलाला त्रास देणे","isBlacklist":true},
        {"rollNo":25,"id":"stud-125","date":"2026-10-04","type":"📏 शिस्तभंग","severity":"गंभीर","action":"गुरुकुलाच्या नियमात राहत नाही,","isBlacklist":true},
        {"rollNo":26,"id":"stud-126","date":"2026-10-04","type":"📏 शिस्तभंग","severity":"गंभीर","action":"गुरुकुलाच्या नियमात राहत नाही,","isBlacklist":true},
        {"rollNo":27,"id":"stud-127","date":"2026-10-04","type":"📏 शिस्तभंग","severity":"गंभीर","action":"भांडण करणे गंभीर स्वरुपात","isBlacklist":true},
        {"rollNo":27,"id":"stud-127","date":"2026-10-04","type":"📏 शिस्तभंग","severity":"गंभीर","action":"गुरुकुलाच्या नियमात राहत नाही, भांडण करतो, सांगून ऐकत नाही","isBlacklist":true},
        {"rollNo":32,"id":"stud-132","date":"2026-10-04","type":"📏 शिस्तभंग","severity":"गंभीर","action":"गुरुकुलाच्या नियमात राहत नाही,","isBlacklist":true},
        {"rollNo":39,"id":"stud-139","date":"2026-10-04","type":"📏 शिस्तभंग","severity":"गंभीर","action":"गुरुकुलाच्या नियमात राहत नाही,","isBlacklist":true},
        {"rollNo":53,"id":"stud-153","date":"2026-10-04","type":"📏 शिस्तभंग","severity":"गंभीर","action":"भांडण करणे गंभीर स्वरुपात","isBlacklist":true},
        {"rollNo":56,"id":"stud-156","date":"2026-10-04","type":"📏 शिस्तभंग","severity":"गंभीर","action":"भांडण करणे गंभीर स्वरुपात","isBlacklist":true},
        {"rollNo":62,"id":"stud-162","date":"2026-10-04","type":"📏 शिस्तभंग","severity":"गंभीर","action":"भांडण करणे गंभीर स्वरुपात","isBlacklist":true},
        {"rollNo":68,"id":"stud-168","date":"2026-10-04","type":"📏 शिस्तभंग","severity":"गंभीर","action":"गुरुकुलाच्या नियमात राहत नाही,","isBlacklist":true},
        {"rollNo":69,"id":"stud-169","date":"2026-10-04","type":"📏 शिस्तभंग","severity":"गंभीर","action":"गुरुकुलाच्या नियमात राहत नाही,","isBlacklist":true}
    ];

    function seedComplaintsAndBlacklist() {
        const list = students();
        if (!list || !list.length) return;
        let changed = false;

        // Clean up dummy placeholder complaints if any existed from early mock seeds
        list.forEach((student) => {
            if (Array.isArray(student.complaints)) {
                const lenBefore = student.complaints.length;
                student.complaints = student.complaints.filter((c) => {
                    const act = String(c.action || c.text || c.reason || '');
                    return !act.includes('प्रारंभिक शिस्त निरीक्षण') && !act.includes('Initial discipline review') && !act.includes('वारंवार शिस्त निरीक्षण') && !act.includes('Repeated discipline review');
                });
                if (student.complaints.length !== lenBefore) changed = true;
            }
            if (Array.isArray(student.blacklistHistory)) {
                const lenBefore = student.blacklistHistory.length;
                student.blacklistHistory = student.blacklistHistory.filter((h) => {
                    const r = String(h.reason || '');
                    return !r.includes('प्रारंभिक शिस्त निरीक्षण') && !r.includes('Initial discipline review') && !r.includes('वारंवार शिस्त निरीक्षण') && !r.includes('Repeated discipline review');
                });
                if (student.blacklistHistory.length !== lenBefore) changed = true;
            }
            if (student.blacklistInfo) {
                const r = String(student.blacklistInfo.reason || '');
                if (r.includes('प्रारंभिक शिस्त निरीक्षण') || r.includes('वारंवार शिस्त निरीक्षण')) {
                    delete student.blacklistInfo;
                    changed = true;
                }
            }
        });

        OFFICIAL_COMPLAINTS_SEED.forEach((c) => {
            const student = list.find((s) => String(s.id) === String(c.id) || Number(s.rollNo) === Number(c.rollNo));
            if (!student) return;
            if (!Array.isArray(student.complaints)) student.complaints = [];

            const exists = student.complaints.some((existing) => 
                String(existing.date || '') === String(c.date) &&
                (String(existing.action || existing.text || '').trim() === String(c.action).trim() ||
                 (String(existing.type || '').trim() === String(c.type).trim() && String(existing.action || existing.text || '').includes(String(c.action).slice(0, 10))))
            );

            if (!exists) {
                student.complaints.push({
                    date: c.date,
                    type: c.type,
                    severity: c.severity,
                    action: c.action,
                    text: c.action,
                    isBlacklist: !!c.isBlacklist
                });
                changed = true;
            }

            if (c.isBlacklist) {
                student.blacklisted = true;
                student.blacklistInfo = { reason: c.action, date: c.date };
                if (!Array.isArray(student.blacklistHistory)) student.blacklistHistory = [];
                const histExists = student.blacklistHistory.some((h) => 
                    String(h.date || '') === String(c.date) && String(h.reason || '').trim() === String(c.action).trim()
                );
                if (!histExists) {
                    student.blacklistHistory.push({ reason: c.action, date: c.date });
                }
                changed = true;
            }
        });

        // Ensure students not flagged in complaints as blacklisted do not remain accidentally blacklisted from old demo states
        const blacklistedRolls = new Set(OFFICIAL_COMPLAINTS_SEED.filter((x) => x.isBlacklist).map((x) => Number(x.rollNo)));
        list.forEach((student) => {
            if (!blacklistedRolls.has(Number(student.rollNo))) {
                if (student.blacklisted && (!student.blacklistHistory || !student.blacklistHistory.length)) {
                    student.blacklisted = false;
                    delete student.blacklistInfo;
                    changed = true;
                }
            }
        });

        if (changed) {
            saveAll();
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
        const saved = sortAwards(getAdarsh().slice());
        const latest = saved[saved.length - 1];

        el.innerHTML = `
            <div class="sb-head">
                <div>
                    <h2><i class="fa-solid fa-award"></i> ${T('आठवड्याचा आदर्श विद्यार्थी', 'Student of the Week')}</h2>
                    <p>${T('दर आठवड्याला एक आदर्श विद्यार्थी निवडा.', 'Pick one star student each week.')}</p>
                </div>
            </div>

            ${latest ? `<div class="sb-hero">
                <div class="sb-medal"><i class="fa-solid fa-medal"></i></div>
                <div>
                    <h3>${esc(latest.name)}</h3>
                    <span>${T('दिनांक', 'Date')} ${esc(awardDate(latest))} · ${esc(formatAwardWeek(latest.week))}${latest.rollNo ? ` · ${T('हजेरी क्र.', 'Roll')} ${esc(latest.rollNo)}` : ''}${latest.note ? ` · ${esc(latest.note)}` : ''}</span>
                </div>
            </div>` : ''}

            <div class="sb-card">
                <div class="sb-grid">
                    <div class="form-group">
                        <label>${T('आठवडा', 'Week')}</label>
                        <select id="sb-week" class="form-control">
                            ${AWARD_WEEK_OPTIONS.map((option) => `<option value="${option.value}">${option.label}</option>`).join('')}
                        </select>
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
                    <td data-label="${T('दिनांक', 'Date')}"><b>${esc(awardDate(a))}</b><small>${esc(formatAwardWeek(a.week))}</small></td>
                    <td data-label="${T('हजेरी क्र.', 'Roll')}">${esc(a.rollNo || '—')}</td>
                    <td data-label="${T('फोटो', 'Photo')}">${photo}</td>
                    <td class="sb-identity" data-label="${T('विद्यार्थी', 'Student')}"><span class="sb-chip gold"><i class="fa-solid fa-star"></i> ${esc(a.name)}</span></td>
                    <td class="sb-count" data-label="${T('वेळा', 'Times')}"><span class="sb-chip gold" data-award-count>${awardCount(a.id)}×</span></td>
                    <td data-label="${T('वर्ग', 'Class')}">${esc(student.standard || '—')}</td>
                    <td class="sb-reason" data-label="${T('कारण / पुरस्कार', 'Reason / Award')}">${esc(a.note || '—')}</td>
                    <td data-label="${T('स्थिती', 'Status')}"><span class="sb-chip gold">${T('सन्मानित', 'Awarded')}</span></td>
                    <td style="text-align:right"><button class="btn-secondary btn-sm" data-profile="${esc(a.id)}">${T('प्रोफाईल पहा', 'View profile')}</button> <button class="btn-secondary btn-sm" data-edit-award-id="${esc(a.id)}" data-edit-award-week="${esc(a.week)}"><i class="fa-solid fa-pen"></i> ${T('संपादन', 'Edit')}</button> <button class="btn-secondary btn-sm" data-del-id="${esc(a.id)}" data-del-week="${esc(a.week)}" title="${T('हटवा', 'Delete')}"><i class="fa-solid fa-trash"></i></button></td>
                </tr>`; }).join('')}
                </tbody></table>` : `<div class="sb-empty">${T('अद्याप कोणीही निवडलेले नाही.', 'No student selected yet.')}</div>`}
            </div>
        `;

        const pick = () => {
            const week = document.getElementById('sb-week').value || '1';
            const stud = students().find((s) => String(s.id) === document.getElementById('sb-student').value);
            const note = document.getElementById('sb-note').value || '';
            return { week, stud, note };
        };

        el.querySelector('#sb-save').onclick = () => {
            const { week, stud, note } = pick();
            if (!stud) { toast(T('विद्यार्थी निवडा.', 'Select a student.'), 'warning'); return; }
            const arr = getAdarsh().filter((a) => !(String(a.week) === String(week) && String(a.id) === String(stud.id)) && (!editingAwardWeek || String(a.week) !== String(editingAwardWeek) || String(a.id) !== String(editingAwardId)));
            arr.push({ week, date: today(), id: stud.id, name: nameOf(stud), rollNo: stud.rollNo, note });
            setAdarsh(sortAwards(arr));
            editingAwardWeek = '';
            editingAwardId = '';
            document.getElementById('sb-save').innerHTML = `<i class="fa-solid fa-star"></i> ${T('जतन करा', 'Save')}`;
            updateMenuBadges();
            toast(T('आदर्श विद्यार्थी जतन झाला!', 'Star student saved!'));
            renderStar();
        };

        el.querySelectorAll('[data-del-id]').forEach((b) => b.addEventListener('click', () => {
            const delId = b.getAttribute('data-del-id');
            const delWk = b.getAttribute('data-del-week');
            ask(T(`Week ${delWk} ची ही निवड काढून टाकायची?`, `Remove this pick for Week ${delWk}?`), () => {
                setAdarsh(getAdarsh().filter((a) => !(String(a.id) === String(delId) && String(a.week) === String(delWk))));
                if (editingAwardWeek === delWk && editingAwardId === delId) {
                    editingAwardWeek = '';
                    editingAwardId = '';
                }
                updateMenuBadges();
                renderStar();
            });
        }));
        el.querySelectorAll('[data-edit-award-id]').forEach((b) => b.addEventListener('click', () => {
            const editId = b.getAttribute('data-edit-award-id');
            const editWk = b.getAttribute('data-edit-award-week');
            const award = getAdarsh().find((a) => String(a.id) === String(editId) && String(a.week) === String(editWk));
            if (!award) return;
            editingAwardWeek = award.week;
            editingAwardId = award.id;
            document.getElementById('sb-week').value = awardWeekNumber(award.week) === 999 ? '1' : String(award.week);
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
                renderBlack();
            });
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
        seedComplaintsAndBlacklist();
        seedInitialRecords();
        seedRequestedRepeatRecords();
        seedWeek11Students();
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
