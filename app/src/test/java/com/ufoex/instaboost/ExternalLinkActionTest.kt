package com.ufoex.instaboost

import com.ufoex.instaboost.utils.ExternalLinkAction.BLOCK
import com.ufoex.instaboost.utils.ExternalLinkAction.CONFIRM
import com.ufoex.instaboost.utils.ExternalLinkAction.OPEN
import com.ufoex.instaboost.utils.appLinkUrl
import com.ufoex.instaboost.utils.externalLinkAction
import com.ufoex.instaboost.utils.externalTarget
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

// Robolectric: externalTarget parses intent: URIs with Android's Intent.
@RunWith(RobolectricTestRunner::class)
class ExternalLinkActionTest {

    @Test
    fun webEmailAndPhoneOpenDirectly() {
        listOf("https://example.com/a", "http://example.com", "mailto:a@b.c", "tel:+5255").forEach {
            assertEquals(it, OPEN, externalLinkAction(it))
        }
    }

    @Test
    fun codeAndLocalSchemesAreBlocked() {
        listOf("javascript:alert(1)", "file:///sdcard/x", "content://x/y", "data:text/html,hi", "not a url").forEach {
            assertEquals(it, BLOCK, externalLinkAction(it))
        }
    }

    @Test
    fun otherAppsAskFirst() {
        listOf("market://details?id=x", "instagram-stories://share", "whatsapp://send?text=a").forEach {
            assertEquals(it, CONFIRM, externalLinkAction(it))
        }
    }

    @Test
    fun intentLinksOnlyGoToTheirWebFallback() {
        assertEquals(
            "https://example.com/x",
            externalTarget("intent://x#Intent;scheme=app;S.browser_fallback_url=https%3A%2F%2Fexample.com%2Fx;end")
        )
        assertNull(externalTarget("intent://x#Intent;scheme=app;package=com.evil;end"))
        assertNull(externalTarget("intent://x#Intent;scheme=app;S.browser_fallback_url=javascript%3Aalert(1);end"))
        assertEquals("https://example.com/", externalTarget("https://example.com/"))
    }

    @Test
    fun appLinksMustBeInstagramWebPages() {
        assertEquals("https://www.instagram.com/p/9/", appLinkUrl("https://www.instagram.com/p/9/"))
        assertEquals("https://www.instagram.com/nasa/", appLinkUrl("instagram://user?username=nasa"))
        assertNull(appLinkUrl("javascript:alert(1)"))
        assertNull(appLinkUrl("file:///data/data/x"))
        assertNull(appLinkUrl("https://evil.com/instagram.com"))
        assertNull(appLinkUrl("https://instagram.com@evil.com/"))
        assertNull(appLinkUrl("https://l.instagram.com/?u=x"))
        assertNull(appLinkUrl(null))
    }
}
