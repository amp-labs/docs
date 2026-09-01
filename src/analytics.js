// Docs analytics.
//
// Two responsibilities, in this order: load posthog-js, then push the two navbar
// conversion events to the dataLayer. GTM maps those pushes to PostHog events —
// nothing here calls `posthog.capture` directly.
//
// Mintlify includes any .js file in the content directory on every page, so this
// file needs no import and no reference from docs.json.

// ---------------------------------------------------------------------------
// 1. Load posthog-js
//
// Mintlify's native `integrations.posthog` is deliberately NOT used. Its schema is
// `additionalProperties: false` over apiKey / apiHost / sessionRecording, so
// autocapture cannot be turned off through it. Docs is meant to send two events
// and nothing else: the PostHog project is already near its ingestion ceiling, and
// docs is instrumented for conversion only. Loading posthog-js here is what makes
// every capture setting reachable.
//
// It also guarantees `window.posthog` exists. The container's tags are written as
// `window.posthog && window.posthog.capture(...)` — a bundle that does not expose
// the global leaves them no-oping in silence, which is the failure the dashboard
// already hit.
(function () {
  // The same container also runs on the marketing site, which loads its own
  // instance. Two posthog-js on one page fight over the cookie and double-count.
  if (window.posthog) return;

  // The GTM container is injected in local preview too, so its tags fire there.
  // On localhost posthog still loads and the tags still run — so the wiring is
  // testable — but capturing starts opted out, and nothing leaves the browser.
  // QA clicks must not land in the baseline or burn ingestion quota.
  var isLocal =
    location.hostname === "localhost" || location.hostname === "127.0.0.1";

  var script = document.createElement("script");
  script.src = "https://us-assets.i.posthog.com/static/array.full.js";
  script.async = true;

  script.onload = function () {
    window.posthog.init("phc_VkNFJXeWlP2sOu5X6NA3KQPdupWd4Evpuo4MHasTUbX", {
      api_host: "https://us.i.posthog.com",

      // Everything automatic is off on purpose.
      //
      // Cost of `capture_pageview: false`: docs reports no traffic volume. The two
      // events still carry `$pathname`, so no report in the tracking plan breaks.
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      capture_heatmaps: false,
      capture_dead_clicks: false,
      disable_session_recording: true,
      rageclick: false,

      opt_out_capturing_by_default: isLocal,
      debug: isLocal,
    });
  };

  document.head.appendChild(script);
})();

// ---------------------------------------------------------------------------
// 2. Push the navbar conversion events
//
// The tags in container GTM-KKG4NLZD fire on the custom events `cta_clicked` and
// `login_button_clicked`, and read every property from the dataLayer (GTM `__v`
// variables), not from the DOM. The marketing site pushes them from its own code.
// Docs pushed nothing, which is why no docs event ever reached PostHog.
//
// Labels are declared here, never read from the page text. Reading them from the
// DOM splits the metric in silence the first time the copy changes.
(function () {
  var EVENTS = [
    {
      path: "/sign-in",
      event: "login_button_clicked",
      properties: {
        label: "Sign in",
        section: "navbar",
        destination_url: "https://dashboard.withampersand.com/sign-in?trk=docs",
      },
    },
    {
      path: "/sign-up",
      event: "cta_clicked",
      properties: {
        label: "Start building now",
        section: "navbar",
        element_type: "button",
        conversion_type: "signup",
        destination_url: "https://dashboard.withampersand.com/sign-up?trk=docs",
      },
    },
  ];

  // Delegated, because docs is a SPA: the navbar is re-rendered on client-side
  // navigation and a listener bound to the node itself would be lost.
  document.addEventListener(
    "click",
    function (event) {
      var target = event.target;
      if (!target || !target.closest) return;

      var link = target.closest('a[href*="dashboard.withampersand.com"]');
      if (!link) return;

      // Scope by where the element is, not by where it points. Any doc page is
      // free to link to the dashboard in its body; only the navbar is a CTA.
      if (!link.closest("#navbar")) return;

      var href = link.getAttribute("href") || "";
      for (var i = 0; i < EVENTS.length; i++) {
        if (href.indexOf(EVENTS[i].path) === -1) continue;

        var payload = { event: EVENTS[i].event };
        var properties = EVENTS[i].properties;
        for (var key in properties) payload[key] = properties[key];

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(payload);
        return;
      }
    },
    true
  );
})();
