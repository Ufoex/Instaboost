package com.ufoex.instaboost

import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith

/**
 * Guards the Instaboost rebrand (app_name, theme style) from silently reverting
 * to "Instaboost" on a future upstream merge that touches strings.xml/themes.xml.
 * Uses startsWith so the test is robust to the debug-build suffix ("Instaboost Debug").
 */
@RunWith(AndroidJUnit4::class)
class AppIdentityTest {

    @Test
    fun appNameIsInstaboost() {
        val context = ApplicationProvider.getApplicationContext<android.content.Context>()
        assertTrue(
            "app_name should start with \"Instaboost\" but was \"${context.getString(R.string.app_name)}\"",
            context.getString(R.string.app_name).startsWith("Instaboost")
        )
    }
}
