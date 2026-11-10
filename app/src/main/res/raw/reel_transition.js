// Swiping between reels. Instagram does every change itself (it keeps its own idea of which reel is current, so moving the
// list from here puts it out of step: the address stops following, going back stops working). This script only
//  - stops it from changing reel by itself halfway through a SLOW drag, with the finger still down: while the finger moves
//    slowly, Instagram is shown a position that follows it 1:1 for the first part and then creeps towards (never reaching)
//    half a reel. A quick flick (or a finger that speeds up) goes through untouched, and Instagram changes reel as it
//    always did. This works through res/raw/early_gate.js, which runs before Instagram's scripts and calls
//    window.__igGate (below) first for every pointer event; without it (an old WebView) nothing changes.
//  - cross-fades the reels as they move: the one leaving becomes transparent while the next is revealed from dark.
//  - hides the ads of the viewer (when the ad blocker is on), keeps them silent and swipes past one that comes to rest on
//    the screen. The swipe is made by the app with real touch events (the page cannot make trusted ones).
//  - realigns a viewer left between two reels.
(function() {
  if (window.__igReelTransition) return;
  window.__igReelTransition = true;

  const X1 = 0.40, X2 = 1.0, CAP = 0.49;    // fractions of a reel's height: 1:1 up to X1, then creeping towards CAP
  const FLICK = 0.45;                        // px per ms: at least this fast and the touch is left to Instagram
  const inReel = () => /^\/reels?\//.test(location.pathname);
  const items = () => [...document.querySelectorAll('.vertically-snappable')];

  // --- the gate: where Instagram thinks a slow finger is
  let t = null;   // { y0, H, free, samples }
  const setY = (e, y) => { ['clientY', 'pageY', 'screenY', 'y'].forEach(k => { try { Object.defineProperty(e, k, { value: y, configurable: true }); } catch (_) {} }); };
  const perceived = (d, H) => {
    const x = Math.min(1, Math.abs(d) / H);
    const p = x <= X1 ? x : X1 + (x - X1) * ((CAP - X1) / (X2 - X1));
    return Math.sign(d) * p * H;
  };
  window.__igGate = (e) => {
    if (e.pointerType !== 'touch' || !e.isPrimary || !inReel()) return false;
    if (e.type === 'pointerdown') {
      t = null;
      if (e.target.closest && e.target.closest('input, textarea, select, [role="slider"], [role="dialog"], [role="menu"], [id^="mb-reel-"], #ib-download')) return false;
      let H = 0, bd = Infinity;
      items().forEach(it => { const r = it.getBoundingClientRect(); if (Math.abs(r.top) < bd) { bd = Math.abs(r.top); H = r.height; } });
      if (!H || bd > 4) return false;
      t = { y0: e.clientY, H, free: false, moves: [] };
      return false;
    }
    if (!t) return false;
    if (e.type === 'pointermove') {
      const now = performance.now();
      t.moves.push([now, e.clientY]);
      if (t.moves.length > 6) t.moves.shift();
      // Speed between moves only (the first jump after touching the screen always looks fast). A quick flick is
      // Instagram's own: from then on this touch goes through untouched.
      if (t.moves.length >= 3) {
        const first = t.moves.find(p => now - p[0] < 100) || t.moves[0];
        const v = (e.clientY - first[1]) / Math.max(1, now - first[0]);
        if (first !== t.moves[t.moves.length - 1] && Math.abs(v) >= FLICK) t.free = true;
      }
      const d = e.clientY - t.y0;
      if (!t.free && Math.abs(d) > X1 * t.H) setY(e, t.y0 + perceived(d, t.H));
      return false;
    }
    if (!t.free && t.moves.length) {                                                     // slow release: shown where Instagram last saw it
      const d = t.moves[t.moves.length - 1][1] - t.y0;
      if (Math.abs(d) > X1 * t.H) setY(e, t.y0 + perceived(d, t.H));
    }
    t = null;
    return false;
  };

  // --- the cross-fade: how much of a reel shows decides its brightness
  const fadeIn = (visible) => Math.max(0, Math.min(1, visible * 1.18));
  const fadeOut = (a) => Math.max(0, Math.min(1, 1 - a * 1.18));
  const opacityFor = (p) => { const a = Math.abs(p); return a <= 0.5 ? fadeOut(a) : fadeIn(1 - a); };
  {
    let raf = 0;
    const loop = () => {
      raf = 0;
      let moving = false;
      items().forEach(it => {
        const r = it.getBoundingClientRect(), h = r.height || 1, p = r.top / h;
        if (r.bottom < -h || r.top > innerHeight + h || Math.abs(p) < 0.01) { if (it.style.opacity) it.style.removeProperty('opacity'); return; }
        if (Math.abs(p) < 1) moving = true;
        it.style.setProperty('opacity', opacityFor(p).toFixed(2));
      });
      if (moving || (window.__igTouch && window.__igTouch.down)) raf = requestAnimationFrame(loop);
    };
    ['touchstart', 'touchmove', 'touchend', 'scroll'].forEach(n => document.addEventListener(n, () => { if (inReel() && !raf) raf = requestAnimationFrame(loop); }, { capture: true, passive: true }));
  }

  // --- ads of the viewer and a viewer left between two reels
  const touching = () => !!(window.__igTouch && (window.__igTouch.down || Date.now() - window.__igTouch.endAt < 900));
  let lastTop = null, stableSince = 0, prevIdx = null, lastDir = 1, lastSwipe = 0, swipedFrom = null;
  setInterval(() => {
    if (!inReel()) return;
    const its = items();
    if (!its.length) return;
    // Ads stay in the list (it measures their height) but are invisible, and nothing plays from them
    if (window.__igSkipAds) {
      its.forEach(it => {
        const r = it.getBoundingClientRect();
        if (r.bottom < -2 * r.height || r.top > innerHeight + 2 * r.height) return;
        if (window.igIsAd(it)) {
          it.__ibAd = true;
          if (it.style.visibility !== 'hidden') it.style.setProperty('visibility', 'hidden', 'important');
          const v = it.querySelector('video'); if (v && !v.paused) v.pause();
        }
      });
    }
    if (touching()) { lastTop = null; return; }
    let best = null, bd = Infinity;
    its.forEach(it => { const tp = it.getBoundingClientRect().top; if (Math.abs(tp) < bd) { bd = Math.abs(tp); best = it; } });
    if (best && bd < 3) {
      const idx = its.indexOf(best);
      if (prevIdx !== null && idx !== prevIdx) lastDir = idx > prevIdx ? 1 : -1;
      prevIdx = idx;
      if (swipedFrom && swipedFrom !== best) swipedFrom = null;                          // left that ad: forget the attempt
      // an ad at rest: swipe on the way it was going (the other way if that already failed once, or there is nothing ahead)
      if (best.__ibAd && Date.now() - lastSwipe > 1300 && window.InstaboostPage) {
        const dir = swipedFrom === best ? -lastDir : lastDir;
        const ok = its[idx + dir];
        swipedFrom = best; lastSwipe = Date.now();
        window.InstaboostPage.postMessage(JSON.stringify({ call: 'swipe', dir: ok ? dir : -dir }));
        lastTop = null; return;
      }
    }
    if (!best || bd < 3) { lastTop = null; return; }
    if (lastTop === null || Math.abs(bd - lastTop) > 1) { lastTop = bd; stableSince = Date.now(); return; }
    if (Date.now() - stableSince < 500) return;                                          // give Instagram its own time to settle
    lastTop = null;
    best.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, 250);
})();
