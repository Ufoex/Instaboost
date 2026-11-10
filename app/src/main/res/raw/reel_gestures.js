// Reel gestures: hold the video to play it faster (instead of Facebook's copy-link). Double tap,
// by thirds of the screen: left goes back, middle likes (a second time takes the like back),
// right goes forward. Values come from
// window.__mbReel ({rate, skip}) which the app prepends from the settings.
(function() {
    if (window.__mbReelGestures) return;
    window.__mbReelGestures = true;
    const cfg = window.__mbReel || { rate: 2, skip: 10 };
    const HOLD_MS = 350, DOUBLE_MS = 300, MOVE = 12, EDGE = 32;

    // Instagram pauses a reel by itself after about 0.3 s of a finger held on it, and pauses it again if it
    // is resumed while the finger is still down. While a finger stays down on a reel (until it moves or lifts)
    // that pause is ignored, so holding speeds the reel up instead of stopping it. The app's own pauses
    // (reel_tap_pause.js) set window.__igAllowPause and go through.
    let holdGuard = 0;
    const nativePause = HTMLMediaElement.prototype.pause;
    HTMLMediaElement.prototype.pause = function() {
        if (holdGuard > Date.now() && !window.__igAllowPause) return;
        return nativePause.apply(this, arguments);
    };

    const inReel = () => {
        const p = location.pathname;
        return /^\/reels?\//.test(p) || (p.indexOf('/videos/') !== -1 && !!document.querySelector('.vertically-snappable video'));
    };
    const activeVideo = () => {
        let best = null, area = 0;
        document.querySelectorAll('video').forEach(v => {
            const r = v.getBoundingClientRect();
            const w = Math.max(0, Math.min(r.right, innerWidth) - Math.max(r.left, 0));
            const h = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0));
            if (w * h > area) { area = w * h; best = v; }
        });
        return best;
    };

    let badge;
    // [x, y]: show it just above the finger (the finger covers its own spot), else top centre.
    const say = (txt, ms, x, y) => {
        if (!badge) {
            badge = document.createElement('div');
            badge.id = 'mb-reel-badge';
            badge.style.cssText = 'position:fixed;z-index:2147483000;' +
                'padding:6px 14px;border-radius:16px;background:rgba(0,0,0,.65);color:#fff;font:600 15px sans-serif;' +
                'pointer-events:none;display:none';
            document.body.appendChild(badge);
        }
        if (x === undefined) { badge.style.left = '50%'; badge.style.top = '14%'; badge.style.transform = 'translateX(-50%)'; }
        else {
            badge.style.left = Math.max(40, Math.min(innerWidth - 40, x)) + 'px';
            badge.style.top = Math.max(40, y - 80) + 'px';
            badge.style.transform = 'translate(-50%,-50%)';
        }
        badge.textContent = txt;
        badge.style.display = 'block';
        clearTimeout(badge._t);
        if (ms) badge._t = setTimeout(() => { badge.style.display = 'none'; }, ms);
    };
    const hideBadge = () => { if (badge) badge.style.display = 'none'; };

    // The like button is the only action-rail button with a long-press action (the reaction
    // picker), so it is found without depending on the page language. Reels are stacked: take
    // the one on screen.
    // Instagram's mobile site does not like on a double tap (its tap only turns the sound on or off), so the
    // like is done here: the heart of the reel on screen, in the right-hand rail. Its label tells whether it is
    // already liked ("Me gusta" / "Quitar Me gusta", and the other languages' equivalents).
    const likeButton = () => {
        let best = null, bestDist = Infinity;
        document.querySelectorAll('svg[aria-label]').forEach(svg => {
            const r = svg.getBoundingClientRect();
            const cy = (r.top + r.bottom) / 2;
            if (!r.width || r.left < innerWidth * 0.6 || cy < 0 || cy > innerHeight) return;
            if (!/^(me gusta|like|quitar me gusta|unlike|j.aime|je n.aime plus|gef.llt mir|gef.llt mir nicht mehr|mi piace|non mi piace pi.)$/i.test(svg.getAttribute('aria-label').trim())) return;
            const d = Math.abs(cy - innerHeight / 2);
            if (d < bestDist) { bestDist = d; best = svg; }
        });
        return best && (best.closest('[role="button"], button') || best.parentElement);
    };
    const isLiked = (b) => {
        const svg = b.querySelector('svg[aria-label]');
        return !!svg && /^(quitar me gusta|unlike|je n.aime plus|gef.llt mir nicht mehr|non mi piace pi.)$/i.test(svg.getAttribute('aria-label').trim());
    };
    // Our own animations, on <body>: Facebook's live inside the action rail, which hide mode makes
    // invisible, so they would never show there.
    const ICON = {
        up: ['M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z', '#1877f2'],
        down: ['M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z', '#cfd2d6'],
        heart: ['M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z', '#ff3040'],
        fwd: ['M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z', '#ffffff'],
        back: ['M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z', '#ffffff']
    };
    // An icon (and an optional caption) that pops in at the tap, drifts dx pixels and fades out.
    const pop = (x, y, kind, caption, dx) => {
        const [path, fill] = ICON[kind];
        const el = document.createElement('div');
        el.id = 'mb-reel-anim';
        el.style.cssText = 'position:fixed;left:' + x + 'px;top:' + y + 'px;width:96px;margin:-48px 0 0 -48px;z-index:2147483000;' +
            'pointer-events:none;display:flex;flex-direction:column;align-items:center;' +
            'filter:drop-shadow(0 2px 6px rgba(0,0,0,.55))';
        el.innerHTML = '<svg viewBox="0 0 24 24" width="96" height="96" fill="' + fill + '"><path d="' + path + '"/></svg>' +
            (caption ? '<span style="margin-top:-6px;color:#fff;font:700 18px sans-serif">' + caption + '</span>' : '');
        document.body.appendChild(el);
        el.animate([
            { transform: 'scale(.3)', opacity: 0 },
            { transform: 'scale(1.15)', opacity: 1, offset: .3 },
            { transform: 'translateX(' + dx * .4 + 'px) scale(1)', opacity: 1, offset: .65 },
            { transform: 'translateX(' + dx + 'px) scale(1.1)', opacity: 0 }
        ], { duration: 800, easing: 'ease-out' }).onfinish = () => el.remove();
    };
    // Double tap in the middle: like, or take the like back when the reel already has one.
    const likeReel = (x, y) => {
        const b = likeButton();
        if (b && !isLiked(b)) b.click();            // like once; a double tap never takes the like back
        pop(x, y, 'heart', '', 0);
    };
    // Which third of the screen: -1 left (back), 0 middle (like), 1 right (forward).
    const zoneOf = (x) => x < innerWidth / 3 ? -1 : x > innerWidth * 2 / 3 ? 1 : 0;

    let st = null, lastTap = null, swallowUntil = 0;

    const onUI = (t) => !!(t.closest && t.closest('button,a,input,[role=button],[role=link],[role=slider],#mb-reel-controls,[id^=mb-reel-]'));

    document.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1 || !inReel() || onUI(e.target)) { st = null; return; }
        const v = activeVideo();
        if (!v) { st = null; return; }
        const t = e.touches[0];
        // Starting at a screen edge = the system back gesture: it takes the touch without sending moves.
        if (t.clientX < EDGE || t.clientX > innerWidth - EDGE) { st = null; return; }
        st = { x: t.clientX, y: t.clientY, t0: Date.now(), v, held: false, moved: false, target: e.target, wasPaused: v.paused };
        // Instagram pauses a held reel after ~0.3 s. The guard that ignores that pause is armed only once the finger
        // has stayed still for 200 ms: a tap or a swipe never has it, so the pause Instagram makes when a reel
        // leaves the screen always goes through (an ignored one left the old reel playing under the new one).
        holdGuard = 0;
        const armed = st;
        setTimeout(() => { if (st === armed && !armed.moved) holdGuard = Date.now() + 8000; }, 200);
        st.timer = setTimeout(() => {
            if (!st || st.moved) return;
            st.held = true;
            st.rate0 = v.playbackRate;
            v.playbackRate = cfg.rate;
            if (v.paused) v.play();
            say(cfg.rate + 'x', 0, st.x, st.y);
            // Back gesture while holding: no touchend/touchcancel may arrive, but the reel is gone.
            const s = st;
            s.dog = setInterval(() => {
                if (inReel() && document.contains(s.v)) return;
                clearInterval(s.dog);
                if (st === s) st = null;
                s.v.playbackRate = s.rate0 || 1;
                hideBadge();
            }, 200);
            // (Facebook's long-press had to be cancelled here; Instagram's hold-to-pause is ignored by holdGuard.)
        }, HOLD_MS);
    }, { capture: true, passive: true });

    document.addEventListener('touchmove', (e) => {
        if (!st || st.held) return;
        const t = e.touches[0];
        if (Math.abs(t.clientX - st.x) > MOVE || Math.abs(t.clientY - st.y) > MOVE) { st.moved = true; clearTimeout(st.timer); holdGuard = 0; }
    }, { capture: true, passive: true });

    document.addEventListener('touchend', (e) => {
        holdGuard = 0;
        const s = st; st = null;
        if (!s) return;
        clearTimeout(s.timer); clearInterval(s.dog);
        if (s.held) {
            s.v.playbackRate = s.rate0 || 1;
            hideBadge();
            swallowUntil = Date.now() + 250;
            e.preventDefault(); // no stopPropagation: copy_post_text.js must still see touchend to cancel its 1 s timer
            return;
        }
        if (s.moved || Date.now() - s.t0 > 250) { lastTap = null; return; }
        const now = Date.now();
        const side = zoneOf(s.x);
        if (lastTap && now - lastTap.t < DOUBLE_MS && lastTap.side === side) {
            const v = s.v;
            window.__igDoubleTapAt = now;            // reel_tap_pause.js drops the pause of the first tap
            if (side === 0) likeReel(s.x, s.y);
            else {
                if (isFinite(v.duration)) v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + side * cfg.skip));
                pop(s.x, s.y, side < 0 ? 'back' : 'fwd', cfg.skip + ' s', side * 40);
            }
            // the first tap already toggled play/pause: put it back
            const was = lastTap.wasPaused;
            setTimeout(() => { if (v.paused !== was) was ? v.pause() : v.play(); }, 80);
            swallowUntil = now + 250;
            lastTap = null;
            e.preventDefault();
        } else {
            lastTap = { t: now, side, wasPaused: s.wasPaused };
        }
    }, { capture: true, passive: false });

    // The system back gesture steals the touch: the page gets a real touchcancel, never a touchend,
    // so drop the hold here. Our own synthetic touchcancel (above) is not trusted and is ignored.
    document.addEventListener('touchcancel', (e) => {
        if (!e.isTrusted) return;
        holdGuard = 0;
        const s = st; st = null;
        if (!s) return;
        clearTimeout(s.timer); clearInterval(s.dog);
        if (s.held) { s.v.playbackRate = s.rate0 || 1; hideBadge(); swallowUntil = Date.now() + 250; }
    }, { capture: true, passive: true });

    // The click that follows a hold / double tap must not pause the video or open anything. Only that one
    // click (and the mouse events of the same touch) is swallowed, and only for a moment. A pointerup is never
    // swallowed: if Instagram misses the finger lifting it keeps believing the reel is held, and pauses it
    // again every time it plays (the video stays stuck until the page is reloaded).
    ['click', 'mouseup'].forEach(n => document.addEventListener(n, (e) => {
        if (Date.now() < swallowUntil) {
            e.preventDefault(); e.stopPropagation();
            if (n === 'click') swallowUntil = 0;
        }
    }, true));
    document.addEventListener('contextmenu', (e) => { if (inReel() && !onUI(e.target)) e.preventDefault(); }, true);
})();
