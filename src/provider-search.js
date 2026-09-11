// Client-side provider filter for the Integrations directory
// (provider-guides/overview.mdx). The number shown before searching comes from
// data-limit on the .amp-providers wrapper; searching always covers them all.
//
// Mintlify auto-includes every .js file in the content directory, so this is
// guarded: it does nothing unless a page contains the provider markup.
(function () {
  var DEFAULT_LIMIT = 24;

  function limitFor(root) {
    var raw = root.getAttribute("data-limit");
    if (raw === "all") return Infinity;
    var n = parseInt(raw, 10);
    return isNaN(n) ? DEFAULT_LIMIT : n;
  }

  function render(root) {
    var input = root.querySelector("#amp-provider-search");
    var chips = root.querySelector("#amp-provider-chips");
    var label = root.querySelector("#amp-provider-count");
    if (!input || !chips || !label) return;

    var limit = limitFor(root);
    var query = (input.value || "").trim();
    var q = query.toLowerCase();
    var items = chips.querySelectorAll(".amp-chip");
    var total = items.length;
    var matched = 0;
    var shown = 0;

    for (var i = 0; i < total; i++) {
      var chip = items[i];
      var name = chip.getAttribute("data-name") || chip.textContent.toLowerCase();
      var hit = !q || name.indexOf(q) !== -1;
      if (hit) matched++;
      var visible = hit && shown < limit;
      if (visible) shown++;
      chip.hidden = !visible;
    }

    chips.classList.add("amp-chips--ready");

    if (q) {
      label.textContent = matched === 0
        ? "No providers match “" + query + "”, try a different spelling, or browse the sidebar."
        : matched + " of " + total + " providers match “" + query + "”";
    } else if (shown < total) {
      label.textContent = shown + " most-used connectors shown, search to reach all " + total;
    } else {
      label.textContent = "Showing all " + total + " providers";
    }
  }

  function init() {
    var root = document.querySelector(".amp-providers");
    if (!root || root.getAttribute("data-amp-ready") === "1") return;
    root.setAttribute("data-amp-ready", "1");
    render(root);
  }

  // Filter as the user types (delegated so it survives client-side navigation).
  document.addEventListener("input", function (e) {
    var t = e.target;
    if (t && t.id === "amp-provider-search") {
      var root = t.closest(".amp-providers");
      if (root) render(root);
    }
  });

  // Mintlify navigates client-side, so re-run whenever the markup is remounted.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  if (typeof MutationObserver !== "undefined") {
    new MutationObserver(init).observe(document.documentElement, { childList: true, subtree: true });
  }
})();
