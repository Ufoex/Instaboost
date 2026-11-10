// Runs before the page's own scripts (document start). Gives the app first look at pointer events: Instagram
// listens to them on `window` (capture) to drag between reels, and a listener added later could never stop it.
// The gate itself decides nothing: window.__igGate (set by reel_transition.js) says whether to hide an event from
// the page. Until that exists, or outside the reels, every event goes through untouched.
(function() {
  if (window.__igGateInstalled) return;
  window.__igGateInstalled = true;
  ['pointerdown', 'pointermove', 'pointerup', 'pointercancel'].forEach(function(n) {
    window.addEventListener(n, function(e) {
      var g = window.__igGate;
      if (g && g(e)) e.stopImmediatePropagation();
    }, true);
  });
})();
