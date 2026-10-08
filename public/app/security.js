/* =========================================================
   SECURITY MODULE (loads after enhance.js)
   1. Admin can change their own password (per-user, saved locally)
   2. Real fingerprint / device-unlock login (WebAuthn passkey)
   3. Password eye-button alignment fix on the login screen
   ========================================================= */
(function () {
    'use strict';

    const EN = () => (typeof currentLanguage !== 'undefined' ? currentLanguage : 'mr') === 'en';
    const toast = (m, t) => (typeof createToast === 'function' ? createToast(m, t || 'success') : console.log(m));
    const user = () => (typeof currentUser !== 'undefined' && currentUser && currentUser.username) ? currentUser.username : '';

    const defaults = () => window.VSS_ACCOUNTS || {
        ankush: { password: 'Ankush@1232', name: 'Ankush Maharaj Kadam' },
        swapnil: { password: 'Swapnil@1232', name: 'Swapnil Vaidya' }
    };
    const passOf = (u) => localStorage.getItem('vss_pwd_' + u) || ((defaults()[u] || {}).password || '');

    /* ---------- 1. Change password ---------- */
    function installPasswordChange() {
        const form = document.getElementById('form-admin-password');
        if (!form || form.dataset.vssPw) return;
        form.dataset.vssPw = '1';
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            const en = EN();
            const u = user();
            const oldP = document.getElementById('admin-old-pass').value;
            const newP = document.getElementById('admin-new-pass').value;
            const conP = document.getElementById('admin-confirm-pass').value;

            if (!u) { toast(en ? 'Please log in again.' : 'कृपया पुन्हा लॉगिन करा.', 'danger'); return; }
            if (oldP !== passOf(u)) {
                toast(en ? 'Current password is wrong!' : 'सध्याचा पासवर्ड चुकीचा आहे!', 'danger');
                return;
            }
            if (newP.length < 4) {
                toast(en ? 'New password must be at least 4 characters.' : 'नवीन पासवर्ड किमान ४ अक्षरांचा हवा.', 'warning');
                return;
            }
            if (newP !== conP) {
                toast(en ? 'New passwords do not match!' : 'नवीन पासवर्ड जुळत नाहीत!', 'danger');
                return;
            }
            localStorage.setItem('vss_pwd_' + u, newP);
            form.reset();
            toast(en ? 'Password changed. Use it from next login.' : 'पासवर्ड बदलला. पुढच्या लॉगिनपासून हाच वापरा.', 'success');
        }, true);
    }

    /* ---------- 2. Fingerprint (WebAuthn) ---------- */
    const b64 = {
        enc: (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''),
        dec: (s) => {
            const p = s.replace(/-/g, '+').replace(/_/g, '/');
            const bin = atob(p + '==='.slice((p.length + 3) % 4));
            const u8 = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
            return u8;
        }
    };
    const fpKey = (u) => 'vss_fp_' + u;
    const fpGet = (u) => { try { return JSON.parse(localStorage.getItem(fpKey(u)) || 'null'); } catch (_) { return null; } };
    const anyFp = () => Object.keys(localStorage).filter((k) => k.indexOf('vss_fp_') === 0)
        .map((k) => { try { return JSON.parse(localStorage.getItem(k)); } catch (_) { return null; } })
        .filter(Boolean);

    const inFrame = () => { try { return window.self !== window.top; } catch (_) { return true; } };

    async function supported() {
        if (!window.PublicKeyCredential || !navigator.credentials || !navigator.credentials.create) return false;
        try {
            const ok = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
            return ok !== false; // undefined/true => try anyway
        } catch (_) { return true; }
    }

    function openInNewTab() {
        try { window.open(window.location.href, '_blank', 'noopener'); } catch (_) { }
    }

    async function registerFingerprint() {
        const en = EN();
        const u = user();
        if (!u) return;
        if (inFrame()) {
            toast(en
                ? 'Fingerprint cannot run inside the preview frame. Opening the app in a new tab — try again there.'
                : 'प्रिव्ह्यू फ्रेममध्ये फिंगरप्रिंट चालत नाही. ॲप नवीन टॅबमध्ये उघडत आहे — तिथे पुन्हा प्रयत्न करा.', 'info');
            openInNewTab();
            return;
        }
        if (!(await supported())) {
            toast(en ? 'This device/browser has no fingerprint unlock.' : 'या डिव्हाइस/ब्राउझरवर फिंगरप्रिंट उपलब्ध नाही.', 'warning');
            return;
        }
        try {
            const cred = await navigator.credentials.create({
                publicKey: {
                    challenge: crypto.getRandomValues(new Uint8Array(32)),
                    rp: { name: 'Shantibrahma Gurukulam' },
                    user: { id: new TextEncoder().encode(u), name: u, displayName: (typeof currentUser !== 'undefined' && currentUser && currentUser.name) || u },
                    pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
                    authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'preferred' },
                    timeout: 60000,
                    attestation: 'none'
                }
            });
            if (!cred) throw new Error('no credential');
            localStorage.setItem(fpKey(u), JSON.stringify({ user: u, id: b64.enc(cred.rawId), at: Date.now() }));
            paintSettings();
            paintLoginButton();
            toast(en ? 'Fingerprint added! You can now log in with it.' : 'फिंगरप्रिंट जोडला! आता त्याने लॉगिन करू शकता.', 'success');
        } catch (err) {
            const name = (err && err.name) || '';
            const msg = name === 'NotAllowedError'
                ? (en ? 'Cancelled or blocked. Open the app in its own tab (not preview) and allow the unlock prompt.' : 'रद्द झाले किंवा अडवले गेले. ॲप स्वतंत्र टॅबमध्ये उघडा (प्रिव्ह्यू नको) आणि अनलॉक प्रॉम्प्टला परवानगी द्या.')
                : name === 'NotSupportedError' || name === 'SecurityError'
                    ? (en ? 'This device/browser does not allow fingerprint here (needs HTTPS + own tab).' : 'इथे फिंगरप्रिंट चालत नाही (HTTPS + स्वतंत्र टॅब आवश्यक).')
                    : (en ? 'Fingerprint setup failed: ' : 'फिंगरप्रिंट नोंदणी अयशस्वी: ') + (name || 'error');
            toast(msg, 'warning');
        }
    }


    async function loginWithFingerprint() {
        const en = EN();
        const list = anyFp();
        if (!list.length) return;
        if (inFrame()) {
            toast(en
                ? 'Fingerprint cannot run inside the preview frame. Opening in a new tab — try there.'
                : 'प्रिव्ह्यू फ्रेममध्ये फिंगरप्रिंट चालत नाही. नवीन टॅबमध्ये उघडत आहे — तिथे प्रयत्न करा.', 'info');
            openInNewTab();
            return;
        }
        try {
            const assertion = await navigator.credentials.get({
                publicKey: {
                    challenge: crypto.getRandomValues(new Uint8Array(32)),
                    allowCredentials: list.map((f) => ({ type: 'public-key', id: b64.dec(f.id) })),
                    userVerification: 'required',
                    timeout: 60000
                }
            });
            if (!assertion) throw new Error('cancelled');
            const id = b64.enc(assertion.rawId);
            const match = list.find((f) => f.id === id) || list[0];
            if (typeof window.vssLoginAs === 'function') window.vssLoginAs(match.user, true);
        } catch (err) {
            toast(en ? 'Fingerprint login failed.' : 'फिंगरप्रिंटने लॉगिन झाले नाही.', 'danger');
        }
    }

    /* settings card */
    function paintSettings() {
        const en = EN();
        const badge = document.getElementById('fingerprint-status-badge');
        const btn = document.getElementById('btn-setup-fingerprint');
        if (!btn) return;
        const has = !!fpGet(user());
        if (badge) {
            badge.textContent = has ? (en ? 'Active' : 'सुरू आहे') : (en ? 'Not configured' : 'नोंद नाही');
            badge.classList.toggle('red', !has);
            badge.classList.toggle('green', has);
            badge.removeAttribute('data-key');
        }
        btn.innerHTML = has
            ? `<i class="fa-solid fa-trash"></i> ${en ? 'Remove fingerprint' : 'फिंगरप्रिंट काढा'}`
            : `<i class="fa-solid fa-fingerprint"></i> ${en ? 'Add fingerprint' : 'फिंगरप्रिंट जोडा'}`;
        btn.removeAttribute('data-key');

        if (!btn.dataset.vssFp) {
            btn.dataset.vssFp = '1';
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopImmediatePropagation();
                if (fpGet(user())) {
                    localStorage.removeItem(fpKey(user()));
                    paintSettings();
                    paintLoginButton();
                    toast(EN() ? 'Fingerprint removed.' : 'फिंगरप्रिंट काढला.', 'info');
                } else {
                    registerFingerprint();
                }
            }, true);
        }

        let help = document.getElementById('vss-fp-help');
        if (!help) {
            help = document.createElement('p');
            help.id = 'vss-fp-help';
            help.className = 'vss-fp-help';
            btn.parentElement.appendChild(help);
        }
        help.textContent = en
            ? 'Uses your phone/laptop unlock (fingerprint or face). Works on this device only.'
            : 'तुमच्या मोबाईल/लॅपटॉपचे अनलॉक (फिंगरप्रिंट किंवा चेहरा) वापरले जाते. फक्त याच डिव्हाइसवर चालेल.';
    }

    /* login screen button */
    function paintLoginButton() {
        const form = document.getElementById('login-form');
        if (!form) return;
        const en = EN();
        let btn = document.getElementById('vss-fp-login');
        const has = anyFp().length > 0;
        if (!has) { if (btn) btn.remove(); return; }
        if (!btn) {
            btn = document.createElement('button');
            btn.type = 'button';
            btn.id = 'vss-fp-login';
            btn.className = 'btn-secondary vss-fp-login';
            btn.addEventListener('click', loginWithFingerprint);
            form.appendChild(btn);
        }
        btn.innerHTML = `<i class="fa-solid fa-fingerprint"></i> ${en ? 'Login with fingerprint' : 'फिंगरप्रिंटने लॉगिन करा'}`;
    }

    /* ---------- 3. eye button alignment on login ---------- */
    function fixEye() {
        const trig = document.getElementById('login-biometrics-triggers');
        if (trig) {
            trig.style.right = '46px';
            trig.style.pointerEvents = 'none';
        }
        const pw = document.getElementById('password');
        if (pw) pw.style.paddingRight = '76px';
    }

    function boot() {
        try {
            fixEye();
            installPasswordChange();
            paintSettings();
            paintLoginButton();
        } catch (err) { console.error('security boot', err); }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 400));
    else setTimeout(boot, 400);
    setInterval(() => { installPasswordChange(); paintSettings(); paintLoginButton(); }, 2000);
})();
