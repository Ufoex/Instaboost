// Hide sponsored posts (the network-level blocker handles trackers).
igWatch(() => igArticlesWith(IG_SPONSORED).forEach(igHide));
