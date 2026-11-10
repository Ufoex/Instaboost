package com.ufoex.instaboost.utils.jsBridge

import android.webkit.JavascriptInterface

class InstaboostSettings (
    private val toggleSettings: () -> Unit,
) {
    @JavascriptInterface
    @Suppress("unused")
    fun onSettingsToggle() = toggleSettings()
}