/* School-attendance exception for students who do not attend school. */
(function () {
    'use strict';

    window.vssIsSchoolEligible = function (student) {
        return !student || student.notGoingToSchool !== true;
    };

    function complaintKey(entry) {
        return [entry.date || '', entry.type || '', entry.severity || '', entry.action || ''].join('|');
    }

    function importInto(records) {
        var seed = window.VSS_STATE_SEED;
        if (!seed || !seed.vss_students || !Array.isArray(records)) return records;
        var seeded;
        try { seeded = JSON.parse(seed.vss_students); } catch (_) { return records; }
        var byRoll = new Map(seeded.map(function (student) { return [String(student.rollNo), student]; }));
        var merged = records.map(function (student) {
            var source = byRoll.get(String(student.rollNo));
            if (!source || !source.historicalAttendance) return student;
            var currentComplaints = Array.isArray(student.complaints) ? student.complaints : [];
            var known = new Set(currentComplaints.map(complaintKey));
            var imported = (source.complaints || []).filter(function (entry) { return !known.has(complaintKey(entry)); });
            var dailyAttendance = Object.assign({}, source.dailyAttendance || {}, student.dailyAttendance || {});
            var notGoing = source.notGoingToSchool === true || student.notGoingToSchool === true;
            if (notGoing) {
                Object.keys(dailyAttendance).forEach(function (date) { delete dailyAttendance[date].school; });
            }
            return Object.assign({}, student, {
                historicalAttendance: source.historicalAttendance,
                notGoingToSchool: notGoing,
                photo: source.photo || student.photo,
                dailyAttendance: dailyAttendance,
                complaints: currentComplaints.concat(imported),
                blacklisted: source.blacklisted === true || student.blacklisted === true
            });
        });
        // Include any new students in seeded that were not yet in records (e.g. rolls 73, 74, 75)
        var existingRolls = new Set(merged.map(function (s) { return String(s.rollNo); }));
        seeded.forEach(function (student) {
            if (!existingRolls.has(String(student.rollNo))) {
                merged.push(student);
            }
        });
        return merged;
    }

    function migrateHistoricalImport() {
        if (localStorage.getItem('vss_historical_import_v7') === 'done') return;
        var raw = localStorage.getItem('vss_students');
        if (!raw) return;
        try {
            var merged = importInto(JSON.parse(raw));
            localStorage.setItem('vss_students', JSON.stringify(merged));
            if (Array.isArray(window.studentsDatabase)) {
                window.studentsDatabase.splice(0, window.studentsDatabase.length, ...merged);
            }
            localStorage.setItem('vss_historical_import_v7', 'done');
            if (window.vssCloudPush) window.vssCloudPush();
        } catch (_) { /* Keep existing data untouched if its format is unexpected. */ }
    }

    function decorateDirectory() {
        document.querySelectorAll('#students-table-body .student-row').forEach(function (row) {
            var roll = String(row.getAttribute('data-roll') || '');
            var student = (window.studentsDatabase || []).find(function (item) { return String(item.rollNo) === roll; });
            if (!student || window.vssIsSchoolEligible(student)) return;
            row.style.background = '#fff8f6';
            row.style.borderLeft = '4px solid #b91c1c';
            var name = row.querySelector('.table-student-name');
            if (name && !name.querySelector('.school-exempt-label')) {
                name.insertAdjacentHTML('beforeend', ' <span class="school-exempt-label" style="display:inline-block;margin-left:6px;padding:2px 8px;border-radius:999px;background:#fee2e2;color:#991b1b;font-size:11px;font-weight:700;">शाळा सूट (School exempt)</span>');
            }
        });
    }

    function decorateProfile() {
        var student = window.selectedStudent;
        var name = document.getElementById('prof-name');
        document.getElementById('school-exempt-profile-badge')?.remove();
        document.getElementById('historical-attendance-card')?.remove();
        if (!student || !name) return;
        var after = name;
        if (!window.vssIsSchoolEligible(student)) {
            name.insertAdjacentHTML('afterend', '<div id="school-exempt-profile-badge" style="margin-top:8px;color:#991b1b;font-weight:700;">● शाळेत जात नाही — School attendance not required (School exempt)</div>');
            after = document.getElementById('school-exempt-profile-badge') || name;
        }
        var history = student.historicalAttendance;
        if (!history) return;
        var monthName = { '2026-06': 'June', '2026-07': 'July', '2026-08': 'August', '2026-09': 'September' };
        var value = function (n) { return n == null ? '—' : String(n); };
        var rows = Object.keys(monthName).map(function (month) {
            var totals = history[month] || {};
            var schoolDisplay = student.notGoingToSchool ? '<span style="color:#b91c1c;font-weight:700;font-size:11px;">लागू नाही (N/A)</span>' : value(totals.school);
            return '<tr><td style="padding:4px 8px;">' + monthName[month] + '</td><td style="padding:4px 8px;text-align:center;">' + schoolDisplay + '</td><td style="padding:4px 8px;text-align:center;">' + value(totals.evening) + '</td><td style="padding:4px 8px;text-align:center;">' + value(totals.morning) + '</td></tr>';
        }).join('');
        after.insertAdjacentHTML('afterend', '<div id="historical-attendance-card" style="margin-top:12px;padding:10px;border:1px solid #dbeafe;border-radius:10px;background:#f8fbff;"><strong>June–September attendance totals</strong><table style="width:100%;margin-top:6px;border-collapse:collapse;font-size:13px;"><thead><tr><th style="text-align:left;padding:4px 8px;">Month</th><th>School</th><th>Evening</th><th>Morning</th></tr></thead><tbody>' + rows + '</tbody></table></div>');
    }

    function patchRenderers() {
        if (typeof window.renderStudentTable === 'function' && !window.renderStudentTable.__schoolStatus) {
            var table = window.renderStudentTable;
            window.renderStudentTable = function () {
                var result = table.apply(this, arguments);
                decorateDirectory();
                return result;
            };
            window.renderStudentTable.__schoolStatus = true;
        }
        if (typeof window.renderStudentProfile === 'function' && !window.renderStudentProfile.__schoolStatus) {
            var profile = window.renderStudentProfile;
            window.renderStudentProfile = function () {
                var result = profile.apply(this, arguments);
                decorateProfile();
                return result;
            };
            window.renderStudentProfile.__schoolStatus = true;
        }
    }

    migrateHistoricalImport();
    var boot = function () { patchRenderers(); decorateDirectory(); decorateProfile(); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else setTimeout(boot, 0);
})();
