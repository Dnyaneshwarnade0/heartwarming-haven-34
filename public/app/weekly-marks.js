/* =========================================================
   साप्ताहिक परीक्षा गुण (हप्ता १ ते ९) — एकदाच भरले जातात
   आणि प्रगती आलेखाशी जुळवले जातात.
   ========================================================= */
(function () {
    'use strict';

    var FLAG = 'vss_weekly_marks_v1';
    var TOTAL_WEEKS = 9;

    function mondayOffset(weeksAgo) {
        var d = new Date();
        d.setDate(d.getDate() - weeksAgo * 7);
        d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // सोमवार
        return d.toISOString().slice(0, 10);
    }

    function students() {
        if (Array.isArray(window.studentsDatabase) && window.studentsDatabase.length) return window.studentsDatabase;
        try {
            var raw = JSON.parse(localStorage.getItem('vss_students') || '[]');
            return Array.isArray(raw) ? raw : [];
        } catch (_) { return []; }
    }

    function ratingFor(avg) {
        if (avg >= 80) return 'Good';
        if (avg >= 50) return 'Average';
        return 'Weak';
    }

    function seed() {
        var data = window.VSS_WEEKLY_MARKS;
        if (!data) return;
        var list = students();
        if (!list.length) return false;

        var byRoll = {};
        list.forEach(function (s) { byRoll[Number(s.rollNo)] = s; });

        var exams = [];
        try { exams = JSON.parse(localStorage.getItem('vss_exams') || '[]'); } catch (_) { exams = []; }
        /* जुने साप्ताहिक रेकॉर्ड काढून नवे भरा */
        exams = exams.filter(function (e) { return String(e && e.id || '').indexOf('wk-') !== 0; });

        var totals = {};
        for (var w = 1; w <= TOTAL_WEEKS; w++) {
            var entries = {};
            Object.keys(data).forEach(function (roll) {
                var marks = data[roll][w - 1];
                if (marks === null || marks === undefined || marks === '') return;
                var stu = byRoll[Number(roll)];
                if (!stu) return;
                entries[stu.id] = { marks: Number(marks), remark: '' };
                totals[stu.id] = totals[stu.id] || [];
                totals[stu.id].push(Number(marks));
            });
            if (!Object.keys(entries).length) continue;
            exams.push({
                id: 'wk-' + w,
                kind: 'weekly',
                name: 'साप्ताहिक परीक्षा ' + w,
                subject: '',
                date: mondayOffset(TOTAL_WEEKS - w),
                max: 100,
                savedAt: new Date().toISOString(),
                entries: entries
            });
        }

        exams.sort(function (a, b) { return String(a.date) < String(b.date) ? -1 : 1; });
        localStorage.setItem('vss_exams', JSON.stringify(exams));

        /* डॅशबोर्डवरील गुणवत्ता वितरण गुणांशी जुळवा */
        list.forEach(function (s) {
            var arr = totals[s.id];
            if (!arr || !arr.length) return;
            var avg = arr.reduce(function (a, b) { return a + b; }, 0) / arr.length;
            var r = ratingFor(avg);
            s.avgMarks = Math.round(avg);
            s.subjects = s.subjects || {};
            Object.keys(s.subjects).forEach(function (k) { if (!s.subjects[k]) s.subjects[k] = r; });
            if (!Object.keys(s.subjects).length) {
                s.subjects = { Marathi: r, Hindi: r, English: r, Maths: r, Science: r };
            }
        });
        localStorage.setItem('vss_students', JSON.stringify(list));

        localStorage.setItem(FLAG, '1');
        try {
            if (typeof window.vssReloadFromStorage === 'function') window.vssReloadFromStorage();
            if (typeof renderDashboardMetrics === 'function') renderDashboardMetrics();
            if (typeof renderStudentTable === 'function') renderStudentTable();
        } catch (_) { }
        return true;
    }

    function boot() {
        if (localStorage.getItem(FLAG) === '1') return;
        var tries = 0;
        var timer = setInterval(function () {
            tries++;
            if (seed() || tries > 20) clearInterval(timer);
        }, 500);
    }

    window.vssSeedWeeklyMarks = function () {
        localStorage.removeItem(FLAG);
        seed();
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 900); });
    else setTimeout(boot, 900);
})();
