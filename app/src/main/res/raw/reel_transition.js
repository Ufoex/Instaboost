// Swiping between reels. Instagram does every change itself (it keeps its own idea of which reel is current, so moving the
// list from here puts it out of step: the address stops following, going back stops working). This script only
//  - shows the reels exactly under the finger (Instagram trails it by ~150 ms), whatever the list is doing.
//  - cross-fades the reels as they move: the one leaving becomes transparent while the next is revealed from dark.
//  - hides the ads of the viewer (when the ad blocker is on), keeps them silent and swipes past one that comes to rest on
//    the screen. The swipe is made by the app with real touch events (the page cannot make trusted ones).
//  - realigns a viewer left between two reels.
(function() {
  if (window.__igReelTransition) return;
  window.__igReelTransition = true;

  const inReel = () => /^\/reels?\//.test(location.pathname);
  const items = () => [...document.querySelectorAll('.vertically-snappable')];

  // --- the cross-fade: how much of a reel shows decides its brightness
  const fadeIn = (visible) => Math.max(0, Math.min(1, visible * 0.82));
  const fadeOut = (a) => Math.max(0, Math.min(1, 1 - a * 1.18));
  const opacityFor = (p) => { const a = Math.abs(p); return a <= 0.5 ? fadeOut(a) : fadeIn(1 - a); };
  {
    let raf = 0, prev = null, flipUntil = 0;
    // On release Instagram puts the list in its final place in a single frame (to the next reel, or back). The list
    // is moved back to where it was and slid to its place instead, so it keeps going after the finger leaves.
    const flip = (d, k) => {
      flipUntil = Date.now() + 160;
      items().forEach(it => {
        const r = it.getBoundingClientRect();
        if (r.bottom < -2 * r.height || r.top > innerHeight + 2 * r.height) return;
        it.animate([{ transform: 'translateY(' + (d / k) + 'px)' }, { transform: 'translateY(0px)' }],
          { duration: 130, easing: 'cubic-bezier(.2,.8,.2,1)', composite: 'add' });
      });
    };
    const loop = () => {
      raf = 0;
      let moving = false;
      if (prev && prev.el.isConnected && Date.now() > flipUntil) {
        const r = prev.el.getBoundingClientRect(), d = prev.top - r.top;
        if (Math.abs(d) > 150 && prev.el.offsetHeight) flip(d, r.height / prev.el.offsetHeight || 1);
      }
      let best = null, bd = Infinity;
      items().forEach(it => {
        const r = it.getBoundingClientRect(), h = r.height || 1, p = r.top / h;
        if (Math.abs(r.top) < bd) { bd = Math.abs(r.top); best = { el: it, top: r.top }; }
        if (r.bottom < -h || r.top > innerHeight + h || Math.abs(p) < 0.01) { if (it.style.opacity) it.style.removeProperty('opacity'); return; }
        if (Math.abs(p) < 1) moving = true;
        it.style.setProperty('opacity', opacityFor(p).toFixed(2));
      });
      prev = best;
      if (moving || Date.now() < flipUntil || (window.__igTouch && window.__igTouch.down)) raf = requestAnimationFrame(loop);
    };
    ['touchstart', 'touchmove', 'touchend', 'scroll'].forEach(n => document.addEventListener(n, () => { if (inReel() && !raf) { prev = null; raf = requestAnimationFrame(loop); } }, { capture: true, passive: true }));
  }

  // --- sensitivity: Instagram is shown the finger SENS times as far from where it landed, so a shorter swipe changes
  // reel. What is drawn is still the finger itself (the block below makes up the difference). 1 = as it is.
  const SENS = 1.25;
  let g = null;
  const setY = (e, y) => { ['clientY', 'pageY', 'screenY', 'y'].forEach(k => { try { Object.defineProperty(e, k, { value: y, configurable: true }); } catch (_) {} }); };
  window.__igGate = (e) => {
    if (e.pointerType !== 'touch' || !e.isPrimary || !inReel()) return false;
    if (e.type === 'pointerdown') {
      g = e.target.closest && e.target.closest('input, textarea, select, [role="slider"], [role="dialog"], [role="menu"], [id^="mb-reel-"], #ib-download') ? null : e.clientY;
    } else if (g !== null) {
      setY(e, g + (e.clientY - g) * SENS);
      if (e.type !== 'pointermove') g = null;
    }
    return false;
  };

  // --- no lag: Instagram eases the list towards the finger (it trails by ~150 ms, and it changes reel by itself past a point).
  // While a finger is down the reels are shown exactly under it: the `translate` property (it adds to Instagram's own
  // transform, which is left alone) makes up the difference. On release that difference eases out as Instagram settles.
  {
    const EASE = 140;
    let d = null, rel = null, raf = 0;
    const put = (it, v) => { it.__ibT = v; if (v) it.style.setProperty('translate', '0 ' + v + 'px'); else it.style.removeProperty('translate'); };
    const igTop = (it) => it.getBoundingClientRect().top - (it.__ibT || 0);      // where Instagram has put it
    const follow = (y) => {
      d.dy = y - d.y0;
      // Instagram rebuilds its list when it changes reel mid-drag: the new elements take over the shift in use
      items().forEach(it => {
        if (d.base.has(it)) return;
        const r = it.getBoundingClientRect();
        if (r.bottom > -2 * r.height && r.top < innerHeight + 2 * r.height) d.base.set(it, r.top + d.t - d.dy);
      });
      d.base.forEach((b, it) => { if (it.isConnected) put(it, d.t = b + d.dy - igTop(it)); });
    };
    const settle = () => {
      raf = 0;
      const k = Math.min(1, (performance.now() - rel.t0) / EASE), e = 1 - Math.pow(1 - k, 3);
      rel.from.forEach((v0, it) => { if (it.isConnected) put(it, k >= 1 ? 0 : (v0 - igTop(it)) * (1 - e)); });
      if (k < 1) raf = requestAnimationFrame(settle);
    };
    const stop = () => {
      if (!d) return;
      const from = new Map();
      d.base.forEach((b, it) => { if (it.isConnected && it.__ibT) from.set(it, it.getBoundingClientRect().top); });
      d = null; rel = { t0: performance.now(), from };
      if (!raf) raf = requestAnimationFrame(settle);
    };
    document.addEventListener('touchstart', (e) => {
      if (d) stop();
      if (e.touches.length !== 1 || !inReel() || (e.target.closest && e.target.closest('input, textarea, select, [role="slider"], [role="dialog"], [role="menu"], [id^="mb-reel-"], #ib-download'))) return;
      if (raf) { cancelAnimationFrame(raf); raf = 0; rel.from.forEach((_, it) => put(it, 0)); rel = null; }
      const base = new Map();
      items().forEach(it => { const r = it.getBoundingClientRect(); if (r.bottom > -2 * r.height && r.top < innerHeight + 2 * r.height) base.set(it, r.top); });
      d = { y0: e.touches[0].clientY, y: e.touches[0].clientY, dy: 0, t: 0, base };
    }, { capture: true, passive: true });
    // Instagram keeps moving its list between touch events (its easing, and its change of reel): the shift is worked out
    // again every frame, in a callback asked for after its own, so what is drawn is always the finger.
    let loop = 0;
    const tick = () => { if (d) { follow(d.y); requestAnimationFrame(tick); } else loop = 0; };
    document.addEventListener('touchmove', (e) => {
      if (!d) return;
      if (e.touches.length !== 1) return stop();
      d.y = e.touches[0].clientY;
      follow(d.y);
      requestAnimationFrame(() => { if (d) follow(d.y); });   // asked for after Instagram's own callbacks of this frame
      if (!loop) { loop = 1; requestAnimationFrame(tick); }
    }, { capture: true, passive: true });
    ['touchend', 'touchcancel'].forEach(n => document.addEventListener(n, stop, { capture: true, passive: true }));
  }

  // --- ads of the viewer and a viewer left between two reels
  const touching = () => !!(window.__igTouch && (window.__igTouch.down || Date.now() - window.__igTouch.endAt < 900));
  let tickN = 0, lastTop = null, stableSince = 0, prevIdx = null, lastDir = 1, lastSwipe = 0, swipedFrom = null;
  setInterval(() => {
    if (!inReel()) return;
    const its = items();
    if (!its.length) return;
    tickN++;
    // Ads stay in the list (it measures their height) but are invisible, and nothing plays from them
    if (window.__igSkipAds) {
      its.forEach(it => {
        const r = it.getBoundingClientRect();
        if ((r.bottom < -2 * r.height || r.top > innerHeight + 2 * r.height) && tickN % 5) return;   // far ones every 5th tick: an ad is hidden before it scrolls in
        if (it.__ibAd || window.igIsAd(it)) {
          it.__ibAd = true;
          if (it.style.visibility !== 'hidden') it.style.setProperty('visibility', 'hidden', 'important');   // Instagram places the slots itself: display:none leaves the gap, so it is hidden and skipped fast
          const v = it.querySelector('video'); if (v && !v.paused) v.pause();
          if (!it.__ibMsg) {                                                              // "Ad blocked" over the hidden ad
            const m = it.__ibMsg = document.createElement('div');
            m.textContent = /^es/i.test(navigator.language) ? 'Anuncio bloqueado' : 'Ad blocked';
            m.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;visibility:visible;pointer-events:none;color:#fff;opacity:.6;font:600 15px sans-serif;background:#000';
            it.appendChild(m);
          }
        }
      });
    }
    // after a release wait 900 ms, but an ad at rest is skipped after 250 ms
    if (touching() && !(!(window.__igTouch.down) && Date.now() - window.__igTouch.endAt > 250 && its.some(it => it.__ibAd && Math.abs(it.getBoundingClientRect().top) < 3))) { lastTop = null; return; }
    let best = null, bd = Infinity;
    its.forEach(it => { const tp = it.getBoundingClientRect().top; if (Math.abs(tp) < bd) { bd = Math.abs(tp); best = it; } });
    if (best && bd < 3) {
      const idx = its.indexOf(best);
      if (prevIdx !== null && idx !== prevIdx) lastDir = idx > prevIdx ? 1 : -1;
      prevIdx = idx;
      if (swipedFrom && swipedFrom !== best) swipedFrom = null;                          // left that ad: forget the attempt
      // an ad at rest: swipe on the way it was going (the other way if that already failed once, or there is nothing ahead)
      if (best.__ibAd && Date.now() - lastSwipe > 900 && window.InstaboostPage) {
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
  }, 100);
})();
