// Swiping between reels, done here instead of by Instagram:
//  - The reel follows the finger the whole way and only changes when the finger lifts (Instagram changes it by
//    itself as soon as the drag passes half the screen, even with the finger still down).
//  - The reels fade as they move: the one leaving dims and the next one brightens with the distance dragged.
//  - On release it goes to the next (or previous) reel if the drag was long enough or fast enough, else it comes back.
// It works through res/raw/early_gate.js, which runs before Instagram's scripts and asks window.__igGate (below) first
// for every pointer event; the touches this script takes are hidden from Instagram. Touches that start on a text field,
// the seek bar, a dialog or one of our buttons are left to Instagram, and taps still produce clicks. Without the early
// script (an old WebView) Instagram keeps its own swipe and only the fade is added.
// After a change the address bar is made to match the reel on screen, and a viewer left between two reels realigns.
(function() {
  if (window.__igReelTransition) return;
  window.__igReelTransition = true;

  const COMMIT_DIST = 0.28;     // fraction of a reel's height that is enough to change reel
  const COMMIT_SPEED = 0.45;    // px per ms that is enough to change reel
  const SLOP = 4;               // px of movement before a touch counts as a drag
  const inReel = () => /^\/reels?\//.test(location.pathname);
  const items = () => [...document.querySelectorAll('.vertically-snappable')];
  const scrollerOf = (v) => { for (let p = v.parentElement; p && p !== document.body; p = p.parentElement) { if (p.scrollHeight > p.clientHeight + 50 && /auto|scroll/.test(getComputedStyle(p).overflowY)) return p; } return null; };

  // Brightness of a reel when it is p (a fraction of its height, 0 = at rest) away from its place: the one with most of
  // the screen dims as it leaves, the one coming in brightens as it enters.
  const opacityFor = (p) => {
    const a = Math.abs(p);
    if (a < 0.01) return 1;
    return Math.max(0.1, Math.min(1, a <= 0.5 ? 1 - 1.6 * a : 1.6 * (1 - a)));
  };

  let g = null;   // the touch being followed

  const eligible = (e) => {
    if (!inReel()) return false;
    if (e.clientX < 32 || e.clientX > innerWidth - 32) return false;                       // system back gesture
    const el = e.target;
    return !(el.closest && el.closest('input, textarea, select, [role="slider"], [role="dialog"], [role="menu"], [id^="mb-reel-"], #ib-download'));
  };

  const start = (e) => {
    g = null;
    if (!eligible(e)) return false;
    const its = items();
    let cur = null, cd = Infinity;
    its.forEach(it => { const d = Math.abs(it.getBoundingClientRect().top); if (d < cd) { cd = d; cur = it; } });
    if (!cur || cd > 4) return false;
    const i = its.indexOf(cur);
    const video = cur.querySelector('video');
    g = { x0: e.clientX, y0: e.clientY, H: cur.getBoundingClientRect().height, cur, next: its[i + 1] || null, prev: its[i - 1] || null,
          scroller: video && scrollerOf(video), active: false, dy: 0, samples: [[performance.now(), e.clientY]] };
    return true;
  };

  const show = (dy) => {
    const toward = dy < 0 ? g.next : g.prev;
    const eff = toward ? dy : dy / 3;                           // no reel on that side: the drag resists
    const setIt = (it, off, restTop) => {
      if (!it) return;
      it.style.transition = 'none';
      it.style.setProperty('translate', '0 ' + off + 'px');
      it.style.setProperty('opacity', opacityFor(restTop === undefined ? off / g.H : (restTop + off) / g.H).toFixed(2));
    };
    setIt(g.cur, eff);
    if (toward) setIt(toward, eff, dy < 0 ? g.H : -g.H);
  };

  const move = (e) => {
    if (!g) return false;
    const dy = e.clientY - g.y0, dx = e.clientX - g.x0;
    if (!g.active) {
      if (Math.abs(dy) < SLOP && Math.abs(dx) < SLOP) return true;
      if (Math.abs(dx) > Math.abs(dy)) { g = null; return false; }                        // sideways: not ours
      g.active = true;
    }
    g.dy = Math.max(-g.H, Math.min(g.H, dy));
    g.samples.push([performance.now(), e.clientY]);
    if (g.samples.length > 6) g.samples.shift();
    show(g.dy);
    return true;
  };

  const settleBack = (s) => {
    const targets = [s.cur, s.next, s.prev].filter(Boolean);
    targets.forEach(it => { it.style.transition = 'translate .18s ease-out, opacity .18s ease-out'; it.style.setProperty('translate', '0 0px'); it.style.removeProperty('opacity'); });
    setTimeout(() => targets.forEach(it => { it.style.removeProperty('transition'); it.style.removeProperty('translate'); }), 220);
  };

  const end = (e, cancelled) => {
    if (!g) return false;
    const s = g; g = null;
    if (!s.active) return true;
    const now = performance.now();
    const last = s.samples[s.samples.length - 1];
    const old = s.samples.find(p => now - p[0] < 120) || s.samples[0];
    const v = (last[1] - old[1]) / Math.max(1, last[0] - old[0]);                           // px per ms, negative = up
    const dir = s.dy < 0 ? 1 : -1;                                                        // 1 = next reel, -1 = previous
    const target = dir > 0 ? s.next : s.prev;
    const far = Math.abs(s.dy) > COMMIT_DIST * s.H;
    const fast = Math.abs(v) > COMMIT_SPEED && Math.sign(v) === Math.sign(s.dy);
    if (cancelled || !target || !(far || fast) || !s.scroller) { settleBack(s); return true; }
    // change: finish the move, then move the list by exactly one reel under it (no visible jump) and clear our marks
    const delta = dir * s.H;
    [s.cur, target].forEach(it => { it.style.transition = 'translate .16s ease-out, opacity .16s ease-out'; it.style.setProperty('translate', '0 ' + (-delta) + 'px'); });
    s.cur.style.setProperty('opacity', '0.1'); target.style.setProperty('opacity', '1');
    setTimeout(() => {
      const sc = s.scroller;
      [s.cur, s.next, s.prev].filter(Boolean).forEach(it => { it.style.transition = 'none'; it.style.removeProperty('translate'); it.style.removeProperty('opacity'); });
      const behavior = sc.style.scrollBehavior; sc.style.scrollBehavior = 'auto';
      sc.scrollTop = sc.scrollTop + delta;
      sc.style.scrollBehavior = behavior;
      setTimeout(() => [s.cur, s.next, s.prev].filter(Boolean).forEach(it => it.style.removeProperty('transition')), 30);
    }, 170);
    return true;
  };

  window.__igGate = (e) => {
    if (e.pointerType !== 'touch' || !e.isPrimary) return false;
    switch (e.type) {
      case 'pointerdown': return start(e);
      case 'pointermove': return move(e);
      case 'pointerup': return end(e, false);
      case 'pointercancel': return end(e, true);
    }
    return false;
  };

  // --- without the early script Instagram keeps the swipe: only fade the reels with how far they are from rest
  if (!window.__igGateInstalled) {
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

  // --- the address bar follows the reel on screen; a viewer left between two reels realigns
  const touching = () => !!(window.__igTouch && (window.__igTouch.down || Date.now() - window.__igTouch.endAt < 900)) || !!g;
  // Each reel has an overlay id "clipsoverlay<media id>_<user id>"; the code in the address is that media id written
  // in Instagram's base-64 alphabet.
  const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  const codeOf = (it) => {
    const o = it.querySelector('[id^="clipsoverlay"]');
    const m = o && o.id.match(/^clipsoverlay(\d+)_/);
    if (!m) return null;
    let n = BigInt(m[1]), c = '';
    while (n > 0n) { c = ALPHA[Number(n % 64n)] + c; n /= 64n; }
    return c;
  };
  let lastTop = null, stableSince = 0, urlSince = 0, urlFor = null;
  setInterval(() => {
    if (!inReel() || touching()) { lastTop = null; urlSince = 0; return; }
    const its = items();
    if (!its.length) return;
    let best = null, bd = Infinity;
    its.forEach(it => { const tp = it.getBoundingClientRect().top; if (Math.abs(tp) < bd) { bd = Math.abs(tp); best = it; } });
    if (!best) return;
    if (bd >= 3) {                                                                            // between two reels
      if (lastTop === null || Math.abs(bd - lastTop) > 1) { lastTop = bd; stableSince = Date.now(); return; }
      if (Date.now() - stableSince < 500) return;
      lastTop = null;
      best.scrollIntoView({ block: 'start', behavior: 'smooth' });
      return;
    }
    lastTop = null;
    const code = codeOf(best);                                                                // aligned: make the address match
    const cur = (location.pathname.match(/^\/reels?\/([\w-]+)/) || [])[1];
    if (!code || code === cur) { urlSince = 0; return; }
    if (urlFor !== code) { urlFor = code; urlSince = Date.now(); return; }
    if (Date.now() - urlSince > 400) { history.replaceState(history.state, '', '/reels/' + code + '/'); urlSince = 0; }
  }, 250);
})();
