// Collapsing toolbar: hide Instagram's top bar and tab bar when scrolling down and bring them
// back on any scroll up (home feed and other pages that scroll the document itself).
(function() {
    if (window.__mbCollapsingToolbar) return;
    window.__mbCollapsingToolbar = true;

    const THRESHOLD = 6;   // px of movement before a direction change counts
    let hidden = false, prev = 0;

    const tabBar = () => {
        for (let p = document.querySelector('a[href="/direct/inbox/"]'); p; p = p.parentElement) {
            if (getComputedStyle(p).position === 'fixed') return p;
        }
        return null;
    };
    const setHidden = (hide) => {
        [[document.querySelector('header'), -1], [tabBar(), 1]].forEach(([el, dir]) => {
            if (!el) return;
            el.style.transition = 'transform 0.25s ease';
            el.style.transform = hide ? `translateY(${dir * el.offsetHeight}px)` : '';
        });
        hidden = hide;
    };

    window.addEventListener('scroll', () => {
        const top = document.scrollingElement ? document.scrollingElement.scrollTop : window.scrollY;
        const dy = top - prev;
        if (top <= 0) { prev = top; if (hidden) setHidden(false); return; }
        if (Math.abs(dy) < THRESHOLD) return;
        prev = top;
        if (dy > 0 && top > 80 && !hidden) setHidden(true);
        else if (dy < 0 && hidden) setHidden(false);
    }, { passive: true });
})();
