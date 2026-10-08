/* Staff-friendly navigation and daily actions. Loaded after the legacy portal. */
(function () {
    'use strict';

    const GROUPS = [
        { key: 'main', en: 'Main', mr: 'मुख्य', ids: ['panel-dashboard'] },
        { key: 'students', en: 'Students', mr: 'विद्यार्थी', ids: ['panel-students', 'menu-star-student', 'menu-blacklist'] },
        { key: 'records', en: 'Records', mr: 'नोंदी', ids: ['menu-daily-task', 'menu-fees', 'menu-exam', 'menu-reports'] },
        { key: 'administration', en: 'Administration', mr: 'प्रशासन', ids: ['panel-bot', 'menu-users-permissions', 'menu-settings', 'menu-backup', 'menu-pwa-install'] },
    ];

    const language = () => (typeof currentLanguage !== 'undefined' && currentLanguage === 'mr' ? 'mr' : 'en');
    const label = (en, mr) => language() === 'mr' ? mr : en;
    const get = (id) => document.getElementById(id);
    const ACCESS = {
        'panel-dashboard': 'dashboard', 'panel-students': 'students', 'panel-student-profile': 'students',
        'panel-star-student': 'students', 'menu-star-student': 'students',
        'panel-blacklist': 'students', 'menu-blacklist': 'students',
        'panel-daily-task': 'attendance', 'menu-daily-task': 'attendance',
        'panel-fees': 'fees', 'menu-fees': 'fees', 'panel-exam': 'exam', 'menu-exam': 'exam',
        'panel-reports': 'reports', 'menu-reports': 'reports',
        'panel-settings': 'settings', 'menu-settings': 'admin',
        'menu-pwa-install': 'public',
        'panel-bot': 'admin', 'panel-backup': 'admin', 'menu-backup': 'admin',
        'panel-admin-profile': 'admin', 'menu-users-permissions': 'admin',
    };
    let navObserver;
    let refreshQueued = false;

    function canOpen(target, user, accounts) {
        if (!user) return target === 'panel-dashboard';
        const account = (accounts || {})[user.username] || {};
        if (user.role === 'admin' || account.role === 'admin') return true;
        const need = ACCESS[target];
        if (need === 'public' || target === 'panel-dashboard') return true;
        if (!need || need === 'admin') return false;
        return Array.isArray(account.perms) && account.perms.includes(need);
    }

    const activeUser = () => typeof currentUser !== 'undefined' ? currentUser : null;
    const activeAccounts = () => window.VSS_ACCOUNTS || {};
    const allowed = (target) => canOpen(target, activeUser(), activeAccounts());
    const denied = () => {
        if (typeof createToast === 'function') createToast(label('You do not have permission for this section.', 'या विभागासाठी तुम्हाला परवानगी नाही.'), 'warning');
    };

    function refreshPermissions() {
        const nav = document.querySelector('.sidebar-menu');
        if (!nav) return;
        nav.querySelectorAll('.menu-item').forEach((item) => {
            const target = item.id || item.getAttribute('data-target');
            item.hidden = !allowed(target) || (['menu-fees', 'menu-exam', 'menu-reports'].includes(target) && !allowed('panel-students'));
        });
        nav.querySelectorAll('.ux-menu-heading').forEach((heading) => {
            let next = heading.nextElementSibling;
            let visible = false;
            while (next && !next.classList.contains('ux-menu-heading')) {
                if (next.classList.contains('menu-item') && !next.hidden) visible = true;
                next = next.nextElementSibling;
            }
            heading.hidden = !visible;
        });
        const actionRules = [
            ['ux-action-add-student', 'panel-students'],
            ['ux-action-attendance', 'panel-daily-task'],
            ['ux-action-fee', 'panel-fees'],
        ];
        actionRules.forEach(([id, target]) => { const button = get(id); if (button) button.hidden = !allowed(target); });
        const feeAction = get('ux-action-fee');
        if (feeAction) feeAction.hidden = !allowed('panel-fees') || !allowed('panel-students');
        const controls = [
            ['btn-add-student', 'panel-students'],
            ['btn-mark-attendance', 'panel-daily-task'],
            ['card-add-payment', 'panel-fees'],
            ['mnav-attendance', 'panel-daily-task'],
            ['mnav-bot', 'panel-bot'],
        ];
        controls.forEach(([id, target]) => { const element = get(id); if (element) element.hidden = !allowed(target); });
        document.querySelectorAll('[data-tab="tab-fees"]').forEach((element) => { element.hidden = !allowed('panel-fees'); });
        const deleteStudent = get('btn-delete-student');
        if (deleteStudent) deleteStudent.hidden = !allowed('menu-users-permissions');
    }

    function installAccessGuard() {
        const original = window.switchPanel;
        if (typeof original !== 'function' || original.__uxGuard) return;
        const guarded = function (target) {
            if (allowed(target)) return original.apply(this, arguments);
            denied();
            return original.call(this, 'panel-dashboard');
        };
        guarded.__uxGuard = true;
        window.switchPanel = guarded;
        const nav = document.querySelector('.sidebar-menu');
        nav?.addEventListener('click', (event) => {
            const item = event.target.closest('.menu-item');
            if (!item || allowed(item.id || item.getAttribute('data-target'))) return;
            event.preventDefault();
            event.stopImmediatePropagation();
            denied();
        }, true);
    }

    function groupFor(item) {
        const key = item.id || item.getAttribute('data-target') || '';
        return GROUPS.find((group) => group.ids.includes(key)) || GROUPS[3];
    }

    function regroupMenu() {
        const nav = document.querySelector('.sidebar-menu');
        if (!nav) return;
        const items = Array.from(nav.children).filter((child) => child.classList.contains('menu-item'));
        const desired = [];
        GROUPS.forEach((group) => {
            const members = items.filter((item) => groupFor(item) === group);
            if (!members.length) return;
            let heading = nav.querySelector(`[data-ux-group="${group.key}"]`);
            if (!heading) {
                heading = document.createElement('div');
                heading.className = 'ux-menu-heading';
                heading.setAttribute('data-ux-group', group.key);
                heading.setAttribute('role', 'presentation');
            }
            heading.textContent = label(group.en, group.mr);
            desired.push(heading, ...members);
        });
        const current = Array.from(nav.children);
        if (current.length !== desired.length || current.some((child, index) => child !== desired[index])) {
            navObserver?.disconnect();
            nav.replaceChildren(...desired);
            navObserver?.observe(nav, { childList: true });
        }
        refreshPermissions();
    }

    function relabel() {
        document.querySelectorAll('[data-ux-en][data-ux-mr]').forEach((element) => {
            element.textContent = element.getAttribute(`data-ux-${language()}`);
        });
        const usersLabel = document.querySelector('#menu-users-permissions span');
        if (usersLabel) usersLabel.textContent = label('Users & Permissions', 'वापरकर्ते व परवानग्या');
        regroupMenu();
        updateDirectory();
    }

    function updateDirectory() {
        const counter = get('ux-student-results');
        if (!counter) return;
        let total = 0;
        try { total = typeof getActiveStudents === 'function' ? getActiveStudents().length : (window.studentsDatabase || []).length; } catch (_) { /* no signed-in list yet */ }
        const shown = get('students-table-body')?.querySelectorAll('tr.student-row').length || 0;
        counter.textContent = label(`${shown} of ${total} students shown`, `${total} पैकी ${shown} विद्यार्थी दिसत आहेत`);
        const search = get('search-student');
        const cls = get('filter-class');
        const section = get('filter-section');
        const filtered = Boolean(search?.value.trim() || cls?.value || section?.value);
        const reset = get('ux-reset-filters');
        if (reset) reset.disabled = !filtered;
        const empty = get('no-students-found');
        if (!empty) return;
        const title = empty.querySelector('h4');
        const help = empty.querySelector('p');
        const action = get('ux-empty-action');
        if (title) title.textContent = total ? label('No matching students', 'जुळणारे विद्यार्थी नाहीत') : label('No students yet', 'अद्याप विद्यार्थी नाहीत');
        if (help) help.textContent = total ? label('Clear your search and filters to see all students.', 'सर्व विद्यार्थी पाहण्यासाठी शोध आणि फिल्टर काढा.') : label('Add the first student to get started.', 'सुरुवात करण्यासाठी पहिला विद्यार्थी जोडा.');
        if (action) action.textContent = total ? label('Clear filters', 'फिल्टर काढा') : label('Add student', 'विद्यार्थी जोडा');
    }

    function resetDirectory() {
        ['search-student', 'filter-class', 'filter-section'].forEach((id) => { const control = get(id); if (control) control.value = ''; });
        if (typeof renderStudentTable === 'function') renderStudentTable();
        updateDirectory();
    }

    function showDirectoryGuide(kind) {
        const help = get('ux-fee-hint');
        const messages = {
            fee: ['Select a student below, then open their Fees tab to record a payment.', 'खाली विद्यार्थी निवडा; त्याच्या फी विभागात पेमेंट नोंदवा.'],
            exam: ['Select a student below, then open their Progress Report for examination records.', 'खाली विद्यार्थी निवडा; त्याच्या प्रगती अहवालात परीक्षेच्या नोंदी पाहा.'],
            report: ['Select a student below, then use Print Report on their profile.', 'खाली विद्यार्थी निवडा; त्याच्या प्रोफाईलमधून अहवाल प्रिंट करा.'],
        };
        if (!help) return;
        help.setAttribute('data-ux-en', messages[kind][0]);
        help.setAttribute('data-ux-mr', messages[kind][1]);
        help.textContent = label(...messages[kind]);
        help.classList.remove('d-none');
        if (typeof switchPanel === 'function') switchPanel('panel-students');
        get('search-student')?.focus();
    }

    function openFeeFlow() {
        if (!allowed('panel-fees') || !allowed('panel-students')) { denied(); return; }
        get('ux-fee-flow')?.remove();

        const overlay = document.createElement('div');
        overlay.id = 'ux-fee-flow';
        overlay.className = 'ux-fee-flow';
        const close = () => overlay.remove();
        const openStudentFees = (studentId, mode) => {
            close();
            if (typeof renderStudentProfile === 'function') renderStudentProfile(studentId);
            document.querySelector('#panel-student-profile [data-tab="tab-fees"]')?.click();
            if (mode === 'receive') {
                setTimeout(() => {
                    get('card-add-payment')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    get('pay-amount')?.focus();
                }, 0);
            }
        };
        const showPicker = (mode) => {
            const title = mode === 'receive' ? label('Fee received — choose student', 'फी भरली — विद्यार्थी निवडा') : label('View fee — choose student', 'फी पहा — विद्यार्थी निवडा');
            overlay.innerHTML = `<section class="ux-fee-card" role="dialog" aria-modal="true" aria-label="${title}">
                <div class="ux-fee-head"><h3>${title}</h3><button type="button" class="ux-fee-close" aria-label="Close">×</button></div>
                <input type="search" class="ux-fee-search" placeholder="${label('Search name or roll number', 'नाव किंवा रोल नंबर शोधा')}">
                <div class="ux-fee-students"></div>
                <button type="button" class="btn-secondary ux-fee-back">${label('Back', 'मागे')}</button>
            </section>`;
            const list = overlay.querySelector('.ux-fee-students');
            const search = overlay.querySelector('.ux-fee-search');
            const draw = () => {
                const query = String(search.value || '').trim().toLowerCase();
                const listData = (typeof getActiveStudents === 'function' ? getActiveStudents() : (window.studentsDatabase || []))
                    .filter((student) => {
                        const name = typeof getStudentName === 'function' ? getStudentName(student) : student.name;
                        return !query || String(name || '').toLowerCase().includes(query) || String(student.rollNo || '').includes(query);
                    })
                    .sort((a, b) => Number(a.rollNo || 0) - Number(b.rollNo || 0));
                list.replaceChildren(...listData.map((student) => {
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = 'ux-fee-student';
                    const name = typeof getStudentName === 'function' ? getStudentName(student) : student.name;
                    button.textContent = `${student.rollNo || '—'} · ${name || label('Student', 'विद्यार्थी')}`;
                    button.addEventListener('click', () => openStudentFees(student.id, mode));
                    return button;
                }));
                if (!list.childElementCount) list.textContent = label('No student found.', 'विद्यार्थी सापडला नाही.');
            };
            draw();
            search.addEventListener('input', draw);
            overlay.querySelector('.ux-fee-close').addEventListener('click', close);
            overlay.querySelector('.ux-fee-back').addEventListener('click', showChoices);
            search.focus();
        };
        const showChoices = () => {
            overlay.innerHTML = `<section class="ux-fee-card" role="dialog" aria-modal="true" aria-label="${label('Fees', 'फी')}">
                <div class="ux-fee-head"><h3>${label('Fees', 'फी')}</h3><button type="button" class="ux-fee-close" aria-label="Close">×</button></div>
                <p>${label('What would you like to do?', 'तुम्हाला काय करायचे आहे?')}</p>
                <button type="button" class="ux-fee-choice primary" data-fee-mode="receive">${label('Fee received', 'फी भरली')}</button>
                <button type="button" class="ux-fee-choice" data-fee-mode="view">${label('View fee', 'फी पहा')}</button>
            </section>`;
            overlay.querySelector('.ux-fee-close').addEventListener('click', close);
            overlay.querySelectorAll('[data-fee-mode]').forEach((button) => button.addEventListener('click', () => showPicker(button.dataset.feeMode)));
        };
        document.body.appendChild(overlay);
        showChoices();
    }

    function wireActions() {
        get('ux-action-add-student')?.addEventListener('click', () => {
            if (!allowed('panel-students')) { denied(); return; }
            if (typeof switchPanel === 'function') switchPanel('panel-students');
            get('btn-add-student')?.click();
        });
        get('ux-action-attendance')?.addEventListener('click', () => {
            if (!allowed('panel-daily-task')) { denied(); return; }
            if (typeof window.openAttendanceModal === 'function') {
                window.openAttendanceModal();
            } else {
                const btnMark = get('btn-mark-attendance');
                if (btnMark) btnMark.click();
            }
        });
        get('ux-action-fee')?.addEventListener('click', () => {
            openFeeFlow();
        });
        [['menu-fees', 'panel-fees', 'fee'], ['menu-exam', 'panel-exam', 'exam'], ['menu-reports', 'panel-reports', 'report']].forEach(([id, target, kind]) => {
            get(id)?.addEventListener('click', (event) => {
                event.preventDefault();
                if (!allowed(target) || !allowed('panel-students')) { denied(); return; }
                if (kind === 'exam' && typeof window.vssOpenMarks === 'function') { window.vssOpenMarks('entry'); return; }
                if (kind === 'fee') { openFeeFlow(); return; }
                showDirectoryGuide(kind);
            });
        });
        get('menu-settings')?.addEventListener('click', () => {
            if (typeof loadAdminProfileData === 'function') loadAdminProfileData();
        });
        get('ux-reset-filters')?.addEventListener('click', resetDirectory);
        get('ux-empty-action')?.addEventListener('click', () => {
            const total = typeof getActiveStudents === 'function' ? getActiveStudents().length : 0;
            if (total) resetDirectory();
            else get('btn-add-student')?.click();
        });
    }

    function boot() {
        const nav = document.querySelector('.sidebar-menu');
        if (!nav) return;
        wireActions();
        regroupMenu();
        installAccessGuard();
        document.getElementById('login-form')?.addEventListener('submit', () => setTimeout(refreshPermissions, 200));
        get('btn-logout')?.addEventListener('click', () => setTimeout(refreshPermissions, 0));
        if (typeof window.vssLoginAs === 'function' && !window.vssLoginAs.__uxRefresh) {
            const login = window.vssLoginAs;
            const wrapped = function () { const result = login.apply(this, arguments); refreshPermissions(); return result; };
            wrapped.__uxRefresh = true;
            window.vssLoginAs = wrapped;
        }
        navObserver = new MutationObserver(() => {
            if (refreshQueued) return;
            refreshQueued = true;
            setTimeout(() => { refreshQueued = false; regroupMenu(); }, 40);
        });
        navObserver.observe(nav, { childList: true });
        const rows = get('students-table-body');
        if (rows) new MutationObserver(updateDirectory).observe(rows, { childList: true });
        ['search-student', 'filter-class', 'filter-section'].forEach((id) => {
            const el = get(id);
            el?.addEventListener('input', updateDirectory);
            el?.addEventListener('change', updateDirectory);
        });
        document.querySelectorAll('#lang-en, #lang-mr, .lang-en-btn, .lang-mr-btn').forEach((button) => {
            button.addEventListener('click', () => setTimeout(relabel, 0));
        });
        relabel();
    }

    window.vssUxRefresh = relabel;
    window.vssUxCanOpen = canOpen;
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 1600));
    else setTimeout(boot, 1600);
})();
