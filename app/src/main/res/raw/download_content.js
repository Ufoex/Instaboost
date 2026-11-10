// Download button for Instagram: reels, posts (every slide of a carousel) and stories. The media
// URLs come from the same JSON the site itself uses (/api/v1/media/<id>/info/, with the logged-in
// session), so reels arrive as a normal muxed MP4 and photos in full size. The file is saved by
// the app (DownloadBridge), not by the page.
(function() {
  if (window.__igDownloader) return;
  window.__igDownloader = true;
  const BTN_ID = 'ib-download';
  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  const ICON = '<svg viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>';

  const dlCall = (name, a, b) => {
    if (window.InstaboostDownloads) window.InstaboostDownloads.postMessage(JSON.stringify({ call: name, a: a, b: b }));
    else if (window.DownloadBridge && window.DownloadBridge[name]) window.DownloadBridge[name](a, b);
  };

  // Post shortcode (the code in /p/<code>/) -> numeric media id.
  const shortcodeToId = (code) => {
    let n = 0n;
    for (const ch of code) n = n * 64n + BigInt(ALPHABET.indexOf(ch));
    return n.toString();
  };
  const codeIn = (s) => { const m = (s || '').match(/\/(?:p|reels?|tv)\/([A-Za-z0-9_-]+)/); return m && m[1]; };

  const nearCenter = (els) => {
    let best = null, bd = Infinity;
    els.forEach(e => {
      const r = e.getBoundingClientRect();
      if (r.bottom <= 0 || r.top >= innerHeight || !r.height) return;
      const d = Math.abs((r.top + r.bottom) / 2 - innerHeight / 2);
      if (d < bd) { bd = d; best = e; }
    });
    return best;
  };

  // The media on screen as a numeric id: from the address (story, post, reel) or, in the feed and
  // in the reels list, from the post nearest the middle of the screen.
  const targetId = () => {
    const path = location.pathname;
    const story = path.match(/^\/stories\/[^/]+\/(\d+)/);
    if (story) return story[1];
    const direct = /^\/reels\/?$/.test(path) ? null : codeIn(path);
    if (direct) return shortcodeToId(direct);
    const item = nearCenter([...document.querySelectorAll('.vertically-snappable, article')]);
    const link = item && item.querySelector('a[href*="/p/"], a[href*="/reel/"], a[href*="/reels/"]');
    const code = link ? codeIn(link.getAttribute('href')) : codeIn(path);
    return code ? shortcodeToId(code) : null;
  };

  const best = (it) => {
    if (it.video_versions && it.video_versions.length) return { url: it.video_versions[0].url, mime: 'video/mp4' };
    const c = it.image_versions2 && it.image_versions2.candidates;
    return c && c.length ? { url: c[0].url, mime: 'image/jpeg' } : null;
  };

  let busy = false;
  const download = async () => {
    if (busy) return;
    const id = targetId();
    if (!id) return dlCall('toast', 'Nothing to download here');
    busy = true;
    try {
      const res = await fetch('/api/v1/media/' + id + '/info/', {
        credentials: 'include',
        headers: { 'X-IG-App-ID': '936619743392459', 'X-Requested-With': 'XMLHttpRequest' }
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const item = ((await res.json()).items || [])[0];
      if (!item) throw new Error('no media');
      const files = (item.carousel_media || [item]).map(best).filter(Boolean);
      if (!files.length) throw new Error('no media');
      files.forEach(f => dlCall('downloadUrl', JSON.stringify(f.mime === 'video/mp4' ? { progressive: [f.url] } : [f.url]), f.mime));
    } catch (e) {
      dlCall('toast', 'Download failed: ' + (e && e.message || e));
    } finally {
      busy = false;
    }
  };

  const btn = document.createElement('button');
  btn.id = BTN_ID;
  btn.setAttribute('aria-label', 'Download content');
  btn.innerHTML = ICON;
  btn.style.cssText = 'position:fixed;right:12px;z-index:2147483000;width:44px;height:44px;border:0;border-radius:50%;' +
    'background:rgba(0,0,0,.6);display:none;align-items:center;justify-content:center;padding:0;opacity:.85';
  btn.addEventListener('click', (e) => { e.stopPropagation(); download(); });
  document.body.appendChild(btn);

  // Elsewhere it floats at the bottom right, clear of the tab bar. On reels it joins the other reel
  // buttons: reel_controls.js lays them out in a column, lets you move them (hold one) and keeps
  // the layout, once this button is marked "visible".
  const place = () => {
    const p = location.pathname;
    const signedIn = !!document.querySelector('a[href="/direct/inbox/"]');
    const onReels = /^\/reels?\//.test(p);
    const media = signedIn && (p === '/' || onReels || /^\/(p|tv|stories)\//.test(p));
    btn.style.display = media ? 'flex' : 'none';
    btn.classList.toggle('visible', onReels);
    if (onReels) { btn.style.bottom = 'auto'; return; }   // position: reel_controls.js
    btn.style.right = '12px';
    btn.style.left = 'auto';
    btn.style.top = 'auto';
    btn.style.bottom = ((window.igNavHeight ? igNavHeight() : 0) + 16) + 'px';
  };
  place();
  setInterval(place, 200);
})();
