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

    banner.querySelector('#pwa-btn-install')?.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        deferredPrompt = null;
      }
      hideInstallPrompt();
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

  // Also expose install trigger function for menu
  window.vssInstallApp = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
    } else {
      alert('ॲप इन्स्टॉल करण्यासाठी ब्राऊझरच्या मेनूवर (⋮) जाऊन "Add to Home Screen" किंवा "Install App" निवडा.');
    }
  };
})();
