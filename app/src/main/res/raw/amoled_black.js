// AMOLED black for Instagram's dark theme: pure black page, near-black cards.
(function() {
  const style = document.createElement('style');
  style.textContent = `
    html.__fb-dark-mode, html._aa4d {
      --ig-primary-background: 0, 0, 0 !important;
      --ig-secondary-background: 14, 14, 14 !important;
      --ig-elevated-background: 8, 8, 8 !important;
      --ig-banner-background: 0, 0, 0 !important;
      --ig-highlight-background: 20, 20, 20 !important;
      --card-background: #000 !important;
      --nav-bar-background: #000 !important;
    }`;
  document.head.appendChild(style);
})();
