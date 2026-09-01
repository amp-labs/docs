// PostHog loader for docs.withampersand.com
//
// Mintlify includes any .js file in the content directory on every page, so this
// file needs no import and no reference from docs.json.
//
// Why it exists: the GTM container (GTM-KKG4NLZD) fires the docs events as
// `window.posthog && window.posthog.capture(...)`. The container does NOT load
// posthog-js — it assumes one is already on the page, which is true on the
// marketing site and the dashboard but was not true here. Without this file those
// tags run, the guard fails, and nothing is sent, with no error.
//
// Mintlify's native `integrations.posthog` is deliberately not used: its schema is
// `additionalProperties: false` over apiKey / apiHost / sessionRecording, so
// autocapture cannot be turned off through it.
(function () {
  // The same container also runs on the marketing site, which loads its own
  // instance. Two posthog-js on one page fight over the cookie and double-count.
  if (window.posthog) return;

  var script = document.createElement("script");
  script.src = "https://us-assets.i.posthog.com/static/array.full.js";
  script.async = true;

  script.onload = function () {
    window.posthog.init("phc_VkNFJXeWlP2sOu5X6NA3KQPdupWd4Evpuo4MHasTUbX", {
      api_host: "https://us.i.posthog.com",

      // Everything automatic is off on purpose. Docs sends exactly two events,
      // both fired from GTM: `Login Button Clicked` and `CTA Clicked` on the
      // navbar. The project is already near its ingestion ceiling, and docs is
      // instrumented for conversion only.
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
    });
  };

  document.head.appendChild(script);
})();
