/* =========================================================
   डेटा सीड — ॲप नवीन ठिकाणी सुरू झाल्यावर संपूर्ण डेटा एकदाच भरतो
   (विद्यार्थी, हजेरी, परीक्षा गुण, सुट्ट्या, भाषा)
   ========================================================= */
(function () {
    'use strict';

    var FLAG = 'vss_state_seed_v4';
    var OLD_FLAG = 'vss_students_seed_v4';


    function hasData() {
        try {
            var a = JSON.parse(localStorage.getItem('vss_students') || 'null');
            return Array.isArray(a) && a.length > 0;
        } catch (_) { return false; }
    }

    function refreshUI() {
        try {
            if (typeof window.vssReloadFromStorage === 'function') window.vssReloadFromStorage();
            else {
                window.studentsDatabase = JSON.parse(localStorage.getItem('vss_students') || '[]');
                if (typeof renderStudentTable === 'function') renderStudentTable();
                if (typeof renderDashboardMetrics === 'function') renderDashboardMetrics();
            }
        } catch (_) { }
    }

    /* संपूर्ण स्नॅपशॉट (विद्यार्थी + हजेरी + परीक्षा + सुट्ट्या) */
    function applyState() {
        var snap = window.VSS_STATE_SEED;
        if (!snap || typeof snap !== 'object') return false;
        Object.keys(snap).forEach(function (k) {
            try { localStorage.setItem(k, snap[k]); } catch (_) { }
        });
        localStorage.setItem(FLAG, '1');
        localStorage.setItem(OLD_FLAG, '1');
        localStorage.setItem('vss_directory_reset_v3', '1');
        localStorage.setItem('vss_weekly_marks_v1', '1');
        refreshUI();
        return true;
    }

    /* जुना पर्याय — फक्त विद्यार्थी यादी */
    function applyStudents() {
        var list = window.VSS_STUDENTS_SEED;
        if (!Array.isArray(list) || !list.length) return false;
        localStorage.setItem('vss_students', JSON.stringify(list));
        if (window.VSS_HOLIDAYS) {
            localStorage.setItem('vss_holidays', JSON.stringify(window.VSS_HOLIDAYS));
        }
        localStorage.setItem(OLD_FLAG, '1');
        localStorage.removeItem('vss_weekly_marks_v1');
        refreshUI();
        return true;
    }

    function boot() {
        if (localStorage.getItem(FLAG) === '1') return;
        /* नवीन आवृत्तीचा डेटा (११ सप्टें. बॅकअप + १–१५ सप्टें. हजेरी) एकदाच भरतो */
        if (!applyState()) applyStudents();
    }


    window.vssSeedState = function () {
        localStorage.removeItem(FLAG);
        return applyState();
    };
    window.vssSeedStudents = function () {
        localStorage.removeItem(OLD_FLAG);
        return applyStudents();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 400); });
    } else {
        setTimeout(boot, 400);
    }
})();
