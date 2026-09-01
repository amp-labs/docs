// Docs analytics. Mintlify includes any .js file in the content directory on
// every page, so this file needs no import.

(function () {
  // PostHog event names, not the dataLayer ones below. GTM translates between them.
  var ALLOWED_EVENTS = ["CTA Clicked", "Login Button Clicked"];

  // The marketing site loads its own instance; two on a page double-count.
  if (window.posthog) return;

  var isLocal =
    location.hostname === "localhost" || location.hostname === "127.0.0.1";

  var script = document.createElement("script");
  // array.js, not array.full.js: 88KB over the wire instead of 185KB.
  script.src = "https://us-assets.i.posthog.com/static/array.js";
  script.async = true;

  script.onload = function () {
    window.posthog.init("phc_VkNFJXeWlP2sOu5X6NA3KQPdupWd4Evpuo4MHasTUbX", {
      api_host: "https://us.i.posthog.com",

      // Docs sends two events and nothing else. Mintlify's native
      // integrations.posthog cannot express this: it exposes only apiKey,
      // apiHost and sessionRecording.
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      capture_heatmaps: false,
      capture_dead_clicks: false,
      capture_exceptions: false,
      capture_performance: false,
      disable_session_recording: true,
      disable_surveys: true,
      rageclick: false,
      advanced_disable_decide: true,

      // GTM is injected into local preview too, so its tags fire there. Keep QA
      // clicks out of the baseline.
      opt_out_capturing_by_default: isLocal,
      debug: isLocal,

      // Backstop. A posthog-js upgrade or a remote setting can change any flag
      // above; this holds regardless.
      before_send: function (event) {
        return event && ALLOWED_EVENTS.indexOf(event.event) !== -1 ? event : null;
      },
    });
  };

  document.head.appendChild(script);
})();

// The GTM tags fire on these dataLayer events and read every property from the
// dataLayer, not the DOM. Labels are declared here, never read from the page:
// reading them splits the metric the first time the copy changes.
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

  // Delegated: the navbar re-renders on client-side navigation.
  document.addEventListener(
    "click",
    function (event) {
      var target = event.target;
      if (!target || !target.closest) return;

      // Scoped by position, not by destination: page bodies link out too.
      var link = target.closest('a[href*="dashboard.withampersand.com"]');
      if (!link || !link.closest("#navbar")) return;

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
