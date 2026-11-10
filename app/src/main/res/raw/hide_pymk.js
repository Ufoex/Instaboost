// Hide the "Suggested for you" people carousel that sits between posts.
igWatch(() => {
  document.querySelectorAll('a[href="/explore/people/"]').forEach(link => {
    for (let p = link; p && p !== document.body; p = p.parentElement) {
      if (p.parentElement && p.parentElement.querySelector(':scope > article')) { igHide(p); return; }
    }
  });
});
