// Behaviour for the Integrations tab.
//
//  1. Category rows on the directory (provider-guides/overview.mdx). Mintlify
//     strips <details>, so the rows are divs and the open state lives in
//     data-open.
//  2. A "back to the directory" link above the title on every provider guide.
//     The guides are hidden: true, so the sidebar cannot list them and gives
//     no way back; this is that way back.
//
// Mintlify auto-includes every .js file in the content directory, so both parts
// are guarded: they do nothing unless the page in question is on screen.
(function () {
  var DIRECTORY = "/provider-guides/overview";

  function currentPath() {
    return document.documentElement.getAttribute("data-current-path") || window.location.pathname;
  }

  /* ---------- 1. Category rows ---------- */

  function toggle(head) {
    var row = head.closest(".amp-cat");
    if (!row) return;
    var open = row.getAttribute("data-open") === "true";
    row.setAttribute("data-open", open ? "false" : "true");
    head.setAttribute("aria-expanded", open ? "false" : "true");
  }

  function syncRows() {
    document.querySelectorAll(".amp-cat").forEach(function (row) {
      var head = row.querySelector(".amp-cat-head");
      if (head) {
        head.setAttribute("aria-expanded", row.getAttribute("data-open") === "true" ? "true" : "false");
      }
    });
  }

  document.addEventListener("click", function (e) {
    var head = e.target.closest && e.target.closest(".amp-cat-head");
    if (head) toggle(head);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    var head = e.target.closest && e.target.closest(".amp-cat-head");
    if (head) {
      e.preventDefault();
      toggle(head);
    }
  });

  /* ---------- 2. Back link on provider guides ---------- */

  function syncBackLink() {
    var path = currentPath();
    var wanted = path.indexOf("/provider-guides/") === 0 && path !== DIRECTORY;
    var existing = document.querySelector(".amp-back");

    // Mintlify navigates client-side, so drop the link when we leave a guide.
    if (!wanted) {
      if (existing) existing.remove();
      return;
    }
    if (existing) return;

    var header = document.getElementById("header");
    if (!header || !header.parentNode) return;

    var link = document.createElement("a");
    link.className = "amp-back";
    link.href = DIRECTORY;
    link.textContent = "← All providers";
    header.parentNode.insertBefore(link, header);
  }

  /* ---------- 3. Filtering the categories ---------- */

  // Typing narrows the categories in place: matching chips stay, categories
  // with no match drop out, and every surviving one opens so results are
  // visible without a click. Clearing restores the resting state.
  function applyFilter(root) {
    var input = document.getElementById("amp-provider-search");
    var status = document.getElementById("amp-find-status");
    if (!input) return;

    var query = input.value.trim();
    var q = query.toLowerCase();
    var total = 0;

    document.querySelectorAll(".amp-cat").forEach(function (row) {
      var hits = 0;
      row.querySelectorAll(".amp-cat-chips a").forEach(function (chip) {
        var hit = !q || chip.textContent.toLowerCase().indexOf(q) !== -1;
        chip.hidden = !hit;
        if (hit) hits++;
      });
      total += hits;

      row.hidden = !!q && hits === 0;

      var open = q ? hits > 0 : row.getAttribute("data-initial") === "true";
      row.setAttribute("data-open", open ? "true" : "false");
      var head = row.querySelector(".amp-cat-head");
      if (head) head.setAttribute("aria-expanded", open ? "true" : "false");
    });

    if (!status) return;
    if (!q) status.textContent = "";
    else if (total === 0) status.textContent = "No providers match \u201c" + query + "\u201d";
    else status.textContent = total + (total === 1 ? " provider matches \u201c" : " providers match \u201c") + query + "\u201d";
  }

  document.addEventListener("input", function (e) {
    if (e.target && e.target.id === "amp-provider-search") applyFilter();
  });

  function init() {
    syncRows();
    syncBackLink();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  if (typeof MutationObserver !== "undefined") {
    new MutationObserver(init).observe(document.documentElement, { childList: true, subtree: true });
  }
})();
