package com.ufoex.instaboost

import com.ufoex.instaboost.utils.MessagesLayerRoute
import com.ufoex.instaboost.utils.isDesktopMessagesUrl
import com.ufoex.instaboost.utils.isFacebookHomeUrl
import com.ufoex.instaboost.utils.isMessagesLink
import com.ufoex.instaboost.utils.messagesDesktopUrl
import com.ufoex.instaboost.utils.messagesLayerRoute
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class MessagesDesktopTest {
    private val inbox = "https://www.instagram.com/direct/inbox/"

    @Test
    fun messagesLinks() {
        assertTrue(isMessagesLink("https://www.instagram.com/direct/inbox/"))
        assertTrue(isMessagesLink("https://m.instagram.com/direct/t/123/"))
        assertTrue(isMessagesLink("https://ig.me/m/someone"))
        assertTrue(isMessagesLink("instagram://mailbox/direct"))
        assertFalse(isMessagesLink("https://www.instagram.com/someone/"))
        assertFalse(isMessagesLink("https://l.instagram.com/direct"))
        assertFalse(isMessagesLink("https://example.com/direct/inbox/"))
    }

    @Test
    fun layerRoutes() {
        // The Direct page itself, and the login / challenge pages it may bounce through, stay in the layer.
        assertEquals(MessagesLayerRoute.Allow, messagesLayerRoute("https://www.instagram.com/direct/t/1/", true))
        assertEquals(MessagesLayerRoute.Allow, messagesLayerRoute("https://www.instagram.com/accounts/login/?next=x", true))
        assertEquals(MessagesLayerRoute.Allow, messagesLayerRoute("https://www.instagram.com/challenge/1/", true))
        // Subframes are never routed.
        assertEquals(MessagesLayerRoute.Allow, messagesLayerRoute("https://www.facebook.com/plugins/x", false))
        // Other forms of a Direct link open their desktop equivalent in the layer.
        assertEquals(MessagesLayerRoute.Remap(inbox), messagesLayerRoute("https://ig.me/m/someone", true))
        assertEquals(MessagesLayerRoute.Remap("https://www.instagram.com/direct/t/9"), messagesLayerRoute("https://m.instagram.com/direct/t/9/", true))
        // Regular Instagram pages go back to the main view.
        assertEquals(MessagesLayerRoute.OpenInMain("https://www.instagram.com/"), messagesLayerRoute("https://www.instagram.com/", true))
        assertEquals(MessagesLayerRoute.OpenInMain("https://www.instagram.com/someone/"), messagesLayerRoute("https://www.instagram.com/someone/", true))
        // Everything else is external, outbound l.instagram.com redirects included.
        assertEquals(MessagesLayerRoute.External("https://example.com/"), messagesLayerRoute("https://example.com/", true))
        assertEquals(MessagesLayerRoute.External("https://l.instagram.com/?u=x"), messagesLayerRoute("https://l.instagram.com/?u=x", true))
        assertEquals(MessagesLayerRoute.External("tel:123"), messagesLayerRoute("tel:123", true))
    }

    @Test
    fun deepLinksKeepTheirConversation() {
        assertEquals("https://www.instagram.com/direct/t/12345", messagesDesktopUrl("https://www.instagram.com/direct/t/12345/"))
        assertEquals("https://www.instagram.com/direct/t/12345", messagesDesktopUrl("https://m.instagram.com/direct/t/12345/?ref=notif"))
        assertEquals(inbox, messagesDesktopUrl("https://ig.me/m/someone"))
        assertEquals(inbox, messagesDesktopUrl("https://www.instagram.com/direct/inbox/"))
        assertEquals(inbox, messagesDesktopUrl("instagram://mailbox"))
    }

    @Test
    fun desktopMessagesPage() {
        assertTrue(isDesktopMessagesUrl("https://www.instagram.com/direct/t/1"))
        assertFalse(isDesktopMessagesUrl("https://m.instagram.com/direct/t/1"))
        assertFalse(isDesktopMessagesUrl("https://www.instagram.com/someone/"))
    }

    @Test
    fun homeIsRecognised() {
        listOf("https://www.instagram.com/", "https://www.instagram.com", "https://m.instagram.com/").forEach {
            assertTrue(it, isFacebookHomeUrl(it))
        }
        listOf("https://www.instagram.com/explore/", "https://example.com/", "https://www.instagram.com/direct/inbox/").forEach {
            assertFalse(it, isFacebookHomeUrl(it))
        }
    }
}
