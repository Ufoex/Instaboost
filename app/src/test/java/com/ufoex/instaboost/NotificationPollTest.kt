package com.ufoex.instaboost

import com.ufoex.instaboost.utils.parseCounts
import org.junit.Assert.assertEquals
import org.junit.Test

class NotificationPollTest {
    @Test
    fun sumsEveryNotificationCount() {
        val json = """{"counts":{"likes":3,"comments":2,"relationships":1,"requests":0},"status":"ok"}"""
        assertEquals(listOf(6), parseCounts(json))
    }

    @Test
    fun unreadablePageCountsAsNone() {
        assertEquals(listOf(0), parseCounts("<html></html>"))
        assertEquals(listOf(0), parseCounts("""{"status":"fail"}"""))
    }
}
