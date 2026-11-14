<h1 align="center">Instaboost</h1>

<p align="center">Light Android client for Instagram with a better reel viewer.</p>

<p align="center"><b>English</b> · <a href="README.es.md">Español</a></p>

<p align="center">
    📘 Also available: <a href='https://github.com/Ufoex/Faceboost'><b>Faceboost</b></a>, the same idea for Facebook.<br>
    🎵 And <a href='https://github.com/Ufoex/Spotiboost'><b>Spotiboost</b></a>, for Spotify.
</p>

<h3 align="center">📥 Download</h3>

<p align="center">
    Get the latest APK from the releases page and install it.<br><br>
    <a href='https://github.com/Ufoex/Instaboost/releases/latest'><img alt='Download' height='40' src='https://img.shields.io/github/v/release/Ufoex/Instaboost?style=for-the-badge&logo=github&label=Download&color=E4405F&labelColor=24292F'/></a>
</p>

<h3 align="center">📊 Downloads</h3>

<p align="center">
    Total number of times the app has been downloaded so far.<br><br>
    <a href='https://grev.shehryar.ae/?owner=Ufoex&repo=Instaboost'><img alt='Downloads' height='40' src='https://img.shields.io/github/downloads/Ufoex/Instaboost/total?style=for-the-badge&logo=github&label=Downloads&color=E4405F&labelColor=24292F'/></a>
</p>

<h3 align="center">🙋 Problem or suggestion?</h3>

<p align="center">
    Something broken, or an idea? Open an issue on GitHub and tell me what happened or what you would like.<br><br>
    <a href='https://github.com/Ufoex/Instaboost/issues/new/choose'><img alt='Open an issue' height='40' src='https://img.shields.io/badge/Open%20an%20issue-D73A4A?style=for-the-badge&logo=github&logoColor=white'/></a>
</p>

<h3 align="center">☕ Like my work?</h3>

<p align="center">
    The app is free and has no ads. If you like it, you can support me with a coffee.<br><br>
    <a href='https://buymeacoffee.com/masterllamk'><img alt='Buy me a coffee' height='40' src='https://img.shields.io/badge/Buy%20me%20a%20coffee-FFDD00?style=for-the-badge&logo=buymeacoffee&logoColor=black'/></a>
</p>

Instaboost is a light Android client for Instagram. It wraps the mobile Instagram website and adds settings and a better reel viewer on top of it.

## Features

- Hide stories, suggested posts, people you may know, Reels and AI-labelled posts.
- Block sponsored posts and trackers.
- Reel viewer: tap to pause, hold to play faster, double tap in the middle to like and on the sides to skip, auto-scroll, sound always on, movable buttons, a seek bar and a hide-icons mode.
- Tap a video in the feed to open it full screen.
- Download photos, carousels and reels.
- Direct messages in their own layer, app lock, share to the app, launcher shortcuts.
- Material You colors and AMOLED black.
- Update check: the app looks for new releases here and shows the release notes in English or Spanish.

## Install

Download the APK from the [latest release](https://github.com/Ufoex/Instaboost/releases/latest) and open it. Android asks once to allow installing from your browser or file manager. Later updates can be installed from inside the app (Settings, Backup and updates).

Requires Android 8.0 (API 26) or newer.

## Build

```
./gradlew assembleDebug      # app/build/outputs/apk/debug (named "Instaboost Debug", installs next to the release)
./gradlew assembleRelease    # unsigned for your key; CI signs it
./gradlew testDebugUnitTest
```

Every push to `main` builds a signed release in CI and publishes it as a GitHub release. The release notes come from the newest section of [CHANGE.md](CHANGE.md), which has an English and a Spanish block.

## Support

The app is free and has no ads. If it is useful to you and you want to say thanks, you can [buy me a coffee](https://buymeacoffee.com/masterllamk).

## License

GPL-3.0, see [LICENSE](LICENSE). Instaboost started from [Materialbook](https://github.com/eepiemi/Materialbook) by eepiemi, which is also GPL-3.0.

Instaboost is not affiliated with or endorsed by Instagram or Meta. Instagram is a trademark of Meta Platforms, Inc.
