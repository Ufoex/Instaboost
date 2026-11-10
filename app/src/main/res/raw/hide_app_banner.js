// Hide Instagram's "Use app" bar above the tab bar.
(function() {
  // Known class (fast, no JS cost once the style is in) ...
  const style = document.createElement('style');
  style.textContent = 'div._acc8._abpk{display:none!important}';
  document.documentElement.appendChild(style);

  // ... and a fallback for when the obfuscated classes change: a short fixed bar whose
  // button reads "Use app" / "Open app" in the usual languages.
  const TEXT = /^(usar|use|open|abrir|utiliser|ouvrir|app)\b.*\b(app|aplicaci|application)/i;
  const sweep = () => {
    document.querySelectorAll('button').forEach(b => {
      if (!TEXT.test(b.textContent.trim())) return;
      for (let p = b.parentElement, i = 0; p && i < 4; p = p.parentElement, i++) {
        if (getComputedStyle(p).position === 'fixed') { p.style.display = 'none'; return; }
      }
    });
  };
  sweep();
  let t;
  new MutationObserver(() => { clearTimeout(t); t = setTimeout(sweep, 300); })
    .observe(document.body, { childList: true, subtree: true });
})();
