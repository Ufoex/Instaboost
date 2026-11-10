package com.ufoex.instaboost

import androidx.compose.ui.graphics.Color
import com.ufoex.instaboost.ui.theme.DarkColorScheme
import com.ufoex.instaboost.ui.theme.FacebookBlue
import com.ufoex.instaboost.ui.theme.LightColorScheme
import org.junit.Assert.assertEquals
import org.junit.Test

/**
 * Native chrome (splash, settings sheet, dialogs) must default to Facebook's own
 * blue, not Material You's dynamic/purple defaults — that's the whole point of
 * this fork. Guards against the fallback color schemes drifting off-brand.
 */
class ThemeTest {

    @Test
    fun facebookBlueMatchesBrandColor() {
        assertEquals(Color(0xFF1877F2), FacebookBlue)
    }

    @Test
    fun lightSchemePrimaryIsFacebookBlue() {
        assertEquals(FacebookBlue, LightColorScheme.primary)
    }

    @Test
    fun darkSchemePrimaryIsFacebookBlue() {
        assertEquals(FacebookBlue, DarkColorScheme.primary)
    }
}
