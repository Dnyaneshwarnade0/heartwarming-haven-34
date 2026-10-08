(function () {
  "use strict";

  function relabel() {
    const dashboard = document.querySelector('[data-target="panel-dashboard"] span');
    const directory = document.querySelector('[data-target="panel-students"] span');
    if (dashboard) dashboard.textContent = "आजचा आढावा";
    if (directory) directory.textContent = "शिष्य नोंद";
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", relabel);
  else relabel();
})();
