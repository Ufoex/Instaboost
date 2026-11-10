// Hide sponsored posts (the network-level blocker handles trackers).
igWatch(() => igArticlesWith(IG_SPONSORED).forEach(a => { a.style.display = 'none'; }));
