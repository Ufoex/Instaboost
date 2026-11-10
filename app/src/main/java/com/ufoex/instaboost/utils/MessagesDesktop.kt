package com.ufoex.instaboost.utils

import java.net.URI

const val MESSAGES_DESKTOP_URL = "https://www.instagram.com/direct/inbox/"

private fun hostAndPath(url: String): Pair<String, String>? {
    val uri = runCatching { URI(url) }.getOrNull() ?: return null
    val scheme = uri.scheme?.lowercase()
    if (scheme != "http" && scheme != "https") return null
    return (uri.host ?: return null).lowercase() to (uri.path ?: "")
}

private fun isFacebookHost(host: String) =
    (host == "instagram.com" || host.endsWith(".instagram.com")) && !host.startsWith("l.")

/**
 * Every way Facebook's mobile site (m.facebook.com) tries to open Messages/Messenger: the facebook.com/messages
 * page, m.me and messenger.com links, and the fb-messenger:// and intent:// deep links
 * that start the Messenger app (none of which render usefully in the mobile web view).
 */
fun isMessagesLink(url: String): Boolean {
    val scheme = url.substringBefore(':', "").lowercase()
    if (scheme == "instagram" && url.contains("direct", ignoreCase = true)) return true
    val (host, path) = hostAndPath(url) ?: return false
    if (host == "ig.me" || host.endsWith(".ig.me")) return true
    return isFacebookHost(host) && path.startsWith("/direct")
}

/** Where a main-frame navigation inside the Messages layer goes. */
sealed interface MessagesLayerRoute {
    /** Stays in the layer as is (the desktop Messages page, login/checkpoint, subframes). */
    data object Allow : MessagesLayerRoute

    /** Another form of a Messages link: open its desktop equivalent in the layer instead. */
    data class Remap(val url: String) : MessagesLayerRoute

    /** A regular Facebook page: close the layer and open it in the main (mobile) view. */
    data class OpenInMain(val url: String) : MessagesLayerRoute

    /** Not Facebook: hand it to the system, as the main view does. */
    data class External(val url: String) : MessagesLayerRoute
}

fun messagesLayerRoute(url: String, isMainFrame: Boolean): MessagesLayerRoute {
    if (!isMainFrame || isDesktopMessagesUrl(url)) return MessagesLayerRoute.Allow
    if (isMessagesLink(url)) return MessagesLayerRoute.Remap(messagesDesktopUrl(url))
    val (host, path) = hostAndPath(url) ?: return MessagesLayerRoute.External(url)
    if (!isFacebookHost(host)) return MessagesLayerRoute.External(url)
    // The desktop Messages page may bounce through these before showing the inbox.
    if (path.startsWith("/accounts") || path.startsWith("/challenge")) return MessagesLayerRoute.Allow
    return MessagesLayerRoute.OpenInMain(url)
}

/** The desktop Messages page (the one loaded with the desktop user agent). */
fun isDesktopMessagesUrl(url: String): Boolean {
    val uri = runCatching { java.net.URI(url) }.getOrNull() ?: return false
    return uri.host?.lowercase() == "www.instagram.com" && (uri.path ?: "").startsWith("/direct")
}

private val THREAD_PATH = Regex("^/direct/t/[^/]+")

/**
 * Desktop equivalent of any Messages/Messenger link, so deep links keep their conversation:
 * `facebook.com/messages/t/<id>`, `m.me/<name>`, `messenger.com/t/<id>` and
 * `fb-messenger://user/<id>` open that thread; anything else opens the inbox.
 */
fun messagesDesktopUrl(url: String): String {
    val inbox = MESSAGES_DESKTOP_URL
    val uri = runCatching { java.net.URI(url) }.getOrNull() ?: return inbox
    val scheme = uri.scheme?.lowercase()
    val host = uri.host?.lowercase() ?: ""
    val path = uri.path ?: ""
    return when {
        scheme != "http" && scheme != "https" -> inbox
        host == "ig.me" || host.endsWith(".ig.me") -> inbox
        else -> THREAD_PATH.find(path)?.let { "https://www.instagram.com" + it.value } ?: inbox
    }
}

/**
 * Facebook's home page (the logo in the Messages layer's header points there). Going "home" from
 * the layer just closes it: the feed underneath is still there, loading it again would restart it.
 */
fun isFacebookHomeUrl(url: String): Boolean {
    val (host, path) = hostAndPath(url) ?: return false
    return isFacebookHost(host) && (path == "" || path == "/")
}
