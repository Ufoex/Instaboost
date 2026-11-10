// Tap a video in the feed to open it (Instagram only pauses it): goes to the full-screen reels
// viewer at that video. A double tap still likes, so the jump waits a moment and is dropped by a second tap.
(function() {
  if (window.__igOpenVideo) return;
  window.__igOpenVideo = true;
  const WAIT = 260;
  let timer = 0;
  let unpress = () => {};

  const videoAt = (x, y) => {
    for (const v of document.querySelectorAll('article video')) {
      const r = v.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return v;
    }
    return null;
  };


  // Instagram takes a second or so to build the viewer: until the reel plays, the frame you were
  // watching stays on screen so the tap answers at once instead of showing a black page.
  const cover = (v) => {
    try {
      const w = Math.min(v.videoWidth, 540), h = Math.round(w * v.videoHeight / v.videoWidth);
      if (!w || !h) return null;
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      c.getContext('2d').drawImage(v, 0, 0, w, h);
      const r = v.getBoundingClientRect();
      return { src: c.toDataURL('image/jpeg', 0.7), rect: { l: r.left, t: r.top, w: r.width, h: r.height }, ratio: w / h };
    } catch (e) { return null; }
  };
  const showCover = (f) => {
    if (!f) return;
    const el = document.createElement('div');
    el.id = 'ig-open-cover';
    el.style.cssText = 'position:fixed;inset:0;z-index:2147482000;background:#000;overflow:hidden';
    const img = document.createElement('img');
    img.src = f.src;
    img.style.cssText = 'position:absolute;object-fit:cover;border-radius:0';
    // where it ends: the whole frame, as large as fits the screen, centred
    const vw = innerWidth, vh = innerHeight;
    const w = Math.min(vw, vh * f.ratio), h = w / f.ratio;
    const to = { left: (vw - w) / 2 + 'px', top: (vh - h) / 2 + 'px', width: w + 'px', height: h + 'px' };
    const from = { left: f.rect.l + 'px', top: f.rect.t + 'px', width: f.rect.w + 'px', height: f.rect.h + 'px' };
    Object.assign(img.style, from);
    el.appendChild(img);
    el.style.background = 'rgba(0,0,0,0)';
    document.body.appendChild(el);
    const ease = { duration: 280, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' };
    el.animate([{ background: 'rgba(0,0,0,0)' }, { background: 'rgba(0,0,0,1)' }], ease);
    img.animate([from, to], ease);
    const t0 = Date.now();
    const done = () => { el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250, fill: 'forwards' }); setTimeout(() => el.remove(), 280); };
    (function wait() {
      const playing = [...document.querySelectorAll('video')].some(v => !v.paused && v.currentTime > 0.05 && v.readyState >= 3);
      if ((playing && /^\/reels\//.test(location.pathname) && Date.now() - t0 > 320) || Date.now() - t0 > 6000) done();
      else setTimeout(wait, 60);
    })();
  };

  // A small press effect on the video while the tap waits to see if it is a double tap.
  const press = (v) => {
    const a = v.animate([{ transform: 'scale(1)' }, { transform: 'scale(.97)' }], { duration: 120, fill: 'forwards', easing: 'ease-out' });
    return () => a.cancel();
  };

  document.addEventListener('click', (e) => {
    if (location.pathname !== '/' || !e.isTrusted) return;
    if (timer) { clearTimeout(timer); timer = 0; unpress(); return; }   // second tap: a double tap
    if (e.target.closest && e.target.closest('button, a, [role="button"], [role="link"], input')) return;
    const v = videoAt(e.clientX, e.clientY);
    const link = v && v.closest('article').querySelector('a[href*="/reel/"], a[href*="/p/"]');
    if (!link) return;
    const code = (link.getAttribute('href').match(/\/(?:p|reel)\/([\w-]+)/) || [])[1];
    if (!code) return;
    const frame = cover(v);
    unpress = press(v);
    timer = setTimeout(() => {
      timer = 0;
      showCover(frame);
      unpress();
      // the reels viewer, opened as a page change (the feed keeps its place for Back)
      window.__igFromFeed = true;
      history.pushState({}, '', '/reels/' + code + '/');
      window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
    }, WAIT);
  }, true);
})();
