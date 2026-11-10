package com.ufoex.instaboost

import androidx.compose.material3.MaterialTheme
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.test.junit4.v2.createComposeRule
import com.ufoex.instaboost.ui.theme.FacebookBlue
import com.ufoex.instaboost.ui.theme.InstaboostTheme
import org.junit.Assert.assertEquals
import org.junit.Rule
import org.junit.Test

/**
 * ThemeTest (unit) checks the fallback ColorScheme values equal Facebook blue.
 * This checks the gap that can't cover: that InstaboostTheme's default
 * parameters actually apply them when called with no args, the way
 * MainActivity calls it — for both light and dark, independent of whatever
 * day/night mode the test device happens to be in.
 */
class InstaboostThemeDefaultTest {

    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun lightModeDefaultsToFacebookBluePrimary() {
        var captured: Color? = null

        composeTestRule.setContent {
            InstaboostTheme(darkTheme = false) {
                captured = MaterialTheme.colorScheme.primary
            }
        }

        composeTestRule.waitForIdle()
        assertEquals(FacebookBlue, captured)
    }

    @Test
    fun darkModeDefaultsToFacebookBluePrimary() {
        var captured: Color? = null

        composeTestRule.setContent {
            InstaboostTheme(darkTheme = true) {
                captured = MaterialTheme.colorScheme.primary
            }
        }

        composeTestRule.waitForIdle()
        assertEquals(FacebookBlue, captured)
    }
}
