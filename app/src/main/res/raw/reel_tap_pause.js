// Reels viewer, as in Instaboost: a tap on the screen pauses / resumes the reel (Instagram's own tap
// toggles the volume), and the sound is always on.
(function() {
  if (window.__igTapPause) return;
  window.__igTapPause = true;
  const inReel = () => /^\/reels?\//.test(location.pathname);

  const centerVideo = () => {
    for (const v of document.querySelectorAll('video')) {
      const r = v.getBoundingClientRect();
      if (r.top < innerHeight / 2 && r.bottom > innerHeight / 2) return v;
    }
    return null;
  };

  // --- sound always on: Instagram starts reels muted and its tap toggles the sound. Muting is simply not
  // allowed on a reel page: the `muted = true` assignment is ignored, so the sound never goes off.
  const mutedDesc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'muted');
  if (mutedDesc && mutedDesc.set) {
    Object.defineProperty(HTMLMediaElement.prototype, 'muted', {
      configurable: true, enumerable: mutedDesc.enumerable, get: mutedDesc.get,
      set(v) { mutedDesc.set.call(this, inReel() ? false : v); }
    });
  }
  // (and, as a safety net, anything that still ends up muted is put back at once)
  document.addEventListener('volumechange', (e) => {
    const v = e.target;
    if (inReel() && v instanceof HTMLVideoElement && v.muted) v.muted = false;
  }, true);
  setInterval(() => {
    if (!inReel()) return;
    document.querySelectorAll('video').forEach(v => { if (v.muted) v.muted = false; });
  }, 300);

  // --- the badge shown in the middle: our pause / play icon. Instagram flashes a volume icon there on
  // every tap (its tap toggles the sound), which is wrong now, so that one is hidden for a moment
  // after a tap (not after a double tap: the like heart must show).
  const PAUSE = 'M6 19h4V5H6v14zm8-14v14h4V5h-4z', PLAY = 'M8 5v14l11-7z';
  let badge = null;
  const flash = (path) => {
    if (!badge || !badge.isConnected) {
      badge = document.createElement('div');
      badge.id = 'mb-reel-flash-tap';
      badge.style.cssText = 'position:fixed;left:50%;top:50%;width:88px;height:88px;margin:-44px 0 0 -44px;' +
        'border-radius:50%;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;' +
        'z-index:2147483000;pointer-events:none;opacity:0';
      document.body.appendChild(badge);
    }
    badge.innerHTML = '<svg width="52" height="52" viewBox="0 0 24 24" fill="#fff"><path d="' + path + '"/></svg>';
    if (badge._a) badge._a.cancel();
    badge._a = badge.animate([
      { opacity: 0, transform: 'scale(.6)', offset: 0 },
      { opacity: 1, transform: 'scale(1.08)', offset: .15 },
      { opacity: 1, transform: 'scale(1)', offset: .25 },
      { opacity: 1, transform: 'scale(1)', offset: .6 },
      { opacity: 0, transform: 'scale(1.25)', offset: 1 }
    ], { duration: 800, easing: 'ease-out' });
  };

  // Instagram's volume badge (a small circle with a speaker in the middle of the reel) is shown on every
  // tap. Right after a tap, once the page changes and again a few times after, the small icons of the
  // reel on screen are checked for one at the centre, and its circle is hidden. Only that reel's icons
  // are read, and not on a fixed timer: reading every icon every few ms made the tap stutter.
  // The circle is hidden only for the length of that badge and then given back: it may be the same box
  // Instagram uses for the like heart, and a box left hidden would swallow the heart of a double tap.
  let quietUntil = 0, scanQueued = false, restoreTimer = 0;
  const hiddenCircles = new Set();
  const restoreCircles = () => {
    clearTimeout(restoreTimer);
    hiddenCircles.forEach(c => c.style.removeProperty('display'));
    hiddenCircles.clear();
  };
  // A double tap no longer gives the circle back at once: the like heart is our own animation now, so
  // Instagram's volume icon stays hidden until its normal end (restoreTimer).
  const endQuiet = () => {};
  const scanBadge = () => {
    scanQueued = false;
    if (Date.now() > quietUntil) return;
    const v = centerVideo();
    const item = v && v.closest('.vertically-snappable');
    if (!item) return;
    item.querySelectorAll('svg').forEach(svg => {
      if (svg.closest('[id^="mb-reel-"], #ib-download')) return;
      const r = svg.getBoundingClientRect();
      if (r.width > 120) return;
      if (Math.abs(r.left + r.width / 2 - innerWidth / 2) < 70 && Math.abs(r.top + r.height / 2 - innerHeight / 2) < 120) {
        const circle = svg.parentElement;
        if (circle && !hiddenCircles.has(circle)) { circle.style.setProperty('display', 'none', 'important'); hiddenCircles.add(circle); }
      }
    });
  };
  const queueScan = () => { if (!scanQueued) { scanQueued = true; requestAnimationFrame(scanBadge); } };
  new MutationObserver(() => { if (Date.now() <= quietUntil) queueScan(); })
    .observe(document.body, { childList: true, subtree: true, attributes: true });
  const armQuiet = () => {
    quietUntil = Date.now() + 900;
    [30, 90, 180, 320].forEach(ms => setTimeout(queueScan, ms));
    clearTimeout(restoreTimer);
    restoreTimer = setTimeout(restoreCircles, 950);
  };

  // --- tap = pause / resume. A double tap is left to Instagram (like) and to the gestures script
  // (skip back / forward), so the pause waits a moment and is dropped by a second tap. A second tap that
  // comes a little late (after the pause or resume was already done) is still a double tap: the video is
  // put back as it was and Instagram's like goes ahead.
  const WAIT = 220;   // how long a tap waits to see whether it is the first of a double tap
  const LATE = 420;   // a second tap this soon after the first one still counts as a double tap
  let timer = 0, lastToggle = null;
  const setPaused = (v, pause) => {
    if (pause) { window.__igAllowPause = true; v.pause(); window.__igAllowPause = false; }
    else v.play().catch(() => {});
  };
  document.addEventListener('click', (e) => {
    if (!inReel() || !e.isTrusted) return;
    if (e.defaultPrevented) { clearTimeout(timer); timer = 0; endQuiet(); return; }       // swallowed by the gestures script
    if (e.target.closest && e.target.closest('button, a, input, [role="button"], [role="link"], [role="slider"], [id^="mb-reel-"], #ib-download')) return;
    if (timer) { clearTimeout(timer); timer = 0; endQuiet(); return; }                    // second tap: like / skip
    const v = centerVideo();
    if (!v) return;
    if (lastToggle && lastToggle.v === v && Date.now() - lastToggle.clickAt < LATE) {      // late second tap
      const l = lastToggle; lastToggle = null;
      endQuiet();
      if (badge && badge._a) badge._a.cancel();
      setPaused(v, l.wasPaused);                                                           // back to how it was
      return;
    }
    armQuiet();
    const clickAt = Date.now();
    timer = setTimeout(() => {
      timer = 0;
      if (Date.now() - (window.__igDoubleTapAt || 0) < 700) { endQuiet(); return; }   // it was a double tap (like / skip)
      lastToggle = { v, wasPaused: v.paused, clickAt };
      if (v.paused) { v.play().catch(() => {}); flash(PLAY); }
      else { window.__igUserPauseAt = Date.now(); setPaused(v, true); flash(PAUSE); }
    }, WAIT);
  }, true);
})();
