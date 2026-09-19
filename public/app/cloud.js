/* =========================================================
   CLOUD STORE — सर्व डेटा आता database मध्ये जतन होतो
   (ब्राउझर फक्त कॅशे म्हणून वापरला जातो)
   ========================================================= */
(function () {
    'use strict';

    /* Backend API — always relative on web to avoid CORS/redirects */
    var API = (function () {
        if (typeof window !== 'undefined' && window.location) {
            var proto = window.location.protocol;
            if (proto === 'http:' || proto === 'https:') {
                return '/api/public/app/state';
            }
        }
        return 'https://admin.shantibrahmagurukulam.com/api/public/app/state';
    })();

    var CKEY = 'vss_tg_code';
    var DEFAULT_CODE = '444A1C6D';
    /* जे डेटा क्लाऊडवर ठेवायचे */
    var KEYS = [
        'vss_students', 'vss_exams', 'vss_adarsh_week', 'vss_cleared_alerts',
        'vss_data_version', 'vss_admin_profile', 'vss_lang', 'vss_tg_auto_absent', 'vss_users',
        'vss_default_subjects', 'vss_holidays'
    ];
    var SCRIPTS = [
        'index.js?v=18', 'enhance.js?v=19', 'ai-chat.js?v=31', 'ai-actions.js?v=3', 'security.js?v=1',
        'telegram.js?v=6', 'records.js?v=1', 'manage.js?v=3',
        'manage2.js?v=1', 'manage3.js?v=1', 'pwa.js?v=1',
        'state-seed.js?v=1', 'students-data.js?v=1', 'students-seed.js?v=2',
        'weekly-marks-data.js?v=1', 'weekly-marks.js?v=2'
    ];


    var code = function () {
        return String(localStorage.getItem(CKEY) || DEFAULT_CODE).trim().toUpperCase();
    };

    var remoteStamp = null;   // शेवटचा server updated_at
    var saveTimer = null;
    var saving = false;
    var booted = false;

    function collect() {
        var out = {};
        KEYS.forEach(function (k) {
            var v = localStorage.getItem(k);
            if (v !== null) out[k] = v;
        });
        return out;
    }

    var LIST_KEYS = ['vss_students', 'vss_exams'];
    function listLen(v) {
        try { var a = JSON.parse(v || 'null'); return Array.isArray(a) ? a.length : -1; } catch (_) { return -1; }
    }

    var needPush = false;

    function apply(data) {
        var changed = false;
        KEYS.forEach(function (k) {
            if (!Object.prototype.hasOwnProperty.call(data, k)) return;
            if (localStorage.getItem(k) === data[k]) return;
            /* रिकाम्या क्लाऊड यादीने स्थानिक डेटा कधीही पुसू नये */
            if (LIST_KEYS.indexOf(k) >= 0) {
                var remote = listLen(data[k]);
                var local = listLen(localStorage.getItem(k));
                if (remote === 0 && local > 0) { needPush = true; return; }
            }
            rawSet.call(localStorage, k, data[k]);
            changed = true;
        });
        /* क्लाऊडवर विद्यार्थी असतील तर ॲपचे "पहिल्यांदा seed/reset" थांबवा व मेमरीत लोड करा */
        if (listLen(data['vss_students']) > 0) {
            rawSet.call(localStorage, 'vss_directory_reset_v3', '1');
            try {
                if (typeof window.vssReloadFromStorage === 'function') {
                    window.vssReloadFromStorage();
                } else {
                    var parsedList = JSON.parse(data['vss_students']);
                    if (typeof studentsDatabase !== 'undefined') studentsDatabase = parsedList;
                    if (typeof window.studentsDatabase !== 'undefined') window.studentsDatabase = parsedList;
                    if (typeof renderStudentTable === 'function') renderStudentTable();
                    if (typeof renderDashboardMetrics === 'function') renderDashboardMetrics();
                }
            } catch (_) { }
        }
        return changed;
    }



    function post(payload) {
        return fetch(API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).then(function (r) { return r.json().catch(function () { return {}; }); })
            .catch(function () { return {}; });
    }

    function status(msg) {
        if (!msg || msg.indexOf('जतन') >= 0 || msg.indexOf('त्रुटी') >= 0 || msg.indexOf('पुन्हा') >= 0) {
            return;
        }
        var el = document.getElementById('vss-cloud-status');
        if (!el) {
            el = document.createElement('div');
            el.id = 'vss-cloud-status';
            el.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:99999;background:#1B3A6B;color:#fff;' +
                'padding:6px 12px;border-radius:20px;font-size:.78rem;box-shadow:0 4px 14px rgba(27,58,107,.25);' +
                'opacity:0;transition:opacity .25s;pointer-events:none';
            document.body.appendChild(el);
        }
        el.textContent = msg;
        el.style.opacity = '1';
        clearTimeout(el._t);
        el._t = setTimeout(function () { el.style.opacity = '0'; }, 2200);
    }

    /* ---------- जतन (debounced, silent background) ---------- */
    function save() {
        saveTimer = null;
        if (saving) return;
        saving = true;

        post({ code: code(), action: 'save', data: collect() }).then(function (out) {
            saving = false;
            if (out && out.ok) {
                remoteStamp = out.updated_at || remoteStamp;
                // शांततेत जतन झाले (विना अडथळा)
            } else {
                console.warn('Cloud state save skipped or unconfirmed:', out);
            }
        }).catch(function (err) {
            saving = false;
            console.warn('Cloud state save error:', err);
        });
    }

    function schedule() {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(save, 1200);
    }

    /* ---------- localStorage वर लक्ष (Storage.prototype वर patch) ---------- */
    var rawSet = Storage.prototype.setItem;
    var rawRemove = Storage.prototype.removeItem;
    Storage.prototype.setItem = function (k, v) {
        rawSet.call(this, k, v);
        if (booted && this === window.localStorage && KEYS.indexOf(String(k)) >= 0) schedule();
    };
    Storage.prototype.removeItem = function (k) {
        rawRemove.call(this, k);
        if (booted && this === window.localStorage && KEYS.indexOf(String(k)) >= 0) schedule();
    };

    /* ---------- क्लाऊडवरील बदल (उदा. Telegram) ---------- */
    function refresh() {
        if (saving || saveTimer) return Promise.resolve();
        return post({ code: code(), action: 'load' }).then(function (out) {
            if (!out || !out.ok || !out.data) return;
            if (out.updated_at && out.updated_at === remoteStamp) return;
            remoteStamp = out.updated_at || remoteStamp;
            if (!apply(out.data)) return;
            status('📥 नवीन अपडेट आले — पान रिफ्रेश होत आहे');
            setTimeout(function () { location.reload(); }, 900);
        });
    }


    /* ---------- सुरुवात: आधी क्लाऊडवरून डेटा, मग ॲप सुरू ---------- */
    function loadScripts() {
        /* स्क्रिप्ट उशिरा लोड होत असल्याने DOMContentLoaded आधीच झालेला असतो —
           म्हणून तो listener लगेच चालवा. */
        var rawAdd = document.addEventListener.bind(document);
        document.addEventListener = function (type, fn, opts) {
            if (type === 'DOMContentLoaded' && document.readyState !== 'loading') {
                setTimeout(function () { try { fn.call(document, new Event('DOMContentLoaded')); } catch (e) { console.error(e); } }, 0);
                return;
            }
            return rawAdd(type, fn, opts);
        };
        var i = 0;
        (function next() {
            if (i >= SCRIPTS.length) {
                booted = true;
                try {
                    if (typeof window.vssReloadFromStorage === 'function') {
                        window.vssReloadFromStorage();
                    } else {
                        var raw = localStorage.getItem('vss_students');
                        if (raw) {
                            var list = JSON.parse(raw);
                            if (Array.isArray(list) && list.length > 0) {
                                if (typeof studentsDatabase !== 'undefined') studentsDatabase = list;
                                if (typeof window.studentsDatabase !== 'undefined') window.studentsDatabase = list;
                                if (typeof renderStudentTable === 'function') renderStudentTable();
                                if (typeof renderDashboardMetrics === 'function') renderDashboardMetrics();
                            }
                        }
                    }
                } catch (_) { }
                setInterval(refresh, 15000);
                return;
            }
            var s = document.createElement('script');
            s.src = SCRIPTS[i++];
            s.onload = next;
            s.onerror = next;
            document.body.appendChild(s);
        })();
    }


    post({ code: code(), action: 'load' })
        .then(function (out) {
            if (out && out.ok && out.data && Object.keys(out.data).length) {
                remoteStamp = out.updated_at || null;
                apply(out.data);
                if (needPush) setTimeout(function () { save(); }, 3000);
            } else {
                /* पहिल्यांदा — सध्याचा ब्राउझर डेटा क्लाऊडवर पाठवा */
                return post({ code: code(), action: 'save', data: collect() }).then(function (o) {
                    if (o && o.ok) remoteStamp = o.updated_at || null;
                });
            }
        })
        .catch(function () { })
        .then(loadScripts, loadScripts);

    window.vssCloud = { save: save, refresh: refresh };
})();
