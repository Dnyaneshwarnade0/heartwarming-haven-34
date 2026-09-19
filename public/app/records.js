/* =========================================================
   RECORDS + PHOTOS LAYER (loads after exam.js)
   - Auto-attach student photos (CDN) by fuzzy Marathi name match
   - Manual photo change / remove from the profile avatar
   - Edit + delete buttons on fee ledger rows and complaint logs
   ========================================================= */
(function () {
    'use strict';

    const EN = () => (typeof currentLanguage !== 'undefined' ? currentLanguage : 'mr') === 'en';
    const esc = (s) => (typeof escapeHTML === 'function' ? escapeHTML(String(s ?? '')) : String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])));
    const students = () => (typeof studentsDatabase !== 'undefined' && Array.isArray(studentsDatabase)) ? studentsDatabase : [];
    const nameOf = (s) => (typeof getStudentName === 'function' ? getStudentName(s) : (typeof s.name === 'object' ? (s.name.mr || s.name.en) : s.name));
    const toast = (m, t) => (typeof createToast === 'function' ? createToast(m, t || 'success') : console.log(m));
    const save = () => { try { if (typeof saveDatabase === 'function') saveDatabase(); else localStorage.setItem('vss_students', JSON.stringify(students())); } catch (_) { } };
    const ask = (msg, ok) => { if (typeof window.vssConfirm === 'function') window.vssConfirm(msg, ok); else if (confirm(msg)) ok(); };

    /* ---------------- 1. photo matching ---------------- */
    const norm = (s) => String(s || '')
        .replace(/महाराज/g, ' ')
        .replace(/[ंँ़्]/g, '')
        .replace(/ी/g, 'ि').replace(/ू/g, 'ु').replace(/ौ/g, 'ो').replace(/ै/g, 'े')
        .replace(/ऱ/g, 'र').replace(/ळ/g, 'ल').replace(/[शष]/g, 'स').replace(/ण/g, 'न').replace(/ब/g, 'व')
        .replace(/\s+/g, ' ').trim();

    function ratio(a, b) {
        a = norm(a); b = norm(b);
        if (!a || !b) return 0;
        if (a === b) return 1;
        const bg = (x) => { const o = new Map(); for (let i = 0; i < x.length - 1; i++) { const g = x.slice(i, i + 2); o.set(g, (o.get(g) || 0) + 1); } return o; };
        const A = bg(a), B = bg(b);
        let inter = 0, tot = 0;
        A.forEach((v, k) => { inter += Math.min(v, B.get(k) || 0); tot += v; });
        B.forEach((v) => { tot += v; });
        return tot ? (2 * inter) / tot : 0;
    }

    async function attachPhotos() {
        let list;
        try {
            const r = await fetch('photos.json', { cache: 'force-cache' });
            list = await r.json();
        } catch (_) { return; }
        if (!Array.isArray(list) || !list.length) return;
        window.vssPhotoBank = list;

        // drop stale CDN photos that are no longer in the photo bank
        const valid = new Set(list.map((p) => p.url));
        let cleaned = 0;
        students().forEach((s) => {
            if (s.photo && /^\/__l5e\//.test(s.photo) && !valid.has(s.photo)) { delete s.photo; cleaned++; }
        });
        if (cleaned) save();

        const pool = students().filter((s) => !s.photo);
        if (!pool.length) return;
        const taken = new Set(students().map((s) => s.photo).filter(Boolean));
        let changed = 0;

        list.forEach((p) => {
            if (taken.has(p.url)) return;
            let best = null, bs = 0;
            pool.forEach((s) => {
                if (s.photo) return;
                const pa = String(p.name).split(/\s+/), sa = String(nameOf(s)).split(/\s+/);
                if (ratio(pa[0], sa[0]) < 0.6) return;
                if (ratio(pa[pa.length - 1], sa[sa.length - 1]) < 0.6) return;
                const sc = ratio(p.name, nameOf(s));
                if (sc > bs) { bs = sc; best = s; }
            });
            if (best && bs >= 0.7) { best.photo = p.url; taken.add(p.url); changed++; }
        });

        if (changed) {
            save();
            if (typeof renderStudentTable === 'function') renderStudentTable();
            toast(EN() ? `${changed} student photos added` : `${changed} विद्यार्थ्यांचे फोटो जोडले`);
        }
    }

    /* ---------------- 2. profile avatar: change / remove ---------------- */
    function photoControls() {
        const av = document.getElementById('prof-avatar');
        if (!av || !window.selectedStudent) return;
        const holder = av.parentElement;
        if (!holder) return;
        let bar = document.getElementById('vss-photo-bar');
        if (!bar) {
            bar = document.createElement('div');
            bar.id = 'vss-photo-bar';
            bar.className = 'vss-photo-bar';
            holder.insertBefore(bar, av.nextSibling);
        }
        const en = EN();
        bar.innerHTML = `
            <button type="button" class="vss-mini-btn" id="vss-photo-set"><i class="fa-solid fa-camera"></i> ${selectedStudent.photo ? (en ? 'Change photo' : 'फोटो बदला') : (en ? 'Add photo' : 'फोटो जोडा')}</button>
            ${selectedStudent.photo ? `<button type="button" class="vss-mini-btn danger" id="vss-photo-del"><i class="fa-solid fa-trash"></i> ${en ? 'Remove' : 'काढा'}</button>` : ''}`;

        const setBtn = document.getElementById('vss-photo-set');
        if (setBtn) setBtn.onclick = () => {
            const inp = document.createElement('input');
            inp.type = 'file'; inp.accept = 'image/*';
            inp.onchange = () => {
                const f = inp.files && inp.files[0];
                if (!f) return;
                const fr = new FileReader();
                fr.onload = () => {
                    const img = new Image();
                    img.onload = () => {
                        const max = 400, sc = Math.min(1, max / Math.max(img.width, img.height));
                        const c = document.createElement('canvas');
                        c.width = Math.round(img.width * sc); c.height = Math.round(img.height * sc);
                        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
                        selectedStudent.photo = c.toDataURL('image/jpeg', 0.75);
                        save();
                        if (typeof renderStudentProfile === 'function') renderStudentProfile();
                        else av.innerHTML = `<img src="${selectedStudent.photo}" alt="">`;
                        setTimeout(photoControls, 60);
                        toast(EN() ? 'Photo updated' : 'फोटो अद्ययावत झाला');
                    };
                    img.src = fr.result;
                };
                fr.readAsDataURL(f);
            };
            inp.click();
        };
        const del = document.getElementById('vss-photo-del');
        if (del) del.onclick = () => ask(EN() ? 'Remove this photo?' : 'हा फोटो काढायचा का?', () => {
            delete selectedStudent.photo;
            save();
            av.innerHTML = '<i class="fa-regular fa-user"></i>';
            setTimeout(photoControls, 60);
        });
    }

    /* ---------------- 3. fee ledger: edit + delete ---------------- */
    window.vssDeletePayment = function (idx) {
        if (!window.selectedStudent) return;
        const l = selectedStudent.fees.ledger[idx];
        if (!l) return;
        ask(EN() ? `Delete payment of ₹${l.amount}?` : `₹${l.amount} चे पेमेंट हटवायचे का?`, () => {
            selectedStudent.fees.ledger.splice(idx, 1);
            selectedStudent.fees.paid = Math.max(0, Number(selectedStudent.fees.paid || 0) - Number(l.amount || 0));
            save();
            if (typeof resolveProfileData === 'function') resolveProfileData();
            if (typeof renderFeesTab === 'function') renderFeesTab();
            if (typeof renderDashboardMetrics === 'function') renderDashboardMetrics();
            toast(EN() ? 'Payment deleted' : 'पेमेंट हटवले', 'danger');
        });
    };

    function patchFees() {
        if (typeof window.renderFeesTab !== 'function' || window.renderFeesTab.__vss) return;
        const orig = window.renderFeesTab;
        const wrapped = function () {
            orig.apply(this, arguments);
            const tbody = document.getElementById('payment-ledger-body');
            if (!tbody) return;
            [...tbody.querySelectorAll('tr')].forEach((tr, idx) => {
                const cell = tr.lastElementChild;
                if (!cell || cell.querySelector('[data-vss-del]')) return;
                if (tr.querySelector('.text-muted') && !tr.querySelector('code')) return;
                const b = document.createElement('button');
                b.className = 'btn-table-action delete';
                b.style.marginLeft = '6px';
                b.setAttribute('data-vss-del', '1');
                b.title = EN() ? 'Delete' : 'हटवा';
                b.innerHTML = '<i class="fa-solid fa-trash"></i>';
                b.onclick = () => window.vssDeletePayment(idx);
                cell.appendChild(b);
            });
        };
        wrapped.__vss = 1;
        window.renderFeesTab = wrapped;
    }

    /* ---------------- 4. complaints: edit + delete ---------------- */
    window.vssEditComplaint = function (idx) {
        if (!window.selectedStudent) return;
        const c = selectedStudent.complaints[idx];
        if (!c) return;
        const en = EN();
        const d = prompt(en ? 'Date (YYYY-MM-DD):' : 'दिनांक (YYYY-MM-DD):', c.date || '');
        if (d === null) return;
        const a = prompt(en ? 'Details / action taken:' : 'तपशील / केलेली कारवाई:', c.action || '');
        if (a === null) return;
        c.date = d.trim(); c.action = a.trim();
        save();
        if (typeof resolveProfileData === 'function') resolveProfileData();
        if (typeof renderIncidentLogs === 'function') renderIncidentLogs();
        toast(en ? 'Updated' : 'अद्ययावत झाले');
    };
    window.vssDeleteComplaint = function (idx) {
        if (!window.selectedStudent) return;
        ask(EN() ? 'Delete this record?' : 'ही नोंद हटवायची का?', () => {
            selectedStudent.complaints.splice(idx, 1);
            save();
            if (typeof resolveProfileData === 'function') resolveProfileData();
            if (typeof renderIncidentLogs === 'function') renderIncidentLogs();
            if (typeof renderDashboardMetrics === 'function') renderDashboardMetrics();
            toast(EN() ? 'Deleted' : 'नोंद हटवली', 'danger');
        });
    };

    function patchIncidents() {
        if (typeof window.renderIncidentLogs !== 'function' || window.renderIncidentLogs.__vss) return;
        const orig = window.renderIncidentLogs;
        const wrapped = function () {
            orig.apply(this, arguments);
            const list = document.getElementById('prof-complaints-list');
            const items = list ? [...list.children] : [];
            items.forEach((el, idx) => {
                if (!el.classList.contains('timeline-item') || el.querySelector('.vss-row-acts')) return;
                const bar = document.createElement('div');
                bar.className = 'vss-row-acts';
                bar.innerHTML = `
                    <button type="button" class="vss-mini-btn" title="${EN() ? 'Edit' : 'संपादित करा'}"><i class="fa-solid fa-pen"></i></button>
                    <button type="button" class="vss-mini-btn danger" title="${EN() ? 'Delete' : 'हटवा'}"><i class="fa-solid fa-trash"></i></button>`;
                bar.children[0].onclick = () => window.vssEditComplaint(idx);
                bar.children[1].onclick = () => window.vssDeleteComplaint(idx);
                el.appendChild(bar);
            });
        };
        wrapped.__vss = 1;
        window.renderIncidentLogs = wrapped;
    }

    /* ---------------- boot ---------------- */
    function boot() {
        try {
            patchFees();
            patchIncidents();
            attachPhotos();
            document.addEventListener('click', () => setTimeout(photoControls, 350), true);
            setTimeout(photoControls, 800);
        } catch (e) { console.error('records boot', e); }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 500));
    else setTimeout(boot, 500);
})();
