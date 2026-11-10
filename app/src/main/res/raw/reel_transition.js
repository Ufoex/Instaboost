// Switching reels, in three parts:
//  1. While a reel is dragged (and while it settles after the finger lifts) the reels on screen fade with how far
//     they are from their place: the one leaving gets dimmer, the one arriving brighter, and both are back to full
//     when they rest.
//  2. The viewer is never left between two reels: if it rests misaligned (a smooth scroll cut short by a touch, for
//     example) it is moved to the nearest reel.
(function() {
  if (window.__igReelTransition) return;
  window.__igReelTransition = true;

  const MIN_OPACITY = 0.3;   // how dim a reel gets when it is a whole screen away
  const inReel = () => /^\/reels?\//.test(location.pathname);
  const items = () => document.querySelectorAll('.vertically-snappable');
  const touching = () => !!(window.__igTouch && (window.__igTouch.down || Date.now() - window.__igTouch.endAt < 900));

  // --- 1. fade with the distance to the resting place
  const applyFade = () => {
    let moving = false;
    items().forEach(it => {
      const r = it.getBoundingClientRect();
      const h = r.height || 1;
      const d = Math.abs(r.top) / h;                      // 0 at rest, 1 a whole reel away
      if (r.bottom < -h || r.top > innerHeight + h) { if (it.style.opacity) it.style.removeProperty('opacity'); return; }
      if (d > 0.01 && d < 1) moving = true;
      const o = d < 0.01 ? '' : String(Math.max(MIN_OPACITY, 1 - (1 - MIN_OPACITY) * Math.min(1, d)).toFixed(2));
      if (o === '') { if (it.style.opacity) it.style.removeProperty('opacity'); }
      else if (it.style.opacity !== o) it.style.setProperty('opacity', o);
    });
    return moving;
  };
  let raf = 0;
  const loop = () => {
    raf = 0;
    if (!inReel()) { items().forEach(it => it.style.removeProperty('opacity')); return; }
    const moving = applyFade();
    if (touching() || moving) raf = requestAnimationFrame(loop);
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
  ['touchstart', 'touchmove', 'touchend', 'scroll'].forEach(n => document.addEventListener(n, kick, { capture: true, passive: true }));

  // --- 2. never rest between two reels
  let lastTop = null, stableSince = 0;
  setInterval(() => {
    if (!inReel() || touching()) { lastTop = null; return; }
    const its = [...items()];
    if (!its.length) return;
    let best = null, bd = Infinity;
    its.forEach(it => { const t = it.getBoundingClientRect().top; if (Math.abs(t) < bd) { bd = Math.abs(t); best = it; } });
    if (!best || bd < 3) { lastTop = null; return; }                       // aligned
    if (lastTop === null || Math.abs(bd - lastTop) > 1) { lastTop = bd; stableSince = Date.now(); return; }   // still moving
    if (Date.now() - stableSince < 500) return;                            // give Instagram its own settle time
    lastTop = null;
    best.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, 250);
})();
