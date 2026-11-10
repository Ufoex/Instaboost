package com.ufoex.instaboost.utils

import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.view.InputDevice
import android.view.MotionEvent
import android.view.View

/**
 * Makes a quick vertical swipe on [view] with real touch events: Instagram's reels viewer only accepts a change of reel from
 * its own pointer handling (it keeps its own idea of which reel is current), so a page script asks the app for the gesture
 * instead of moving the list itself. [forward] swipes up (next reel), otherwise down (previous).
 */
fun swipeView(view: View, forward: Boolean) {
    val w = view.width.toFloat()
    val h = view.height.toFloat()
    if (w <= 0f || h <= 0f) return
    val x = w * 0.45f
    val from = h * (if (forward) 0.72f else 0.28f)
    val to = h * (if (forward) 0.22f else 0.78f)
    val handler = Handler(Looper.getMainLooper())
    val start = SystemClock.uptimeMillis()
    val steps = 8
    val span = 150L
    fun send(action: Int, y: Float, at: Long) {
        val e = MotionEvent.obtain(start, at, action, x, y, 0)
        e.source = InputDevice.SOURCE_TOUCHSCREEN
        view.dispatchTouchEvent(e)
        e.recycle()
    }
    send(MotionEvent.ACTION_DOWN, from, start)
    for (i in 1..steps) {
        val at = start + span * i / steps
        val y = from + (to - from) * i / steps
        handler.postAtTime({ send(MotionEvent.ACTION_MOVE, y, at) }, at)
    }
    val end = start + span + 16
    handler.postAtTime({ send(MotionEvent.ACTION_UP, to, end) }, end)
}
