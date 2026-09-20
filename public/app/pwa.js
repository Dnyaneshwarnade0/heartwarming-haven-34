/* =========================================================
   PWA Handler — Service Worker registration & Install Banner
   ========================================================= */
(function () {
  'use strict';

  // 1. Standalone display mode detection
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://');

  if (isStandalone) {
    document.documentElement.classList.add('is-pwa');
    document.body?.classList.add('is-pwa');
  }

  // 2. Register Service Worker
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    window.addEventListener('load', () => {
      const swPath = location.pathname.startsWith('/app') ? './sw.js' : '/sw.js';
      const swScope = location.pathname.startsWith('/app') ? './' : '/';
      navigator.serviceWorker.register(swPath, { scope: swScope })
        .then((reg) => {
          // Immediately check for updates
          try { reg.update(); } catch (_) { }
          // Check for SW updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('PWA: नवीन व्हर्जन उपलब्ध आहे.');
                }
              });
            }
          });
        })
        .catch((err) => {
          console.warn('PWA SW registration failed:', err);
        });
    });
  }

  // 3. Install Prompt Handling
  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallPrompt();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    hideInstallPrompt();
    console.log('PWA यशस्वीरित्या इन्स्टॉल झाले.');
  });

  function showInstallPrompt() {
    if (isStandalone || document.getElementById('pwa-install-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.className = 'pwa-install-banner animate-slide-up';
    banner.innerHTML = `
      <div class="pwa-banner-icon">
        <img src="favicon.png" alt="App Icon" />
      </div>
      <div class="pwa-banner-text">
        <b id="pwa-banner-title">शांतिब्रह्म गुरुकुलम्</b>
        <span id="pwa-banner-sub">मोबाईल ॲपप्रमाणे वापरा</span>
      </div>
      <div class="pwa-banner-actions">
        <button type="button" id="pwa-btn-install" class="pwa-install-btn">
          <i class="fa-solid fa-download"></i> <span id="pwa-btn-text">इन्स्टॉल करा</span>
        </button>
        <button type="button" id="pwa-btn-dismiss" class="pwa-dismiss-btn" title="बंद करा">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `;

    document.body.appendChild(banner);

    // Sync labels with language
    const isMr = (typeof currentLanguage !== 'undefined' ? currentLanguage : 'mr') !== 'en';
    if (!isMr) {
      const sub = banner.querySelector('#pwa-banner-sub');
      const btn = banner.querySelector('#pwa-btn-text');
      if (sub) sub.textContent = 'Install as Mobile App';
      if (btn) btn.textContent = 'Install';
    }

    banner.querySelector('#pwa-btn-install')?.addEventListener('click', () => {
      openInstallOptionsModal();
    });

    banner.querySelector('#pwa-btn-dismiss')?.addEventListener('click', () => {
      hideInstallPrompt();
      sessionStorage.setItem('vss_pwa_dismissed', '1');
    });

    // Don't re-prompt in same session if dismissed
    if (sessionStorage.getItem('vss_pwa_dismissed') === '1') {
      banner.style.display = 'none';
    }
  }

  function hideInstallPrompt() {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
      banner.classList.add('fade-out');
      setTimeout(() => banner.remove(), 300);
    }
  }

  function openInstallOptionsModal() {
    let modal = document.getElementById('pwa-install-options-modal');
    if (modal) modal.remove();

    const isIos = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase()) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    modal = document.createElement('div');
    modal.id = 'pwa-install-options-modal';
    modal.className = 'ios-pwa-overlay';
    modal.innerHTML = `
      <div class="ios-pwa-modal animate-scale-in">
        <div class="ios-modal-header">
          <img src="favicon.png" alt="शांतिब्रह्म गुरुकुलम्" />
          <div class="ios-modal-title">
            <b>शांतिब्रह्म गुरुकुलम्</b>
            <span>ॲप इन्स्टॉल करण्यासाठी पर्याय निवडा:</span>
          </div>
          <button type="button" class="ios-modal-close" id="pwa-modal-close-btn" title="बंद करा">&times;</button>
        </div>

        <div class="pwa-options-container" style="display: flex; flex-direction: column; gap: 12px; margin: 16px 0 12px;">
          <!-- 1. Add to Home Screen -->
          <button type="button" id="opt-add-home-screen" class="pwa-option-card">
            <div class="pwa-opt-icon"><i class="fa-solid fa-house-chimney"></i></div>
            <div class="pwa-opt-body">
              <div class="pwa-opt-title">1. Add to Home Screen (होम स्क्रीनवर जोडा)</div>
              <div class="pwa-opt-desc">मोबाईलच्या मुख्य स्क्रीनवर थेट ॲप आयकॉन जोडा.</div>
            </div>
            <i class="fa-solid fa-chevron-right pwa-opt-arrow"></i>
          </button>

          <!-- 2. Android -->
          <button type="button" id="opt-android-install" class="pwa-option-card">
            <div class="pwa-opt-icon" style="background: #E8F5E9; color: #2E7D32;"><i class="fa-brands fa-android"></i></div>
            <div class="pwa-opt-body">
              <div class="pwa-opt-title">2. Android (अँड्रॉइड थेट इन्स्टॉल)</div>
              <div class="pwa-opt-desc">अँड्रॉइड फोनवर जलद व स्वतंत्र PWA ॲप्लिकेशन इन्स्टॉल करा.</div>
            </div>
            <i class="fa-solid fa-chevron-right pwa-opt-arrow"></i>
          </button>
        </div>

        <div id="pwa-install-guide-box" style="display: none; margin-top: 10px; padding: 14px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; font-size: 0.84rem; color: #1E293B; line-height: 1.5;">
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#pwa-modal-close-btn').addEventListener('click', () => {
      modal.remove();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    // Handle Option 1: Add to Home Screen
    modal.querySelector('#opt-add-home-screen').addEventListener('click', () => {
      const guide = modal.querySelector('#pwa-install-guide-box');
      guide.style.display = 'block';
      if (isIos) {
        guide.innerHTML = `
          <div style="font-weight: 700; color: #1B3A6B; margin-bottom: 6px;">📱 iPhone / iPad (Safari):</div>
          १. खालील <b>Share बटणावर (⎋)</b> टॅप करा.<br>
          २. मेनूमध्ये खाली स्क्रोल करून <b>'Add to Home Screen' (होम स्क्रीनवर जोडा ➕)</b> निवडा.<br>
          ३. वर उजवीकडे <b>'Add' (जोडा)</b> वर टॅप करा!
        `;
      } else if (deferredPrompt) {
        deferredPrompt.prompt();
        modal.remove();
      } else {
        guide.innerHTML = `
          <div style="font-weight: 700; color: #1B3A6B; margin-bottom: 6px;">🏠 Home Screen वर जोडण्याची पद्धत:</div>
          १. ब्राउझरच्या वरच्या उजव्या बाजूला <b>⋮ (तीन ठिपके)</b> वर टॅप करा.<br>
          २. मेनूमधून <b>'Add to Home screen' (होम स्क्रीनवर जोडा)</b> निवडा.<br>
          ३. ॲप आयकॉन तुमच्या मोबाईलच्या होम स्क्रीनवर लगेच तयार होईल!
        `;
      }
    });

    // Handle Option 2: Android
    modal.querySelector('#opt-android-install').addEventListener('click', () => {
      const guide = modal.querySelector('#pwa-install-guide-box');
      if (deferredPrompt) {
        deferredPrompt.prompt();
        modal.remove();
      } else {
        guide.style.display = 'block';
        guide.innerHTML = `
          <div style="font-weight: 700; color: #2E7D32; margin-bottom: 6px;"><i class="fa-brands fa-android"></i> Android थेट इन्स्टॉलेशन:</div>
          १. Google Chrome च्या उजव्या कोपऱ्यातील <b>⋮ (तीन ठिपके)</b> वर टॅप करा.<br>
          २. <b>'Install app' (किंवा 'Add to Home screen')</b> हा पर्याय निवडा.<br>
          ३. <b>Install</b> वर क्लिक करताच स्वतंत्र अँड्रॉइड ॲप सुरू होईल!
        `;
      }
    });
  }

  // Also expose install trigger function for menu and buttons
  window.vssInstallApp = () => {
    openInstallOptionsModal();
  };
})();
