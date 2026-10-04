/* Clear only old demo activity once; student profiles and future updates stay intact. */
(function () {
    'use strict';

    var FLAG = 'vss_demo_updates_removed_v1';

    function clean(list) {
        if (!Array.isArray(list)) return list;
        return list.map(function (student) {
            if (!student || typeof student !== 'object') return student;
            student.attendance = [];
            student.sessionAttendance = {};
            student.dailyAttendance = {};
            student.complaints = [];
            student.blacklisted = false;
            delete student.blacklistInfo;
            return student;
        });
    }

    function cleanStoredStudents() {
        try {
            var raw = localStorage.getItem('vss_students');
            if (!raw) return;
            localStorage.setItem('vss_students', JSON.stringify(clean(JSON.parse(raw))));
        } catch (_) { }
    }

    function cleanStateSeed() {
        try {
            if (!window.VSS_STATE_SEED || !window.VSS_STATE_SEED.vss_students) return;
            var list = JSON.parse(window.VSS_STATE_SEED.vss_students);
            window.VSS_STATE_SEED.vss_students = JSON.stringify(clean(list));
        } catch (_) { }
    }

    if (localStorage.getItem(FLAG) === '1' || localStorage.getItem('vss_imported_backup_v1') === '1') return;

    cleanStateSeed();
    if (Array.isArray(window.VSS_STUDENTS_SEED)) clean(window.VSS_STUDENTS_SEED);
    cleanStoredStudents();
    localStorage.removeItem('vss_adarsh_week');
    localStorage.setItem('vss_demo_updates_pending_sync', '1');
    localStorage.setItem(FLAG, '1');
})();
