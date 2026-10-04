(function () {
    'use strict';
    // Exam feature removed per user request
    const removeEls = () => {
        document.getElementById('menu-exam')?.remove();
        document.getElementById('panel-exam')?.remove();
    };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', removeEls);
    } else {
        removeEls();
    }
})();
