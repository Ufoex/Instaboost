package com.ufoex.instaboost

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import com.ufoex.instaboost.utils.fbRedirectSanitizer
import com.ufoex.instaboost.utils.intentUrl
import com.ufoex.instaboost.utils.isWebViewRenderable

class ExternalLinkTest {

    // Keeps Instagram in the app...
    @Test
    fun instagramStaysInWebView() {
        listOf(
            "https://www.instagram.com/p/abc123/",
            "https://m.instagram.com/someone/",
            "https://instagram.com/",
            // The bare root must stay too, or it would reload Instagram in the browser.
            "https://www.instagram.com",
            "https://ig.me/m/someone",
            "https://instagr.am/p/abc",
        ).forEach { assertTrue(it, isWebViewRenderable(it)) }
    }

    // ...and sends everything else to the default browser.
    @Test
    fun everythingElseLeavesTheApp() {
        listOf(
            "https://example.com/article",
            "https://news.example.org/story?id=7",
            // Host must be compared, not searched for anywhere in the string.
            "https://evil.com/instagram.com/x",
            // Short-link redirectors only ever point off-site, so they must leave too.
            "https://l.instagram.com/?u=https%3A%2F%2Fexample.com%2Fa",
            // Facebook is another site now.
            "https://www.facebook.com/x",
        ).forEach { assertFalse(it, isWebViewRenderable(it)) }
    }

    // WebView can't render app deep links; they must reach the owning app.
    @Test
    fun deepLinksAreNotRenderableInWebView() {
        listOf(
            "instagram-stories://share",
            "market://details?id=com.example",
            "intent://example.com/#Intent;scheme=https;package=com.example;end",
            "tel:+123456",
            "mailto:someone@example.com",
        ).forEach { assertFalse(it, isWebViewRenderable(it)) }
    }

    // The Instagram app's deep links become instagram.com pages; web links are untouched.
    @Test
    fun appDeepLinksMapToWeb() {
        mapOf(
            "instagram://user?username=nasa" to "https://www.instagram.com/nasa/",
            "instagram://user" to "https://www.instagram.com/",
            "instagram://mailbox" to "https://www.instagram.com/direct/inbox/",
            "instagram://media?id=1" to "https://www.instagram.com/",
            "instagram://camera" to "https://www.instagram.com/",
            "instagram://unknownthing" to "https://www.instagram.com/",
            "https://www.instagram.com/x" to "https://www.instagram.com/x",
        ).forEach { (link, url) -> assertEquals(link, url, intentUrl(link)) }
    }

    // The old sanitizer re-encoded URL.query, so "hello%20world" came out as
    // "hello%2520world" and the browser got a broken URL.
    @Test
    fun sanitizerKeepsQueryIntact() {
        assertEquals(
            "https://example.com/search?q=hello%20world",
            fbRedirectSanitizer("https://example.com/search?q=hello%20world")
        )
        assertEquals(
            "https://example.com/search?q=hello+world",
            fbRedirectSanitizer("https://example.com/search?q=hello+world")
        )
    }

    @Test
    fun sanitizerStripsFbclidAndKeepsFragment() {
        assertEquals(
            "https://news.example.com/story?id=7",
            fbRedirectSanitizer("https://news.example.com/story?utm_source=fb&id=7&fbclid=xyz")
        )
        // Functional parameters stay: ref/set/source are part of the pages themselves.
        assertEquals(
            "https://example.com/a?set=a.12&ref=x&source=y",
            fbRedirectSanitizer("https://example.com/a?set=a.12&ref=x&source=y&__tn__=-R")
        )
        assertEquals(
            "https://example.com/page#section-3",
            fbRedirectSanitizer("https://example.com/page#section-3")
        )
    }

    // l.instagram.com/?u= carries the real destination; unwrap it.
    @Test
    fun sanitizerUnwrapsInstagramRedirector() {
        assertEquals(
            "https://example.com/article",
            fbRedirectSanitizer(
                "https://l.instagram.com/?u=https%3A%2F%2Fexample.com%2Farticle&e=ATabc"
            )
        )
    }

    // A URL we can't parse must survive untouched rather than become a broken one.
    @Test
    fun sanitizerReturnsInputWhenUnparseable() {
        assertEquals("not a url at all", fbRedirectSanitizer("not a url at all"))
    }
}