// Material You: the system accent colour replaces Instagram's blue (buttons, links, highlights).
(function() {
  if (!window.MaterialYouBridge) return;
  const p = JSON.parse(window.MaterialYouBridge.getMaterialYouPrimaryRgb());
  const rgb = `${p.r}, ${p.g}, ${p.b}`;
  const hex = window.MaterialYouBridge.getMaterialYouPrimaryRgbString();
  const on = window.MaterialYouBridge.getMaterialYouOnPrimaryRgbString();
  const style = document.createElement('style');
  style.textContent = `
    ::selection { background: rgba(${rgb}, 0.5); color: ${on}; }
    html, html.__fb-dark-mode, html.__fb-light-mode {
      --ig-primary-button: ${rgb} !important;
      --ig-primary-button-hover: ${rgb} !important;
      --ig-link: ${rgb} !important;
      --primary-button-background: ${hex} !important;
      --blue-link: ${hex} !important;
      --accent: ${hex} !important;
      --highlight-bg: rgba(${rgb}, 0.2) !important;
    }`;
  document.head.appendChild(style);
})();
