// Search + provider filter on the troubleshooting index
// (troubleshooting-guides/overview.mdx). Guarded so it only acts on that page;
// Mintlify auto-includes every .js file in the content directory.
(function () {
  function render(root) {
    var input = root.querySelector("#amp-ts-search");
    var list = root.querySelector("#amp-ts-list");
    var count = root.querySelector("#amp-ts-count");
    if (!input || !list || !count) return;

    var active = root.querySelector(".amp-ts-chip.is-active");
    var tag = active ? active.getAttribute("data-tag") || "" : "";
    var q = (input.value || "").trim().toLowerCase();
    var rows = list.querySelectorAll(".amp-ts-row");
    var shown = 0;

    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var tags = (row.getAttribute("data-tags") || "").toLowerCase();
      var text = (row.textContent || "").toLowerCase();
      var hit = (!tag || tags.indexOf(tag) !== -1) && (!q || text.indexOf(q) !== -1 || tags.indexOf(q) !== -1);
      row.hidden = !hit;
      if (hit) shown++;
    }

    count.textContent = shown === rows.length
      ? "Showing all " + rows.length + " entries"
      : shown + " of " + rows.length + " entries match";
  }

  function init() {
    var root = document.getElementById("amp-ts-root");
    if (!root || root.getAttribute("data-ts-ready") === "1") return;
    root.setAttribute("data-ts-ready", "1");
    render(root);
  }

  document.addEventListener("input", function (e) {
    if (e.target && e.target.id === "amp-ts-search") {
      var root = e.target.closest(".amp-ts");
      if (root) render(root);
    }
  });

  document.addEventListener("click", function (e) {
    var chip = e.target && e.target.closest ? e.target.closest(".amp-ts-chip") : null;
    if (!chip) return;
    var root = chip.closest(".amp-ts");
    if (!root) return;
    var chips = root.querySelectorAll(".amp-ts-chip");
    for (var i = 0; i < chips.length; i++) chips[i].classList.remove("is-active");
    chip.classList.add("is-active");
    render(root);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  if (typeof MutationObserver !== "undefined") {
    new MutationObserver(init).observe(document.documentElement, { childList: true, subtree: true });
  }
})();
