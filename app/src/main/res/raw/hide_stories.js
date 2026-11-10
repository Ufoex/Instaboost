// Hide the stories tray above the feed: the block right before the one that holds the posts.
igWatch(() => {
  for (let p = document.querySelector('article'), i = 0; p && i < 8; p = p.parentElement, i++) {
    const prev = p.previousElementSibling;
    if (prev && prev.offsetHeight > 80 && prev.offsetHeight < 220 &&
        prev.querySelectorAll('[role="button"] canvas, [role="button"] img').length >= 2) {
      igHide(prev);
      return;
    }
  }
});
