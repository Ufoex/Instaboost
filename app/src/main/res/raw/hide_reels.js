// Hide the Reels tab and reels shown inside the feed.
igWatch(() => {
  document.querySelectorAll('a[href="/reels/"]').forEach(a => {
    let p = a;
    while (p.parentElement && p.parentElement.children.length < 4 && p.parentElement !== document.body) p = p.parentElement;
    p.style.display = 'none';
  });
  document.querySelectorAll('article').forEach(a => { if (a.querySelector('a[href*="/reel/"]')) igHide(a); });
});
