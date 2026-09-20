/* =========================================================
   PWA Handler — Service Worker registration & Native PWA
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
          try { reg.update(); } catch (_) { }
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

  // 3. Native PWA Install Prompt Handling
  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    // Keep reference so that if user clicks install in app menu, native prompt opens
    deferredPrompt = e;
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    console.log('PWA यशस्वीरित्या इन्स्टॉल झाले.');
  });

  // Native install trigger for sidebar menu (no custom modals or popups)
  window.vssInstallApp = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((result) => {
        if (result.outcome === 'accepted') {
          deferredPrompt = null;
        }
      });
    }
  };
})();
