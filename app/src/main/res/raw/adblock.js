window.__igSkipAds = true;   // the reels viewer also skips ads (see reel_transition.js)
// Hide sponsored posts (the network-level blocker handles trackers).
igWatch(() => igArticlesWith(IG_SPONSORED).forEach(igHide));
