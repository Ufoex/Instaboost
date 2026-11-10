// Hide "Suggested for you" posts from accounts you don't follow.
igWatch(() => igArticlesWith(IG_SUGGESTED).forEach(a => { a.style.display = 'none'; }));
