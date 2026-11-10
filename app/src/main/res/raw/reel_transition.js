// Switching reels: the reel that lands on screen pops in (a quick fade and scale up). It uses the
// separate `scale` property: animating `transform` would replace the offset Instagram puts on each
// reel and make the video jump.
(function() {
  if (window.__igReelTransition) return;
  window.__igReelTransition = true;
  let last = '';

  const active = () => {
    let best = null, area = 0;
    document.querySelectorAll('.vertically-snappable').forEach(it => {
      const r = it.getBoundingClientRect();
      const h = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0));
      if (h > area) { area = h; best = it; }
    });
    return best;
  };

  // Instagram keeps the address on the reel in view: a new address inside the viewer = a new reel.
  setInterval(() => {
    const p = /^\/reels?\//.test(location.pathname) ? location.pathname : '';
    const prev = last;
    last = p;
    if (!p || !prev || p === prev) return;       // leaving, entering (has its own animation) or same reel
    const it = active();
    if (it) it.animate(
      [{ opacity: 0.35, scale: '0.94' }, { opacity: 1, scale: '1' }],
      { duration: 300, easing: 'cubic-bezier(.2,.8,.2,1)' });
  }, 100);
})();
