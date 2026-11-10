package com.ufoex.instaboost

import org.junit.Assert.assertEquals
import org.junit.Test
import com.ufoex.instaboost.utils.fbRedirectSanitizer
import com.ufoex.instaboost.utils.isWebViewRenderable

/**
 * Exercises the real classification + sanitize pair the interceptor runs, in the same
 * order, so a regression in either step shows up here instead of on a user's phone.
 */
class ExternalLinkPipelineTest {

    private fun handOff(url: String): String =
        if (isWebViewRenderable(url)) "in-webview" else fbRedirectSanitizer(url)

    @Test
    fun externalLinkReachesBrowserIntact() {
        assertEquals("https://example.com/search?q=hello%20world",
            handOff("https://example.com/search?q=hello%20world"))
        assertEquals("https://example.com/page#section-3",
            handOff("https://example.com/page#section-3"))
    }

    // Instagram's own l.instagram.com redirector: the destination is what should reach the browser.
    @Test
    fun redirectorHandsOffUnwrappedDestination() {
        assertEquals("https://example.com/article", handOff(
            "https://l.instagram.com/?u=https%3A%2F%2Fexample.com%2Farticle&e=ATabc&fbclid=Qz"
        ))
    }

    @Test
    fun instagramStaysPut() {
        assertEquals("in-webview", handOff("https://www.instagram.com/p/abc/"))
        assertEquals("in-webview", handOff("https://www.instagram.com/"))
    }

    @Test
    fun trackingParamsAreStripped() {
        assertEquals("https://news.example.com/p?id=7",
            handOff("https://news.example.com/p?id=7&fbclid=abc123"))
    }
}